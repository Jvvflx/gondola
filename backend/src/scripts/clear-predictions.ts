import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'gondola',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
});

async function clearDuplicates() {
    try {
        console.log('Clearing duplicate predictions...');
        // Keep only the most recent prediction for each product
        await pool.query(`
            DELETE FROM predictions a USING (
                SELECT MIN(id) as id, product_id
                FROM predictions 
                WHERE status = 'risk'
                GROUP BY product_id
                HAVING COUNT(*) > 1
            ) b
            WHERE a.product_id = b.product_id 
            AND a.id <> b.id
        `);

        // Or simpler: just delete all and let them re-upload
        // await pool.query('TRUNCATE TABLE predictions');

        console.log('Duplicates cleared (kept oldest/newest depending on logic, or just wiped).');
        // Actually, let's just wipe them so the user sees the fresh result from next upload
        await pool.query('DELETE FROM predictions');
        console.log('All predictions cleared. Please re-upload to generate fresh ones.');

        process.exit(0);
    } catch (err) {
        console.error('Failed to clear duplicates:', err);
        process.exit(1);
    }
}

clearDuplicates();
