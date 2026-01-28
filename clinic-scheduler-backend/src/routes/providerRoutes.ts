import { Router } from 'express';
import { getPatientDetails } from '../controllers/providerController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// Provider fetching a specific patient's data
router.get('/patients/:id', getPatientDetails);

export default router;