import { useTranslation } from 'react-i18next';
import { Product } from '@/types/pos';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Plus, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const currencySymbol = t('currency.symbol');

  const formatPrice = (price: number) => {
    if (currentLanguage === 'ar') {
      return `${price.toFixed(2)} ${currencySymbol}`;
    }
    return `${currencySymbol}${price.toFixed(2)}`;
  };

  return (
    <Card className="group hover:shadow-medium transition-all duration-300 hover:-translate-y-1 bg-gradient-surface border-0">
      <CardHeader className="pb-3">
        <div className="w-full h-24 bg-gradient-primary rounded-lg flex items-center justify-center mb-2">
          <ShoppingCart className="h-8 w-8 text-primary-foreground" />
        </div>
        <h3 className="font-semibold text-lg text-foreground">
          {t(product.nameKey)}
        </h3>
      </CardHeader>
      
      <CardContent className="pb-3">
        <p className="text-muted-foreground text-sm mb-3">
          {product.description}
        </p>
        <div className="text-2xl font-bold text-primary">
          {formatPrice(product.price)}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={() => onAddToCart(product)}
          className="w-full bg-primary hover:bg-primary-hover transition-colors gap-2"
          size="lg"
        >
          <Plus className="h-4 w-4" />
          {t('pos.addToCart')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;