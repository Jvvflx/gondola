"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockConnector = void 0;
const config_1 = require("../config");
class MockConnector {
    async fetchProducts() {
        // Generate mock products
        return [
            {
                id: 'prod-001',
                sku: 'SKU-001',
                name: 'Produto Teste 1',
                barcode: '7891234567890',
                department: 'Alimentos',
                category: 'Bebidas',
                brand: 'Marca A',
                costPrice: 2.50,
                salePrice: 4.99,
                active: true,
                storeId: config_1.config.tenantId,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 'prod-002',
                sku: 'SKU-002',
                name: 'Produto Teste 2',
                barcode: '7891234567891',
                department: 'Limpeza',
                category: 'Detergentes',
                brand: 'Marca B',
                costPrice: 3.00,
                salePrice: 5.99,
                active: true,
                storeId: config_1.config.tenantId,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];
    }
    async fetchStock() {
        return [
            {
                productId: 'prod-001',
                storeId: config_1.config.tenantId,
                quantity: 150,
                minStock: 20,
                maxStock: 300,
                updatedAt: new Date(),
            },
            {
                productId: 'prod-002',
                storeId: config_1.config.tenantId,
                quantity: 80,
                minStock: 15,
                maxStock: 200,
                updatedAt: new Date(),
            },
        ];
    }
    async fetchSales(startDate, endDate) {
        return [
            {
                transactionId: 'TXN-001',
                storeId: config_1.config.tenantId,
                date: new Date(),
                total: 14.97,
                paymentMethod: 'credit_card',
                items: [
                    {
                        productId: 'prod-001',
                        quantity: 3,
                        unitPrice: 4.99,
                        totalPrice: 14.97,
                    },
                ],
            },
        ];
    }
    async fetchValidities() {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        return [
            {
                productId: 'prod-001',
                storeId: config_1.config.tenantId,
                batch: 'LOTE-001',
                expirationDate: futureDate,
                quantity: 50,
            },
        ];
    }
}
exports.MockConnector = MockConnector;
