import cron from 'node-cron';
import axios from 'axios';
import { MockERPAdapter } from './adapters/MockAdapter';
import dotenv from 'dotenv';

dotenv.config();

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
const adapter = new MockERPAdapter();

async function syncData() {
    console.log('Starting synchronization...');
    try {
        // 1. Fetch Data
        const products = await adapter.fetchProducts();
        const stock = await adapter.fetchCurrentStock();
        const sales = await adapter.fetchSales(new Date(), new Date());

        // 2. Send to Backend
        await axios.post(`${BACKEND_URL}/ingest`, {
            products,
            stock,
            sales,
            timestamp: new Date(),
        });

        console.log('Synchronization complete.');
    } catch (error) {
        console.error('Error during synchronization:', error);
    }
}

// Run every minute for demo purposes
cron.schedule('* * * * *', syncData);

console.log('Gondola Agent started. Running sync every minute.');
// Run once immediately on start
syncData();
