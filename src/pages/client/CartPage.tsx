import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../../services/api/realApi';
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
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Charger les articles du panier depuis l'API
  useEffect(() => {
    loadCartItems();
  }, []);

  // Écouter les changements du localStorage pour synchroniser le panier
  useEffect(() => {
    const handleStorageChange = () => {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const cartData = JSON.parse(savedCart);
        // Normaliser les données du panier
        const normalizedItems = cartData.map(normalizeCartItem);
        setCartItems(normalizedItems);
      }
    };

    // Écouter les changements du localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Écouter les événements personnalisés pour les changements dans le même onglet
    window.addEventListener('cartUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
    };
  }, []);

  // Fonction pour normaliser les données du panier
  const normalizeCartItem = (item: any) => {
    return {
      id: item.id || item.nom,
      name: item.name || item.nom || 'Produit sans nom',
      description: item.description || item.description_courte || item.description_longue || 'Aucune description',
      price: parseFloat(item.price || item.prix_vente || 0),
      originalPrice: parseFloat(item.originalPrice || item.prix_achat || item.price || item.prix_vente || 0),
      quantity: item.quantity || 1,
      image: item.image || item.images?.[0] || 'https://via.placeholder.com/200x200',
      seller: item.seller || {
        name: item.company || item.entreprise?.nom || 'Vendeur inconnu',
        rating: 4.5,
        verified: true,
      },
      shipping: item.shipping || {
        free: true,
        time: '24-48h',
      },
      inStock: item.inStock !== undefined ? item.inStock : (item.stock || item.stock_actuel || 0) > 0,
      maxQuantity: item.maxQuantity || item.stock || item.stock_actuel || 10,
      selectedColor: item.selectedColor || item.couleur || '',
      selectedSize: item.selectedSize || item.taille || '',
      category: item.category || item.categorie?.nom || 'Autre',
      brand: item.brand || item.marque_nom || item.marque || 'Marque inconnue',
    };
  };

  const loadCartItems = async () => {
    try {
      setLoading(true);
      
      // Charger le panier depuis le localStorage
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const cartData = JSON.parse(savedCart);
        // Normaliser les données du panier
        const normalizedItems = cartData.map(normalizeCartItem);
        setCartItems(normalizedItems);
      } else {
        // Si aucun panier n'est sauvegardé, utiliser des données mockées par défaut
        const mockCartItems = [
          {
            id: '1',
            name: 'iPhone 15 Pro',
            description: 'Smartphone avec puce A17 Pro',
            price: 850000,
            originalPrice: 950000,
            quantity: 1,
            image: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
            seller: {
              name: 'TechSolutions Sénégal',
              rating: 4.9,
              verified: true,
            },
            shipping: {
              free: true,
              time: '24-48h',
            },
            inStock: true,
            maxQuantity: 15,
          },
          {
            id: '2',
            name: 'Robe Élégante Africaine',
            description: 'Robe traditionnelle en wax premium',
            price: 35000,
            originalPrice: 45000,
            quantity: 2,
            image: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
            seller: {
              name: 'Boutique Marie Diallo',
              rating: 4.7,
              verified: true,
            },
            shipping: {
              free: false,
              cost: 2500,
              time: '2-3 jours',
            },
            inStock: true,
            maxQuantity: 25,
            selectedColor: 'Bleu Royal',
            selectedSize: 'M',
          },
          {
            id: '3',
            name: 'Air Jordan 1 Retro',
            description: 'Baskets iconiques en cuir premium',
            price: 145000,
            quantity: 1,
            image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
            seller: {
              name: 'Boutique Marie Diallo',
              rating: 4.7,
              verified: true,
            },
            shipping: {
              free: true,
              time: '24-48h',
            },
            inStock: true,
            maxQuantity: 12,
            selectedColor: 'Chicago',
            selectedSize: '42',
            },
          ];
        setCartItems(mockCartItems);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du panier:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const promoCodes = [
    { code: 'WELCOME10', discount: 10, type: 'percentage', description: 'Réduction 10% nouveaux clients' },
    { code: 'FIDELITE5', discount: 5, type: 'percentage', description: 'Réduction fidélité 5%' },
    { code: 'LIVRAISON', discount: 2500, type: 'fixed', description: 'Livraison gratuite' },
  ];

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    setCartItems(prev => {
      const updatedItems = prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity: Math.min(newQuantity, item.maxQuantity) }
          : item
      );
      // Sauvegarder dans le localStorage
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      // Déclencher un événement personnalisé
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      return updatedItems;
    });
  };

  const removeItem = (itemId: string) => {
    setCartItems(prev => {
      const updatedItems = prev.filter(item => item.id !== itemId);
      // Sauvegarder dans le localStorage
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      // Déclencher un événement personnalisé
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      return updatedItems;
    });
  };

  const moveToWishlist = (itemId: string) => {
    console.log('Move to wishlist:', itemId);
    removeItem(itemId);
  };

  const applyPromoCode = () => {
    const promo = promoCodes.find(p => p.code === promoCode.toUpperCase());
    if (promo) {
      setAppliedPromo(promo);
      setPromoCode('');
    } else {
      alert('Code promo invalide');
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
  };

  const calculateSavings = () => {
    return cartItems.reduce((sum, item) => {
      const originalTotal = (item.originalPrice || item.price || 0) * (item.quantity || 1);
      const currentTotal = (item.price || 0) * (item.quantity || 1);
      return sum + (originalTotal - currentTotal);
    }, 0);
  };

  const calculateShipping = () => {
    const hasNonFreeShipping = cartItems.some(item => !item.shipping?.free);
    if (!hasNonFreeShipping) return 0;
    
    // Prendre le coût de livraison le plus élevé
    return Math.max(...cartItems.map(item => item.shipping?.cost || 0));
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
    return calculateSubtotal() + calculateShipping() - calculatePromoDiscount();
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
            onClick={() => {
              setCartItems([]);
              localStorage.removeItem('cart');
              // Déclencher un événement personnalisé
              window.dispatchEvent(new CustomEvent('cartUpdated'));
            }}
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
              {cartItems.map((item, index) => (
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
                            onClick={() => removeItem(item.id)}
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
                      { id: 'orange', name: 'Orange Money', icon: '🟠', popular: true },
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
                    onClick={() => {
                      alert('Commande passée avec succès !');
                      setShowCheckout(false);
                      setCartItems([]);
                      localStorage.removeItem('cart');
                      // Déclencher un événement personnalisé
                      window.dispatchEvent(new CustomEvent('cartUpdated'));
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