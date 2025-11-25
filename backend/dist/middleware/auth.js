"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateApiKey = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No token provided' } });
    }
    const [, token] = authHeader.split(' ');
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default_secret');
        req.user = decoded;
        return next();
    }
    catch (err) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } });
    }
};
exports.authenticate = authenticate;
const authenticateApiKey = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No API key provided' } });
    }
    const [scheme, apiKey] = authHeader.split(' ');
    if (scheme !== 'Bearer') {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid authorization scheme' } });
    }
    try {
        const tenant = await prisma_1.prisma.tenant.findUnique({
            where: { apiKey },
        });
        if (!tenant) {
            return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid API key' } });
        }
        req.tenant = { id: tenant.id, name: tenant.name };
        return next();
    }
    catch (err) {
        console.error('Error authenticating API key:', err);
        return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
    }
};
exports.authenticateApiKey = authenticateApiKey;
