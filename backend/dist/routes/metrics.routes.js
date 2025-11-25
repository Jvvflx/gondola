"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const metrics_service_1 = require("../services/metrics.service");
const router = (0, express_1.Router)();
const metricsService = new metrics_service_1.MetricsService();
// All routes require JWT authentication
router.use(auth_1.authenticate);
router.get('/dashboard', async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const metrics = await metricsService.getDashboardMetrics(tenantId);
        return res.json({ success: true, data: metrics });
    }
    catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        return res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' },
        });
    }
});
router.get('/rupture', async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const alerts = await metricsService.getRuptureAlerts(tenantId);
        return res.json({ success: true, data: alerts });
    }
    catch (error) {
        console.error('Error fetching rupture alerts:', error);
        return res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' },
        });
    }
});
router.get('/excess', async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const alerts = await metricsService.getExcessStockAlerts(tenantId);
        return res.json({ success: true, data: alerts });
    }
    catch (error) {
        console.error('Error fetching excess stock alerts:', error);
        return res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' },
        });
    }
});
router.get('/validity', async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const alerts = await metricsService.getValidityAlerts(tenantId);
        return res.json({ success: true, data: alerts });
    }
    catch (error) {
        console.error('Error fetching validity alerts:', error);
        return res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' },
        });
    }
});
router.get('/sales-history', async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const days = parseInt(req.query.days) || 30;
        const history = await metricsService.getSalesHistory(tenantId, days);
        return res.json({ success: true, data: history });
    }
    catch (error) {
        console.error('Error fetching sales history:', error);
        return res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' },
        });
    }
});
exports.default = router;
