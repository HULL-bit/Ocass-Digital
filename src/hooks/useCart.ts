import { useState, useEffect } from 'react';
import CartService, { CartItem, CartSummary } from '../services/cart/CartService';

export interface UseCartReturn {
  cartItems: CartItem[];
  cartSummary: CartSummary;
  isLoading: boolean;
  addToCart: (product: any, quantity?: number, selectedColor?: string, selectedSize?: string) => boolean;
  updateQuantity: (itemId: string, newQuantity: number) => boolean;
  removeFromCart: (itemId: string) => boolean;
  clearCart: () => void;
  isInCart: (productId: string, selectedColor?: string, selectedSize?: string) => boolean;
  getItemQuantity: (productId: string, selectedColor?: string, selectedSize?: string) => number;
}

export const useCart = (): UseCartReturn => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartSummary, setCartSummary] = useState<CartSummary>({
    items: [],
    totalItems: 0,
    subtotal: 0,
    totalSavings: 0,
    shipping: 0,
    total: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cartService = CartService.getInstance();
    
    // Charger les données initiales
    setCartItems(cartService.getCartItems());
    setCartSummary(cartService.getCartSummary());
    setIsLoading(false);

    // Écouter les changements du panier via l'événement personnalisé
    const handleCartUpdated = (event: any) => {
      console.log('🔄 Événement cartUpdated reçu:', event.detail);
      if (event.detail && event.detail.summary) {
        console.log('✅ Mise à jour avec données de l\'événement');
        setCartItems(event.detail.items || []);
        setCartSummary(event.detail.summary);
      } else {
        console.log('⚠️ Fallback: récupération directe du service');
        // Fallback: récupérer directement du service
        setCartItems(cartService.getCartItems());
        setCartSummary(cartService.getCartSummary());
      }
    };

    // Écouter les changements de localStorage (autres onglets)
    const handleStorageChange = (event: any) => {
      if (event.key === 'cart') {
        console.log('💾 Changement de stockage détecté:', event);
        setCartItems(cartService.getCartItems());
        setCartSummary(cartService.getCartSummary());
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdated);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdated);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const addToCart = (product: any, quantity: number = 1, selectedColor?: string, selectedSize?: string): boolean => {
    console.log('🛒 useCart.addToCart appelé avec:', { 
      product: product?.name || product?.nom, 
      productId: product?.id,
      quantity, 
      selectedColor, 
      selectedSize 
    });
    
    const cartService = CartService.getInstance();
    const result = cartService.addToCart(product, quantity, selectedColor, selectedSize);
    
    console.log('🛒 Résultat addToCart:', result);
    return result;
  };

  const updateQuantity = (itemId: string, newQuantity: number): boolean => {
    const cartService = CartService.getInstance();
    return cartService.updateQuantity(itemId, newQuantity);
  };

  const removeFromCart = (itemId: string): boolean => {
    const cartService = CartService.getInstance();
    return cartService.removeFromCart(itemId);
  };

  const clearCart = (): void => {
    const cartService = CartService.getInstance();
    cartService.clearCart();
  };

  const isInCart = (productId: string, selectedColor?: string, selectedSize?: string): boolean => {
    const cartService = CartService.getInstance();
    return cartService.isInCart(productId, selectedColor, selectedSize);
  };

  const getItemQuantity = (productId: string, selectedColor?: string, selectedSize?: string): number => {
    const cartService = CartService.getInstance();
    return cartService.getItemQuantity(productId, selectedColor, selectedSize);
  };

  return {
    cartItems,
    cartSummary,
    isLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    isInCart,
    getItemQuantity
  };
};

export default useCart;
