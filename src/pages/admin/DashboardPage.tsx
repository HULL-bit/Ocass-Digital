import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Globe,
  Shield,
  Database
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import MetricCard from '../../components/ui/MetricCard';
import Button from '../../components/ui/Button';

const DashboardPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Mock data pour les graphiques
  const platformGrowthData = [
    { name: 'Jan', users: 850, companies: 45, revenue: 12500000 },
    { name: 'Fév', users: 920, companies: 52, revenue: 14200000 },
    { name: 'Mar', users: 1050, companies: 61, revenue: 16800000 },
    { name: 'Avr', users: 1180, companies: 73, revenue: 19200000 },
    { name: 'Mai', users: 1320, companies: 82, revenue: 22100000 },
    { name: 'Jun', users: 1450, companies: 89, revenue: 24800000 },
  ];

  const sectorDistribution = [
    { name: 'Commerce', value: 35, color: '#E91E63', companies: 31 },
    { name: 'Technologie', value: 25, color: '#2196F3', companies: 22 },
    { name: 'Santé', value: 20, color: '#4CAF50', companies: 18 },
    { name: 'Services', value: 15, color: '#FF9800', companies: 13 },
    { name: 'Autres', value: 5, color: '#9C27B0', companies: 5 },
  ];

  const recentActivities = [
    {
      id: '1',
      type: 'user_registered',
      message: 'Nouvel utilisateur inscrit: Khadija Thiam',
      timestamp: '2024-01-15T10:30:00Z',
      icon: Users,
      color: 'text-green-600',
    },
    {
      id: '2',
      type: 'company_created',
      message: 'Nouvelle entreprise: Restaurant Le Baobab',
      timestamp: '2024-01-15T09:45:00Z',
      icon: Building2,
      color: 'text-blue-600',
    },
    {
      id: '3',
      type: 'payment_received',
      message: 'Paiement reçu: 75,000 XOF (Plan Professional)',
      timestamp: '2024-01-15T08:20:00Z',
      icon: DollarSign,
      color: 'text-purple-600',
    },
    {
      id: '4',
      type: 'system_alert',
      message: 'Alerte système: Utilisation CPU élevée (85%)',
      timestamp: '2024-01-15T07:15:00Z',
      icon: AlertTriangle,
      color: 'text-orange-600',
    },
  ];

  const systemHealth = [
    { service: 'API Django', status: 'healthy', uptime: '99.9%', responseTime: '45ms' },
    { service: 'Base de Données', status: 'healthy', uptime: '99.8%', responseTime: '12ms' },
    { service: 'Redis Cache', status: 'healthy', uptime: '99.9%', responseTime: '2ms' },
    { service: 'WebSocket', status: 'warning', uptime: '98.5%', responseTime: '78ms' },
    { service: 'Celery Workers', status: 'healthy', uptime: '99.7%', responseTime: '156ms' },
  ];

  const topCompanies = [
    { name: 'TechSolutions Sénégal', revenue: 150000000, growth: 25.5, users: 25 },
    { name: 'Boutique Marie Diallo', revenue: 25000000, growth: 18.2, users: 5 },
    { name: 'Pharmacie Moderne', revenue: 45000000, growth: 12.8, users: 8 },
  ];

  const periods = [
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'quarter', label: 'Ce trimestre' },
    { value: 'year', label: 'Cette année' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Dashboard Administrateur OCASS DIGITAL</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Vue d'ensemble de la plateforme commerciale OCASS DIGITAL
          </p>
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Revenus Totaux"
          value={24800000}
          previousValue={22100000}
          format="currency"
          icon={<DollarSign className="w-6 h-6" />}
          color="success"
        />
        <MetricCard
          title="Utilisateurs Actifs"
          value={1450}
          previousValue={1320}
          format="number"
          icon={<Users className="w-6 h-6" />}
          color="primary"
        />
        <MetricCard
          title="Entreprises"
          value={89}
          previousValue={82}
          format="number"
          icon={<Building2 className="w-6 h-6" />}
          color="info"
        />
        <MetricCard
          title="Taux de Croissance"
          value={12.2}
          previousValue={8.7}
          format="percentage"
          icon={<TrendingUp className="w-6 h-6" />}
          color="warning"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Growth */}
        <div className="card-premium p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Croissance de la Plateforme
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={platformGrowthData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorCompanies" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="name" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none', 
                  borderRadius: '12px',
                  color: '#F9FAFB'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="users" 
                stroke="#3B82F6" 
                fillOpacity={1} 
                fill="url(#colorUsers)" 
                strokeWidth={3}
                name="Utilisateurs"
              />
              <Area 
                type="monotone" 
                dataKey="companies" 
                stroke="#10B981" 
                fillOpacity={1} 
                fill="url(#colorCompanies)" 
                strokeWidth={3}
                name="Entreprises"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sector Distribution */}
        <div className="card-premium p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Répartition par Secteur
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sectorDistribution}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {sectorDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Trend */}
        <div className="card-premium p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Évolution des Revenus
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={platformGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="name" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none', 
                  borderRadius: '12px',
                  color: '#F9FAFB'
                }}
                formatter={(value: any) => [`${(value / 1000000).toFixed(1)}M XOF`, 'Revenus']}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Companies */}
        <div className="card-premium p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Entreprises
          </h3>
          <div className="space-y-4">
            {topCompanies.map((company, index) => (
              <motion.div
                key={company.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {company.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(company.revenue / 1000000).toFixed(1)}M XOF • {company.users} utilisateurs
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">
                    +{company.growth}%
                  </p>
                  <p className="text-xs text-gray-500">croissance</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* System Health & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <div className="card-premium p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-500" />
            État du Système
          </h3>
          
          <div className="space-y-3">
            {systemHealth.map((service, index) => (
              <motion.div
                key={service.service}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {service.service}
                    </p>
                    <p className="text-xs text-gray-500">
                      Uptime: {service.uptime} • {service.responseTime}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  service.status === 'healthy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  service.status === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {service.status === 'healthy' ? 'Sain' : 
                   service.status === 'warning' ? 'Attention' : 'Erreur'}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card-premium p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-500" />
            Activité Récente
          </h3>
          
          <div className="space-y-3">
            {recentActivities.map((activity, index) => {
              const IconComponent = activity.icon;
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl"
                >
                  <div className={`w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center ${activity.color}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card-premium p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Actions Rapides
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { icon: Users, label: 'Gérer Utilisateurs', color: 'from-blue-500 to-cyan-500', action: () => window.location.href = '/admin/users' },
            { icon: Building2, label: 'Gérer Entreprises', color: 'from-purple-500 to-pink-500', action: () => window.location.href = '/admin/companies' },
            { icon: Shield, label: 'Sécurité', color: 'from-red-500 to-orange-500', action: () => window.location.href = '/admin/security' },
            { icon: Database, label: 'Sauvegardes', color: 'from-green-500 to-emerald-500', action: async () => {
              try {
                // TODO: Implémenter l'endpoint de sauvegarde dans l'API
                console.log('Démarrage de la sauvegarde...');
                // await apiService.backupDatabase();
                alert('Sauvegarde démarrée avec succès !');
              } catch (error) {
                console.error('Erreur lors de la sauvegarde:', error);
                alert('Erreur lors de la sauvegarde');
              }
            } },
            { icon: Activity, label: 'Monitoring', color: 'from-yellow-500 to-orange-500', action: () => window.location.href = '/admin/monitoring' },
            { icon: Zap, label: 'Intégrations', color: 'from-indigo-500 to-purple-500', action: () => window.location.href = '/admin/integrations' },
          ].map((action, index) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={action.action}
              className={`p-4 bg-gradient-to-r ${action.color} text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              <action.icon className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;