import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Product, Invoice } from '@/types/pos';
import { useCart } from '@/hooks/useCart';
import { sampleProducts } from '@/data/products';
import { qzTrayService } from '@/services/qzTrayService';
import ProductCard from './ProductCard';
import Cart from './Cart';
import InvoiceGenerator from './InvoiceGenerator';
import LanguageSwitcher from './LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Store, CreditCard, Receipt } from 'lucide-react';

const POSDashboard = () => {
  const { t, i18n } = useTranslation();
  const { cart, addToCart, updateQuantity, removeItem, clearCart } = useCart();
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  const generateInvoiceNumber = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `INV-${timestamp}-${random}`.toUpperCase();
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to cart before checkout",
        variant: "destructive"
      });
      return;
    }

    const invoice: Invoice = {
      id: generateInvoiceNumber(),
      number: generateInvoiceNumber(),
      date: new Date(),
      items: cart.items,
      subtotal: cart.subtotal,
      tax: cart.tax,
      total: cart.total,
      language: i18n.language as 'en' | 'ar',
      currency: {
        symbol: t('currency.symbol'),
        code: t('currency.code')
      }
    };

    setCurrentInvoice(invoice);
    setShowInvoice(true);

    // Save to local storage (sales history)
    const existingSales = JSON.parse(localStorage.getItem('pos_sales') || '[]');
    existingSales.push(invoice);
    localStorage.setItem('pos_sales', JSON.stringify(existingSales));

    toast({
      title: t('invoice.title') + ' Generated',
      description: `${t('invoice.number')}${invoice.number}`,
      variant: "default"
    });
  };

  const handlePrint = async (invoice: Invoice) => {
    try {
      const success = await qzTrayService.printInvoice(invoice, i18n.language as 'en' | 'ar');
      
      if (success) {
        toast({
          title: "Print Successful",
          description: "Invoice has been sent to printer",
          variant: "default"
        });
      } else {
        toast({
          title: "QZ Tray Not Available",
          description: "Opened browser print dialog as fallback",
          variant: "default"
        });
      }

      // Clear cart after successful print
      clearCart();
      setShowInvoice(false);
      setCurrentInvoice(null);
    } catch (error) {
      toast({
        title: "Print Error",
        description: "Failed to print invoice",
        variant: "destructive"
      });
    }
  };

  const handleCloseInvoice = () => {
    setShowInvoice(false);
    setCurrentInvoice(null);
    clearCart();
  };

  if (showInvoice && currentInvoice) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <InvoiceGenerator
          invoice={currentInvoice}
          onPrint={handlePrint}
          onClose={handleCloseInvoice}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-primary text-primary-foreground p-4 shadow-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Store className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">{t('pos.title')}</h1>
              <p className="text-primary-foreground/80 text-sm">
                {t('invoice.storeName')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <LanguageSwitcher />
            <Button
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={() => {
                const sales = JSON.parse(localStorage.getItem('pos_sales') || '[]');
                console.log('Sales History:', sales);
                toast({
                  title: "Sales History",
                  description: `${sales.length} transactions in history`,
                  variant: "default"
                });
              }}
            >
              <Receipt className="h-4 w-4" />
              History
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Grid */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-surface border-0 shadow-soft">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-6 text-foreground">
                  Products
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {sampleProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={addToCart}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <Cart
                items={cart.items}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeItem}
                onClearCart={clearCart}
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        </div>
      </div>

      {/* QZ Tray Status Footer */}
      <footer className="bg-muted/50 p-2 text-center text-sm text-muted-foreground">
        <div className="max-w-7xl mx-auto">
          QZ Tray Integration Ready | 
          <Button
            variant="link"
            size="sm"
            className="p-0 ml-1 h-auto text-muted-foreground"
            onClick={async () => {
              const printers = await qzTrayService.getPrinters();
              toast({
                title: "Available Printers",
                description: printers.length > 0 ? printers.join(', ') : 'No printers found or QZ Tray not running',
                variant: "default"
              });
            }}
          >
            Check Printers
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default POSDashboard;