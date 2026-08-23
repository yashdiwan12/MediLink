import { prisma } from './db';

async function sanitizeQuestions() {
  const appointments = await prisma.appointment.findMany();

  let fixed = 0;
  for (const appt of appointments) {
    if (Array.isArray(appt.suggestedQuestions)) {
      const sanitized = appt.suggestedQuestions.filter((q: any) => 
        typeof q === 'string' && q.trim().length > 5 && q.trim().endsWith('?')
      ).slice(0, 3);
      
      if (sanitized.length !== appt.suggestedQuestions.length) {
        await prisma.appointment.update({
          where: { id: appt.id },
          data: { suggestedQuestions: sanitized }
        });
        fixed++;
      }
    }
  }
  console.log(`Sanitized questions for ${fixed} appointments.`);
}

sanitizeQuestions()
  .then(() => console.log('Done!'))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
