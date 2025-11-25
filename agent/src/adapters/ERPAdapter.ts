export interface Product {
    id: string;
    name: string;
    price: number;
    cost: number;
    category: string;
}

export interface StockSnapshot {
    productId: string;
    quantity: number;
    timestamp: Date;
}

export interface DailySales {
    productId: string;
    date: Date;
    quantity: number;
    totalAmount: number;
}

export interface ERPAdapter {
    fetchProducts(): Promise<Product[]>;
    fetchCurrentStock(): Promise<StockSnapshot[]>;
    fetchSales(from: Date, to: Date): Promise<DailySales[]>;
}
