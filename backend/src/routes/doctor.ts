import express from 'express';
import { authenticate, authorizeRole } from '../middleware/auth';
import { generatePostVisitSummary } from '../services/ai';
import { sendEmail } from '../services/email';
import { prisma } from '../db';

const router = express.Router();

// All routes here require DOCTOR role
router.use(authenticate, authorizeRole(['DOCTOR']));

// Get Doctor's Appointment Schedule
router.get('/appointments', async (req, res) => {
  const doctorId = req.user!.id;
  try {
    const appointments = await prisma.appointment.findMany({
      where: { doctorId },
      include: { patient: { select: { id: true, name: true, email: true } } },
      orderBy: { appointmentDate: 'asc' },
    });
    res.status(200).json({ appointments });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit clinical notes and generate post-visit summary
router.post('/appointments/:appointmentId/post-visit', async (req, res) => {
  const { appointmentId } = req.params;
  const { clinicalNotes } = req.body;
  const doctorId = req.user!.id;

  try {
    // Verify the appointment belongs to this doctor
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: true }
    });

    if (!appointment || appointment.doctorId !== doctorId) {
      return res.status(404).json({ error: 'Appointment not found or unauthorized' });
    }

    if (appointment.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Appointment is already marked as completed' });
    }

    // Call Groq AI API for Post-visit summary
    const aiSummary = await generatePostVisitSummary(clinicalNotes);

    // Update appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        clinicalNotes,
        patientSummary: aiSummary.patientSummary,
        medicationSchedule: aiSummary.medicationSchedule,
        status: 'COMPLETED'
      }
    });

    // Send email to patient with the summary
    const emailSubject = `Your Visit Summary with Doctor`;
    const emailText = `Hello ${appointment.patient.name},\n\nHere is a summary of your recent visit:\n\n${aiSummary.patientSummary}\n\nMedication Schedule:\n${JSON.stringify(aiSummary.medicationSchedule, null, 2)}`;
    
    // Fire and forget email sending
    sendEmail(appointment.patient.email, emailSubject, emailText);

    res.status(200).json({ message: 'Post-visit summary generated and appointment completed', appointment: updatedAppointment });
  } catch (error) {
    console.error('Error generating post-visit summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
