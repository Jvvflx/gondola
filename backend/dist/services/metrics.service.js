"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
const prisma_1 = require("../lib/prisma");
class MetricsService {
    async getDashboardMetrics(tenantId) {
        const [totalProducts, sales, ruptureCount, excessCount, validityCount] = await Promise.all([
            prisma_1.prisma.product.count({ where: { tenantId, active: true } }),
            prisma_1.prisma.sale.aggregate({
                where: { tenantId },
                _count: true,
                _sum: { total: true },
            }),
            this.getRuptureAlerts(tenantId).then(alerts => alerts.length),
            this.getExcessStockAlerts(tenantId).then(alerts => alerts.length),
            this.getValidityAlerts(tenantId).then(alerts => alerts.length),
        ]);
        return {
            totalProducts,
            totalSales: sales._count,
            totalRevenue: sales._sum.total || 0,
            ruptureAlerts: ruptureCount,
            excessAlerts: excessCount,
            validityAlerts: validityCount,
        };
    }
    async getRuptureAlerts(tenantId) {
        const products = await prisma_1.prisma.product.findMany({
            where: { tenantId, active: true },
            include: {
                stocks: true,
                saleItems: {
                    include: { sale: true },
                    where: {
                        sale: {
                            date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
                        },
                    },
                },
            },
        });
        const alerts = [];
        for (const product of products) {
            const stock = product.stocks[0];
            if (!stock)
                continue;
            // Calculate average daily sales
            const totalSold = product.saleItems.reduce((sum, item) => sum + item.quantity, 0);
            const averageDailySales = totalSold / 7;
            // Alert if stock is less than 3 days of sales
            if (averageDailySales > 0 && stock.quantity < averageDailySales * 3) {
                const daysOfStock = stock.quantity / averageDailySales;
                alerts.push({
                    productId: product.id,
                    productName: product.name,
                    sku: product.sku,
                    currentStock: stock.quantity,
                    averageDailySales,
                    reason: `Estoque para apenas ${daysOfStock.toFixed(1)} dias`,
                    severity: daysOfStock < 1 ? 'high' : daysOfStock < 2 ? 'medium' : 'low',
                });
            }
        }
        return alerts.sort((a, b) => {
            const severityOrder = { high: 0, medium: 1, low: 2 };
            return severityOrder[a.severity] - severityOrder[b.severity];
        });
    }
    async getExcessStockAlerts(tenantId) {
        const products = await prisma_1.prisma.product.findMany({
            where: { tenantId, active: true },
            include: {
                stocks: true,
                saleItems: {
                    include: { sale: true },
                    where: {
                        sale: {
                            date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
                        },
                    },
                },
            },
        });
        const alerts = [];
        for (const product of products) {
            const stock = product.stocks[0];
            if (!stock)
                continue;
            // Calculate average monthly sales
            const totalSold = product.saleItems.reduce((sum, item) => sum + item.quantity, 0);
            const averageMonthlySales = totalSold;
            // Alert if stock is more than 2x monthly sales
            if (averageMonthlySales > 0 && stock.quantity > averageMonthlySales * 2) {
                const monthsOfStock = stock.quantity / averageMonthlySales;
                alerts.push({
                    productId: product.id,
                    productName: product.name,
                    sku: product.sku,
                    currentStock: stock.quantity,
                    averageDailySales: totalSold / 30,
                    reason: `Estoque para ${monthsOfStock.toFixed(1)} meses`,
                    severity: monthsOfStock > 6 ? 'high' : monthsOfStock > 4 ? 'medium' : 'low',
                });
            }
        }
        return alerts.sort((a, b) => {
            const severityOrder = { high: 0, medium: 1, low: 2 };
            return severityOrder[a.severity] - severityOrder[b.severity];
        });
    }
    async getValidityAlerts(tenantId) {
        const validities = await prisma_1.prisma.validity.findMany({
            where: {
                tenantId,
                expirationDate: {
                    lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Next 30 days
                },
            },
            include: {
                product: true,
            },
        });
        const alerts = validities.map((validity) => {
            const daysUntilExpiration = Math.floor((validity.expirationDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
            return {
                productId: validity.product.id,
                productName: validity.product.name,
                sku: validity.product.sku,
                currentStock: validity.quantity,
                daysUntilExpiration,
                reason: `Vence em ${daysUntilExpiration} dias`,
                severity: daysUntilExpiration < 7 ? 'high' : daysUntilExpiration < 15 ? 'medium' : 'low',
            };
        });
        return alerts.sort((a, b) => {
            const severityOrder = { high: 0, medium: 1, low: 2 };
            return severityOrder[a.severity] - severityOrder[b.severity];
        });
    }
    async getSalesHistory(tenantId, days = 30) {
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const sales = await prisma_1.prisma.sale.groupBy({
            by: ['date'],
            where: {
                tenantId,
                date: { gte: startDate },
            },
            _sum: { total: true },
            _count: true,
            orderBy: { date: 'asc' },
        });
        return sales.map((sale) => ({
            date: sale.date.toISOString().split('T')[0],
            total: sale._sum.total || 0,
            count: sale._count,
        }));
    }
}
exports.MetricsService = MetricsService;
