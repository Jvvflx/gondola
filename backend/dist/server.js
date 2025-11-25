"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const shared_1 = require("@gondola/shared");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const data_routes_1 = __importDefault(require("./routes/data.routes"));
const metrics_routes_1 = __importDefault(require("./routes/metrics.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/auth', auth_routes_1.default);
app.use('/api', data_routes_1.default);
app.use('/api/metrics', metrics_routes_1.default);
app.use('/api/ai', ai_routes_1.default);
app.get('/', (req, res) => {
    res.json({ message: 'Gôndola API is running', sharedVersion: shared_1.SHARED_VERSION });
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
