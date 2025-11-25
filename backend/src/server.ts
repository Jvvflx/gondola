import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { SHARED_VERSION } from '@gondola/shared';

import authRoutes from './routes/auth.routes';
import dataRoutes from './routes/data.routes';
import metricsRoutes from './routes/metrics.routes';
import aiRoutes from './routes/ai.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration to allow frontend access
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/api', dataRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Gôndola API is running', sharedVersion: SHARED_VERSION });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
