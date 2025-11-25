import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { AIService } from '../services/ai.service';

const router = Router();
const aiService = new AIService();

// All routes require JWT authentication
router.use(authenticate);

router.post('/suggestions', async (req, res) => {
    try {
        const tenantId = req.user!.tenantId;
        const suggestions = await aiService.generatePromotionSuggestions(tenantId);

        return res.json({ success: true, data: suggestions });
    } catch (error) {
        console.error('Error generating promotion suggestions:', error);
        return res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' },
        });
    }
});

router.get('/insights', async (req, res) => {
    try {
        const tenantId = req.user!.tenantId;
        const insights = await aiService.generateDailyInsights(tenantId);

        return res.json({ success: true, data: insights });
    } catch (error) {
        console.error('Error generating insights:', error);
        return res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' },
        });
    }
});

export default router;
