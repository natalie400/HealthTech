import express, { Application, Request, Response } from 'express';
import cors from 'cors'; 
import dotenv from 'dotenv';
import appointmentRoutes from './routes/appointmentRoutes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';

dotenv.config();

const app: Application = express();

// 1. THE CONNECTION CONFIGURATION
// We explicitly allow the Frontend URL to send cookies and data.
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', 
  credentials: true 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check (To see if the kitchen is open)
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    message: 'Clinic Scheduler API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Welcome to Clinic Scheduler API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      appointments: '/api/appointments',
    }
  });
});

// Routes (The Stations in the Kitchen)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);

// 404 handler (If they order something not on the menu)
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found` 
  });
});

export default app;