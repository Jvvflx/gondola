import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ingestRoutes from './routes/ingest';
import dashboardRoutes from './routes/dashboard';
import uploadRoutes from './routes/upload';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/ingest', ingestRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/upload', uploadRoutes);
import { runAnalysis } from './services/scheduler';

app.post('/analysis/run', async (req, res) => {
    try {
        await runAnalysis();
        res.json({ message: 'Analysis triggered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to run analysis' });
    }
});

import { query } from './db';

app.post('/admin/clear-data', async (req, res) => {
    try {
        console.log('Clearing all data...');
        // Truncate tables in correct order (due to foreign keys)
        await query('TRUNCATE TABLE daily_sales, stock_snapshots, analysis_results, products CASCADE');
        res.json({ message: 'Data cleared successfully' });
    } catch (error) {
        console.error('Error clearing data:', error);
        res.status(500).json({ error: 'Failed to clear data' });
    }
});

app.get('/', (req, res) => {
    res.send('Gôndola Cloud API is running');
});

import { startScheduler } from './services/scheduler';

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    startScheduler();
});
