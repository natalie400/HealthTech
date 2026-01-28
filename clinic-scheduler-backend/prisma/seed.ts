import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Define the password you WANT to use
  // We use the same hash for everyone so it's easy to remember during testing
  const standardPassword = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('Password123', 10); // <--- CHANGED: Matches your console log now

  // 1. Create Patient
  const patient = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      password: standardPassword,
      name: 'John Doe',
      role: 'patient',
    },
  });

  // 2. Create Providers
  const provider1 = await prisma.user.upsert({
    where: { email: 'sarah@clinic.com' },
    update: {},
    create: {
      email: 'sarah@clinic.com',
      password: standardPassword,
      name: 'Dr. Sarah Smith',
      role: 'provider',
    },
  });

  const provider2 = await prisma.user.upsert({
    where: { email: 'mike@clinic.com' },
    update: {},
    create: {
      email: 'mike@clinic.com',
      password: standardPassword,
      name: 'Dr. Mike Johnson',
      role: 'provider',
    },
  });

  // 3. Create DESIGNATED ADMIN (The Security Backdoor) 🔒
  const adminEmail = 'admin@healthtech.com';
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: adminPassword, // <--- Force update password if user already exists
    },
    create: {
      email: adminEmail,
      name: 'Master Administrator',
      password: adminPassword,
      role: 'admin', // This is the only place 'admin' role is assigned
    },
  });

  console.log('✅ Users & Admin created');

  // 4. Reset & Create Appointments
  await prisma.appointment.deleteMany({}); // Clear old appointments to prevent duplicates

  await prisma.appointment.createMany({
    data: [
      {
        patientId: patient.id,
        providerId: provider1.id,
        date: new Date('2026-01-15'),
        time: '10:00 AM',
        status: 'booked',
        reason: 'Annual Checkup',
      },
      {
        patientId: patient.id,
        providerId: provider2.id,
        date: new Date('2026-01-20'),
        time: '2:00 PM',
        status: 'booked',
        reason: 'Follow-up Visit',
      },
      {
        patientId: patient.id,
        providerId: provider1.id,
        date: new Date('2025-12-10'),
        time: '9:00 AM',
        status: 'completed',
        reason: 'Blood Test Results',
      },
    ],
  });

  console.log('✅ Appointments created');
  console.log('');
  console.log('📧 Test credentials:');
  console.log('   Patient:  john@example.com / password123');
  console.log('   Provider: sarah@clinic.com / password123');
  console.log('   Provider: mike@clinic.com  / password123');
  console.log('   ----------------------------------------');
  console.log('   🛡️ ADMIN:   admin@healthtech.com');
  console.log('   🔑 PASS:    Password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });