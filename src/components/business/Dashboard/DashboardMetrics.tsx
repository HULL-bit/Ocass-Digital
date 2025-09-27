import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  Package, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Target
} from 'lucide-react';
import MetricCard from '../../ui/MetricCard';
import apiService from '../../../services/api/realApi';

// Vérifier que apiService est correctement importé
console.log('DashboardMetrics - apiService:', apiService);

interface DashboardMetricsProps {
  userRole: 'admin' | 'entrepreneur' | 'client';
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ userRole }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Vérifier que les hooks sont correctement initialisés
  console.log('DashboardMetrics - hooks initialized:', { selectedPeriod, metrics, isLoading, error });

  // Mettre à jour la date et l'heure toutes les secondes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Charger les données de l'API sans modifier le design
  useEffect(() => {
    const loadMetrics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiService.getDashboardMetrics({ period: selectedPeriod });
        setMetrics(data);
      } catch (err: any) {
        console.error('Erreur lors du chargement des métriques:', err);
        setError(err.message || 'Erreur lors du chargement des métriques');
        setMetrics(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadMetrics();
  }, [selectedPeriod, userRole]);

  // Mock data for demonstration - optimisé avec useMemo
  const mockMetrics = useMemo(() => ({
    admin: [
      {
        id: 'total_revenue',
        title: 'Revenus Totaux',
        value: 2450000,
        previousValue: 2100000,
        format: 'currency' as const,
        icon: <DollarSign className="w-6 h-6" />,
        color: 'success' as const,
      },
      {
        id: 'active_users',
        title: 'Utilisateurs Actifs',
        value: 1247,
        previousValue: 1180,
        format: 'number' as const,
        icon: <Users className="w-6 h-6" />,
        color: 'primary' as const,
      },
      {
        id: 'total_companies',
        title: 'Entreprises',
        value: 89,
        previousValue: 82,
        format: 'number' as const,
        icon: <Package className="w-6 h-6" />,
        color: 'info' as const,
      },
      {
        id: 'growth_rate',
        title: 'Taux de Croissance',
        value: 12.5,
        previousValue: 8.3,
        format: 'percentage' as const,
        icon: <TrendingUp className="w-6 h-6" />,
        color: 'success' as const,
      },
    ],
    entrepreneur: [
      {
        id: 'daily_sales',
        title: 'Ventes du Jour',
        value: 125000,
        previousValue: 98000,
        format: 'currency' as const,
        icon: <ShoppingCart className="w-6 h-6" />,
        color: 'success' as const,
      },
      {
        id: 'total_customers',
        title: 'Clients Totaux',
        value: 156,
        previousValue: 142,
        format: 'number' as const,
        icon: <Users className="w-6 h-6" />,
        color: 'primary' as const,
      },
      {
        id: 'products_count',
        title: 'Produits en Stock',
        value: 234,
        previousValue: 267,
        format: 'number' as const,
        icon: <Package className="w-6 h-6" />,
        color: 'warning' as const,
      },
    ],
    client: [
      {
        id: 'total_orders',
        title: 'Commandes Totales',
        value: 23,
        previousValue: 18,
        format: 'number' as const,
        icon: <ShoppingCart className="w-6 h-6" />,
        color: 'primary' as const,
      },
      {
        id: 'total_spent',
        title: 'Total Dépensé',
        value: 450000,
        previousValue: 380000,
        format: 'currency' as const,
        icon: <DollarSign className="w-6 h-6" />,
        color: 'success' as const,
      },
      {
        id: 'loyalty_points',
        title: 'Points Fidélité',
        value: 1250,
        previousValue: 980,
        format: 'number' as const,
        icon: <CheckCircle className="w-6 h-6" />,
        color: 'info' as const,
      },
      {
        id: 'pending_orders',
        title: 'Commandes en Cours',
        value: 2,
        previousValue: 1,
        format: 'number' as const,
        icon: <Clock className="w-6 h-6" />,
        color: 'warning' as const,
      },
    ],
  }), []);

  // Garder exactement le design des mock (couleurs, icônes, formats) et remplacer seulement les valeurs
  let currentMetrics = mockMetrics[userRole] || [];
  
  if (metrics && typeof metrics === 'object') {
    // Remplacer seulement les valeurs des mock par celles de l'API, garder tout le reste identique
    currentMetrics = currentMetrics.map(mockMetric => {
      // Chercher la valeur correspondante dans les données API
      const apiValue = Object.entries(metrics).find(([key]) => key === mockMetric.id)?.[1];
      
      if (apiValue !== undefined) {
        // Garder EXACTEMENT le design du mock (couleurs, icônes, formats, titres) et remplacer seulement la valeur
        return {
          ...mockMetric, // Garde tout le design (couleur, icône, format, titre, etc.)
          value: apiValue // Seule la valeur change
        };
      }
      
      // Si pas de valeur API, garder exactement le mock
      return mockMetric;
    });
  }

  const periods = [
    { value: 'today', label: "Aujourd'hui" },
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'year', label: 'Cette année' },
  ];

  return (
    <div className="space-y-6">
      {/* Header avec Date/Heure et Period Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div className="flex flex-col space-y-2">
          <h2 className="text-2xl font-bold gradient-text">
            Métriques de Performance
          </h2>
          
          {/* Date et Heure */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-primary-500 to-electric-500 text-white rounded-xl shadow-lg">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">
                {currentDateTime.toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl shadow-lg">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium font-mono">
                {currentDateTime.toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </span>
            </div>
          </motion.div>
        </div>
        
        <div className="flex items-center space-x-2">
          {periods.map((period) => (
            <motion.button
              key={period.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedPeriod(period.value)}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300
                ${selectedPeriod === period.value
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
              `}
            >
              {period.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatePresence mode="wait">
          {currentMetrics.map((metric, index) => (
            <motion.div
              key={`${selectedPeriod}-${metric.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <MetricCard
                title={metric.title}
                value={metric.value}
                previousValue={metric.previousValue}
                format={metric.format}
                icon={metric.icon}
                color={metric.color}
                loading={isLoading}
                onClick={() => console.log(`Clicked on ${metric.title}`)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Actions Rapides
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {userRole === 'entrepreneur' && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/entrepreneur/pos'}
                className="p-4 bg-gradient-to-r from-primary-500 to-electric-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ShoppingCart className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Nouvelle Vente</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/entrepreneur/stock'}
                className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Package className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Ajouter Produit</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/entrepreneur/customers'}
                className="p-4 bg-gradient-to-r from-amber-500 to-gold-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Users className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Nouveau Client</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/entrepreneur/analytics'}
                className="p-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <TrendingUp className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Voir Rapports</span>
              </motion.button>
            </>
          )}
          
          {userRole === 'admin' && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Alertes Système</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 bg-gradient-to-r from-primary-500 to-electric-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Users className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Gérer Utilisateurs</span>
              </motion.button>
            </>
          )}
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
        >
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-red-700 dark:text-red-400">
              Erreur lors du chargement des métriques
            </span>
          </div>
        </motion.div>
      )}
      </div>
    );
};

export default DashboardMetrics;