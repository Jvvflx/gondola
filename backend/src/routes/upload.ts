import { Router } from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import { query } from '../db';
import axios from 'axios';

const router = Router();
const upload = multer({ dest: 'uploads/' });
const MANGABA_SERVICE_URL = process.env.MANGABA_SERVICE_URL || 'http://localhost:8000';

interface CsvRow {
    id: string;
    name: string;
    price: string;
    cost: string;
    category: string;
    stock_quantity: string;
    sales_quantity: string;
    sales_total: string;
    expiry_date?: string;
}

router.post('/', upload.array('files'), async (req, res) => {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }

    const files = req.files as Express.Multer.File[];
    const period = req.body.period || 'day';
    const now = new Date();

    let totalProcessed = 0;
    const allProducts: any[] = [];
    const allStock: any[] = [];
    const allSales: any[] = [];

    try {
        // Process files sequentially to maintain order
        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Calculate timestamp for this file
            // We assume the last file is "Today" and previous files are history
            const offset = (files.length - 1) - i;
            const fileDate = new Date(now);

            if (period === 'hour') {
                fileDate.setHours(fileDate.getHours() - offset);
            } else if (period === 'month') {
                fileDate.setMonth(fileDate.getMonth() - offset);
            } else {
                // default day
                fileDate.setDate(fileDate.getDate() - offset);
            }

            console.log(`Processing file ${file.originalname} for date: ${fileDate.toISOString()}`);

            await new Promise<void>((resolve, reject) => {
                const results: CsvRow[] = [];
                fs.createReadStream(file.path)
                    .pipe(csv({
                        mapHeaders: ({ header }) => header.trim().replace(/^\ufeff/, '')
                    }))
                    .on('data', (data: CsvRow) => results.push(data))
                    .on('end', async () => {
                        try {
                            for (const row of results) {
                                // Map to internal models
                                const product = {
                                    id: row.id,
                                    name: row.name,
                                    price: parseFloat(row.price),
                                    cost: parseFloat(row.cost),
                                    category: row.category,
                                    next_expiry_date: row.expiry_date ? new Date(row.expiry_date.split(';')[0].trim()) : null
                                };
                                allProducts.push(product);

                                allStock.push({
                                    productId: row.id,
                                    quantity: parseInt(row.stock_quantity),
                                    timestamp: fileDate
                                });

                                // Sales data
                                if (row.sales_quantity && row.sales_total) {
                                    allSales.push({
                                        productId: row.id,
                                        date: fileDate,
                                        quantity: parseInt(row.sales_quantity),
                                        totalAmount: parseFloat(row.sales_total)
                                    });
                                }
                            }
                            totalProcessed += results.length;

                            // Cleanup file
                            fs.unlinkSync(file.path);
                            resolve();
                        } catch (err) {
                            reject(err);
                        }
                    })
                    .on('error', reject);
            });
        }

        // Batch Insert Data
        // 1. Upsert Products (using the latest info from all files, effectively last file wins if duplicates)
        // We can just iterate allProducts, Postgres will handle updates
        for (const p of allProducts) {
            await query(
                `INSERT INTO products (id, name, price, cost, category, next_expiry_date)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 ON CONFLICT (id) DO UPDATE SET
                   name = EXCLUDED.name,
                   price = EXCLUDED.price,
                   cost = EXCLUDED.cost,
                   category = EXCLUDED.category,
                   next_expiry_date = EXCLUDED.next_expiry_date,
                   updated_at = CURRENT_TIMESTAMP`,
                [p.id, p.name, p.price, p.cost, p.category, p.next_expiry_date]
            );
        }

        // 2. Insert Stock Snapshots
        for (const s of allStock) {
            await query(
                `INSERT INTO stock_snapshots (product_id, quantity, captured_at)
                 VALUES ($1, $2, $3)`,
                [s.productId, s.quantity, s.timestamp]
            );
        }

        // 3. Insert Daily Sales
        for (const s of allSales) {
            await query(
                `INSERT INTO daily_sales (product_id, sale_date, quantity, total_amount)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (product_id, sale_date) DO UPDATE SET
                   quantity = EXCLUDED.quantity,
                   total_amount = EXCLUDED.total_amount`,
                [s.productId, s.date, s.quantity, s.totalAmount]
            );
        }

        // Trigger Mangaba AI
        // We send all the data we just processed + history if needed
        // For efficiency, let's just send what we have + maybe some history if the upload was small
        // But the user wants to simulate history, so the uploaded data IS the history.

        try {
            console.log('Triggering Mangaba AI Analysis...');
            const aiResponse = await axios.post(`${MANGABA_SERVICE_URL}/analyze`, {
                products: allProducts, // This might be large, but for now it's fine
                stock: allStock,
                sales: allSales
            });

            const { insights } = aiResponse.data;

            if (insights && insights.recommendations) {
                // Save predictions
                for (const rec of insights.recommendations) {
                    // Clear existing active predictions for this product to avoid duplicates
                    await query(`
                        DELETE FROM predictions 
                        WHERE product_id = $1 AND status = 'risk'
                    `, [rec.productId]);

                    await query(`
                        INSERT INTO predictions (product_id, status, suggested_action, confidence_score, details)
                        VALUES ($1, $2, $3, $4, $5)
                    `, [
                        rec.productId,
                        'risk',
                        rec.suggestion,
                        rec.confidence || 0.8,
                        JSON.stringify(rec)
                    ]);
                }
            }
        } catch (err) {
            console.error('Failed to trigger Mangaba AI:', err);
        }

        res.json({ message: 'Files processed successfully', count: totalProcessed });

    } catch (error) {
        console.error('Error processing upload:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error processing files' });
    }
});

export default router;
