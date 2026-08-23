import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import patientRoutes from './routes/patient';
import doctorRoutes from './routes/doctor';
import calendarRoutes from './routes/calendar';
import { startMedicationRemindersJob } from './jobs/reminders';
import { startEmailQueueJob } from './jobs/emailRetries';
import { prisma } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Healthcare Appointment Manager API is running' });
});

// Authentication Routes
app.use('/api/auth', authRoutes);

// Admin Routes
app.use('/api/admin', adminRoutes);

// Doctor Routes
app.use('/api/doctor', doctorRoutes);

// Patient Routes
app.use('/api/patient', patientRoutes);

// Calendar Routes
app.use('/api/calendar', calendarRoutes);

// Initialize Background Jobs
startMedicationRemindersJob();
startEmailQueueJob();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
