import { prisma } from './src/db';

async function main() {
  const docs = await prisma.doctorProfile.findMany({ include: { user: true } });
  console.log('Total doctors in DB:', docs.length);
  console.log(docs.map((d: any) => ({ name: d.user.name, spec: d.specialization })));
}
main().finally(() => prisma.$disconnect());
