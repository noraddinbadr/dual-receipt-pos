export interface Product {
  id: string;
  name: string;
  nameKey: string; // Translation key
  price: number;
  category: string;
  image?: string;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  subtotal: number;
  tax: number;
  itemCount: number;
}

export interface Invoice {
  id: string;
  number: string;
  date: Date;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  language: 'en' | 'ar';
  currency: {
    symbol: string;
    code: string;
  };
}

export interface Store {
  name: string;
  address?: string;
  phone?: string;
  logo?: string;
}

export interface PrintConfig {
  printerName?: string;
  paperWidth: number;
  fontSize: number;
  language: 'en' | 'ar';
}