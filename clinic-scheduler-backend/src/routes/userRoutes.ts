import { Router } from 'express';
import prisma from '../utils/db';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/users - Get all users (protected)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/users/providers - Get all providers (public)
router.get('/providers', async (req, res) => {
  try {
    const providers = await prisma.user.findMany({
      where: { role: 'provider' },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    res.json({
      success: true,
      count: providers.length,
      data: providers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching providers',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/users/:id - Get single user (protected)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;