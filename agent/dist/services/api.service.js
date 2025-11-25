"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiService = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
class ApiService {
    constructor() {
        this.baseUrl = config_1.config.apiUrl;
        this.apiKey = config_1.config.apiKey;
    }
    async uploadProducts(products) {
        try {
            await axios_1.default.post(`${this.baseUrl}/api/products`, products, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log(`✓ Uploaded ${products.length} products`);
        }
        catch (error) {
            console.error('Error uploading products:', error);
            throw error;
        }
    }
    async uploadStock(stocks) {
        try {
            await axios_1.default.post(`${this.baseUrl}/api/stock`, stocks, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log(`✓ Uploaded ${stocks.length} stock records`);
        }
        catch (error) {
            console.error('Error uploading stock:', error);
            throw error;
        }
    }
    async uploadSales(sales) {
        try {
            await axios_1.default.post(`${this.baseUrl}/api/sales`, sales, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log(`✓ Uploaded ${sales.length} sales`);
        }
        catch (error) {
            console.error('Error uploading sales:', error);
            throw error;
        }
    }
}
exports.ApiService = ApiService;
