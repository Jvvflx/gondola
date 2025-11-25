import dotenv from 'dotenv';
import { SHARED_VERSION } from '@gondola/shared';
import { config, validateConfig } from './config';
import { MockConnector } from './connectors/mock.connector';
import { SyncJob } from './jobs/sync.job';

dotenv.config();

console.log(`🚀 Gôndola Agent starting... (Shared Version: ${SHARED_VERSION})`);

const main = async () => {
    try {
        // Validate configuration
        validateConfig();
        console.log(`📡 API URL: ${config.apiUrl}`);
        console.log(`⏱️  Sync Interval: ${config.syncInterval}ms\n`);

        // Initialize connector (using Mock for now)
        const connector = new MockConnector();
        const syncJob = new SyncJob(connector);

        // Run initial sync
        await syncJob.execute();

        // Schedule periodic syncs
        setInterval(async () => {
            try {
                await syncJob.execute();
            } catch (error) {
                console.error('Sync job failed:', error);
            }
        }, config.syncInterval);

        console.log('✅ Agent initialized successfully. Running in background...');
    } catch (error) {
        console.error('❌ Error initializing agent:', error);
        process.exit(1);
    }
};

main();
