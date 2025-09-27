import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiService from '../../services/api/realApi';
import { Heart, ShoppingCart, Trash2, Star, Eye, Plus } from 'lucide-react';
import Button from '../../components/ui/Button';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  store: string;
}

const WishlistPage: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger la wishlist depuis l'API
  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      // Pour l'instant, on utilise les données mockées
      // TODO: Implémenter l'API de la wishlist quand elle sera disponible
      const mockWishlistItems = [
    {
      id: '1',
      name: 'Smartphone Samsung Galaxy S24',
      price: 450000,
      originalPrice: 500000,
      image: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2',
      rating: 4.5,
      reviews: 128,
      inStock: true,
      store: 'Tech Store Dakar'
    },
    {
      id: '2',
      name: 'Casque Audio Sony WH-1000XM4',
      price: 180000,
      image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2',
      rating: 4.8,
      reviews: 89,
      inStock: true,
      store: 'Audio Pro'
    },
    {
      id: '3',
      name: 'Laptop HP Pavilion 15',
      price: 650000,
      originalPrice: 700000,
      image: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2',
      rating: 4.2,
      reviews: 45,
      inStock: false,
      store: 'Computer World'
    },
    {
      id: '4',
      name: 'Montre Connectée Apple Watch',
      price: 320000,
      image: 'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2',
      rating: 4.7,
      reviews: 203,
      inStock: true,
      store: 'Apple Store Dakar'
    },
    {
      id: '5',
      name: 'Sac à Dos Nike Heritage',
      price: 45000,
      image: 'https://images.pexels.com/photos/1552617/pexels-photo-1552617.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2',
      rating: 4.3,
      reviews: 67,
      inStock: true,
      store: 'Sport Plus'
    },
    {
      id: '6',
      name: 'Parfum Chanel No. 5',
      price: 120000,
      image: 'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2',
      rating: 4.9,
      reviews: 156,
      inStock: true,
      store: 'Beauty Store'
    }
  ];
      
      setWishlistItems(mockWishlistItems);
    } catch (error) {
      console.error('Erreur lors du chargement de la wishlist:', error);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = (id: string) => {
    setWishlistItems(items => items.filter(item => item.id !== id));
  };

  const addToCart = (item: WishlistItem) => {
    // Logique pour ajouter au panier
    console.log('Ajout au panier:', item);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Mes Favoris</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {wishlistItems.length} article{wishlistItems.length > 1 ? 's' : ''} dans votre liste de souhaits
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            icon={<ShoppingCart className="w-4 h-4" />}
          >
            Ajouter tout au panier
          </Button>
        </div>
      </motion.div>

      {/* Wishlist Items */}
      {wishlistItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
            Votre liste de souhaits est vide
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Ajoutez des articles que vous aimez pour les retrouver facilement
          </p>
          <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
            Découvrir des produits
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col space-y-2">
                  {item.originalPrice && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      -{Math.round((1 - item.price / item.originalPrice) * 100)}%
                    </span>
                  )}
                  {!item.inStock && (
                    <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                      Rupture
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-500 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="mb-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.store}</p>
                  <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                    {item.name}
                  </h3>
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-1 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(item.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({item.reviews})
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                      {formatPrice(item.price)}
                    </span>
                    {item.originalPrice && (
                      <span className="text-sm text-gray-500 line-through ml-2">
                        {formatPrice(item.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    icon={<ShoppingCart className="w-4 h-4" />}
                    onClick={() => addToCart(item)}
                    disabled={!item.inStock}
                  >
                    {item.inStock ? 'Ajouter au panier' : 'Rupture de stock'}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Summary */}
      {wishlistItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary-500 to-electric-500 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Résumé de vos favoris</h3>
              <p className="opacity-90">
                {wishlistItems.length} article{wishlistItems.length > 1 ? 's' : ''} • 
                Prix total: {formatPrice(wishlistItems.reduce((sum, item) => sum + item.price, 0))}
              </p>
            </div>
            <Button
              variant="secondary"
              size="lg"
              icon={<ShoppingCart className="w-5 h-5" />}
              className="bg-white text-primary-600 hover:bg-gray-100"
            >
              Ajouter tout au panier
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default WishlistPage;