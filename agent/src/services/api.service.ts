import axios from 'axios';
import { config } from '../config';
import { Product, Stock, Sale } from '@gondola/shared';

export class ApiService {
    private baseUrl: string;
    private apiKey: string;

    constructor() {
        this.baseUrl = config.apiUrl;
        this.apiKey = config.apiKey;
    }

    async uploadProducts(products: Product[]): Promise<void> {
        try {
            await axios.post(`${this.baseUrl}/api/products`, products, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log(`✓ Uploaded ${products.length} products`);
        } catch (error) {
            console.error('Error uploading products:', error);
            throw error;
        }
    }

    async uploadStock(stocks: Stock[]): Promise<void> {
        try {
            await axios.post(`${this.baseUrl}/api/stock`, stocks, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log(`✓ Uploaded ${stocks.length} stock records`);
        } catch (error) {
            console.error('Error uploading stock:', error);
            throw error;
        }
    }

    async uploadSales(sales: Sale[]): Promise<void> {
        try {
            await axios.post(`${this.baseUrl}/api/sales`, sales, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log(`✓ Uploaded ${sales.length} sales`);
        } catch (error) {
            console.error('Error uploading sales:', error);
            throw error;
        }
    }
}
