import { GoogleGenerativeAI } from '@google/generative-ai';
import { MetricsService } from './metrics.service';

interface PromotionSuggestion {
    productId: string;
    productName: string;
    sku: string;
    reason: string;
    suggestedDiscount: number;
    priority: 'high' | 'medium' | 'low';
    aiInsight: string;
}

interface DailyInsight {
    summary: string;
    keyMetrics: string[];
    recommendations: string[];
    generatedAt: Date;
}

export class AIService {
    private genAI: GoogleGenerativeAI;
    private model: any;
    private metricsService: MetricsService;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn('GEMINI_API_KEY not set. AI features will be disabled.');
        }
        this.genAI = new GoogleGenerativeAI(apiKey || '');
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
        this.metricsService = new MetricsService();
    }

    async generatePromotionSuggestions(tenantId: string): Promise<PromotionSuggestion[]> {
        const [excessStock, validityAlerts] = await Promise.all([
            this.metricsService.getExcessStockAlerts(tenantId),
            this.metricsService.getValidityAlerts(tenantId),
        ]);

        const suggestions: PromotionSuggestion[] = [];

        // Excess stock promotions
        for (const alert of excessStock.slice(0, 5)) {
            const discount = alert.severity === 'high' ? 30 : alert.severity === 'medium' ? 20 : 15;

            const aiInsight = await this.getAIInsight(
                `Produto: ${alert.productName}. ${alert.reason}. Estoque atual: ${alert.currentStock} unidades. Sugira uma estratégia de promoção.`
            );

            suggestions.push({
                productId: alert.productId,
                productName: alert.productName,
                sku: alert.sku,
                reason: `Excesso de estoque: ${alert.reason}`,
                suggestedDiscount: discount,
                priority: alert.severity,
                aiInsight,
            });
        }

        // Validity promotions
        for (const alert of validityAlerts.slice(0, 5)) {
            const discount = alert.severity === 'high' ? 40 : alert.severity === 'medium' ? 25 : 15;

            const aiInsight = await this.getAIInsight(
                `Produto: ${alert.productName}. ${alert.reason}. Quantidade: ${alert.currentStock} unidades. Sugira uma estratégia de promoção urgente.`
            );

            suggestions.push({
                productId: alert.productId,
                productName: alert.productName,
                sku: alert.sku,
                reason: `Validade próxima: ${alert.reason}`,
                suggestedDiscount: discount,
                priority: alert.severity,
                aiInsight,
            });
        }

        return suggestions.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }

    async generateDailyInsights(tenantId: string): Promise<DailyInsight> {
        const [metrics, ruptureAlerts, excessAlerts, validityAlerts] = await Promise.all([
            this.metricsService.getDashboardMetrics(tenantId),
            this.metricsService.getRuptureAlerts(tenantId),
            this.metricsService.getExcessStockAlerts(tenantId),
            this.metricsService.getValidityAlerts(tenantId),
        ]);

        const prompt = `
Você é um consultor de varejo especializado. Analise os seguintes dados e forneça insights acionáveis:

Métricas Gerais:
- Total de produtos: ${metrics.totalProducts}
- Total de vendas: ${metrics.totalSales}
- Receita total: R$ ${metrics.totalRevenue.toFixed(2)}
- Alertas de ruptura: ${metrics.ruptureAlerts}
- Alertas de excesso: ${metrics.excessAlerts}
- Alertas de validade: ${metrics.validityAlerts}

Forneça:
1. Um resumo executivo (2-3 frases)
2. 3-5 métricas-chave para acompanhar
3. 3-5 recomendações práticas e específicas

Formato: JSON com campos "summary", "keyMetrics" (array), "recommendations" (array)
`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Try to parse JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    summary: parsed.summary || 'Análise em andamento',
                    keyMetrics: parsed.keyMetrics || [],
                    recommendations: parsed.recommendations || [],
                    generatedAt: new Date(),
                };
            }
        } catch (error) {
            console.error('Error generating AI insights:', error);
        }

        // Fallback if AI fails
        return {
            summary: `Sistema com ${metrics.totalProducts} produtos ativos, ${metrics.totalSales} vendas realizadas. Atenção para ${metrics.ruptureAlerts} alertas de ruptura e ${metrics.validityAlerts} produtos próximos da validade.`,
            keyMetrics: [
                `${metrics.ruptureAlerts} produtos em risco de ruptura`,
                `${metrics.excessAlerts} produtos com excesso de estoque`,
                `${metrics.validityAlerts} produtos próximos da validade`,
            ],
            recommendations: [
                'Revisar níveis de estoque dos produtos em alerta',
                'Criar promoções para produtos com excesso',
                'Priorizar venda de produtos próximos da validade',
            ],
            generatedAt: new Date(),
        };
    }

    private async getAIInsight(prompt: string): Promise<string> {
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error) {
            console.error('Error getting AI insight:', error);
            return 'Análise de IA temporariamente indisponível';
        }
    }
}
