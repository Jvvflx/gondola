import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load env from the backend directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'gondola',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
});

async function testConnection() {
    try {
        console.log('Testing connection with config:');
        console.log(`User: ${process.env.DB_USER}`);
        console.log(`Host: ${process.env.DB_HOST}`);
        console.log(`DB: ${process.env.DB_NAME}`);
        console.log(`Port: ${process.env.DB_PORT}`);

        const client = await pool.connect();
        console.log('Successfully connected to the database!');
        const res = await client.query('SELECT NOW()');
        console.log('Current time from DB:', res.rows[0].now);
        client.release();
        process.exit(0);
    } catch (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
}

testConnection();
