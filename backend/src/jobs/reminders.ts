import cron from 'node-cron';
import { Prisma } from '@prisma/client';
import { sendEmail } from '../services/email';
import { prisma } from '../db';

// This cron job runs every morning at 8:00 AM
export const startMedicationRemindersJob = () => {
  cron.schedule('0 8 * * *', async () => {
    console.log('Running daily medication reminder job...');
    
    try {
      // Find appointments that are COMPLETED and have a medication schedule
      // In a production system, we'd check follow-up duration as well
      const appointments = await prisma.appointment.findMany({
        where: {
          status: 'COMPLETED',
          medicationSchedule: { not: Prisma.DbNull }
        },
        include: { patient: true }
      });

      let emailsSent = 0;

      for (const appointment of appointments) {
        if (!appointment.medicationSchedule) continue;

        const schedule = appointment.medicationSchedule as any[];
        if (schedule.length === 0) continue;
        
        const emailSubject = 'Your Daily Medication Reminder';
        const emailText = `Hello ${appointment.patient!.name},\n\nThis is a friendly reminder for your medication schedule:\n\n${JSON.stringify(schedule, null, 2)}\n\nPlease ensure you follow the doctor's instructions.`;
        
        const success = await sendEmail(appointment.patient!.email, emailSubject, emailText);
        if (success) emailsSent++;
      }

      console.log(`Successfully sent ${emailsSent} medication reminders.`);
    } catch (error) {
      console.error('Error in medication reminder job:', error);
    }
  });

  console.log('Medication reminders cron job initialized.');
};
