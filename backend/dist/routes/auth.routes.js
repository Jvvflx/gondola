"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, tenantName } = req.body;
        // Check if user already exists
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ success: false, error: { code: 'USER_EXISTS', message: 'User already exists' } });
        }
        // Create Tenant
        const tenant = await prisma_1.prisma.tenant.create({
            data: {
                name: tenantName,
                apiKey: require('crypto').randomBytes(16).toString('hex'), // Simple API Key generation
            },
        });
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Create User
        const user = await prisma_1.prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                tenantId: tenant.id,
                role: 'admin',
            },
        });
        return res.status(201).json({ success: true, data: { userId: user.id, tenantId: tenant.id } });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } });
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, tenantId: user.tenantId, role: user.role }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '1d' });
        return res.json({ success: true, data: { token, user: { id: user.id, name: user.name, email: user.email } } });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
    }
});
exports.default = router;
