export interface Stock {
    productId: string;
    storeId: string;
    quantity: number;
    minStock?: number;
    maxStock?: number;
    updatedAt: Date;
}
