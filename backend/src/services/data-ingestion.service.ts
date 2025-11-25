import { prisma } from '../lib/prisma';
import { Product, Stock, Sale } from '@gondola/shared';

export class DataIngestionService {
    async upsertProducts(tenantId: string, products: Product[]): Promise<void> {
        for (const product of products) {
            await prisma.product.upsert({
                where: {
                    tenantId_sku: {
                        tenantId,
                        sku: product.sku,
                    },
                },
                update: {
                    name: product.name,
                    barcode: product.barcode,
                    department: product.department,
                    category: product.category,
                    brand: product.brand,
                    costPrice: product.costPrice,
                    salePrice: product.salePrice,
                    active: product.active,
                    updatedAt: new Date(),
                },
                create: {
                    id: product.id,
                    sku: product.sku,
                    name: product.name,
                    barcode: product.barcode,
                    department: product.department,
                    category: product.category,
                    brand: product.brand,
                    costPrice: product.costPrice,
                    salePrice: product.salePrice,
                    active: product.active,
                    tenantId,
                },
            });
        }
    }

    async upsertStock(tenantId: string, stocks: Stock[]): Promise<void> {
        for (const stock of stocks) {
            // Find product by storeId (which maps to tenantId) and productId
            const product = await prisma.product.findFirst({
                where: {
                    tenantId,
                    id: stock.productId,
                },
            });

            if (!product) {
                console.warn(`Product ${stock.productId} not found for tenant ${tenantId}`);
                continue;
            }

            await prisma.stock.upsert({
                where: {
                    tenantId_productId: {
                        tenantId,
                        productId: product.id,
                    },
                },
                update: {
                    quantity: stock.quantity,
                    minStock: stock.minStock,
                    maxStock: stock.maxStock,
                    updatedAt: new Date(),
                },
                create: {
                    quantity: stock.quantity,
                    minStock: stock.minStock,
                    maxStock: stock.maxStock,
                    productId: product.id,
                    tenantId,
                },
            });
        }
    }

    async createSales(tenantId: string, sales: Sale[]): Promise<void> {
        for (const sale of sales) {
            // Check if sale already exists
            const existingSale = await prisma.sale.findUnique({
                where: {
                    tenantId_transactionId: {
                        tenantId,
                        transactionId: sale.transactionId,
                    },
                },
            });

            if (existingSale) {
                console.log(`Sale ${sale.transactionId} already exists, skipping`);
                continue;
            }

            await prisma.sale.create({
                data: {
                    transactionId: sale.transactionId,
                    date: sale.date,
                    total: sale.total,
                    paymentMethod: sale.paymentMethod,
                    customerId: sale.customerId,
                    tenantId,
                    items: {
                        create: sale.items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            total: item.totalPrice,
                            discount: item.discount,
                        })),
                    },
                },
            });
        }
    }
}
