import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create users
  const patient = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      password: hashedPassword,
      name: 'John Doe',
      role: 'patient',
    },
  });

  const provider1 = await prisma.user.upsert({
    where: { email: 'sarah@clinic.com' },
    update: {},
    create: {
      email: 'sarah@clinic.com',
      password: hashedPassword,
      name: 'Dr. Sarah Smith',
      role: 'provider',
    },
  });

  const provider2 = await prisma.user.upsert({
    where: { email: 'mike@clinic.com' },
    update: {},
    create: {
      email: 'mike@clinic.com',
      password: hashedPassword,
      name: 'Dr. Mike Johnson',
      role: 'provider',
    },
  });

  console.log('✅ Users created');

  // Delete existing appointments (to avoid duplicates)
  await prisma.appointment.deleteMany({});

  // Create appointments
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
  console.log('   Patient: john@example.com / password123');
  console.log('   Provider: sarah@clinic.com / password123');
  console.log('   Provider: mike@clinic.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
