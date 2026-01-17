export interface Variant {
    id: string;
    name: string;
    price: number;
    stock?: number;
}

export interface ProductOption {
    name: string;
    choices: string[];
}

export interface Product {
    id: string;
    name: string;
    price: number;
    costPrice?: number;
    category: string;
    image: string;
    stock?: number;
    barcode?: string;
    variants?: Variant[];
    options?: ProductOption[];
}

export interface Category {
    id: string;
    name: string;
}

export interface CartItem extends Product {
    quantity: number;
    selectedVariant?: Variant;
    selectedOptions?: { [optionName: string]: string };
    discount?: {
        type: 'percent' | 'fixed';
        value: number;
    };
}

export interface Order {
    id: string;
    items: CartItem[];
    total: number;
    subtotal?: number;
    discountTotal?: number;
    date: string;
    status: 'completed' | 'refunded';
    paymentMethod: 'cash' | 'card' | 'qr';
    cashReceived?: number;
    change?: number;
    taxRateUsed?: number;
    customerId?: string;
    pointsRedeemed?: number;
    discountFromPoints?: number;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    points: number;
    totalSpent: number;
}

export interface AdditionalCurrency {
    symbol: string;
    exchangeRate: number;
}

export interface StoreSettings {
    name: string;
    address: string;
    phone: string;
    footerMessage: string;
    currency: string;
    enableDualCurrency: boolean;
    secondaryCurrency: string;
    exchangeRate: number;
    additionalCurrencies?: AdditionalCurrency[];
}
