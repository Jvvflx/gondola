"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const data_ingestion_service_1 = require("../services/data-ingestion.service");
const router = (0, express_1.Router)();
const dataService = new data_ingestion_service_1.DataIngestionService();
// All routes require API key authentication
router.use(auth_1.authenticateApiKey);
router.post('/products', async (req, res) => {
    try {
        const products = req.body;
        const tenantId = req.tenant.id;
        if (!Array.isArray(products)) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_INPUT', message: 'Expected an array of products' },
            });
        }
        await dataService.upsertProducts(tenantId, products);
        return res.json({
            success: true,
            data: { count: products.length, message: 'Products synced successfully' },
        });
    }
    catch (error) {
        console.error('Error syncing products:', error);
        return res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' },
        });
    }
});
router.post('/stock', async (req, res) => {
    try {
        const stocks = req.body;
        const tenantId = req.tenant.id;
        if (!Array.isArray(stocks)) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_INPUT', message: 'Expected an array of stock records' },
            });
        }
        await dataService.upsertStock(tenantId, stocks);
        return res.json({
            success: true,
            data: { count: stocks.length, message: 'Stock synced successfully' },
        });
    }
    catch (error) {
        console.error('Error syncing stock:', error);
        return res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' },
        });
    }
});
router.post('/sales', async (req, res) => {
    try {
        const sales = req.body;
        const tenantId = req.tenant.id;
        if (!Array.isArray(sales)) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_INPUT', message: 'Expected an array of sales' },
            });
        }
        await dataService.createSales(tenantId, sales);
        return res.json({
            success: true,
            data: { count: sales.length, message: 'Sales synced successfully' },
        });
    }
    catch (error) {
        console.error('Error syncing sales:', error);
        return res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' },
        });
    }
});
exports.default = router;
