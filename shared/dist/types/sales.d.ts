export interface SaleItem {
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    discount?: number;
}
export interface Sale {
    transactionId: string;
    storeId: string;
    date: Date;
    total: number;
    items: SaleItem[];
    paymentMethod?: string;
    customerId?: string;
}
