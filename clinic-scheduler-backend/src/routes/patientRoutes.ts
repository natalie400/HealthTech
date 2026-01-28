import { Router } from 'express';
import { getHealthMetrics, getPatientNotes, createPatientNote } from '../controllers/patientController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Protect all routes - only logged in users can access
router.use(authenticateToken);

router.get('/metrics', getHealthMetrics);
router.get('/notes', getPatientNotes);
router.post('/notes', createPatientNote);

export default router;