import { useState, useCallback } from 'react';
import { Product, CartItem, Cart } from '@/types/pos';

export const useCart = () => {
  const [cart, setCart] = useState<Cart>({
    items: [],
    total: 0,
    subtotal: 0,
    tax: 0,
    itemCount: 0
  });

  const calculateTotals = useCallback((items: CartItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return { subtotal, tax, total, itemCount };
  }, []);

  const addToCart = useCallback((product: Product) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.items.findIndex(
        item => item.product.id === product.id
      );

      let newItems: CartItem[];
      
      if (existingItemIndex >= 0) {
        // Update existing item
        newItems = prevCart.items.map((item, index) => {
          if (index === existingItemIndex) {
            const newQuantity = item.quantity + 1;
            return {
              ...item,
              quantity: newQuantity,
              subtotal: product.price * newQuantity
            };
          }
          return item;
        });
      } else {
        // Add new item
        const newItem: CartItem = {
          product,
          quantity: 1,
          subtotal: product.price
        };
        newItems = [...prevCart.items, newItem];
      }

      const totals = calculateTotals(newItems);

      return {
        items: newItems,
        ...totals
      };
    });
  }, [calculateTotals]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) return;

    setCart(prevCart => {
      const newItems = prevCart.items.map(item => {
        if (item.product.id === productId) {
          return {
            ...item,
            quantity,
            subtotal: item.product.price * quantity
          };
        }
        return item;
      });

      const totals = calculateTotals(newItems);

      return {
        items: newItems,
        ...totals
      };
    });
  }, [calculateTotals]);

  const removeItem = useCallback((productId: string) => {
    setCart(prevCart => {
      const newItems = prevCart.items.filter(item => item.product.id !== productId);
      const totals = calculateTotals(newItems);

      return {
        items: newItems,
        ...totals
      };
    });
  }, [calculateTotals]);

  const clearCart = useCallback(() => {
    setCart({
      items: [],
      total: 0,
      subtotal: 0,
      tax: 0,
      itemCount: 0
    });
  }, []);

  return {
    cart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart
  };
};