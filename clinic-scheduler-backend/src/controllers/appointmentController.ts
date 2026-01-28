import { Request, Response } from 'express';
import prisma from '../utils/db';

// Helper to validate business hours (e.g., 8 AM to 5 PM)
const isBusinessHour = (timeString: string) => {
  const hour = parseInt(timeString.split(':')[0]);
  return hour >= 8 && hour <= 17;
};

// GET /api/appointments - Secured with RBAC 🛡️
export const getAllAppointments = async (req: Request, res: Response) => {
  try {
    // 1. Get the logged-in user's details (attached by middleware)
    // We cast to 'any' because Express Request doesn't know about our custom JWT fields yet
    const user = (req as any); 
    const role = user.role;
    const userId = user.userId;

    // 2. Start with an empty filter
    const where: any = {};

    // 3. ENFORCE ROLE-BASED ACCESS (Requirement #3)
    // "As the system, I want to enforce role-based access"
    if (role === 'patient') {
      where.patientId = userId; // Patient can ONLY see their own
    } else if (role === 'provider') {
      where.providerId = userId; // Provider can ONLY see their own
    } 
    // Admin (or others) bypasses this and can see all (or use query params below)

    // 4. Apply optional filters (only if they don't conflict with forced roles)
    const { patientId, providerId, status } = req.query;
    
    // If Admin wants to filter by specific people:
    if (role === 'admin') {
      if (patientId) where.patientId = Number(patientId);
      if (providerId) where.providerId = Number(providerId);
    }
    if (status) where.status = status as string;

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: { select: { id: true, name: true, email: true } },
        provider: { select: { id: true, name: true, email: true } },
      },
      orderBy: { date: 'desc' },
    });

    // Format response (Flattening the data)
    const formatted = appointments.map(apt => ({
      id: apt.id,
      patientId: apt.patientId,
      patientName: apt.patient.name,
      providerId: apt.providerId,
      providerName: apt.provider.name,
      date: apt.date.toISOString().split('T')[0],
      time: apt.time,
      status: apt.status,
      reason: apt.reason,
      createdAt: apt.createdAt,
      updatedAt: apt.updatedAt,
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ success: false, message: 'Error fetching appointments' });
  }
};

// GET /api/appointments/:id - Secured 🛡️
export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any);

    const appointment = await prisma.appointment.findUnique({
      where: { id: Number(id) },
      include: {
        patient: { select: { id: true, name: true, email: true } },
        provider: { select: { id: true, name: true, email: true } },
      },
    });

    if (!appointment) return res.status(404).json({ success: false, message: 'Not found' });

    // RBAC Check for Single Item
    if (user.role === 'patient' && appointment.patientId !== user.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (user.role === 'provider' && appointment.providerId !== user.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching appointment' });
  }
};

// POST /api/appointments - Validated & Conflict Checked 🛡️
export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { patientId, providerId, date, time, reason } = req.body;

    // 1. INPUT VALIDATION (Requirement #2)
    // "As the system, I want to validate all inputs"
    if (!patientId || !providerId || !date || !time || !reason) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Date Validation: No past dates
    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    if (appointmentDate < today) {
      return res.status(400).json({ success: false, message: 'Cannot book appointments in the past' });
    }

    // Time Validation: Business hours only (Simple check)
    // if (!isBusinessHour(time)) {
    //   return res.status(400).json({ success: false, message: 'Please select a time between 8 AM and 5 PM' });
    // }

    // 2. PREVENT DOUBLE BOOKING (Requirement #1)
    // "As the system, I want to prevent double-booking"
    const conflict = await prisma.appointment.findFirst({
      where: {
        providerId,
        date: appointmentDate,
        time,
        status: { in: ['booked', 'confirmed'] }, // Check strictly for taken slots
      },
    });

    if (conflict) {
      return res.status(409).json({ 
        success: false, 
        message: 'This time slot is already double-booked. Please choose another.' 
      });
    }

    const newAppointment = await prisma.appointment.create({
      data: {
        patientId,
        providerId,
        date: appointmentDate,
        time,
        status: 'booked',
        reason,
      },
      include: {
        patient: { select: { id: true, name: true } },
        provider: { select: { id: true, name: true } }
      }
    });

    res.status(201).json({ success: true, message: 'Appointment booked successfully', data: newAppointment });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ success: false, message: 'Error creating appointment' });
  }
};

// PATCH /api/appointments/:id
export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Basic existence check
    const existing = await prisma.appointment.findUnique({ where: { id: Number(id) } });
    if (!existing) return res.status(404).json({ success: false, message: 'Not found' });

    if (updates.date) updates.date = new Date(updates.date);

    const updated = await prisma.appointment.update({
      where: { id: Number(id) },
      data: updates,
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating' });
  }
};

// DELETE /api/appointments/:id
export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.appointment.delete({ where: { id: Number(id) } });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting' });
  }
};