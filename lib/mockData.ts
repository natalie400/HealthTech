import { User, Appointment } from './types';

// Mock Users
export const mockUsers: User[] = [
  // Patients
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'patient',
  },
  {
    id: 4,
    name: 'Jane Williams',
    email: 'jane@patient.com',
    role: 'patient',
  },
  {
    id: 5,
    name: 'Carlos Rivera',
    email: 'carlos@patient.com',
    role: 'patient',
  },
  // Providers
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
  {
    id: 6,
    name: 'Dr. Emily Chen',
    email: 'emily@clinic.com',
    role: 'provider',
  },
  {
    id: 7,
    name: 'Dr. Ahmed Ali',
    email: 'ahmed@clinic.com',
    role: 'provider',
  },
];

// Mock Appointments
export const mockAppointments: Appointment[] = [
  // John Doe's appointments
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
  // Jane Williams' appointments
  {
    id: 4,
    patientId: 4,
    patientName: 'Jane Williams',
    providerId: 2,
    providerName: 'Dr. Sarah Smith',
    date: '2026-01-16',
    time: '11:00 AM',
    status: 'booked',
    reason: 'Consultation',
  },
  {
    id: 5,
    patientId: 4,
    patientName: 'Jane Williams',
    providerId: 6,
    providerName: 'Dr. Emily Chen',
    date: '2026-01-18',
    time: '3:00 PM',
    status: 'booked',
    reason: 'Skin Rash',
  },
  // Carlos Rivera's appointments
  {
    id: 6,
    patientId: 5,
    patientName: 'Carlos Rivera',
    providerId: 7,
    providerName: 'Dr. Ahmed Ali',
    date: '2026-01-19',
    time: '9:00 AM',
    status: 'booked',
    reason: 'Back Pain',
  },
  {
    id: 7,
    patientId: 5,
    patientName: 'Carlos Rivera',
    providerId: 3,
    providerName: 'Dr. Mike Johnson',
    date: '2026-01-22',
    time: '4:00 PM',
    status: 'booked',
    reason: 'Follow-up',
  },
  // More for variety
  {
    id: 8,
    patientId: 4,
    patientName: 'Jane Williams',
    providerId: 7,
    providerName: 'Dr. Ahmed Ali',
    date: '2026-01-23',
    time: '2:00 PM',
    status: 'completed',
    reason: 'General Checkup',
  },
  {
    id: 9,
    patientId: 1,
    patientName: 'John Doe',
    providerId: 6,
    providerName: 'Dr. Emily Chen',
    date: '2026-01-25',
    time: '11:00 AM',
    status: 'booked',
    reason: 'Allergy Consultation',
  },
];

// Helper function to get appointments by user
export function getAppointmentsByPatient(patientId: number): Appointment[] {
  return mockAppointments.filter(apt => apt.patientId === patientId);
}

export function getAppointmentsByProvider(providerId: number): Appointment[] {
  return mockAppointments.filter(apt => apt.providerId === providerId);
}
// Available time slots for booking
export const availableTimeSlots = [
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
];

// Get providers (doctors)
export function getProviders(): User[] {
  return mockUsers.filter(user => user.role === 'provider');
}

// Check if a time slot is available
export function isSlotAvailable(providerId: number, date: string, time: string): boolean {
  return !mockAppointments.some(
    apt => apt.providerId === providerId && 
           apt.date === date && 
           apt.time === time &&
           apt.status === 'booked'
  );
}