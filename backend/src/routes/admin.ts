import express from 'express';
import { authenticate, authorizeRole } from '../middleware/auth';
import { prisma } from '../db';
import { sendEmail } from '../services/email';
import { deleteCalendarEvent } from '../services/calendar';

const router = express.Router();

// All routes here require ADMIN role
router.use(authenticate, authorizeRole(['ADMIN']));

// 0. List All Doctor Users
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await prisma.user.findMany({
      where: { role: 'DOCTOR' },
      select: {
        id: true, name: true, email: true,
        doctorProfile: { include: { leaves: true } }
      },
      orderBy: { name: 'asc' },
    });
    res.status(200).json({ doctors });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
// 1. Create or Update Doctor Profile
router.post('/doctors/:userId/profile', async (req, res) => {
  const { userId } = req.params;
  const { specialization, workingHours, slotDuration } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'DOCTOR') {
      return res.status(404).json({ error: 'Doctor not found or invalid role' });
    }

    const profile = await prisma.doctorProfile.upsert({
      where: { userId },
      update: { specialization, workingHours, slotDuration },
      create: { userId, specialization, workingHours, slotDuration },
    });

    res.status(200).json({ message: 'Doctor profile updated', profile });
  } catch (error) {
    console.error('Error updating doctor profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Add Leave for a Doctor
router.post('/doctors/:profileId/leaves', async (req, res) => {
  const { profileId } = req.params;
  const { date, reason } = req.body;

  try {
    const leaveDate = new Date(date);
    
    // Create leave entry
    const leave = await prisma.leave.create({
      data: {
        doctorProfileId: profileId,
        date: leaveDate,
        reason,
      },
    });

    // Leave Conflict Resolution Logic
    // Find all appointments for this doctor on this date and mark as cancelled
    // Notify affected patients and remove from Google Calendar
    const affectedAppointments = await prisma.appointment.findMany({
      where: {
        doctor: { doctorProfile: { id: profileId } },
        appointmentDate: leaveDate,
        status: 'SCHEDULED'
      },
      include: {
        patient: { select: { name: true, email: true } },
        doctor: { select: { name: true, email: true } }
      }
    });

    if (affectedAppointments.length > 0) {
      // 1. Mark as cancelled in DB
      await prisma.appointment.updateMany({
        where: {
          id: { in: affectedAppointments.map((a: any) => a.id) }
        },
        data: {
          status: 'CANCELLED'
        }
      });

      // 2. Loop through and process Side-Effects
      for (const appt of affectedAppointments) {
        // Remove from Google Calendar
        if (appt.googleEventId) {
          deleteCalendarEvent(appt.doctorId, appt.googleEventId).catch(err => console.error('Failed to delete calendar event for leave conflict:', err));
        }

        // Notify patient
        sendEmail(
          appt.patient.email,
          'Appointment Cancelled - Doctor on Leave',
          `Hello ${appt.patient.name},\n\nUnfortunately, Dr. ${appt.doctor.name} has taken emergency leave on ${appt.appointmentDate.toISOString().split('T')[0]}. Your appointment at ${appt.startTime} has been cancelled. Please book another slot at your convenience.`
        );
      }

      console.log(`Cancelled ${affectedAppointments.length} appointments due to doctor leave.`);
    }

    res.status(201).json({ message: 'Leave added successfully', leave, cancelledAppointmentsCount: affectedAppointments.length });
  } catch (error) {
    console.error('Error adding leave:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
