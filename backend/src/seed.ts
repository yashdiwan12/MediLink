s errimport { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create a Doctor
  const doctor = await prisma.user.upsert({
    where: { email: 'doctor@demo.com' },
    update: {},
    create: {
      email: 'doctor@demo.com',
      password: hashedPassword,
      name: 'Gregory House',
      role: Role.DOCTOR,
    },
  });

  // 2. Create the Doctor's Profile
  await prisma.doctorProfile.upsert({
    where: { userId: doctor.id },
    update: {},
    create: {
      userId: doctor.id,
      specialization: 'Diagnostic Medicine',
      slotDuration: 30,
      workingHours: {
        monday: ["09:00-17:00"],
        tuesday: ["09:00-17:00"],
        wednesday: ["09:00-17:00"],
        thursday: ["09:00-17:00"],
        friday: ["09:00-17:00"],
      },
    },
  });

  console.log('✅ Created Demo Doctor (Dr. Gregory House)');
  console.log('Login -> doctor@demo.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
