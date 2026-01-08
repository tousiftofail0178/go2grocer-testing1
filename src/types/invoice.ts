export interface InvoiceItem {
    sku: string;          // Product ID or SKU
    description: string;  // Product Name
    quantity: number;
    unit: string;         // e.g., 'Bottle', 'Kg'
    size: string;         // e.g., '5L'
    unitPrice: number;
    totalPrice: number;
}

export interface InvoiceData {
    id: string | number;
    invoiceNumber: string;
    date: string;
    orderId: string | number;
    status: string;
    // Business Details
    businessName: string;
    businessAddress: string;
    businessPhone: string;
    customerId?: string; // Added for displaying Business ID
    // Financials
    totalAmount: number;
    vatAmount: number;
    // The List
    items: InvoiceItem[];
}
