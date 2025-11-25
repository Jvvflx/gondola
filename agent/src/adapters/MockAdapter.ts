import { ERPAdapter, Product, StockSnapshot, DailySales } from './ERPAdapter';

export class MockERPAdapter implements ERPAdapter {
    async fetchProducts(): Promise<Product[]> {
        return [
            { id: '1', name: 'Arroz 5kg', price: 25.0, cost: 18.0, category: 'Mercearia' },
            { id: '2', name: 'Feijão 1kg', price: 8.0, cost: 5.0, category: 'Mercearia' },
            { id: '3', name: 'Coca-Cola 2L', price: 10.0, cost: 7.0, category: 'Bebidas' },
        ];
    }

    async fetchCurrentStock(): Promise<StockSnapshot[]> {
        return [
            { productId: '1', quantity: 100, timestamp: new Date() },
            { productId: '2', quantity: 50, timestamp: new Date() },
            { productId: '3', quantity: 200, timestamp: new Date() },
        ];
    }

    async fetchSales(from: Date, to: Date): Promise<DailySales[]> {
        // Mock sales for the last few days
        return [
            { productId: '1', date: new Date(), quantity: 10, totalAmount: 250.0 },
            { productId: '2', date: new Date(), quantity: 5, totalAmount: 40.0 },
        ];
    }
}
