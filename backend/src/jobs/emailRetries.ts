import cron from 'node-cron';
import { prisma } from '../db';
import nodemailer from 'nodemailer';

// Dedicated raw sender for the background job to avoid recursive queuing
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const startEmailQueueJob = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const pendingEmails = await prisma.emailQueue.findMany({
        where: {
          status: 'PENDING',
          retries: { lt: 3 }
        },
        take: 50 // Process in batches
      });

      if (pendingEmails.length === 0) return;
      
      console.log(`Processing ${pendingEmails.length} queued emails...`);

      for (const email of pendingEmails) {
        try {
          if (!process.env.SMTP_USER) {
            console.log(`[Mock Email Sent] To: ${email.to} | Subject: ${email.subject}`);
          } else {
            await transporter.sendMail({
              from: '"Healthcare Appointment Manager" <noreply@healthcare.local>',
              to: email.to,
              subject: email.subject,
              text: email.text,
              html: email.html || undefined,
            });
          }

          // Mark as sent
          await prisma.emailQueue.update({
            where: { id: email.id },
            data: { status: 'SENT' }
          });
        } catch (err: any) {
          console.error(`Failed to send queued email to ${email.to}:`, err.message);
          
          const newRetries = email.retries + 1;
          await prisma.emailQueue.update({
            where: { id: email.id },
            data: { 
              retries: newRetries,
              status: newRetries >= 3 ? 'FAILED' : 'PENDING'
            }
          });
        }
      }
    } catch (error) {
      console.error('Error in email queue job:', error);
    }
  });

  console.log('Email Queue cron job initialized.');
};
