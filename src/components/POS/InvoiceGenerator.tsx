import { useTranslation } from 'react-i18next';
import { Invoice } from '@/types/pos';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Printer, Download } from 'lucide-react';

interface InvoiceGeneratorProps {
  invoice: Invoice | null;
  onPrint: (invoice: Invoice) => void;
  onClose: () => void;
}

const InvoiceGenerator = ({ invoice, onPrint, onClose }: InvoiceGeneratorProps) => {
  const { t, i18n } = useTranslation();
  
  if (!invoice) return null;

  const currentLanguage = i18n.language;
  const isRTL = currentLanguage === 'ar';
  
  const formatPrice = (price: number) => {
    if (currentLanguage === 'ar') {
      return `${price.toFixed(2)} ${invoice.currency.symbol}`;
    }
    return `${invoice.currency.symbol}${price.toFixed(2)}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(currentLanguage === 'ar' ? 'ar-SA' : 'en-US');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(currentLanguage === 'ar' ? 'ar-SA' : 'en-US');
  };

  return (
    <Card className="max-w-md mx-auto bg-white shadow-strong">
      <CardHeader className="text-center border-b">
        <CardTitle className="text-2xl font-bold text-primary">
          {t('invoice.storeName')}
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          <div>{t('invoice.number')}{invoice.number}</div>
          <div>{t('invoice.date')}: {formatDate(invoice.date)}</div>
          <div>{t('invoice.time')}: {formatTime(invoice.date)}</div>
        </div>
      </CardHeader>

      <CardContent className="p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-xl font-bold mb-4 text-center">
          {t('invoice.title')}
        </div>

        <div className="space-y-2 mb-4">
          {invoice.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <div className="flex-1">
                <div className="font-medium">{t(item.product.nameKey)}</div>
                <div className="text-muted-foreground">
                  {formatPrice(item.product.price)} × {item.quantity}
                </div>
              </div>
              <div className="font-semibold">
                {formatPrice(item.subtotal)}
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>{t('pos.subtotal')}</span>
            <span>{formatPrice(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('pos.tax')}</span>
            <span>{formatPrice(invoice.tax)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>{t('pos.total')}</span>
            <span>{formatPrice(invoice.total)}</span>
          </div>
        </div>

        <div className="text-center mt-6 space-y-2 text-sm text-muted-foreground">
          <div className="font-semibold">{t('invoice.thankYou')}</div>
          <div>{t('invoice.visitAgain')}</div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Close
          </Button>
          <Button
            onClick={() => onPrint(invoice)}
            className="flex-1 bg-primary hover:bg-primary-hover gap-2"
          >
            <Printer className="h-4 w-4" />
            {t('invoice.print')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceGenerator;