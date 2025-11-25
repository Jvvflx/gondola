"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateConfig = exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    apiUrl: process.env.API_URL || 'http://localhost:3000',
    apiKey: process.env.API_KEY || '',
    syncInterval: parseInt(process.env.SYNC_INTERVAL || '60000', 10), // Default: 60 seconds
    tenantId: process.env.TENANT_ID || '',
};
const validateConfig = () => {
    if (!exports.config.apiKey) {
        throw new Error('API_KEY is required');
    }
    if (!exports.config.tenantId) {
        throw new Error('TENANT_ID is required');
    }
};
exports.validateConfig = validateConfig;
