import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      // POS Interface
      pos: {
        title: "Point of Sale",
        cart: "Shopping Cart",
        total: "Total",
        subtotal: "Subtotal",
        tax: "Tax",
        checkout: "Checkout",
        clear: "Clear Cart",
        addToCart: "Add to Cart",
        removeItem: "Remove Item",
        quantity: "Quantity",
        price: "Price",
        item: "Item",
        items: "Items",
        empty: "Cart is empty",
        languages: "Languages"
      },
      // Products
      products: {
        coffee: "Coffee",
        tea: "Tea", 
        sandwich: "Sandwich",
        pastry: "Pastry",
        juice: "Fresh Juice",
        water: "Water",
        cake: "Cake",
        cookie: "Cookie"
      },
      // Invoice
      invoice: {
        title: "Invoice",
        number: "Invoice #",
        date: "Date",
        time: "Time",
        storeName: "Modern POS Store",
        thankYou: "Thank you for your purchase!",
        visitAgain: "Please visit us again",
        itemsCount: "{{count}} item",
        itemsCount_plural: "{{count}} items",
        print: "Print Receipt",
        generateInvoice: "Generate Invoice"
      },
      // Currency
      currency: {
        symbol: "$",
        code: "USD"
      }
    }
  },
  ar: {
    translation: {
      // POS Interface
      pos: {
        title: "نقطة البيع",
        cart: "سلة التسوق",
        total: "المجموع",
        subtotal: "المجموع الفرعي",
        tax: "الضريبة",
        checkout: "الدفع",
        clear: "مسح السلة",
        addToCart: "إضافة للسلة",
        removeItem: "إزالة العنصر",
        quantity: "الكمية",
        price: "السعر",
        item: "عنصر",
        items: "عناصر",
        empty: "السلة فارغة",
        languages: "اللغات"
      },
      // Products
      products: {
        coffee: "قهوة",
        tea: "شاي",
        sandwich: "ساندويتش",
        pastry: "معجنات",
        juice: "عصير طازج",
        water: "ماء",
        cake: "كيك",
        cookie: "بسكويت"
      },
      // Invoice
      invoice: {
        title: "فاتورة",
        number: "رقم الفاتورة #",
        date: "التاريخ",
        time: "الوقت",
        storeName: "متجر نقطة البيع الحديث",
        thankYou: "شكراً لشرائكم!",
        visitAgain: "نرجو زيارتكم لنا مرة أخرى",
        itemsCount: "{{count}} عنصر",
        itemsCount_plural: "{{count}} عناصر",
        print: "طباعة الإيصال",
        generateInvoice: "إنشاء فاتورة"
      },
      // Currency
      currency: {
        symbol: "﷼",
        code: "SAR"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false // react already does escaping
    },
    
    // Enable debug mode in development
    debug: process.env.NODE_ENV === 'development'
  });

export default i18n;