import express from 'express';
import { getSystemStats, getUsersList } from '../controllers/adminController';
// Ensure you are using the correct middleware name!
import { authenticateToken } from '../middleware/auth'; 

const router = express.Router();

router.use(authenticateToken); // Protect routes

router.get('/stats', getSystemStats);
router.get('/users', getUsersList);

export default router;