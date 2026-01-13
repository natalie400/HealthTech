// TypeScript interfaces define the "shape" of our data

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'patient' | 'provider'; // Can only be one of these two values
}

export interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  providerId: number;
  providerName: string;
  date: string;
  time: string;
  status: 'booked' | 'cancelled' | 'completed';
  reason: string;
}