import { Request, Response } from 'express';
import prisma from '../utils/db';
import { CreateAppointmentDto, UpdateAppointmentDto } from '../types';

// GET /api/appointments - Get all appointments
export const getAllAppointments = async (req: Request, res: Response) => {
  try {
    const { patientId, providerId, status } = req.query;

    // Build filter conditions
    const where: any = {};
    
    if (patientId) {
      where.patientId = Number(patientId);
    }
    
    if (providerId) {
      where.providerId = Number(providerId);
    }
    
    if (status) {
      where.status = status as string;
    }

    // Fetch from database with relations
    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          select: { id: true, name: true, email: true },
        },
        provider: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Format response
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

    res.json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// GET /api/appointments/:id - Get single appointment
export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id: Number(id) },
      include: {
        patient: {
          select: { id: true, name: true, email: true },
        },
        provider: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    const formatted = {
      id: appointment.id,
      patientId: appointment.patientId,
      patientName: appointment.patient.name,
      providerId: appointment.providerId,
      providerName: appointment.provider.name,
      date: appointment.date.toISOString().split('T')[0],
      time: appointment.time,
      status: appointment.status,
      reason: appointment.reason,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    };

    res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// POST /api/appointments - Create new appointment (Handles Blocks)
export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { patientId, providerId, date, time, reason, status } = req.body;
    
    // Default status if not provided
    const appointmentStatus = status || 'booked';

    // Validation
    if (!patientId || !providerId || !date || !time || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: patientId, providerId, date, time, reason',
      });
    }

    // Patient Validation Logic
    const patient = await prisma.user.findUnique({
      where: { id: patientId },
    });

    // ALLOW if status is 'blocked' (Provider booking themselves)
    // REJECT if normal booking and role is not 'patient'
    if (!patient || (patient.role !== 'patient' && appointmentStatus !== 'blocked')) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found or invalid role for this operation',
      });
    }

    // Check if provider exists
    const provider = await prisma.user.findUnique({
      where: { id: providerId },
    });

    if (!provider || provider.role !== 'provider') {
      return res.status(404).json({
        success: false,
        message: 'Provider not found',
      });
    }

    // Conflict Detection
    // Check if slot is occupied by EITHER 'booked' OR 'blocked' status
    const conflict = await prisma.appointment.findFirst({
      where: {
        providerId,
        date: new Date(date),
        time,
        status: { in: ['booked', 'blocked'] },
      },
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already unavailable',
      });
    }

    // Create appointment
    const newAppointment = await prisma.appointment.create({
      data: {
        patientId,
        providerId,
        date: new Date(date),
        time,
        status: appointmentStatus,
        reason,
      },
      include: {
        patient: { select: { id: true, name: true, email: true } },
        provider: { select: { id: true, name: true, email: true } },
      },
    });

    const formatted = {
      id: newAppointment.id,
      patientId: newAppointment.patientId,
      patientName: newAppointment.patient.name,
      providerId: newAppointment.providerId,
      providerName: newAppointment.provider.name,
      date: newAppointment.date.toISOString().split('T')[0],
      time: newAppointment.time,
      status: newAppointment.status,
      reason: newAppointment.reason,
      createdAt: newAppointment.createdAt,
      updatedAt: newAppointment.updatedAt,
    };

    res.status(201).json({
      success: true,
      message: appointmentStatus === 'blocked' ? 'Time slot blocked successfully' : 'Appointment created successfully',
      data: formatted,
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating appointment',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// PATCH /api/appointments/:id - Update appointment (Updated for Conflict Checks)
export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: UpdateAppointmentDto = req.body;

    // 1. Fetch existing appointment
    const existing = await prisma.appointment.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // 2. CONFLICT CHECK (Critical Fix)
    // If date or time is being changed, verify the new slot is empty
    if (updates.date || updates.time) {
      const checkDate = updates.date ? new Date(updates.date) : existing.date;
      const checkTime = updates.time || existing.time;
      const checkProviderId = existing.providerId; // Provider usually stays same

      const conflict = await prisma.appointment.findFirst({
        where: {
          providerId: checkProviderId,
          date: checkDate,
          time: checkTime,
          // Conflict if slot is booked OR blocked
          status: { in: ['booked', 'blocked'] },
          // IMPORTANT: Exclude the current appointment ID from the check
          id: { not: Number(id) } 
        }
      });

      if (conflict) {
        return res.status(409).json({
          success: false,
          message: 'The new time slot is already unavailable',
        });
      }
    }

    // 3. Build update data
    const updateData: any = {};
    
    if (updates.date) {
      updateData.date = new Date(updates.date);
    }
    
    if (updates.time) {
      updateData.time = updates.time;
    }
    
    if (updates.status) {
      updateData.status = updates.status;
    }
    
    if (updates.reason) {
      updateData.reason = updates.reason;
    }

    // 4. Update appointment
    const updated = await prisma.appointment.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        patient: { select: { id: true, name: true, email: true } },
        provider: { select: { id: true, name: true, email: true } },
      },
    });

    const formatted = {
      id: updated.id,
      patientId: updated.patientId,
      patientName: updated.patient.name,
      providerId: updated.providerId,
      providerName: updated.provider.name,
      date: updated.date.toISOString().split('T')[0],
      time: updated.time,
      status: updated.status,
      reason: updated.reason,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: formatted,
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating appointment',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// DELETE /api/appointments/:id - Delete appointment
export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if appointment exists
    const existing = await prisma.appointment.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Delete appointment
    await prisma.appointment.delete({
      where: { id: Number(id) },
    });

    res.json({
      success: true,
      message: 'Appointment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting appointment',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};