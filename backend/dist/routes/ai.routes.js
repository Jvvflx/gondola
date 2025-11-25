"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const ai_service_1 = require("../services/ai.service");
const router = (0, express_1.Router)();
const aiService = new ai_service_1.AIService();
// All routes require JWT authentication
router.use(auth_1.authenticate);
router.post('/suggestions', async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const suggestions = await aiService.generatePromotionSuggestions(tenantId);
        return res.json({ success: true, data: suggestions });
    }
    catch (error) {
        console.error('Error generating promotion suggestions:', error);
        return res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' },
        });
    }
});
router.get('/insights', async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const insights = await aiService.generateDailyInsights(tenantId);
        return res.json({ success: true, data: insights });
    }
    catch (error) {
        console.error('Error generating insights:', error);
        return res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' },
        });
    }
});
exports.default = router;
