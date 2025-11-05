import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  Target, 
  Users, 
  CreditCard, 
  BarChart3, 
  Store,
  Settings,
  Search,
  Bell,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
  Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import DashboardMetrics from '../components/business/Dashboard/DashboardMetrics';
import StockPage from '../pages/entrepreneur/StockPage';
import POSPage from '../pages/entrepreneur/POSPage';
import AnalyticsPage from '../pages/entrepreneur/AnalyticsPage';
import ProfilePage from '../pages/entrepreneur/ProfilePage';
import SettingsPage from '../pages/entrepreneur/SettingsPage';
import CustomersPage from '../pages/entrepreneur/CustomersPage';
import ProjectsPage from '../pages/entrepreneur/ProjectsPage';
import BillingPage from '../pages/entrepreneur/BillingPage';
import SuppliersPage from '../pages/entrepreneur/SuppliersPage';
import AddProduct from '../pages/entrepreneur/AddProduct';
import AddCompany from '../pages/entrepreneur/AddCompany';
import Button from '../components/ui/Button';
import { useState } from 'react';
import { getAvatarWithFallback } from '../utils/avatarUtils';

const EntrepreneurLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/entrepreneur',
      icon: Home,
      current: location.pathname === '/entrepreneur',
    },
    {
      name: 'Gestion Stock',
      href: '/entrepreneur/inventory',
      icon: Package,
      current: location.pathname.startsWith('/entrepreneur/inventory'),
    },
    {
      name: 'Point de Vente',
      href: '/entrepreneur/pos',
      icon: ShoppingCart,
      current: location.pathname.startsWith('/entrepreneur/pos'),
    },
    {
      name: 'Projets',
      href: '/entrepreneur/projects',
      icon: Target,
      current: location.pathname.startsWith('/entrepreneur/projects'),
    },
    {
      name: 'CRM Clients',
      href: '/entrepreneur/customers',
      icon: Users,
      current: location.pathname.startsWith('/entrepreneur/customers'),
    },
    {
      name: 'Facturation',
      href: '/entrepreneur/billing',
      icon: CreditCard,
      current: location.pathname.startsWith('/entrepreneur/billing'),
    },
    {
      name: 'Analytics',
      href: '/entrepreneur/analytics',
      icon: BarChart3,
      current: location.pathname.startsWith('/entrepreneur/analytics'),
    },
    {
      name: 'Fournisseurs',
      href: '/entrepreneur/suppliers',
      icon: Store,
      current: location.pathname.startsWith('/entrepreneur/suppliers'),
    },
    {
      name: 'Paramètres',
      href: '/entrepreneur/settings',
      icon: Settings,
      current: location.pathname.startsWith('/entrepreneur/settings'),
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
            className="fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-dark-800 shadow-2xl lg:relative lg:z-0"
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <img
                  src={user?.company?.logo || 'https://images.pexels.com/photos/4386476/pexels-photo-4386476.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'}
                  alt={user?.company?.name}
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <div>
                  <h1 className="text-lg font-bold gradient-text">{user?.company?.name || 'Mon Entreprise'}</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Commerce & Services</p>
                </div>
              </div>
              
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  className="bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 text-white hover:from-gray-700 hover:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700" 
                  size="sm" 
                  icon={<ShoppingCart className="w-4 h-4" />}
                >
                  Vente
                </Button>
                <Button 
                  className="bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 text-white hover:from-gray-700 hover:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700" 
                  size="sm" 
                  icon={<Plus className="w-4 h-4" />}
                >
                  Produit
                </Button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    sidebar-link group
                    ${item.current ? 'active' : ''}
                  `}
                >
                  <item.icon className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={getAvatarWithFallback(user?.avatar || null, user?.email || '', user?.firstName)}
                  alt={user?.firstName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    
                    Entrepreneur
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
              
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher produits, clients..."
                  className="input-premium pl-10 w-80"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Quick Stats */}
              <div className="hidden lg:flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <p className="font-semibold text-green-600">125,000 XOF</p>
                  <p className="text-gray-500 text-xs">Ventes du jour</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-blue-600">234</p>
                  <p className="text-gray-500 text-xs">Produits</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-purple-600">12</p>
                  <p className="text-gray-500 text-xs">Commandes</p>
                </div>
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <Bell className="w-5 h-5" />
                <span className="notification-badge">5</span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Routes>
            <Route path="/" element={<DashboardMetrics userRole="entrepreneur" />} />
            <Route path="/inventory" element={<StockPage />} />
            <Route path="/pos" element={<POSPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/projects" element={
              <ProjectsPage />
            } />
            <Route path="/customers" element={
              <CustomersPage />
            } />
            <Route path="/billing" element={
              <BillingPage />
            } />
            <Route path="/suppliers" element={
              <SuppliersPage />
            } />
            <Route path="/add-product" element={<AddProduct />} />
            <Route path="/add-company" element={<AddCompany />} />
            <Route path="/*" element={<DashboardMetrics userRole="entrepreneur" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default EntrepreneurLayout;