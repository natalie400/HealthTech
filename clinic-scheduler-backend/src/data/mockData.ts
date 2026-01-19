import { User, Appointment } from '../types';

export const mockUsers: User[] = [
  {
    id: 1,
    email: 'john@example.com',
    password: '$2b$10$abcdefghijklmnopqrstuvwxyz', // This would be hashed
    name: 'John Doe',
    role: 'patient',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    email: 'sarah@clinic.com',
    password: '$2b$10$abcdefghijklmnopqrstuvwxyz',
    name: 'Dr. Sarah Smith',
    role: 'provider',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    email: 'mike@clinic.com',
    password: '$2b$10$abcdefghijklmnopqrstuvwxyz',
    name: 'Dr. Mike Johnson',
    role: 'provider',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockAppointments: Appointment[] = [
  {
    id: 1,
    patientId: 1,
    providerId: 2,
    date: new Date('2026-01-15'),
    time: '10:00 AM',
    status: 'booked',
    reason: 'Annual Checkup',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    patientId: 1,
    providerId: 3,
    date: new Date('2026-01-20'),
    time: '2:00 PM',
    status: 'booked',
    reason: 'Follow-up Visit',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    patientId: 1,
    providerId: 2,
    date: new Date('2025-12-10'),
    time: '9:00 AM',
    status: 'completed',
    reason: 'Blood Test Results',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];