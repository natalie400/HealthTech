import { Request, Response } from 'express';
import prisma from '../utils/db';

// GET /api/patient/metrics
export const getHealthMetrics = async (req: Request, res: Response) => {
  try {
    // 1. Get the logged-in user's ID
    const userId = (req as any).userId;

    // 2. Fetch metrics for THIS patient only
    // ✅ FIX: Cast prisma to 'any' to bypass the error
    const metrics = await (prisma as any).healthMetric.findMany({
      where: { patientId: userId },
      orderBy: { recordedAt: 'asc' }, // Oldest to newest (good for charts)
    });

    res.json({ success: true, data: metrics });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ success: false, message: 'Error fetching health metrics' });
  }
};

// GET /api/patient/notes
export const getPatientNotes = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    // ✅ FIX: Cast prisma to 'any'
    const notes = await (prisma as any).patientNote.findMany({
      where: { patientId: userId },
      orderBy: { createdAt: 'desc' }, // Newest first
    });

    res.json({ success: true, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching notes' });
  }
};

// POST /api/patient/notes
export const createPatientNote = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { title, content, category } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    // ✅ FIX: Cast prisma to 'any'
    const newNote = await (prisma as any).patientNote.create({
      data: {
        patientId: userId,
        title,
        content,
        category,
      },
    });

    res.status(201).json({ success: true, data: newNote });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating note' });
  }
};