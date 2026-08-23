import { prisma } from './db';
import { generatePreVisitSummary } from './services/ai';

async function fixBrokenAppointments() {
  const brokenAppointments = await prisma.appointment.findMany({
    where: { chiefComplaint: 'Failed to analyze symptoms.' }
  });

  console.log(`Found ${brokenAppointments.length} broken appointments.`);

  for (const appt of brokenAppointments) {
    console.log(`Fixing appointment ${appt.id}...`);
    const summary = await generatePreVisitSummary(appt.symptoms);
    
    await prisma.appointment.update({
      where: { id: appt.id },
      data: {
        urgencyLevel: summary.urgencyLevel,
        chiefComplaint: summary.chiefComplaint,
        suggestedQuestions: summary.suggestedQuestions
      }
    });
    console.log(`Fixed! AI categorized as: ${summary.recommendedSpecialization}`);
  }
}

fixBrokenAppointments()
  .then(() => console.log('Done!'))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
