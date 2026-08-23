import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  // Find all Gregory House entries
  const all = await prisma.user.findMany({
    where: { name: { contains: 'Gregory House' } },
    orderBy: { createdAt: 'asc' },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  console.log('Found entries:', JSON.stringify(all, null, 2));

  if (all.length <= 1) {
    console.log('No duplicate found.');
    return;
  }

  // Keep the first, delete the rest (the duplicate from the old seed)
  const toDelete = all.slice(1);
  for (const doc of toDelete) {
    // Delete profile first (FK constraint), then user
    await prisma.doctorProfile.deleteMany({ where: { userId: doc.id } });
    await prisma.user.delete({ where: { id: doc.id } });
    console.log(`Deleted duplicate: ${doc.name} <${doc.email}>`);
  }

  console.log('Done.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
