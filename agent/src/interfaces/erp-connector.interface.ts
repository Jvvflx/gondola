import { Product, Stock, Sale, Validity } from '@gondola/shared';

export interface ERPConnector {
    fetchProducts(): Promise<Product[]>;
    fetchStock(): Promise<Stock[]>;
    fetchSales(startDate: Date, endDate: Date): Promise<Sale[]>;
    fetchValidities(): Promise<Validity[]>;
}
