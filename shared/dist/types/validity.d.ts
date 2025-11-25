export interface Validity {
    productId: string;
    storeId: string;
    batch?: string;
    expirationDate: Date;
    quantity: number;
    alertLevel?: 'low' | 'medium' | 'critical';
}
