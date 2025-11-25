import dotenv from 'dotenv';

dotenv.config();

export const config = {
    apiUrl: process.env.API_URL || 'http://localhost:3000',
    apiKey: process.env.API_KEY || '',
    syncInterval: parseInt(process.env.SYNC_INTERVAL || '60000', 10), // Default: 60 seconds
    tenantId: process.env.TENANT_ID || '',
};

export const validateConfig = () => {
    if (!config.apiKey) {
        throw new Error('API_KEY is required');
    }
    if (!config.tenantId) {
        throw new Error('TENANT_ID is required');
    }
};
