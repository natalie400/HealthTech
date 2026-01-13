import { Router } from 'express';
import {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from '../controllers/appointmentController';

const router = Router();

// GET /api/appointments
router.get('/', getAllAppointments);

// GET /api/appointments/:id
router.get('/:id', getAppointmentById);

// POST /api/appointments
router.post('/', createAppointment);

// PATCH /api/appointments/:id
router.patch('/:id', updateAppointment);

// DELETE /api/appointments/:id
router.delete('/:id', deleteAppointment);

export default router;