import { Request, Response } from 'express';
import prisma from '../utils/db';

export const getSystemStats = async (req: Request, res: Response) => {
  try {
    const [totalUsers, providers, patients, totalAppointments] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'provider' } }),
      prisma.user.count({ where: { role: 'patient' } }),
      prisma.appointment.count(),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        providers,
        patients,
        appointments: totalAppointments,
        systemStatus: 'Healthy',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching stats' });
  }
};

export const getUsersList = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
};