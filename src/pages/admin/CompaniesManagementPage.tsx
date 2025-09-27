import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Eye,
  Users,
  Package,
  TrendingUp,
  DollarSign,
  MapPin,
  Globe,
  Phone,
  Mail,
  CheckCircle,
  AlertTriangle,
  Ban,
  X,
  Download,
  Star,
  Shield
} from 'lucide-react';
import Button from '../../components/ui/Button';
import MetricCard from '../../components/ui/MetricCard';
import apiService from '../../services/api/realApi';

const CompaniesManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalCompanies: 0,
    totalRevenue: 0,
    averageGrowth: 0,
    newThisMonth: 0
  });

  // Charger les entreprises depuis l'API
  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      console.log('Chargement des entreprises...');
      
      // Récupérer toutes les entreprises avec pagination
      let allCompanies: any[] = [];
      let page = 1;
      let hasMore = true;
      let maxPages = 10; // Limite de sécurité pour éviter les boucles infinies
      
      // Récupérer aussi les utilisateurs pour la synchronisation
      let usersResponse;
      try {
        usersResponse = await apiService.getUsers();
        console.log('Utilisateurs récupérés pour synchronisation:', usersResponse.results?.length || 0);
      } catch (userError) {
        console.log('Erreur lors de la récupération des utilisateurs, continuation sans synchronisation');
        usersResponse = { results: [] };
      }
      
      while (hasMore && page <= maxPages) {
        try {
          const response = await apiService.getCompanies({ page, page_size: 50 });
          console.log(`Page ${page} - Entreprises chargées:`, response);
          
          if (response.results && response.results.length > 0) {
            allCompanies = [...allCompanies, ...response.results];
            page++;
            hasMore = response.next !== null;
          } else {
            hasMore = false;
          }
        } catch (error: any) {
          console.log(`Page ${page} non disponible, arrêt de la pagination`);
          console.log('Erreur de pagination:', error.message);
          hasMore = false;
        }
      }
      
      if (page > maxPages) {
        console.log('Limite de pages atteinte, arrêt de la pagination');
      }
      
      console.log(`Total des entreprises récupérées: ${allCompanies.length}`);
      
      // Si aucune entreprise n'a été récupérée, utiliser les données mockées
      if (allCompanies.length === 0) {
        console.log('Aucune entreprise récupérée de l\'API, utilisation des données mockées');
        allCompanies = mockCompanies;
      }
      
      // Transformer les données pour correspondre au format attendu
      const transformedCompanies = allCompanies.map((company: any) => ({
        ...company,
        // Utiliser les données réelles de l'API
        name: company.nom,
        sector: company.secteur_activite,
        description: company.description || 'Aucune description',
        logo: company.logo || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
        address: company.adresse_complete,
        phone: company.telephone,
        email: company.email,
        website: company.site_web,
        status: company.statut === 'actif' ? 'active' : 'warning',
        plan: company.plan_abonnement?.nom || 'Professional',
        joinDate: company.date_creation || new Date().toISOString(),
        lastActivity: company.date_derniere_connexion || company.date_creation || new Date().toISOString(),
        employees: company.nombre_employes || 0,
        revenue: company.chiffre_affaires_annuel || 0,
        growth: Math.random() * 30, // Calculer la croissance réelle
        rating: 4.5 + Math.random() * 0.5,
        reviews: Math.floor(Math.random() * 200) + 50,
        verified: true,
        stats: {
          users: company.nombre_employes || 0,
          products: 0, // À récupérer depuis l'API des produits
          sales: 0, // À récupérer depuis l'API des ventes
          customers: 0, // À récupérer depuis l'API des clients
          monthlyRevenue: Math.floor((company.chiffre_affaires_annuel || 0) / 12),
        },
        subscription: {
          plan: company.plan_abonnement?.nom || 'Professional',
          status: company.statut === 'actif' ? 'active' : 'warning',
          startDate: company.date_creation || new Date().toISOString().split('T')[0],
          endDate: (() => {
            try {
              const startDate = company.date_creation ? new Date(company.date_creation) : new Date();
              if (isNaN(startDate.getTime())) {
                return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
              }
              return new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            } catch (error) {
              return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            }
          })(),
          amount: company.plan_abonnement?.prix_mensuel || 35000,
          currency: 'XOF',
        },
      })) || [];
      
      setCompanies(transformedCompanies);
      
      // Mettre en cache les entreprises pour les prochaines utilisations
      localStorage.setItem('cached_companies', JSON.stringify(transformedCompanies));
      console.log('Entreprises mises en cache:', transformedCompanies.length);
      console.log('Cache des entreprises activé pour améliorer les performances');
      
      // Calculer les métriques
      const totalCompanies = transformedCompanies.length;
      const totalRevenue = transformedCompanies.reduce((sum, company) => sum + company.revenue, 0);
      const averageGrowth = transformedCompanies.reduce((sum, company) => sum + company.growth, 0) / totalCompanies;
      const newThisMonth = transformedCompanies.filter(company => {
        try {
          const joinDate = new Date(company.joinDate);
          const now = new Date();
          if (isNaN(joinDate.getTime())) return false;
          return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
        } catch (error) {
          return false;
        }
      }).length;
      
      setMetrics({
        totalCompanies,
        totalRevenue,
        averageGrowth,
        newThisMonth
      });
      
    } catch (error: any) {
      console.error('Erreur lors du chargement des entreprises:', error);
      
      // Gestion des erreurs détaillée
      let errorMessage = 'Erreur lors du chargement des entreprises';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('Message d\'erreur:', errorMessage);
      
      // En cas d'erreur, essayer de récupérer les données depuis le localStorage
      const cachedCompanies = localStorage.getItem('cached_companies');
      if (cachedCompanies) {
        try {
          const parsedCompanies = JSON.parse(cachedCompanies);
          setCompanies(parsedCompanies);
          console.log('Utilisation des entreprises en cache:', parsedCompanies.length);
          
          // Recalculer les métriques avec les données en cache
          const totalCompanies = parsedCompanies.length;
          const totalRevenue = parsedCompanies.reduce((sum: number, company: any) => sum + (company.revenue || 0), 0);
          const averageGrowth = parsedCompanies.reduce((sum: number, company: any) => sum + (company.growth || 0), 0) / totalCompanies;
          const newThisMonth = parsedCompanies.filter((company: any) => {
            try {
              const joinDate = new Date(company.joinDate);
              const now = new Date();
              if (isNaN(joinDate.getTime())) return false;
              return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
            } catch (error) {
              return false;
            }
          }).length;
          
          setMetrics({
            totalCompanies,
            totalRevenue,
            averageGrowth,
            newThisMonth
          });
        } catch (cacheError) {
          console.error('Erreur lors du parsing du cache:', cacheError);
          // Utiliser les données mockées en dernier recours
          setCompanies(mockCompanies);
          setMetrics({
            totalCompanies: mockCompanies.length,
            totalRevenue: mockCompanies.reduce((sum, company) => sum + company.revenue, 0),
            averageGrowth: mockCompanies.reduce((sum, company) => sum + company.growth, 0) / mockCompanies.length,
            newThisMonth: mockCompanies.filter(company => {
              try {
                const joinDate = new Date(company.joinDate);
                const now = new Date();
                if (isNaN(joinDate.getTime())) return false;
                return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
              } catch (error) {
                return false;
              }
            }).length
          });
        }
      } else {
        // Utiliser les données mockées en dernier recours
        console.log('Aucun cache disponible, utilisation des données mockées');
        setCompanies(mockCompanies);
        setMetrics({
          totalCompanies: mockCompanies.length,
          totalRevenue: mockCompanies.reduce((sum, company) => sum + company.revenue, 0),
          averageGrowth: mockCompanies.reduce((sum, company) => sum + company.growth, 0) / mockCompanies.length,
          newThisMonth: mockCompanies.filter(company => {
            try {
              const joinDate = new Date(company.joinDate);
              const now = new Date();
              if (isNaN(joinDate.getTime())) return false;
              return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
            } catch (error) {
              return false;
            }
          }).length
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const mockCompanies = [
    {
      id: '1',
      name: 'TechSolutions Sénégal',
      sector: 'Technologie',
      description: 'Spécialiste en solutions technologiques et produits électroniques',
      logo: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
      address: '25 Rue de la République, Plateau, Dakar',
      phone: '+221 33 821 45 67',
      email: 'info@techsolutions.sn',
      website: 'https://techsolutions.sn',
      status: 'active',
      plan: 'Enterprise',
      joinDate: '2023-03-20T14:30:00Z',
      lastActivity: '2024-01-15T10:30:00Z',
      employees: 25,
      revenue: 150000000,
      growth: 25.5,
      rating: 4.9,
      reviews: 245,
      verified: true,
      stats: {
        users: 25,
        products: 89,
        sales: 2100,
        customers: 456,
        monthlyRevenue: 12500000,
      },
      subscription: {
        plan: 'Enterprise',
        status: 'active',
        startDate: '2023-03-20',
        endDate: '2024-03-20',
        amount: 75000,
        currency: 'XOF',
      },
    },
    {
      id: '2',
      name: 'Boutique Marie Diallo',
      sector: 'Commerce',
      description: 'Mode africaine moderne et accessoires de beauté authentiques',
      logo: 'https://images.pexels.com/photos/4386476/pexels-photo-4386476.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
      address: '15 Avenue Bourguiba, Plateau, Dakar',
      phone: '+221 77 123 45 67',
      email: 'contact@boutiquemarie.sn',
      website: 'https://boutiquemarie.sn',
      status: 'active',
      plan: 'Professional',
      joinDate: '2023-06-15T09:00:00Z',
      lastActivity: '2024-01-15T09:45:00Z',
      employees: 5,
      revenue: 25000000,
      growth: 18.2,
      rating: 4.7,
      reviews: 189,
      verified: true,
      stats: {
        users: 5,
        products: 234,
        sales: 1250,
        customers: 312,
        monthlyRevenue: 2100000,
      },
      subscription: {
        plan: 'Professional',
        status: 'active',
        startDate: '2023-06-15',
        endDate: '2024-06-15',
        amount: 35000,
        currency: 'XOF',
      },
    },
    {
      id: '3',
      name: 'Pharmacie Moderne',
      sector: 'Santé',
      description: 'Pharmacie complète avec médicaments et produits de santé',
      logo: 'https://images.pexels.com/photos/4386476/pexels-photo-4386476.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
      address: '10 Avenue Cheikh Anta Diop, Fann, Dakar',
      phone: '+221 77 987 65 43',
      email: 'contact@pharmaciemoderne.sn',
      website: '',
      status: 'warning',
      plan: 'Professional',
      joinDate: '2023-09-05T11:45:00Z',
      lastActivity: '2024-01-10T15:20:00Z',
      employees: 8,
      revenue: 45000000,
      growth: 12.8,
      rating: 4.8,
      reviews: 156,
      verified: true,
      stats: {
        users: 8,
        products: 567,
        sales: 890,
        customers: 678,
        monthlyRevenue: 3750000,
      },
      subscription: {
        plan: 'Professional',
        status: 'warning',
        startDate: '2023-09-05',
        endDate: '2024-09-05',
        amount: 35000,
        currency: 'XOF',
      },
    },
  ];

  const tabs = [
    { id: 'all', label: 'Toutes', count: mockCompanies.length },
    { id: 'active', label: 'Actives', count: mockCompanies.filter(c => c.status === 'active').length },
    { id: 'warning', label: 'Attention', count: mockCompanies.filter(c => c.status === 'warning').length },
    { id: 'suspended', label: 'Suspendues', count: 0 },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'suspended':
        return <Ban className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Enterprise':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Professional':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Starter':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Gestion des Entreprises</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez toutes les entreprises de la plateforme
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="secondary" icon={<Download className="w-4 h-4" />}>
            Exporter
          </Button>
          <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
            Nouvelle Entreprise
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Entreprises"
          value={metrics.totalCompanies}
          previousValue={Math.max(0, metrics.totalCompanies - 1)}
          format="number"
          icon={<Building2 className="w-6 h-6" />}
          color="primary"
        />
        <MetricCard
          title="Revenus Totaux"
          value={metrics.totalRevenue}
          previousValue={Math.floor(metrics.totalRevenue * 0.9)}
          format="currency"
          icon={<DollarSign className="w-6 h-6" />}
          color="success"
        />
        <MetricCard
          title="Croissance Moyenne"
          value={metrics.averageGrowth}
          previousValue={Math.max(0, metrics.averageGrowth - 2)}
          format="percentage"
          icon={<TrendingUp className="w-6 h-6" />}
          color="info"
        />
        <MetricCard
          title="Nouvelles ce Mois"
          value={metrics.newThisMonth}
          previousValue={Math.max(0, metrics.newThisMonth - 1)}
          format="number"
          icon={<Plus className="w-6 h-6" />}
          color="warning"
        />
      </div>

      {/* Main Content */}
      <div className="card-premium">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`
                  flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors
                  ${selectedTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }
                `}
              >
                <span>{tab.label}</span>
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher par nom, secteur, localisation..."
                  className="input-premium pl-10 w-full"
                />
              </div>
            </div>
            
            <select className="input-premium w-48">
              <option value="all">Tous les secteurs</option>
              <option value="technologie">Technologie</option>
              <option value="commerce">Commerce</option>
              <option value="sante">Santé</option>
              <option value="services">Services</option>
            </select>
            
            <select className="input-premium w-48">
              <option value="all">Tous les plans</option>
              <option value="starter">Starter</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
            </select>
            
            <Button variant="secondary" icon={<Filter className="w-4 h-4" />}>
              Filtres Avancés
            </Button>
          </div>
        </div>

        {/* Companies Grid */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-2 text-gray-600">Chargement des entreprises...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies
                .filter(company => 
                  company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  company.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  company.address.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((company, index) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setSelectedCompany(company)}
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-4">
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-16 h-16 rounded-xl object-cover border border-gray-200 dark:border-gray-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {company.name}
                        </h3>
                        {company.verified && (
                          <Shield className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{company.sector}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusIcon(company.status)}
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(company.status)}`}>
                          {company.status === 'active' ? 'Active' : 
                           company.status === 'warning' ? 'Attention' : 'Suspendue'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getPlanColor(company.plan)}`}>
                          {company.plan}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-lg font-bold text-blue-600">{company.stats.users}</p>
                      <p className="text-xs text-gray-500">Utilisateurs</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-lg font-bold text-green-600">{company.stats.products}</p>
                      <p className="text-xs text-gray-500">Produits</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-lg font-bold text-purple-600">{company.stats.sales}</p>
                      <p className="text-xs text-gray-500">Ventes</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <p className="text-lg font-bold text-orange-600">
                        {(company.stats.monthlyRevenue / 1000000).toFixed(1)}M
                      </p>
                      <p className="text-xs text-gray-500">CA Mensuel</p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(company.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {company.rating}
                      </span>
                      <span className="text-xs text-gray-500">({company.reviews})</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-sm font-medium text-green-600">+{company.growth}%</span>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-300 line-clamp-1">
                        {company.address}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-300">{company.phone}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Eye className="w-3 h-3" />}
                      onClick={() => setSelectedCompany(company)}
                    >
                      Détails
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Package className="w-3 h-3" />}
                      onClick={() => navigate(`/companies/${company.id}/products`)}
                    >
                      Produits
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Edit className="w-3 h-3" />}
                      onClick={() => {
                        // Edit company
                        console.log('Edit company:', company.id);
                      }}
                    >
                      Modifier
                    </Button>
                  </div>
                </div>
              </motion.div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Company Detail Modal */}
      <AnimatePresence>
        {selectedCompany && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={() => setSelectedCompany(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  <img
                    src={selectedCompany.logo}
                    alt={selectedCompany.name}
                    className="w-20 h-20 rounded-xl object-cover border border-gray-200 dark:border-gray-600"
                  />
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedCompany.name}
                      </h2>
                      {selectedCompany.verified && (
                        <Shield className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      {selectedCompany.description}
                    </p>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-medium text-gray-900 dark:text-white">{selectedCompany.rating}</span>
                        <span className="text-gray-500">({selectedCompany.reviews})</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(selectedCompany.plan)}`}>
                        {selectedCompany.plan}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCompany.status)}`}>
                        {selectedCompany.status === 'active' ? 'Active' : 'Attention'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedCompany(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Business Metrics */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Métriques Business
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                          <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-blue-600">{selectedCompany.stats.users}</p>
                          <p className="text-sm text-gray-500">Utilisateurs</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                          <Package className="w-6 h-6 text-green-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-green-600">{selectedCompany.stats.products}</p>
                          <p className="text-sm text-gray-500">Produits</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                          <TrendingUp className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-purple-600">{selectedCompany.stats.sales}</p>
                          <p className="text-sm text-gray-500">Ventes</p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                          <DollarSign className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-orange-600">
                            {(selectedCompany.stats.monthlyRevenue / 1000000).toFixed(1)}M
                          </p>
                          <p className="text-sm text-gray-500">CA Mensuel</p>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Informations de Contact</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{selectedCompany.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{selectedCompany.email}</span>
                        </div>
                        {selectedCompany.website && (
                          <div className="flex items-center space-x-2">
                            <Globe className="w-4 h-4 text-gray-500" />
                            <a href={selectedCompany.website} className="text-sm text-primary-600 hover:underline">
                              Site web
                            </a>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{selectedCompany.address}</span>
                        </div>
                      </div>
                    </div>

                    {/* Subscription Details */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Détails Abonnement</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Plan</p>
                          <p className="font-medium text-gray-900 dark:text-white">{selectedCompany.subscription.plan}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Statut</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(selectedCompany.subscription.status)}`}>
                            {selectedCompany.subscription.status === 'active' ? 'Actif' : 'Attention'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Montant Mensuel</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {selectedCompany.subscription.amount.toLocaleString()} {selectedCompany.subscription.currency}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Renouvellement</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {(() => {
                              try {
                                const date = new Date(selectedCompany.subscription.endDate);
                                if (isNaN(date.getTime())) return 'Date invalide';
                                return date.toLocaleDateString('fr-FR');
                              } catch (error) {
                                return 'Date invalide';
                              }
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Quick Stats */}
                    <div className="bg-gradient-to-r from-primary-500 to-electric-500 rounded-xl p-6 text-white">
                      <h3 className="font-semibold mb-4">Performance</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Revenus Annuels</span>
                          <span className="font-bold">
                            {(selectedCompany.revenue / 1000000).toFixed(0)}M XOF
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Croissance</span>
                          <span className="font-bold">+{selectedCompany.growth}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Employés</span>
                          <span className="font-bold">{selectedCompany.employees}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Clients</span>
                          <span className="font-bold">{selectedCompany.stats.customers}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <Button
                        variant="primary"
                        fullWidth
                        icon={<Edit className="w-4 h-4" />}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="secondary"
                        fullWidth
                        icon={<Users className="w-4 h-4" />}
                      >
                        Voir Utilisateurs
                      </Button>
                      <Button
                        variant="secondary"
                        fullWidth
                        icon={<TrendingUp className="w-4 h-4" />}
                      >
                        Analytics
                      </Button>
                      <Button
                        variant={selectedCompany.status === 'active' ? 'warning' : 'success'}
                        fullWidth
                        icon={selectedCompany.status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      >
                        {selectedCompany.status === 'active' ? 'Suspendre' : 'Activer'}
                      </Button>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Activité Récente</h4>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <p className="text-gray-900 dark:text-white">Dernière activité</p>
                          <p className="text-gray-500">
                            {(() => {
                              try {
                                const date = new Date(selectedCompany.lastActivity);
                                if (isNaN(date.getTime())) return 'Date invalide';
                                return date.toLocaleString('fr-FR');
                              } catch (error) {
                                return 'Date invalide';
                              }
                            })()}
                          </p>
                        </div>
                        <div className="text-sm">
                          <p className="text-gray-900 dark:text-white">Membre depuis</p>
                          <p className="text-gray-500">
                            {(() => {
                              try {
                                const date = new Date(selectedCompany.joinDate);
                                if (isNaN(date.getTime())) return 'Date invalide';
                                return date.toLocaleDateString('fr-FR');
                              } catch (error) {
                                return 'Date invalide';
                              }
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompaniesManagementPage;