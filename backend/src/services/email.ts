import { prisma } from '../db';

export const sendEmail = async (to: string, subject: string, text: string, html?: string): Promise<boolean> => {
  try {
    await prisma.emailQueue.create({
      data: {
        to,
        subject,
        text,
        html,
        status: 'PENDING',
        retries: 0
      }
    });
    console.log(`Email to ${to} queued successfully.`);
    return true;
  } catch (error) {
    console.error(`Failed to queue email to ${to}:`, error);
    return false;
  }
};
