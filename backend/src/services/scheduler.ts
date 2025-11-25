import cron from 'node-cron';
import { query } from '../db';
import axios from 'axios';

const MANGABA_SERVICE_URL = process.env.MANGABA_SERVICE_URL || 'http://localhost:8000';

export const startScheduler = () => {
    // Run every 6 hours
    cron.schedule('0 */6 * * *', async () => {
        console.log('Running periodic analysis...');
        try {
            await runAnalysis();
        } catch (error) {
            console.error('Error running periodic analysis:', error);
        }
    });

    console.log('Scheduler started: Analysis set to run every 6 hours.');
};

export const runAnalysis = async () => {
    // 1. Fetch current state
    const products = await query('SELECT * FROM products');

    // Get latest stock snapshot for each product
    const stock = await query(`
        SELECT s.* 
        FROM stock_snapshots s
        JOIN (
            SELECT product_id, MAX(captured_at) as max_at
            FROM stock_snapshots
            GROUP BY product_id
        ) latest ON s.product_id = latest.product_id AND s.captured_at = latest.max_at
    `);

    // Get sales from last 30 days for velocity calculation
    const sales = await query(`
        SELECT * FROM daily_sales 
        WHERE sale_date >= CURRENT_DATE - INTERVAL '30 days'
    `);

    // Map to Mangaba format
    const payload = {
        products: products.rows.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: parseFloat(p.price),
            cost: parseFloat(p.cost),
            category: p.category,
            next_expiry_date: p.next_expiry_date ? p.next_expiry_date.toISOString().split('T')[0] : null
        })),
        stock: stock.rows.map((s: any) => ({
            productId: s.product_id,
            quantity: s.quantity,
            timestamp: s.captured_at
        })),
        sales: sales.rows.map((s: any) => ({
            productId: s.product_id,
            date: s.sale_date,
            quantity: s.quantity,
            totalAmount: parseFloat(s.total_amount)
        }))
    };

    // 2. Call Mangaba AI
    console.log('Sending data to Mangaba AI...');
    const response = await axios.post(`${MANGABA_SERVICE_URL}/analyze`, payload);

    // 3. Store Results
    console.log('Analysis complete. Insights received:', response.data.insights);

    try {
        await query(
            'INSERT INTO analysis_results (content) VALUES ($1)',
            [response.data.insights]
        );
        console.log('Insights persisted to database.');
    } catch (error) {
        console.error('Error persisting insights:', error);
    }
};
