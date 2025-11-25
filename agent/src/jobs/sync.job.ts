import { ERPConnector } from '../interfaces/erp-connector.interface';
import { ApiService } from '../services/api.service';

export class SyncJob {
    private connector: ERPConnector;
    private apiService: ApiService;

    constructor(connector: ERPConnector) {
        this.connector = connector;
        this.apiService = new ApiService();
    }

    async execute(): Promise<void> {
        console.log('🔄 Starting synchronization...');

        try {
            // Fetch and upload products
            console.log('📦 Fetching products...');
            const products = await this.connector.fetchProducts();
            if (products.length > 0) {
                await this.apiService.uploadProducts(products);
            }

            // Fetch and upload stock
            console.log('📊 Fetching stock...');
            const stock = await this.connector.fetchStock();
            if (stock.length > 0) {
                await this.apiService.uploadStock(stock);
            }

            // Fetch and upload sales
            console.log('💰 Fetching sales...');
            const endDate = new Date();
            const startDate = new Date();
            startDate.setHours(0, 0, 0, 0); // Start of today
            const sales = await this.connector.fetchSales(startDate, endDate);
            if (sales.length > 0) {
                await this.apiService.uploadSales(sales);
            }

            console.log('✅ Synchronization completed successfully\n');
        } catch (error) {
            console.error('❌ Synchronization failed:', error);
            throw error;
        }
    }
}
