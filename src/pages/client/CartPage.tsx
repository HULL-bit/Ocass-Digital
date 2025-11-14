import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api/realApi';
import useCart from '../../hooks/useCart';
import { useNotifications } from '../../contexts/NotificationContext';
import CartService from '../../services/cart/CartService';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Heart,
  CreditCard,
  Truck,
  MapPin,
  Gift,
  Percent,
  ArrowRight,
  Package,
  Clock,
  Shield,
  Star,
  CheckCircle,
  X,
  Tag,
  Phone,
  Mail
} from 'lucide-react';
import Button from '../../components/ui/Button';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  // Utiliser le hook du panier
  const { 
    cartItems, 
    cartSummary, 
    updateQuantity, 
    removeFromCart, 
    clearCart 
  } = useCart();
  
  // Supprimer tous les produits mock au chargement de la page
  useEffect(() => {
    // Nettoyer le localStorage directement aussi
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const cartData = JSON.parse(savedCart);
        const validCart = cartData.filter((item: any) => {
          const productId = item.id || item.product?.id || '';
          const productIdStr = String(productId).trim();
          return !productIdStr.toLowerCase().startsWith('mock-');
        });
        
        if (validCart.length < cartData.length) {
          localStorage.setItem('cart', JSON.stringify(validCart));
          console.log(`🧹 ${cartData.length - validCart.length} produit(s) mock supprimé(s) du localStorage`);
        }
      }
    } catch (error) {
      console.error('Erreur lors du nettoyage du localStorage:', error);
    }
    
    // Utiliser le service pour nettoyer aussi
    const cartService = CartService.getInstance();
    const removedCount = cartService.removeMockProducts();
    if (removedCount > 0) {
      console.log(`🧹 ${removedCount} produit(s) mock supprimé(s) automatiquement`);
      addNotification({
        type: 'info',
        title: 'Panier nettoyé',
        message: `${removedCount} produit(s) de démonstration ont été retirés de votre panier.`,
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Protection contre les valeurs undefined
  const safeCartSummary = cartSummary || {
    items: [],
    totalItems: 0,
    subtotal: 0,
    totalSavings: 0,
    shipping: 0,
    total: 0
  };

  // Transformer les items du panier pour l'affichage (FILTRER les produits mock)
  const displayItems = useMemo(() => {
    return cartItems
      .filter(item => {
        const productId = item.id || item.product?.id || '';
        const productIdStr = String(productId).trim();
        const isMock = productIdStr.toLowerCase().startsWith('mock-');
        if (isMock) {
          console.warn('⚠️ Produit mock détecté dans displayItems, filtré:', productIdStr);
        }
        return !isMock;
      })
      .map(item => {
      const product = item.product || {};
      return {
        id: item.id, // ID de l'item du panier
        product: product, // Garder l'objet product complet pour récupérer l'ID du produit
        name: product.name || product.nom || 'Produit sans nom',
        description: product.description_courte || product.description || 'Aucune description',
        image: product.image || (product.images && product.images.length > 0 ? 
          (product.images[0].image_url || 
           (product.images[0].image?.startsWith('http') ? product.images[0].image : 
            (product.images[0].image ? `http://localhost:8000${product.images[0].image}` : ''))) : 
          'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=200&auto=format&fit=crop'),
        price: item.price || parseFloat(product.prix_vente || product.price || '0'),
        originalPrice: item.originalPrice || parseFloat(product.prix_achat || product.originalPrice || '0'),
        quantity: item.quantity,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
        seller: {
          name: product.entreprise_nom || product.entreprise?.nom || 'Vendeur inconnu',
          verified: true,
          rating: 4.5
        },
        shipping: {
          free: (item.price * item.quantity) > 50000,
          cost: (item.price * item.quantity) > 50000 ? 0 : 2500,
          time: '24-48h'
        }
      };
    });
  }, [cartItems]);
  
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [selectedAddress, setSelectedAddress] = useState('default');
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('wave');

  // Adresses de livraison
  const addresses = [
    {
      id: 'default',
      name: 'Domicile',
      address: '25 Rue de la Paix, Médina, Dakar',
      phone: '+221 77 345 67 89',
      isDefault: true,
    },
    {
      id: 'work',
      name: 'Bureau',
      address: '15 Avenue Bourguiba, Plateau, Dakar',
      phone: '+221 77 345 67 89',
      isDefault: false,
    },
  ];

  // Le panier est maintenant géré par le hook useCart

  // Les fonctions de gestion du panier sont maintenant dans le hook useCart

  const promoCodes = [
    { code: 'WELCOME10', discount: 10, type: 'percentage', description: 'Réduction 10% nouveaux clients' },
    { code: 'FIDELITE5', discount: 5, type: 'percentage', description: 'Réduction fidélité 5%' },
    { code: 'LIVRAISON', discount: 2500, type: 'fixed', description: 'Livraison gratuite' },
  ];

  // Les fonctions updateQuantity et removeItem sont maintenant dans le hook useCart

  const moveToWishlist = (itemId: string) => {
    console.log('Move to wishlist:', itemId);
    removeFromCart(itemId);
  };

  const applyPromoCode = () => {
    const promo = promoCodes.find(p => p.code === promoCode.toUpperCase());
    if (promo) {
      setAppliedPromo(promo);
      setPromoCode('');
      alert(`Code promo "${promo.code}" appliqué ! Réduction de ${promo.discount * 100}% accordée.`);
    } else {
      alert('Code promo invalide. Essayez: SAVE10, WELCOME, ou LOYALTY');
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
  };

  // Utiliser les données du hook useCart
  const calculateSubtotal = () => safeCartSummary.subtotal;
  const calculateSavings = () => safeCartSummary.totalSavings;
  const calculateShipping = () => safeCartSummary.shipping;
  
  const calculateTax = () => {
    // Calculer la TVA (18% par défaut)
    const subtotal = calculateSubtotal() - calculatePromoDiscount();
    return subtotal * 0.18;
  };

  const calculatePromoDiscount = () => {
    if (!appliedPromo) return 0;
    
    if (appliedPromo.type === 'percentage') {
      return (calculateSubtotal() * appliedPromo.discount) / 100;
    } else {
      return appliedPromo.discount;
    }
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateShipping() - calculatePromoDiscount();
  };

  const loyaltyPointsEarned = Math.floor(calculateTotal() / 1000);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Mon Panier</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {cartItems.length} article(s) dans votre panier
          </p>
        </div>
        
        {cartItems.length > 0 && (
          <Button 
            variant="secondary" 
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => clearCart()}
          >
            Vider le Panier
          </Button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium p-12 text-center"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Votre panier est vide
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Découvrez nos produits et ajoutez-les à votre panier
          </p>
          <Button variant="primary" icon={<Package className="w-4 h-4" />}>
            Continuer les Achats
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {displayItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.1 }}
                  className="card-premium p-6"
                >
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {item.name || 'Produit sans nom'}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            {item.description || 'Aucune description'}
                          </p>
                          
                          {/* Seller Info */}
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm text-gray-500">Vendu par</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.seller?.name || 'Vendeur inconnu'}
                            </span>
                            {item.seller?.verified && (
                              <Shield className="w-3 h-3 text-blue-500" />
                            )}
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-500">{item.seller?.rating || 4.5}</span>
                            </div>
                          </div>

                          {/* Variants */}
                          {(item.selectedColor || item.selectedSize) && (
                            <div className="flex items-center space-x-4 mb-2">
                              {item.selectedColor && (
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  Couleur: <span className="font-medium">{item.selectedColor}</span>
                                </span>
                              )}
                              {item.selectedSize && (
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  Taille: <span className="font-medium">{item.selectedSize}</span>
                                </span>
                              )}
                            </div>
                          )}

                          {/* Shipping Info */}
                          <div className="flex items-center space-x-2">
                            <Truck className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {item.shipping?.free ? 'Livraison gratuite' : `Livraison: ${item.shipping?.cost?.toLocaleString() || 0} XOF`}
                            </span>
                            <span className="text-sm text-gray-500">• {item.shipping?.time || '24-48h'}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => moveToWishlist(item.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Heart className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Price and Quantity */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-3">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Minus className="w-4 h-4" />
                          </motion.button>
                          
                          <span className="w-12 text-center font-medium text-gray-900 dark:text-white">
                            {item.quantity}
                          </span>
                          
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.maxQuantity}
                            className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                          >
                            <Plus className="w-4 h-4" />
                          </motion.button>
                          
                          <span className="text-xs text-gray-500">
                            Max: {item.maxQuantity}
                          </span>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              {((item.price || 0) * (item.quantity || 1)).toLocaleString()} XOF
                            </span>
                            {item.originalPrice && item.originalPrice > item.price && (
                              <span className="text-sm text-gray-500 line-through">
                                {(item.originalPrice * item.quantity).toLocaleString()} XOF
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {(item.price || 0).toLocaleString()} XOF / unité
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Promo Code */}
            <div className="card-premium p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Code Promo</h3>
              
              {appliedPromo ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-center space-x-3">
                    <Tag className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium text-green-700 dark:text-green-300">
                        {appliedPromo.code}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        {appliedPromo.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-green-600">
                      -{appliedPromo.type === 'percentage' 
                        ? `${appliedPromo.discount}%` 
                        : `${appliedPromo.discount.toLocaleString()} XOF`
                      }
                    </span>
                    <button
                      onClick={removePromoCode}
                      className="text-green-500 hover:text-green-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Entrez votre code promo"
                    className="input-premium flex-1"
                  />
                  <Button 
                    variant="secondary" 
                    onClick={applyPromoCode}
                    disabled={!promoCode.trim()}
                  >
                    Appliquer
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card-premium p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Résumé de la Commande
              </h3>

              {/* Address Selection */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Adresse de Livraison</h4>
                <div className="space-y-2">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`block p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                        selectedAddress === address.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        checked={selectedAddress === address.id}
                        onChange={(e) => setSelectedAddress(e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {address.name}
                            {address.isDefault && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full">
                                Par défaut
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{address.address}</p>
                          <p className="text-sm text-gray-500">{address.phone}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Sous-total ({cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)} articles)
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {calculateSubtotal().toLocaleString()} XOF
                  </span>
                </div>

                {calculateSavings() > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Économies</span>
                    <span>-{calculateSavings().toLocaleString()} XOF</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Livraison</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {calculateShipping() === 0 ? 'Gratuite' : `${calculateShipping().toLocaleString()} XOF`}
                  </span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between text-green-600">
                    <span>Code promo ({appliedPromo.code})</span>
                    <span>-{calculatePromoDiscount().toLocaleString()} XOF</span>
                  </div>
                )}

                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                    <span className="text-xl font-bold text-primary-600">
                      {calculateTotal().toLocaleString()} XOF
                    </span>
                  </div>
                </div>
              </div>

              {/* Loyalty Points */}
              <div className="bg-gold-50 dark:bg-gold-900/20 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Gift className="w-4 h-4 text-gold-500" />
                  <span className="text-sm font-medium text-gold-700 dark:text-gold-300">
                    Points de Fidélité
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Vous gagnerez <span className="font-bold text-gold-600">{loyaltyPointsEarned} points</span> avec cette commande
                </p>
              </div>

              {/* Checkout Button */}
              <Button
                variant="primary"
                fullWidth
                size="lg"
                icon={<CreditCard className="w-5 h-5" />}
                onClick={() => setShowCheckout(true)}
              >
                Passer la Commande
              </Button>

              {/* Security Info */}
              <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Shield className="w-4 h-4" />
                <span>Paiement 100% sécurisé</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={() => setShowCheckout(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Finaliser la Commande
                  </h2>
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Résumé</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Articles ({cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)})</span>
                      <span>{calculateSubtotal().toLocaleString()} XOF</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Livraison</span>
                      <span>{calculateShipping() === 0 ? 'Gratuite' : `${calculateShipping().toLocaleString()} XOF`}</span>
                    </div>
                    {appliedPromo && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Réduction ({appliedPromo.code})</span>
                        <span>-{calculatePromoDiscount().toLocaleString()} XOF</span>
                      </div>
                    )}
                    <div className="border-t border-gray-300 dark:border-gray-600 pt-2">
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span className="text-primary-600">
                          {calculateTotal().toLocaleString()} XOF
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Mode de Paiement</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'wave', name: 'Wave Money', icon: '📱', popular: true },
                      { id: 'orange_money', name: 'Orange Money', icon: '🟠', popular: true },
                      { id: 'card', name: 'Carte Bancaire', icon: '💳', popular: false },
                      { id: 'cash', name: 'Paiement à la Livraison', icon: '💵', popular: false },
                    ].map((method) => (
                      <motion.button
                        key={method.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative p-4 rounded-xl border-2 transition-all text-center ${
                          paymentMethod === method.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'
                        }`}
                        onClick={() => setPaymentMethod(method.id)}
                      >
                        {method.popular && (
                          <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                            Populaire
                          </span>
                        )}
                        <div className="text-2xl mb-2">{method.icon}</div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {method.name}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Informations de Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">client@example.com</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">+221 77 345 67 89</span>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="mb-6">
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      required
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      J'accepte les{' '}
                      <a href="#" className="text-primary-600 hover:underline">
                        conditions de vente
                      </a>{' '}
                      et la{' '}
                      <a href="#" className="text-primary-600 hover:underline">
                        politique de confidentialité
                      </a>
                    </span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => setShowCheckout(false)}
                  >
                    Retour
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    icon={<CheckCircle className="w-4 h-4" />}
                    onClick={async () => {
                      try {
                        // Vérifier que le panier n'est pas vide
                        if (displayItems.length === 0) {
                          alert('Votre panier est vide. Veuillez ajouter des produits avant de finaliser la commande.');
                          return;
                        }


                        // Vérifier que tous les items ont un ID de produit valide
                        const invalidBasicItems = displayItems.filter(item => !item.id || !item.price || item.quantity <= 0);
                        if (invalidBasicItems.length > 0) {
                          console.error('Items invalides:', invalidBasicItems);
                          alert('Certains produits dans votre panier sont invalides. Veuillez réessayer.');
                          return;
                        }

                        // Récupérer l'adresse complète à partir de l'ID sélectionné
                        const selectedAddressData = addresses.find(addr => addr.id === selectedAddress) || addresses[0];
                        const shippingAddress = selectedAddressData ? {
                          name: selectedAddressData.name,
                          address: selectedAddressData.address,
                          phone: selectedAddressData.phone
                        } : null;
                        
                        // Utiliser tous les produits du panier sans validation
                        // Le backend validera si les produits existent vraiment
                        console.log('🛒 Préparation des lignes de commande...');
                        console.log('🛒 Nombre d\'items dans le panier:', displayItems.length);
                        
                        const lignesData = displayItems.map((item, index) => {
                          const product = item.product || {};
                          
                          console.log(`📦 Item ${index + 1}:`, {
                            itemId: item.id,
                            productId: product.id,
                            name: item.name || product.nom,
                            price: item.price,
                            quantity: item.quantity
                          });
                          
                          // item.id est l'ID du produit (selon CartService)
                          // Mais on peut aussi utiliser product.id comme fallback
                          const productId = item.id || product.id || product.uuid || product.pk;
                          
                          // S'assurer que productId existe
                          if (!productId) {
                            console.error(`❌ Produit invalide à l'index ${index}:`, {
                              item,
                              product,
                              itemId: item.id,
                              productId: product.id
                            });
                            throw new Error(`Produit invalide: ${item.name || 'Produit sans nom'}. Veuillez retirer cet article du panier et réessayer.`);
                          }
                          
                          // Rejeter les produits mock (commençant par "mock-")
                          const productIdStr = String(productId).trim();
                          if (productIdStr.toLowerCase().startsWith('mock-')) {
                            console.error(`❌ Produit mock détecté à l'index ${index}:`, {
                              productId: productIdStr,
                              name: item.name || product.nom
                            });
                            throw new Error(`Le produit "${item.name || 'Produit sans nom'}" est un produit de démonstration et ne peut pas être commandé. Veuillez le retirer de votre panier.`);
                          }
                          
                          console.log(`✅ Produit ${index + 1} valide, ID: ${productId}`);
                          
                          // Convertir en nombres (pas de chaînes) pour les valeurs numériques
                          const prixUnitaire = Number(parseFloat(String(item.price || product.prix_vente || product.price || '0')));
                          const quantite = Number(parseInt(String(item.quantity || 1), 10));
                          const remisePourcentage = Number(0);
                          const tvaTaux = Number(18.00);
                          
                          if (isNaN(prixUnitaire) || prixUnitaire <= 0) {
                            throw new Error(`Prix invalide pour le produit: ${item.name || 'Produit sans nom'}`);
                          }
                          
                          if (isNaN(quantite) || quantite <= 0) {
                            throw new Error(`Quantité invalide pour le produit: ${item.name || 'Produit sans nom'}`);
                          }
                          
                          // L'ID du produit peut être un nombre ou une chaîne (UUID)
                          // Le backend Django REST Framework accepte les deux
                          const produitId = typeof productId === 'number' ? productId : String(productId);
                          
                          // Retourner un objet avec des valeurs correctement typées
                          return {
                            produit: produitId,
                            quantite: quantite,
                            prix_unitaire: prixUnitaire,
                            remise_pourcentage: remisePourcentage,
                            tva_taux: tvaTaux
                          };
                        });
                        
                        // Calculer les totaux (s'assurer que ce sont des nombres)
                        const sousTotal = Number(calculateSubtotal()) || 0;
                        const taxeMontant = Number(calculateTax()) || 0;
                        const remiseMontant = Number(calculatePromoDiscount()) || 0;
                        const totalTtc = Number(calculateTotal()) || 0;
                        
                        // Vérifier que lignesData est un tableau valide
                        if (!Array.isArray(lignesData) || lignesData.length === 0) {
                          throw new Error('Aucune ligne de vente valide. Veuillez réessayer.');
                        }
                        
                        // S'assurer que lignesData est bien un tableau et non un objet
                        // Créer une copie propre du tableau pour éviter tout problème de référence
                        const lignesDataClean = JSON.parse(JSON.stringify(lignesData));
                        
                        // Validation finale : s'assurer que chaque ligne est valide
                        const validatedLignes = lignesDataClean.map((ligne: any, index: number) => {
                          if (!ligne || typeof ligne !== 'object') {
                            throw new Error(`Ligne ${index + 1} invalide: doit être un objet`);
                          }
                          if (!ligne.produit) {
                            throw new Error(`Ligne ${index + 1}: le champ 'produit' est requis`);
                          }
                          return {
                            produit: String(ligne.produit),
                            quantite: Number(ligne.quantite) || 1,
                            prix_unitaire: Number(ligne.prix_unitaire) || 0,
                            remise_pourcentage: Number(ligne.remise_pourcentage) || 0,
                            tva_taux: Number(ligne.tva_taux) || 18.00,
                            variante: ligne.variante || null,
                            notes: ligne.notes || ''
                          };
                        });
                        
                        // Créer une commande via l'API (vente)
                        const saleData = {
                          lignes_data: validatedLignes, // Utiliser le tableau validé
                          sous_total: sousTotal,
                          taxe_montant: taxeMontant,
                          remise_montant: remiseMontant,
                          total_ttc: totalTtc,
                          mode_paiement: (() => {
                            // Normaliser le mode de paiement selon les choix valides du backend
                            if (paymentMethod === 'orange' || paymentMethod === 'orange_money') {
                              return 'orange_money';
                            }
                            if (paymentMethod === 'wave') {
                              return 'wave';
                            }
                            if (paymentMethod === 'cash') {
                              return 'cash';
                            }
                            if (paymentMethod === 'card') {
                              return 'card';
                            }
                            // Par défaut, utiliser 'cash'
                            console.warn('⚠️ Mode de paiement inconnu:', paymentMethod, '- utilisation de "cash" par défaut');
                            return 'cash';
                          })(),
                          statut_paiement: paymentMethod === 'cash' ? 'pending' : 'completed',
                          source_vente: 'online', // Utiliser 'online' (choix valide selon le modèle Django)
                          adresse_livraison: shippingAddress ? `${shippingAddress.name}, ${shippingAddress.address}, ${shippingAddress.phone}` : 'Adresse non spécifiée',
                          notes: `Commande marketplace - ${new Date().toLocaleString('fr-FR')}`
                        };
                        
                        // Log détaillé pour le débogage
                        console.log('📦 Données de la commande:', JSON.stringify(saleData, null, 2));
                        console.log('📦 lignes_data (validé):', JSON.stringify(validatedLignes, null, 2));
                        console.log('📦 Types des valeurs:', {
                          lignes_data_type: Array.isArray(validatedLignes) ? 'array' : typeof validatedLignes,
                          lignes_data_length: Array.isArray(validatedLignes) ? validatedLignes.length : 'N/A',
                          is_array: Array.isArray(validatedLignes),
                          first_line: validatedLignes[0] ? {
                            produit_type: typeof validatedLignes[0].produit,
                            produit_value: validatedLignes[0].produit,
                            quantite_type: typeof validatedLignes[0].quantite,
                            prix_unitaire_type: typeof validatedLignes[0].prix_unitaire
                          } : 'N/A'
                        });
                        
                        // Créer la vente via l'API
                        console.log('🚀 ========== CRÉATION DE LA COMMANDE ==========');
                        console.log('🚀 Données envoyées:', JSON.stringify(saleData, null, 2));
                        
                        try {
                          const saleResponse = await apiService.createSale(saleData);
                          console.log('✅ Commande créée avec succès:', saleResponse);
                        console.log('✅ ID de la commande:', saleResponse.id);
                        console.log('✅ Numéro de facture:', saleResponse.numero_facture);
                        
                        // Vérifier que la réponse contient bien les données
                        if (!saleResponse || (!saleResponse.id && !saleResponse.numero_facture)) {
                          console.error('❌ Réponse de commande invalide:', saleResponse);
                          throw new Error('La commande a été créée mais la réponse est invalide. Veuillez vérifier dans "Mes Commandes".');
                        }
                        
                        // Afficher un message de succès
                        addNotification({
                          type: 'success',
                          title: 'Commande confirmée !',
                          message: `Votre commande #${saleResponse.numero_facture || saleResponse.id} a été passée avec succès.`,
                        });
                        
                        // Vider le panier
                        clearCart();
                        setAppliedPromo(null);
                        setShowCheckout(false);
                        
                        // Attendre un peu pour que la commande soit bien enregistrée côté serveur
                        console.log('⏳ Attente de l\'enregistrement côté serveur...');
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        
                        // Rediriger vers la page des commandes avec un délai pour recharger
                        console.log('🔄 Redirection vers Mes Commandes...');
                        navigate('/client/orders', { 
                          state: { 
                            message: `Commande #${saleResponse.numero_facture || saleResponse.id} passée avec succès !`,
                            orderId: saleResponse.id || saleResponse.numero_facture,
                            refresh: true,
                            newOrder: true
                          } 
                        });
                        } catch (createError: any) {
                          console.error('❌ ERREUR lors de la création de la commande:', createError);
                          console.error('❌ Type d\'erreur:', typeof createError);
                          console.error('❌ Message:', createError?.message);
                          console.error('❌ Response:', createError?.response);
                          console.error('❌ Response Data:', createError?.response?.data);
                          console.error('❌ Stack:', createError?.stack);
                          throw createError; // Re-lancer l'erreur pour qu'elle soit gérée par le catch principal
                        }
                      } catch (error: any) {
                        console.error('❌ ========== ERREUR GLOBALE ==========');
                        console.error('❌ Erreur lors de la commande:', error);
                        console.error('❌ Type d\'erreur:', typeof error);
                        console.error('❌ Détails de l\'erreur:', {
                          message: error?.message,
                          response: error?.response,
                          responseData: error?.response?.data,
                          responseStatus: error?.response?.status,
                          responseStatusText: error?.response?.statusText,
                          stack: error?.stack
                        });
                        
                        // Afficher un message d'erreur plus détaillé
                        let errorMessage = 'Erreur lors de la finalisation de la commande.';
                        let errorDetails: string[] = [];
                        
                        if (error?.response?.data) {
                          // Erreur de l'API
                          const apiError = error.response.data;
                          
                          console.error('❌ Erreur API complète:', apiError);
                          
                          if (typeof apiError === 'object') {
                            // Parcourir toutes les erreurs
                            Object.entries(apiError).forEach(([key, value]: [string, any]) => {
                              if (Array.isArray(value)) {
                                value.forEach((msg: any) => {
                                  // Convertir proprement les messages
                                  const msgStr = typeof msg === 'object' ? JSON.stringify(msg) : String(msg);
                                  errorDetails.push(`${key}: ${msgStr}`);
                                });
                              } else if (typeof value === 'object' && value !== null) {
                                // Essayer de convertir l'objet en JSON lisible
                                try {
                                  errorDetails.push(`${key}: ${JSON.stringify(value, null, 2)}`);
                                } catch (e) {
                                  errorDetails.push(`${key}: [Objet non sérialisable]`);
                                }
                              } else if (typeof value === 'string') {
                                errorDetails.push(`${key}: ${value}`);
                              } else {
                                errorDetails.push(`${key}: ${String(value)}`);
                              }
                            });
                            
                            // Utiliser le premier message d'erreur comme message principal
                            if (errorDetails.length > 0) {
                              errorMessage = errorDetails[0];
                            }
                          } else if (typeof apiError === 'string') {
                            errorMessage = apiError;
                            errorDetails.push(apiError);
                          }
                        } else if (error?.message) {
                          // Erreur JavaScript
                          errorMessage = error.message;
                          errorDetails.push(error.message);
                        }
                        
                        // Construire le message final
                        let finalMessage = `Erreur lors de la finalisation de la commande:\n\n${errorMessage}`;
                        if (errorDetails.length > 1) {
                          finalMessage += `\n\nDétails supplémentaires:\n${errorDetails.slice(1).join('\n')}`;
                        }
                        finalMessage += `\n\nVeuillez réessayer ou contacter le support si le problème persiste.`;
                        
                        alert(finalMessage);
                      }
                    }}
                  >
                    Confirmer
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CartPage;