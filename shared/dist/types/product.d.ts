export interface Product {
    id: string;
    sku: string;
    name: string;
    barcode?: string;
    department?: string;
    category?: string;
    brand?: string;
    costPrice: number;
    salePrice: number;
    active: boolean;
    storeId: string;
    createdAt?: Date;
    updatedAt?: Date;
}
