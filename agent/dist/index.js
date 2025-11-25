"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const shared_1 = require("@gondola/shared");
const config_1 = require("./config");
const mock_connector_1 = require("./connectors/mock.connector");
const sync_job_1 = require("./jobs/sync.job");
dotenv_1.default.config();
console.log(`🚀 Gôndola Agent starting... (Shared Version: ${shared_1.SHARED_VERSION})`);
const main = async () => {
    try {
        // Validate configuration
        (0, config_1.validateConfig)();
        console.log(`📡 API URL: ${config_1.config.apiUrl}`);
        console.log(`⏱️  Sync Interval: ${config_1.config.syncInterval}ms\n`);
        // Initialize connector (using Mock for now)
        const connector = new mock_connector_1.MockConnector();
        const syncJob = new sync_job_1.SyncJob(connector);
        // Run initial sync
        await syncJob.execute();
        // Schedule periodic syncs
        setInterval(async () => {
            try {
                await syncJob.execute();
            }
            catch (error) {
                console.error('Sync job failed:', error);
            }
        }, config_1.config.syncInterval);
        console.log('✅ Agent initialized successfully. Running in background...');
    }
    catch (error) {
        console.error('❌ Error initializing agent:', error);
        process.exit(1);
    }
};
main();
