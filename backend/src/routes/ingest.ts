import { Router } from 'express';
import { query } from '../db';
import axios from 'axios';

const router = Router();
const MANGABA_SERVICE_URL = process.env.MANGABA_SERVICE_URL || 'http://localhost:8000';

router.post('/', async (req, res) => {
    try {
        const { products, stock, sales, timestamp } = req.body;

        if (!products || !stock || !sales || !timestamp) {
            return res.status(400).json({ error: 'Missing required fields: products, stock, sales, timestamp' });
        }

        if (!Array.isArray(products) || !Array.isArray(stock) || !Array.isArray(sales)) {
            return res.status(400).json({ error: 'Invalid data format: products, stock, and sales must be arrays' });
        }

        console.log(`Received data at ${timestamp}`);

        // 1. Upsert Products
        for (const p of products) {
            await query(
                `INSERT INTO products (id, name, price, cost, category)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (id) DO UPDATE SET
                   name = EXCLUDED.name,
                   price = EXCLUDED.price,
                   cost = EXCLUDED.cost,
                   category = EXCLUDED.category,
                   updated_at = CURRENT_TIMESTAMP`,
                [p.id, p.name, p.price, p.cost, p.category]
            );
        }

        // 2. Insert Stock Snapshots
        for (const s of stock) {
            await query(
                `INSERT INTO stock_snapshots (product_id, quantity, captured_at)
                 VALUES ($1, $2, $3)`,
                [s.productId, s.quantity, s.timestamp]
            );
        }

        // 3. Insert Daily Sales (Upsert to handle re-runs for same day)
        for (const s of sales) {
            await query(
                `INSERT INTO daily_sales (product_id, sale_date, quantity, total_amount)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (product_id, sale_date) DO UPDATE SET
                   quantity = EXCLUDED.quantity,
                   total_amount = EXCLUDED.total_amount`,
                [s.productId, s.date, s.quantity, s.totalAmount]
            );
        }

        // Trigger Mangaba AI for analysis
        try {
            await axios.post(`${MANGABA_SERVICE_URL}/analyze`, {
                products,
                stock,
                sales
            });
        } catch (err) {
            console.error('Failed to trigger Mangaba AI:', err);
        }

        res.status(200).json({ message: 'Data ingested successfully' });
    } catch (error) {
        console.error('Error processing ingestion:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
