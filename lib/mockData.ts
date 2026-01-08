import { User, Appointment } from './types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'patient',
  },
  {
    id: 2,
    name: 'Dr. Sarah Smith',
    email: 'sarah@clinic.com',
    role: 'provider',
  },
  {
    id: 3,
    name: 'Dr. Mike Johnson',
    email: 'mike@clinic.com',
    role: 'provider',
  },
];

// Mock Appointments
export const mockAppointments: Appointment[] = [
  {
    id: 1,
    patientId: 1,
    patientName: 'John Doe',
    providerId: 2,
    providerName: 'Dr. Sarah Smith',
    date: '2026-01-15',
    time: '10:00 AM',
    status: 'booked',
    reason: 'Annual Checkup',
  },
  {
    id: 2,
    patientId: 1,
    patientName: 'John Doe',
    providerId: 3,
    providerName: 'Dr. Mike Johnson',
    date: '2026-01-20',
    time: '2:00 PM',
    status: 'booked',
    reason: 'Follow-up Visit',
  },
  {
    id: 3,
    patientId: 1,
    patientName: 'John Doe',
    providerId: 2,
    providerName: 'Dr. Sarah Smith',
    date: '2025-12-10',
    time: '9:00 AM',
    status: 'completed',
    reason: 'Blood Test Results',
  },
];

// Helper function to get appointments by user
export function getAppointmentsByPatient(patientId: number): Appointment[] {
  return mockAppointments.filter(apt => apt.patientId === patientId);
}

export function getAppointmentsByProvider(providerId: number): Appointment[] {
  return mockAppointments.filter(apt => apt.providerId === providerId);
}