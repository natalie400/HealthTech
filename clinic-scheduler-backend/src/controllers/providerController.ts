import { Request, Response } from 'express';
import prisma from '../utils/db';

// GET /api/provider/patients/:id
export const getPatientDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // The Patient's ID

    // 1. Fetch Patient Info
    const patient = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: { id: true, name: true, email: true }
    });

    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    // 2. Fetch Their Health Metrics (Charts)
    const metrics = await (prisma as any).healthMetric.findMany({
      where: { patientId: Number(id) },
      orderBy: { recordedAt: 'asc' },
    });

    // 3. Fetch Their Notes (Symptoms)
    const notes = await (prisma as any).patientNote.findMany({
      where: { patientId: Number(id) },
      orderBy: { createdAt: 'desc' },
    });

    // 4. Fetch Past Appointments with this Doctor
    const appointments = await prisma.appointment.findMany({
      where: { 
        patientId: Number(id),
        // Optional: restrict to only appointments with THIS provider?
        // providerId: (req as any).userId 
      },
      orderBy: { date: 'desc' }
    });

    res.json({
      success: true,
      data: {
        patient,
        metrics,
        notes,
        appointments
      }
    });

  } catch (error) {
    console.error('Error fetching patient details:', error);
    res.status(500).json({ success: false, message: 'Error fetching patient data' });
  }
};