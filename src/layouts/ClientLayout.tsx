import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  ShoppingBag, 
  Store, 
  ShoppingCart, 
  CreditCard, 
  User, 
  Gift, 
  Headphones,
  Search,
  Heart,
  Bell,
  Moon,
  Sun,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import useCart from '../hooks/useCart';
import DashboardMetrics from '../components/business/Dashboard/DashboardMetrics';
import CatalogPage from '../pages/client/CatalogPage';
import CartPage from '../pages/client/CartPage';
import OrdersPage from '../pages/client/OrdersPage';
import StoresPage from '../pages/client/StoresPage';
import ProfilePage from '../pages/client/ProfilePage';
import LoyaltyPage from '../pages/client/LoyaltyPage';
import SupportPage from '../pages/client/SupportPage';
import WishlistPage from '../pages/client/WishlistPage';
import Button from '../components/ui/Button';
import { useState, useEffect } from 'react';
import { getAvatarWithFallback } from '../utils/avatarUtils';

const ClientLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Utiliser les hooks pour les données réelles
  const { cartSummary } = useCart();
  const [favoritesCount, setFavoritesCount] = useState(0);
  
  // Charger le nombre de favoris
  useEffect(() => {
    const loadFavoritesCount = () => {
      try {
        const savedFavorites = localStorage.getItem('favorites');
        if (savedFavorites) {
          const favorites = JSON.parse(savedFavorites);
          setFavoritesCount(favorites.length);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des favoris:', error);
      }
    };
    
    loadFavoritesCount();
    
    // Écouter les changements de favoris
    const handleFavoritesChange = () => {
      loadFavoritesCount();
    };
    
    window.addEventListener('favoritesUpdated', handleFavoritesChange);
    window.addEventListener('storage', (e) => {
      if (e.key === 'favorites') {
        loadFavoritesCount();
      }
    });
    
    return () => {
      window.removeEventListener('favoritesUpdated', handleFavoritesChange);
    };
  }, []);

  const navigation = [
    {
      name: 'Accueil',
      href: '/client',
      icon: Home,
      current: location.pathname === '/client',
    },
    {
      name: 'Catalogue',
      href: '/client/catalog',
      icon: ShoppingBag,
      current: location.pathname.startsWith('/client/catalog'),
    },
    {
      name: 'Boutiques',
      href: '/client/stores',
      icon: Store,
      current: location.pathname.startsWith('/client/stores'),
    },
    {
      name: 'Mon Panier',
      href: '/client/cart',
      icon: ShoppingCart,
      current: location.pathname.startsWith('/client/cart'),
      badge: cartSummary.totalItems > 0 ? cartSummary.totalItems : undefined,
    },
    {
      name: 'Mes Favoris',
      href: '/client/wishlist',
      icon: Heart,
      current: location.pathname.startsWith('/client/wishlist'),
      badge: favoritesCount > 0 ? favoritesCount : undefined,
    },
    {
      name: 'Mes Commandes',
      href: '/client/orders',
      icon: CreditCard,
      current: location.pathname.startsWith('/client/orders'),
    },
    {
      name: 'Mon Profil',
      href: '/client/profile',
      icon: User,
      current: location.pathname.startsWith('/client/profile'),
    },
    {
      name: 'Fidélité',
      href: '/client/loyalty',
      icon: Gift,
      current: location.pathname.startsWith('/client/loyalty'),
    },
    {
      name: 'Support',
      href: '/client/support',
      icon: Headphones,
      current: location.pathname.startsWith('/client/support'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-premium flex">
      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || window.innerWidth >= 1024) && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 w-full sm:w-80 bg-white dark:bg-dark-800 shadow-2xl lg:relative lg:z-0"
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-500 to-electric-500 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold gradient-text">Marketplace</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Espace Client Premium</p>
                </div>
              </div>
              
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher des produits..."
                  className="input-premium pl-10 w-full"
                />
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    sidebar-link group relative
                    ${item.current ? 'active' : ''}
                  `}
                >
                  <item.icon className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto bg-primary-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            {/* Loyalty Points */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="bg-gradient-to-r from-gold-500 to-amber-500 rounded-xl p-4 text-white mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Points Fidélité</p>
                    <p className="text-2xl font-bold">1,250</p>
                  </div>
                  <Gift className="w-8 h-8 opacity-80" />
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={getAvatarWithFallback(user?.avatar, user?.email || '', user?.firstName)}
                  alt={user?.firstName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    Client Premium
                  </p>
                </div>
              </div>
              
              <Button
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                size="sm"
                fullWidth
                icon={<LogOut className="w-4 h-4" />}
                onClick={logout}
              >
                Déconnexion
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <header className="bg-white dark:bg-dark-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              {/* Breadcrumb */}
              <nav className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                <Link to="/client" className="hover:text-primary-600">Accueil</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white">Dashboard</span>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {/* Debug Info */}
              <div className="hidden lg:flex items-center space-x-2 text-xs text-gray-500">
                <span>Panier: {cartSummary.totalItems}</span>
                <span>Favoris: {favoritesCount}</span>
              </div>

              {/* Wishlist */}
              <Link
                to="/client/wishlist"
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Heart className="w-5 h-5" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {favoritesCount}
                  </span>
                )}
              </Link>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <Bell className="w-5 h-5" />
                <span className="notification-badge">2</span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Cart */}
              <Link
                to="/client/cart"
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartSummary.totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartSummary.totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Routes>
            <Route path="/" element={<DashboardMetrics userRole="client" />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/stores" element={<StoresPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/loyalty" element={<LoyaltyPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/*" element={<DashboardMetrics userRole="client" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;