import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Package,
  Globe,
  Activity,
  Download,
  Filter,
  Calendar,
  RefreshCw,
  Building2,
  Eye
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import MetricCard from '../../components/ui/MetricCard';
import Button from '../../components/ui/Button';
import dashboardApiService from '../../services/api/dashboardApi';
import apiService from '../../services/api/realApi';

const AnalyticsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Données réelles depuis l'API
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);
  const [platformMetrics, setPlatformMetrics] = useState<any[]>([]);
  const [sectorPerformance, setSectorPerformance] = useState<any[]>([]);
  const [userEngagement, setUserEngagement] = useState<any[]>([]);
  const [topCompanies, setTopCompanies] = useState<any[]>([]);
  const [geographicData, setGeographicData] = useState<any[]>([]);

  // Charger les données réelles depuis l'API
  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      console.log('📊 Chargement des données analytics depuis l\'API...');
      
      // Charger les métriques du dashboard
      const metrics = await dashboardApiService.getDashboardMetrics('admin', selectedPeriod);
      setDashboardMetrics(metrics);
      
      // Transformer les données de croissance de la plateforme
      if (metrics.platformGrowth && Array.isArray(metrics.platformGrowth)) {
        const transformed = metrics.platformGrowth.map((item: any) => ({
          name: item.name,
          revenue: item.revenue || 0,
          users: item.users || 0,
          companies: item.companies || 0,
          transactions: item.transactions || 0
        }));
        setPlatformMetrics(transformed);
      } else {
        // Fallback si pas de données
        setPlatformMetrics([
          { name: 'Jan', revenue: 0, users: 0, companies: 0, transactions: 0 },
          { name: 'Fév', revenue: 0, users: 0, companies: 0, transactions: 0 },
          { name: 'Mar', revenue: 0, users: 0, companies: 0, transactions: 0 },
          { name: 'Avr', revenue: 0, users: 0, companies: 0, transactions: 0 },
          { name: 'Mai', revenue: 0, users: 0, companies: 0, transactions: 0 },
          { name: 'Jun', revenue: 0, users: 0, companies: 0, transactions: 0 },
        ]);
      }
      
      // Transformer les données de répartition par secteur
      if (metrics.sectorDistribution && Array.isArray(metrics.sectorDistribution)) {
        const transformed = metrics.sectorDistribution.map((item: any) => ({
          sector: item.name || 'Autres',
          revenue: item.revenue || 0,
          growth: item.growth || 0,
          companies: item.companies || 0
        }));
        setSectorPerformance(transformed);
      } else {
        setSectorPerformance([]);
      }
      
      // Transformer les top entreprises
      if (metrics.topCompanies && Array.isArray(metrics.topCompanies)) {
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
        const transformed = metrics.topCompanies.map((item: any, index: number) => ({
          name: item.name || 'Entreprise',
          revenue: item.revenue || 0,
          growth: item.growth || 0,
          users: item.users || 0,
          color: colors[index % colors.length]
        }));
        setTopCompanies(transformed);
      } else {
        setTopCompanies([]);
      }
      
      // Générer les données d'engagement utilisateur (simulation basée sur les données réelles)
      // TODO: Remplacer par un appel API réel quand disponible
      const engagementData = generateUserEngagementData(metrics.activeUsers || 0);
      setUserEngagement(engagementData);
      
      // Générer les données géographiques (simulation basée sur les données réelles)
      // TODO: Remplacer par un appel API réel quand disponible
      const geoData = generateGeographicData(metrics.totalUsers || 0, metrics.totalCompanies || 0, metrics.totalRevenue || 0);
      setGeographicData(geoData);
      
      console.log('✅ Données analytics chargées avec succès');
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données analytics:', error);
      // Utiliser des données par défaut en cas d'erreur
      setPlatformMetrics([
        { name: 'Jan', revenue: 0, users: 0, companies: 0, transactions: 0 },
        { name: 'Fév', revenue: 0, users: 0, companies: 0, transactions: 0 },
        { name: 'Mar', revenue: 0, users: 0, companies: 0, transactions: 0 },
        { name: 'Avr', revenue: 0, users: 0, companies: 0, transactions: 0 },
        { name: 'Mai', revenue: 0, users: 0, companies: 0, transactions: 0 },
        { name: 'Jun', revenue: 0, users: 0, companies: 0, transactions: 0 },
      ]);
      setSectorPerformance([]);
      setTopCompanies([]);
      setUserEngagement([]);
      setGeographicData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fonction helper pour générer les données d'engagement (temporaire)
  const generateUserEngagementData = (activeUsers: number) => {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    return days.map((day, index) => ({
      name: day,
      activeUsers: Math.floor(activeUsers * (0.7 + Math.random() * 0.3)),
      sessions: Math.floor(activeUsers * (2 + Math.random() * 1.5)),
      avgDuration: Math.floor(15 + Math.random() * 20)
    }));
  };

  // Fonction helper pour générer les données géographiques (temporaire)
  const generateGeographicData = (totalUsers: number, totalCompanies: number, totalRevenue: number) => {
    const regions = [
      { name: 'Dakar', ratio: 0.6 },
      { name: 'Thiès', ratio: 0.15 },
      { name: 'Saint-Louis', ratio: 0.1 },
      { name: 'Kaolack', ratio: 0.08 },
      { name: 'Ziguinchor', ratio: 0.07 }
    ];
    
    return regions.map(region => ({
      region: region.name,
      users: Math.floor(totalUsers * region.ratio),
      companies: Math.floor(totalCompanies * region.ratio),
      revenue: Math.floor(totalRevenue * region.ratio)
    }));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Vider le cache pour forcer le rechargement des vraies données
    dashboardApiService.clearCache();
    await loadAnalyticsData();
  };

  const periods = [
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'quarter', label: 'Ce trimestre' },
    { value: 'year', label: 'Cette année' },
  ];

  const metrics = [
    { value: 'revenue', label: 'Revenus', icon: DollarSign },
    { value: 'users', label: 'Utilisateurs', icon: Users },
    { value: 'companies', label: 'Entreprises', icon: Package },
    { value: 'transactions', label: 'Transactions', icon: Activity },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Analytics Plateforme</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Analyse complète des performances de la plateforme
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="secondary" 
            icon={<RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
            onClick={handleRefresh}
            disabled={refreshing || loading}
          >
            {refreshing ? 'Actualisation...' : 'Actualiser'}
          </Button>
          <Button variant="secondary" icon={<Download className="w-4 h-4" />}>
            Exporter
          </Button>
          <Button variant="primary" icon={<BarChart3 className="w-4 h-4" />}>
            Rapport Personnalisé
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex items-center justify-between">
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

        <div className="flex items-center space-x-2">
          {metrics.map((metric) => {
            const IconComponent = metric.icon;
            return (
              <motion.button
                key={metric.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedMetric(metric.value)}
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300
                  ${selectedMetric === metric.value
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                `}
              >
                <IconComponent className="w-4 h-4" />
                <span>{metric.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Key Metrics */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Chargement des métriques...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Revenus Totaux"
            value={dashboardMetrics?.totalRevenue || 0}
            previousValue={(() => {
              const current = dashboardMetrics?.totalRevenue || 0;
              const growth = dashboardMetrics?.revenueGrowthPercentage || 0;
              // Calculer la valeur précédente basée sur le pourcentage de croissance
              // Si croissance = 10%, alors previous = current / 1.10
              if (growth > 0 && current > 0) {
                return Math.round(current / (1 + growth / 100));
              }
              // Si pas de croissance ou valeur nulle, utiliser 90% comme estimation
              return current > 0 ? Math.round(current * 0.95) : 0;
            })()}
            format="currency"
            icon={<DollarSign className="w-6 h-6" />}
            color="success"
          />
          <MetricCard
            title="Utilisateurs Actifs"
            value={dashboardMetrics?.activeUsers || dashboardMetrics?.totalUsers || 0}
            previousValue={(() => {
              const current = dashboardMetrics?.activeUsers || dashboardMetrics?.totalUsers || 0;
              const growth = dashboardMetrics?.usersGrowthPercentage || 0;
              // Calculer la valeur précédente basée sur le pourcentage de croissance
              if (growth > 0 && current > 0) {
                return Math.round(current / (1 + growth / 100));
              }
              // Si pas de croissance ou valeur nulle, utiliser 95% comme estimation
              return current > 0 ? Math.round(current * 0.95) : 0;
            })()}
            format="number"
            icon={<Users className="w-6 h-6" />}
            color="primary"
          />
          <MetricCard
            title="Entreprises Actives"
            value={dashboardMetrics?.totalCompanies || 0}
            previousValue={(() => {
              const current = dashboardMetrics?.totalCompanies || 0;
              const growth = dashboardMetrics?.companiesGrowthPercentage || 0;
              // Calculer la valeur précédente basée sur le pourcentage de croissance
              if (growth > 0 && current > 0) {
                return Math.round(current / (1 + growth / 100));
              }
              // Si pas de croissance ou valeur nulle, utiliser 95% comme estimation
              return current > 0 ? Math.round(current * 0.95) : 0;
            })()}
            format="number"
            icon={<Building2 className="w-6 h-6" />}
            color="info"
          />
          <MetricCard
            title="Produits"
            value={dashboardMetrics?.totalProducts || 0}
            previousValue={(() => {
              const current = dashboardMetrics?.totalProducts || 0;
              // Pour les produits, utiliser une estimation conservatrice
              return current > 0 ? Math.round(current * 0.98) : 0;
            })()}
            format="number"
            icon={<Package className="w-6 h-6" />}
            color="warning"
          />
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Growth */}
        <div className="card-premium p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Croissance de la Plateforme
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={platformMetrics}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
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
                formatter={(value: any, name: string) => {
                  if (name === 'revenue') return [`${(value / 1000000).toFixed(1)}M XOF`, 'Revenus'];
                  return [value, name === 'users' ? 'Utilisateurs' : 'Entreprises'];
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10B981" 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                strokeWidth={3}
                name="Revenus"
              />
              <Area 
                type="monotone" 
                dataKey="users" 
                stroke="#3B82F6" 
                fillOpacity={1} 
                fill="url(#colorUsers)" 
                strokeWidth={3}
                name="Utilisateurs"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sector Performance */}
        <div className="card-premium p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Performance par Secteur
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={sectorPerformance} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis type="number" stroke="#6B7280" />
              <YAxis dataKey="sector" type="category" stroke="#6B7280" width={100} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none', 
                  borderRadius: '12px',
                  color: '#F9FAFB'
                }}
                formatter={(value: any) => [`${(value / 1000000).toFixed(1)}M XOF`, 'Revenus']}
              />
              <Bar 
                dataKey="revenue" 
                fill="#3B82F6"
                radius={[0, 8, 8, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* User Engagement */}
        <div className="card-premium p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Engagement Utilisateurs (7 derniers jours)
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={userEngagement}>
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
              <Line 
                type="monotone" 
                dataKey="activeUsers" 
                stroke="#8B5CF6" 
                strokeWidth={3}
                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                name="Utilisateurs Actifs"
              />
              <Line 
                type="monotone" 
                dataKey="sessions" 
                stroke="#F59E0B" 
                strokeWidth={3}
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 6 }}
                name="Sessions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Geographic Distribution */}
        <div className="card-premium p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Répartition Géographique
          </h3>
          <div className="space-y-4">
            {geographicData.map((region, index) => (
              <motion.div
                key={region.region}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {region.region}
                    </p>
                    <p className="text-xs text-gray-500">
                      {region.users} utilisateurs • {region.companies} entreprises
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {(region.revenue / 1000000).toFixed(1)}M XOF
                  </p>
                  <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full mt-1">
                    <div 
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${(region.revenue / 185000000) * 100}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Companies Performance */}
      <div className="card-premium p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Top Entreprises par Performance
          </h3>
          <Button variant="secondary" size="sm" icon={<Eye className="w-4 h-4" />}>
            Voir Tout
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {topCompanies.map((company, index) => (
            <motion.div
              key={company.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: company.color }}
                />
                <span className="text-xs text-green-600 font-medium">
                  +{company.growth}%
                </span>
              </div>
              
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                {company.name}
              </h4>
              
              <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {(company.revenue / 1000000).toFixed(1)}M XOF
              </p>
              
              <p className="text-xs text-gray-500">
                {company.users} utilisateurs
              </p>
              
              <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                <div 
                  className="h-full rounded-full"
                  style={{ 
                    backgroundColor: company.color,
                    width: `${(company.revenue / 150000000) * 100}%`
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Breakdown */}
        <div className="card-premium p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Répartition des Revenus
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Abonnements</span>
              <span className="font-semibold text-gray-900 dark:text-white">65%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
              <div className="h-full bg-primary-500 rounded-full" style={{ width: '65%' }} />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Commissions</span>
              <span className="font-semibold text-gray-900 dark:text-white">25%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
              <div className="h-full bg-green-500 rounded-full" style={{ width: '25%' }} />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Services Premium</span>
              <span className="font-semibold text-gray-900 dark:text-white">10%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
              <div className="h-full bg-gold-500 rounded-full" style={{ width: '10%' }} />
            </div>
          </div>
        </div>

        {/* Growth Trends */}
        <div className="card-premium p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tendances de Croissance
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Nouveaux Utilisateurs</p>
                <p className="text-xs text-gray-500">Cette semaine</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">+67</p>
                <p className="text-xs text-green-600">+12.5%</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Nouvelles Entreprises</p>
                <p className="text-xs text-gray-500">Ce mois</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">+7</p>
                <p className="text-xs text-blue-600">+8.5%</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Volume Transactions</p>
                <p className="text-xs text-gray-500">Ce mois</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-purple-600">+2.7K</p>
                <p className="text-xs text-purple-600">+12.2%</p>
              </div>
            </div>
          </div>
        </div>

        {/* System Performance */}
        <div className="card-premium p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Performance Système
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Uptime</span>
              <span className="font-semibold text-green-600">99.9%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
              <div className="h-full bg-green-500 rounded-full" style={{ width: '99.9%' }} />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Temps de Réponse API</span>
              <span className="font-semibold text-blue-600">245ms</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '75%' }} />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Utilisation CPU</span>
              <span className="font-semibold text-yellow-600">68%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
              <div className="h-full bg-yellow-500 rounded-full" style={{ width: '68%' }} />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Utilisation Mémoire</span>
              <span className="font-semibold text-purple-600">52%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: '52%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Activity Feed */}
      <div className="card-premium p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Activité en Temps Réel
          </h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Live</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Nouvelles Ventes', value: '12', change: '+3', color: 'text-green-600' },
            { label: 'Nouveaux Utilisateurs', value: '8', change: '+2', color: 'text-blue-600' },
            { label: 'Paiements Traités', value: '45', change: '+12', color: 'text-purple-600' },
            { label: 'Support Tickets', value: '3', change: '+1', color: 'text-orange-600' },
          ].map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
            >
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {metric.value}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {metric.label}
              </p>
              <p className={`text-xs font-medium ${metric.color}`}>
                {metric.change} dernière heure
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;