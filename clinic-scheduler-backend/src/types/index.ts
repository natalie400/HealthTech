export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: 'patient' | 'provider';
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: number;
  patientId: number;
  providerId: number;
  date: Date;
  time: string;
  status: 'booked' | 'cancelled' | 'completed';
  reason: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAppointmentDto {
  patientId: number;
  providerId: number;
  date: string;
  time: string;
  reason: string;
}

export interface UpdateAppointmentDto {
  date?: string;
  time?: string;
  status?: 'booked' | 'cancelled' | 'completed';
  reason?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  role: 'patient' | 'provider';
}