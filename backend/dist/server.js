"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const ingest_1 = __importDefault(require("./routes/ingest"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const upload_1 = __importDefault(require("./routes/upload"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/ingest', ingest_1.default);
app.use('/dashboard', dashboard_1.default);
app.use('/upload', upload_1.default);
const scheduler_1 = require("./services/scheduler");
app.post('/analysis/run', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, scheduler_1.runAnalysis)();
        res.json({ message: 'Analysis triggered successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to run analysis' });
    }
}));
const db_1 = require("./db");
app.post('/admin/clear-data', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Clearing all data...');
        // Truncate tables in correct order (due to foreign keys)
        yield (0, db_1.query)('TRUNCATE TABLE daily_sales, stock_snapshots, analysis_results, products CASCADE');
        res.json({ message: 'Data cleared successfully' });
    }
    catch (error) {
        console.error('Error clearing data:', error);
        res.status(500).json({ error: 'Failed to clear data' });
    }
}));
app.get('/', (req, res) => {
    res.send('Gôndola Cloud API is running');
});
const scheduler_2 = require("./services/scheduler");
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    (0, scheduler_2.startScheduler)();
});
