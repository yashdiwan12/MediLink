import express from 'express';
import { authenticate, authorizeRole } from '../middleware/auth';
import { generatePreVisitSummary } from '../services/ai';
import { createCalendarEvent, deleteCalendarEvent } from '../services/calendar';
import { sendEmail } from '../services/email';
import { prisma } from '../db';

const router = express.Router();

router.use(authenticate, authorizeRole(['PATIENT']));

// 1. Search Doctors by Specialization
router.get('/doctors', async (req, res) => {
  const { specialization } = req.query;

  try {
    const doctors = await prisma.doctorProfile.findMany({
      where: specialization ? {
        specialization: {
          contains: String(specialization),
          mode: 'insensitive',
        }
      } : undefined,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

  res.status(200).json({ doctors });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Get Patient's Own Appointments
router.get('/appointments', async (req, res) => {
  const patientId = req.user!.id;
  try {
    // Automatically delete appointments if more than 10
    const allAppts = await prisma.appointment.findMany({
      where: { patientId },
      orderBy: { appointmentDate: 'desc' },
      select: { id: true }
    });

    if (allAppts.length > 10) {
      const idsToDelete = allAppts.slice(10).map(a => a.id);
      await prisma.appointment.deleteMany({
        where: { id: { in: idsToDelete } }
      });
    }

    const appointments = await prisma.appointment.findMany({
      where: { patientId },
      include: {
        doctor: { select: { id: true, name: true } },
      },
      orderBy: { appointmentDate: 'desc' },
      take: 10,
    });
    res.status(200).json({ appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Cancel an Appointment (patient)
router.patch('/appointments/:id/cancel', async (req, res) => {
  const { id } = req.params;
  const patientId = req.user!.id;
  try {
    const appt = await prisma.appointment.findUnique({ 
      where: { id },
      include: { 
        doctor: { select: { id: true, name: true, email: true } },
        patient: { select: { name: true, email: true } }
      }
    });
    if (!appt || appt.patientId !== patientId) return res.status(404).json({ error: 'Not found' });
    if (appt.status !== 'SCHEDULED') return res.status(400).json({ error: 'Only scheduled appointments can be cancelled' });
    
    const updated = await prisma.appointment.update({ where: { id }, data: { status: 'CANCELLED' } });
    
    // Remove calendar event
    if (appt.googleEventId) {
      deleteCalendarEvent(appt.doctorId, appt.googleEventId).catch(err => console.error('Failed to delete calendar event', err));
    }

    // Notify doctor
    sendEmail(
      appt.doctor.email,
      'Appointment Cancelled',
      `Hello Dr. ${appt.doctor.name},\n\nYour appointment with ${appt.patient.name} on ${appt.appointmentDate.toISOString().split('T')[0]} at ${appt.startTime} has been cancelled by the patient.`
    );
    // Notify patient
    sendEmail(
      appt.patient.email,
      'Appointment Cancelled',
      `Hello ${appt.patient.name},\n\nYour appointment with Dr. ${appt.doctor.name} on ${appt.appointmentDate.toISOString().split('T')[0]} at ${appt.startTime} has been cancelled.`
    );

    res.status(200).json({ appointment: updated });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Book an Appointment (with Concurrency Handling & Auto-Assignment)
router.post('/appointments', async (req, res) => {
  const { appointmentDate, startTime, endTime, symptoms, patientName, patientAge, patientGender, patientPhone } = req.body;
  const patientId = req.user!.id; // from authenticate middleware

  try {
    const date = new Date(appointmentDate);

    // Call Groq AI API for Pre-visit summary BEFORE holding DB locks
    const aiSummary = await generatePreVisitSummary(symptoms);

    // Concurrency Handling: Use Prisma Interactive Transaction to prevent double-booking
    const bookingResult = await prisma.$transaction(async (tx: any) => {
      // 1. Find all doctors for the requested specialization
      const doctors = await tx.doctorProfile.findMany({
        where: { specialization: { contains: String(aiSummary.recommendedSpecialization).trim(), mode: 'insensitive' } },
        include: { leaves: { where: { date } } }
      });

      if (doctors.length === 0) {
        throw new Error('No doctors found for this specialization: ' + JSON.stringify(aiSummary));
      }

      // 2. Filter out doctors who are on leave
      const doctorsNotOnLeave = doctors.filter((doc: any) => doc.leaves.length === 0);

      if (doctorsNotOnLeave.length === 0) {
        throw new Error('All doctors in this specialization are on leave on this date');
      }

      const availableDoctorIds = doctorsNotOnLeave.map((d: any) => d.userId);

      // 3. Find overlapping appointments for these doctors
      const overlappingAppointments = await tx.appointment.findMany({
        where: {
          doctorId: { in: availableDoctorIds },
          appointmentDate: date,
          status: 'SCHEDULED',
          OR: [
            // Simple overlap logic: exact time match
            { startTime, endTime }
          ]
        },
        select: { doctorId: true }
      });

      const busyDoctorIds = new Set(overlappingAppointments.map((a: any) => a.doctorId));

      // 4. Assign the first doctor who is NOT busy
      const assignedDoctor = doctorsNotOnLeave.find((d: any) => !busyDoctorIds.has(d.userId));

      if (!assignedDoctor) {
        throw new Error('No doctors are available for this specialization at the selected time');
      }

      // 5. Create Appointment with AI generated data and the assigned doctor
      const newAppointment = await tx.appointment.create({
        data: {
          patientId,
          doctorId: assignedDoctor.userId,
          appointmentDate: date,
          startTime,
          endTime,
          symptoms,
          patientName,
          patientAge: patientAge ? parseInt(patientAge) : null,
          patientGender,
          patientPhone,
          urgencyLevel: aiSummary.urgencyLevel,
          chiefComplaint: aiSummary.chiefComplaint,
          suggestedQuestions: aiSummary.suggestedQuestions,
          status: 'SCHEDULED',
        },
        include: {
          doctor: { select: { id: true, name: true } }
        }
      });

      return { newAppointment, assignedDoctor };
    });

    // 4. Async trigger for Google Calendar Sync
    createCalendarEvent(bookingResult.assignedDoctor.userId, {
      summary: `Medical Appointment with ${patientName || 'Patient'}`,
      description: `Symptoms: ${symptoms}\nUrgency: ${aiSummary.urgencyLevel}\nChief Complaint: ${aiSummary.chiefComplaint}`,
      startTime: new Date(`${date.toISOString().split('T')[0]}T${startTime}:00Z`).toISOString(),
      endTime: new Date(`${date.toISOString().split('T')[0]}T${endTime}:00Z`).toISOString(),
      attendeeEmail: req.user!.email // the patient's email
    }).then(async (eventId) => {
      if (eventId) {
        await prisma.appointment.update({
          where: { id: bookingResult.newAppointment.id },
          data: { googleEventId: eventId }
        });
      }
    }).catch(err => console.error('Failed to sync calendar or update appointment:', err));

    // Send confirmation emails
    const doctorUser = await prisma.user.findUnique({ where: { id: bookingResult.assignedDoctor.userId } });
    if (doctorUser) {
      sendEmail(
        req.user!.email,
        'Appointment Confirmed',
        `Hello ${patientName || 'Patient'},\n\nYour appointment with Dr. ${doctorUser.name} is confirmed for ${appointmentDate} at ${startTime}.\nSpecialization: ${aiSummary.recommendedSpecialization}\n\nPlease arrive on time.`
      );
      
      sendEmail(
        doctorUser.email,
        'New Appointment Booked',
        `Hello Dr. ${doctorUser.name},\n\nA new appointment has been booked.\nPatient: ${patientName || 'Patient'}\nDate: ${appointmentDate}\nTime: ${startTime}\nChief Complaint: ${aiSummary.chiefComplaint}\nUrgency: ${aiSummary.urgencyLevel}`
      );
    }

    // Automatically delete appointments if more than 10 for this patient
    try {
      const allAppts = await prisma.appointment.findMany({
        where: { patientId },
        orderBy: { appointmentDate: 'desc' },
        select: { id: true }
      });
      if (allAppts.length > 10) {
        const idsToDelete = allAppts.slice(10).map(a => a.id);
        await prisma.appointment.deleteMany({
          where: { id: { in: idsToDelete } }
        });
      }
    } catch (cleanupErr) {
      console.error('Failed to cleanup old appointments:', cleanupErr);
    }

    res.status(201).json({ 
      message: 'Appointment booked successfully', 
      appointment: bookingResult.newAppointment,
      specialization: aiSummary.recommendedSpecialization 
    });
  } catch (error: any) {
    console.error('Booking Error:', error.message);
      if (
        error.message.startsWith('No doctors found for this specialization') ||
        error.message.startsWith('AI Triage Failed:') ||
        ['All doctors in this specialization are on leave on this date', 'No doctors are available for this specialization at the selected time'].includes(error.message)
      ) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
  }
});

export default router;
