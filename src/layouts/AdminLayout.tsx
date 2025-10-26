import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Users, 
  Building2, 
  BarChart3, 
  Settings, 
  Shield,
  Headphones,
  Monitor,
  Database,
  Zap,
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
import UsersManagementPage from '../pages/admin/UsersManagementPage';
import CompaniesManagementPage from '../pages/admin/CompaniesManagementPage';
import CompaniesOverview from '../pages/admin/CompaniesOverview';
import AnalyticsPage from '../pages/admin/AnalyticsPage';
import SupportPage from '../pages/admin/SupportPage';
import MonitoringPage from '../pages/admin/MonitoringPage';
import SystemSettingsPage from '../pages/admin/SystemSettingsPage';
import IntegrationsPage from '../pages/admin/IntegrationsPage';
import BackupsPage from '../pages/admin/BackupsPage';
import SecurityPage from '../pages/admin/SecurityPage';
import CompanyProductsPage from '../pages/admin/CompanyProductsPage';
import Button from '../components/ui/Button';
import { useState } from 'react';
import { getAvatarWithFallback } from '../utils/avatarUtils';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: Home,
      current: location.pathname === '/admin',
    },
    {
      name: 'Utilisateurs',
      href: '/admin/users',
      icon: Users,
      current: location.pathname.startsWith('/admin/users'),
    },
    {
      name: 'Entreprises',
      href: '/admin/companies',
      icon: Building2,
      current: location.pathname.startsWith('/admin/companies'),
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      current: location.pathname.startsWith('/admin/analytics'),
    },
    {
      name: 'Support',
      href: '/admin/support',
      icon: Headphones,
      current: location.pathname.startsWith('/admin/support'),
    },
    {
      name: 'Monitoring',
      href: '/admin/monitoring',
      icon: Monitor,
      current: location.pathname.startsWith('/admin/monitoring'),
    },
    {
      name: 'Intégrations',
      href: '/admin/integrations',
      icon: Zap,
      current: location.pathname.startsWith('/admin/integrations'),
    },
    {
      name: 'Sauvegardes',
      href: '/admin/backups',
      icon: Database,
      current: location.pathname.startsWith('/admin/backups'),
    },
    {
      name: 'Sécurité',
      href: '/admin/security',
      icon: Shield,
      current: location.pathname.startsWith('/admin/security'),
    },
    {
      name: 'Paramètres',
      href: '/admin/settings',
      icon: Settings,
      current: location.pathname.startsWith('/admin/settings'),
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
                  src={getAvatarWithFallback(user?.avatar, user?.email || '')}
                  alt={user?.firstName}
                  className="w-10 h-10 rounded-xl object-cover border-2 border-primary-500 shadow-lg"
                />
                <div>
                  <h1 className="text-lg font-bold gradient-text">Admin Panel</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Contrôle Total</p>
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
                <Button variant="primary" size="sm" icon={<Users className="w-4 h-4" />}>
                  Utilisateur
                </Button>
                <Button variant="secondary" size="sm" icon={<Building2 className="w-4 h-4" />}>
                  Entreprise
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
                  src={getAvatarWithFallback(user?.avatar, user?.email || '')}
                  alt={user?.firstName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-primary-500 shadow-lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    Super Admin
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
                  placeholder="Recherche globale..."
                  className="input-premium pl-10 w-80"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* System Status */}
              <div className="hidden lg:flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="font-semibold text-green-600">Système</p>
                  </div>
                  <p className="text-gray-500 text-xs">Opérationnel</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-blue-600">1,247</p>
                  <p className="text-gray-500 text-xs">Utilisateurs</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-purple-600">89</p>
                  <p className="text-gray-500 text-xs">Entreprises</p>
                </div>
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <Bell className="w-5 h-5" />
                <span className="notification-badge">12</span>
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
            <Route path="/" element={<DashboardMetrics userRole="admin" />} />
            <Route path="/users" element={<UsersManagementPage />} />
            <Route path="/companies" element={<CompaniesManagementPage />} />
            <Route path="/companies-overview" element={<CompaniesOverview />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/monitoring" element={<MonitoringPage />} />
            <Route path="/settings" element={<SystemSettingsPage />} />
            <Route path="/integrations" element={
              <IntegrationsPage />
            } />
            <Route path="/backups" element={
              <BackupsPage />
            } />
            <Route path="/security" element={
              <SecurityPage />
            } />
            <Route path="/companies/:companyId/products" element={<CompanyProductsPage />} />
            <Route path="/*" element={<DashboardMetrics userRole="admin" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;