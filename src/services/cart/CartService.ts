/**
 * Service de gestion du panier avec synchronisation automatique
 */
import { ProductData } from '../sync/DataSyncService';

export interface CartItem {
  id: string;
  product: ProductData;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  addedAt: Date;
  price: number;
  originalPrice?: number;
}

export interface CartSummary {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  totalSavings: number;
  shipping: number;
  total: number;
}

class CartService {
  private static instance: CartService;
  private cartItems: CartItem[] = [];
  private listeners: ((cart: CartSummary) => void)[] = [];

  private constructor() {
    this.loadCartFromStorage();
    this.setupStorageListener();
  }

  public static getInstance(): CartService {
    if (!CartService.instance) {
      CartService.instance = new CartService();
    }
    return CartService.instance;
  }

  private loadCartFromStorage(): void {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const cartData = JSON.parse(savedCart);
        this.cartItems = cartData.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement du panier:', error);
      this.cartItems = [];
    }
  }

  private saveCartToStorage(): void {
    try {
      console.log('💾 Sauvegarde du panier...');
      localStorage.setItem('cart', JSON.stringify(this.cartItems));
      this.notifyListeners();
      
      // Déclencher un événement personnalisé pour synchroniser les composants
      const summary = this.getCartSummary();
      const event = new CustomEvent('cartUpdated', { 
        detail: { items: this.cartItems, summary: summary }
      });
      window.dispatchEvent(event);
      console.log('✅ Panier sauvegardé et événement déclenché:', {
        itemsCount: this.cartItems.length,
        totalItems: summary.totalItems,
        subtotal: summary.subtotal
      });
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde du panier:', error);
    }
  }

  private setupStorageListener(): void {
    // Écouter les changements du localStorage (autres onglets)
    window.addEventListener('storage', (e) => {
      if (e.key === 'cart') {
        this.loadCartFromStorage();
      }
    });

    // Écouter les événements personnalisés (même onglet)
    window.addEventListener('cartUpdated', () => {
      this.loadCartFromStorage();
    });
  }

  private notifyListeners(): void {
    const summary = this.getCartSummary();
    this.listeners.forEach(listener => listener(summary));
  }

  public addListener(listener: (cart: CartSummary) => void): void {
    this.listeners.push(listener);
  }

  public removeListener(listener: (cart: CartSummary) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  public addToCart(
    product: ProductData, 
    quantity: number = 1, 
    selectedColor?: string, 
    selectedSize?: string
  ): boolean {
    try {
      console.log('=== DÉBUT addToCart ===');
      console.log('Produit reçu:', {
        id: product?.id,
        name: product?.name || product?.nom,
        price: product?.price || product?.prix_vente,
        stock: product?.stock || product?.stock_actuel
      });
      console.log('Paramètres:', { quantity, selectedColor, selectedSize });
      
      // Validation des données
      if (!product) {
        console.error('❌ Produit null/undefined');
        return false;
      }

      if (!product.id) {
        console.error('❌ Produit sans ID:', product);
        return false;
      }

      if (!Number.isInteger(quantity) || quantity <= 0) {
        console.error('❌ Quantité invalide:', quantity);
        return false;
      }

      const price = parseFloat(product.prix_vente || product.price || '0');
      if (isNaN(price) || price < 0) {
        console.error('❌ Prix invalide:', product, 'prix calculé:', price);
        return false;
      }

      console.log('✅ Validation réussie, prix:', price);

      const existingItemIndex = this.cartItems.findIndex(
        item => item.id === product.id && 
        item.selectedColor === selectedColor && 
        item.selectedSize === selectedSize
      );

      if (existingItemIndex >= 0) {
        // Mettre à jour la quantité
        const maxStock = parseInt(product.stock_actuel || product.stock || '10');
        const newQuantity = Math.min(
          this.cartItems[existingItemIndex].quantity + quantity,
          maxStock
        );
        this.cartItems[existingItemIndex].quantity = newQuantity;
        console.log('✅ Quantité mise à jour:', newQuantity);
      } else {
        // Ajouter un nouvel article
        const maxStock = parseInt(product.stock_actuel || product.stock || '10');
        const cartItem: CartItem = {
          id: product.id,
          product,
          quantity: Math.min(quantity, maxStock),
          selectedColor,
          selectedSize,
          addedAt: new Date(),
          price: price,
          originalPrice: parseFloat(product.prix_achat || product.prix_vente || product.price || '0')
        };
        this.cartItems.push(cartItem);
        console.log('✅ Nouvel article ajouté:', cartItem);
      }

      console.log('📦 Panier avant sauvegarde:', this.cartItems);
      this.saveCartToStorage();
      this.dispatchCartEvent();
      console.log('✅ Ajout au panier réussi');
      console.log('=== FIN addToCart ===');
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      return false;
    }
  }

  public updateQuantity(itemId: string, newQuantity: number): boolean {
    try {
      const itemIndex = this.cartItems.findIndex(item => item.id === itemId);
      
      if (itemIndex >= 0) {
        if (newQuantity <= 0) {
          this.cartItems.splice(itemIndex, 1);
        } else {
          this.cartItems[itemIndex].quantity = newQuantity;
        }
        
        this.saveCartToStorage();
        this.dispatchCartEvent();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la quantité:', error);
      return false;
    }
  }

  public removeFromCart(itemId: string): boolean {
    try {
      const initialLength = this.cartItems.length;
      this.cartItems = this.cartItems.filter(item => item.id !== itemId);
      
      if (this.cartItems.length !== initialLength) {
        this.saveCartToStorage();
        this.dispatchCartEvent();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de la suppression du panier:', error);
      return false;
    }
  }

  public clearCart(): void {
    try {
      this.cartItems = [];
      this.saveCartToStorage();
      this.dispatchCartEvent();
    } catch (error) {
      console.error('Erreur lors du vidage du panier:', error);
    }
  }

  public getCartItems(): CartItem[] {
    return [...this.cartItems];
  }

  public getCartSummary(): CartSummary {
    const totalItems = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalSavings = this.cartItems.reduce((sum, item) => {
      const originalTotal = (item.originalPrice || item.price) * item.quantity;
      const currentTotal = item.price * item.quantity;
      return sum + (originalTotal - currentTotal);
    }, 0);
    
    // Calculer les frais de livraison (logique simplifiée)
    const shipping = subtotal > 50000 ? 0 : 2500; // Livraison gratuite au-dessus de 50,000 XOF
    
    const total = subtotal + shipping;

    return {
      items: this.cartItems,
      totalItems,
      subtotal,
      totalSavings,
      shipping,
      total
    };
  }

  // Méthodes de calcul pour compatibilité
  public calculateSubtotal(): number {
    return this.getCartSummary().subtotal;
  }

  public calculateSavings(): number {
    return this.getCartSummary().totalSavings;
  }

  public calculateShipping(): number {
    return this.getCartSummary().shipping;
  }

  public isInCart(productId: string, selectedColor?: string, selectedSize?: string): boolean {
    return this.cartItems.some(
      item => item.id === productId && 
      item.selectedColor === selectedColor && 
      item.selectedSize === selectedSize
    );
  }

  public getItemQuantity(productId: string, selectedColor?: string, selectedSize?: string): number {
    const item = this.cartItems.find(
      item => item.id === productId && 
      item.selectedColor === selectedColor && 
      item.selectedSize === selectedSize
    );
    return item ? item.quantity : 0;
  }

  private dispatchCartEvent(): void {
    // Déclencher un événement personnalisé pour la synchronisation
    window.dispatchEvent(new CustomEvent('cartUpdated', {
      detail: this.getCartSummary()
    }));
  }

  // Synchronisation avec les données du catalogue
  public syncWithCatalog(products: ProductData[]): void {
    try {
      // Mettre à jour les prix et disponibilité des produits dans le panier
      this.cartItems = this.cartItems.map(item => {
        const updatedProduct = products.find(p => p.id === item.id);
        if (updatedProduct) {
          return {
            ...item,
            product: updatedProduct,
            price: parseFloat(updatedProduct.prix_vente || '0'),
            originalPrice: parseFloat(updatedProduct.prix_achat || updatedProduct.prix_vente || '0')
          };
        }
        return item;
      });

      // Supprimer les produits qui n'existent plus
      this.cartItems = this.cartItems.filter(item => 
        products.some(p => p.id === item.id)
      );

      this.saveCartToStorage();
      this.dispatchCartEvent();
    } catch (error) {
      console.error('Erreur lors de la synchronisation du panier:', error);
    }
  }
}

export default CartService;
