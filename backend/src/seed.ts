import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const workingHours = {
  monday: ['09:00-17:00'],
  tuesday: ['09:00-17:00'],
  wednesday: ['09:00-17:00'],
  thursday: ['09:00-17:00'],
  friday: ['09:00-17:00'],
};

const doctors = [
  { email: 'dr.house@medilink.com',    name: 'Dr. Gregory House',    specialization: 'Diagnostic Medicine' },
  { email: 'dr.yang@medilink.com',     name: 'Dr. Cristina Yang',    specialization: 'Cardiology' },
  { email: 'dr.shepherd@medilink.com', name: 'Dr. Derek Shepherd',   specialization: 'Neurology' },
  { email: 'dr.karev@medilink.com',    name: 'Dr. Alex Karev',       specialization: 'Pediatrics' },
  { email: 'dr.grey@medilink.com',     name: 'Dr. Meredith Grey',    specialization: 'General Medicine' },
  { email: 'dr.hunt@medilink.com',     name: 'Dr. Owen Hunt',        specialization: 'Orthopedics' },
  { email: 'dr.torres@medilink.com',   name: 'Dr. Callie Torres',    specialization: 'Orthopedics' },
  { email: 'dr.avery@medilink.com',    name: 'Dr. Jackson Avery',    specialization: 'Dermatology' },
  { email: 'dr.bailey@medilink.com',   name: 'Dr. Miranda Bailey',   specialization: 'General Medicine' },
  { email: 'dr.webber@medilink.com',   name: 'Dr. Richard Webber',   specialization: 'Psychiatry' },
];

async function main() {
  console.log('Seeding database...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  for (const doc of doctors) {
    const user = await prisma.user.upsert({
      where: { email: doc.email },
      update: {},
      create: {
        email: doc.email,
        password: hashedPassword,
        name: doc.name,
        role: Role.DOCTOR,
      },
    });

    await prisma.doctorProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        specialization: doc.specialization,
        slotDuration: 30,
        workingHours,
      },
    });

    console.log(`✅ ${doc.name} (${doc.specialization})`);
  }

  // Admin account
  const admin = await prisma.user.upsert({
    where: { email: 'admin@medilink.com' },
    update: {},
    create: {
      email: 'admin@medilink.com',
      password: hashedPassword,
      name: 'Admin',
      role: Role.ADMIN,
    },
  });
  console.log(`✅ Admin (${admin.email})`);

  console.log('\nDone! Credentials: password123 for all accounts.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
