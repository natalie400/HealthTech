import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Define standard passwords
  const standardPassword = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('Password123', 10);

  // 2. Create Patient
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

  // 3. Create Providers
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

  // 4. Create DESIGNATED ADMIN
  const adminEmail = 'admin@healthtech.com';
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: adminPassword },
    create: {
      email: adminEmail,
      name: 'Master Administrator',
      password: adminPassword,
      role: 'admin',
    },
  });

  console.log('✅ Users & Admin created');

  // 5. Reset Data (Clear old records to avoid duplicates)
  await prisma.patientNote.deleteMany({});
  await prisma.healthMetric.deleteMany({});
  await prisma.appointment.deleteMany({});

  // 6. Create Appointments
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

  // 7. Create Health Metrics (The Missing Piece! 📊)
  // We explicitly create these so the dashboard chart has data to render
  await prisma.healthMetric.createMany({
    data: [
      { 
        patientId: patient.id, 
        type: 'Heart Rate', 
        value: '72', 
        unit: 'bpm', 
        recordedAt: new Date('2025-12-01') 
      },
      { 
        patientId: patient.id, 
        type: 'Heart Rate', 
        value: '75', 
        unit: 'bpm', 
        recordedAt: new Date('2025-12-15') 
      },
      { 
        patientId: patient.id, 
        type: 'Heart Rate', 
        value: '70', 
        unit: 'bpm', 
        recordedAt: new Date('2026-01-05') 
      },
      { 
        patientId: patient.id, 
        type: 'Heart Rate', 
        value: '85', 
        unit: 'bpm', 
        recordedAt: new Date('2026-01-20') 
      },
      { 
        patientId: patient.id, 
        type: 'Weight', 
        value: '70', 
        unit: 'kg', 
        recordedAt: new Date('2025-12-01') 
      },
    ],
  });
  console.log('✅ Health Metrics created');

  // 8. Create Patient Notes 📝
  await prisma.patientNote.createMany({
    data: [
      { 
        patientId: patient.id, 
        title: 'Recurring Migraines', 
        content: 'I have been having headaches every morning for 3 days.', 
        category: 'symptom' 
      },
      { 
        patientId: patient.id, 
        title: 'Great Service', 
        content: 'Dr. Sarah was very kind during my last visit.', 
        category: 'feedback' 
      },
    ],
  });
  console.log('✅ Patient Notes created');

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