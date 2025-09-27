import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Shield, 
  Crown,
  User,
  Building2,
  ShoppingBag,
  Mail,
  Phone,
  Calendar,
  Activity,
  Ban,
  CheckCircle,
  AlertTriangle,
  Eye,
  X,
  UserPlus,
  Download,
  Clock
} from 'lucide-react';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import MetricCard from '../../components/ui/MetricCard';
import apiService from '../../services/api/realApi';

const UsersManagementPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    newThisMonth: 0,
    activeUsers: 0,
    retentionRate: 0
  });

  // Charger les utilisateurs depuis l'API
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsers();
      console.log('Utilisateurs chargés:', response);
      
      // Transformer les données pour correspondre au format attendu
      const transformedUsers = response.results?.map((user: any) => ({
        ...user,
        // Utiliser les données réelles de l'API
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.type_utilisateur,
        company: user.entreprise?.nom || null,
        phone: user.telephone,
        avatar: user.avatar || 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        status: user.statut === 'actif' ? 'active' : 'suspended',
        lastLogin: user.date_derniere_connexion,
        joinDate: user.date_creation,
        loginCount: user.nombre_connexions || 0,
        experiencePoints: user.points_experience || 0,
        level: user.niveau || 1,
        mfaEnabled: user.mfa_actif || false,
        emailVerified: user.email_verifie || false,
        phoneVerified: user.telephone_verifie || false,
        permissions: user.permissions || [],
        stats: user.type_utilisateur === 'entrepreneur' ? {
          sales: user.ventes_count || 0,
          revenue: user.chiffre_affaires || 0,
          customers: user.clients_count || 0,
          products: user.produits_count || 0,
        } : {
          orders: user.commandes_count || 0,
          spent: user.montant_depense || 0,
          loyaltyPoints: user.points_fidelite || 0,
          favoriteStores: user.magasins_favoris_count || 0,
        },
      })) || [];
      
      setUsers(transformedUsers);
      
      // Calculer les métriques
      const totalUsers = transformedUsers.length;
      const newThisMonth = transformedUsers.filter(user => {
        const joinDate = new Date(user.joinDate);
        const now = new Date();
        return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
      }).length;
      const activeUsers = transformedUsers.filter(user => user.status === 'active').length;
      const retentionRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;
      
      setMetrics({
        totalUsers,
        newThisMonth,
        activeUsers,
        retentionRate
      });
      
    } catch (error: any) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      
      // Gestion des erreurs détaillée
      let errorMessage = 'Erreur lors du chargement des utilisateurs';
      
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
      // En cas d'erreur, utiliser les données mockées comme fallback
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  const mockUsers = [
    {
      id: '1',
      firstName: 'Marie',
      lastName: 'Diallo',
      email: 'marie@boutiquemarie.sn',
      role: 'entrepreneur',
      company: 'Boutique Marie Diallo',
      phone: '+221 77 123 45 67',
      avatar: 'https://images.pexels.com/photos/3992656/pexels-photo-3992656.png?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      status: 'active',
      lastLogin: '2024-01-15T10:30:00Z',
      joinDate: '2023-06-15T09:00:00Z',
      loginCount: 245,
      experiencePoints: 2500,
      level: 3,
      mfaEnabled: true,
      emailVerified: true,
      phoneVerified: true,
      permissions: ['inventory:read', 'inventory:write', 'sales:read', 'sales:write'],
      stats: {
        sales: 125,
        revenue: 15750000,
        customers: 89,
        products: 156,
      },
    },
    {
      id: '2',
      firstName: 'Amadou',
      lastName: 'Ba',
      email: 'amadou@techsolutions.sn',
      role: 'entrepreneur',
      company: 'TechSolutions Sénégal',
      phone: '+221 77 234 56 78',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      status: 'active',
      lastLogin: '2024-01-15T08:45:00Z',
      joinDate: '2023-03-20T14:30:00Z',
      loginCount: 412,
      experiencePoints: 4200,
      level: 4,
      mfaEnabled: true,
      emailVerified: true,
      phoneVerified: true,
      permissions: ['*'],
      stats: {
        sales: 89,
        revenue: 45200000,
        customers: 156,
        products: 89,
      },
    },
    {
      id: '3',
      firstName: 'Abdou',
      lastName: 'Samb',
      email: 'abdou.samb@email.com',
      role: 'client',
      company: null,
      phone: '+221 77 345 67 89',
      avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      status: 'active',
      lastLogin: '2024-01-15T11:15:00Z',
      joinDate: '2023-08-10T16:20:00Z',
      loginCount: 67,
      experiencePoints: 850,
      level: 1,
      mfaEnabled: false,
      emailVerified: true,
      phoneVerified: false,
      permissions: ['profile:read', 'profile:write', 'orders:read'],
      stats: {
        orders: 23,
        spent: 450000,
        loyaltyPoints: 450,
        favoriteStores: 3,
      },
    },
    {
      id: '4',
      firstName: 'Fatou',
      lastName: 'Sow',
      email: 'fatou@pharmaciemoderne.sn',
      role: 'entrepreneur',
      company: 'Pharmacie Moderne',
      phone: '+221 77 456 78 90',
      avatar: 'https://images.pexels.com/photos/3992656/pexels-photo-3992656.png?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      status: 'suspended',
      lastLogin: '2024-01-10T15:20:00Z',
      joinDate: '2023-09-05T11:45:00Z',
      loginCount: 89,
      experiencePoints: 1800,
      level: 2,
      mfaEnabled: false,
      emailVerified: true,
      phoneVerified: true,
      permissions: ['inventory:read', 'sales:read'],
      stats: {
        sales: 67,
        revenue: 8900000,
        customers: 234,
        products: 567,
      },
    },
  ];

  const userRoles = [
    { id: 'all', name: 'Tous', count: mockUsers.length, icon: Users },
    { id: 'admin', name: 'Admins', count: 1, icon: Crown },
    { id: 'entrepreneur', name: 'Entrepreneurs', count: 3, icon: Building2 },
    { id: 'client', name: 'Clients', count: 1, icon: ShoppingBag },
  ];

  const tabs = [
    { id: 'all', label: 'Tous les utilisateurs', count: mockUsers.length },
    { id: 'active', label: 'Actifs', count: mockUsers.filter(u => u.status === 'active').length },
    { id: 'suspended', label: 'Suspendus', count: mockUsers.filter(u => u.status === 'suspended').length },
    { id: 'pending', label: 'En attente', count: 0 },
  ];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-red-500" />;
      case 'entrepreneur':
        return <Building2 className="w-4 h-4 text-blue-500" />;
      case 'client':
        return <ShoppingBag className="w-4 h-4 text-green-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'suspended':
        return <Ban className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Gestion des Utilisateurs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez tous les utilisateurs de la plateforme
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="secondary" icon={<Download className="w-4 h-4" />}>
            Exporter
          </Button>
          <Button variant="primary" icon={<UserPlus className="w-4 h-4" />}>
            Nouvel Utilisateur
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Utilisateurs"
          value={metrics.totalUsers}
          previousValue={Math.max(0, metrics.totalUsers - 1)}
          format="number"
          icon={<Users className="w-6 h-6" />}
          color="primary"
        />
        <MetricCard
          title="Nouveaux ce Mois"
          value={metrics.newThisMonth}
          previousValue={Math.max(0, metrics.newThisMonth - 1)}
          format="number"
          icon={<UserPlus className="w-6 h-6" />}
          color="success"
        />
        <MetricCard
          title="Utilisateurs Actifs"
          value={metrics.activeUsers}
          previousValue={Math.max(0, metrics.activeUsers - 1)}
          format="number"
          icon={<Activity className="w-6 h-6" />}
          color="info"
        />
        <MetricCard
          title="Taux de Rétention"
          value={metrics.retentionRate}
          previousValue={Math.max(0, metrics.retentionRate - 2)}
          format="percentage"
          icon={<CheckCircle className="w-6 h-6" />}
          color="warning"
        />
      </div>

      {/* Filters and Tabs */}
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
                  placeholder="Rechercher par nom, email, entreprise..."
                  className="input-premium pl-10 w-full"
                />
              </div>
            </div>
            
            <select className="input-premium w-48">
              <option value="all">Tous les rôles</option>
              <option value="admin">Administrateurs</option>
              <option value="entrepreneur">Entrepreneurs</option>
              <option value="client">Clients</option>
            </select>
            
            <select className="input-premium w-48">
              <option value="all">Toutes les entreprises</option>
              <option value="boutique-marie">Boutique Marie</option>
              <option value="techsolutions">TechSolutions</option>
              <option value="pharmacie">Pharmacie Moderne</option>
            </select>
            
            <Button variant="secondary" icon={<Filter className="w-4 h-4" />}>
              Filtres Avancés
            </Button>
          </div>
        </div>

        {/* Users Table */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-2 text-gray-600">Chargement des utilisateurs...</span>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Entreprise
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Dernière Connexion
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {users
                    .filter(user => 
                      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (user.company && user.company.toLowerCase().includes(searchTerm.toLowerCase()))
                    )
                    .map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => setSelectedUser(user)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <img
                          src={user.avatar}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(user.role)}
                        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.company || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(user.status)}
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(user.status)}`}>
                          {user.status === 'active' ? 'Actif' : 
                           user.status === 'suspended' ? 'Suspendu' : 'En attente'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(user.lastLogin).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Eye className="w-3 h-3" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(user);
                          }}
                        >
                          Voir
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Edit className="w-3 h-3" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowUserModal(true);
                          }}
                        >
                          Modifier
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  <img
                    src={selectedUser.avatar}
                    alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </h2>
                    <div className="flex items-center space-x-2 mt-1">
                      {getRoleIcon(selectedUser.role)}
                      <span className="text-gray-600 dark:text-gray-400 capitalize">
                        {selectedUser.role}
                      </span>
                      {selectedUser.company && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {selectedUser.company}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Info */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Contact Info */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Informations de Contact</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{selectedUser.email}</span>
                          {selectedUser.emailVerified && (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{selectedUser.phone}</span>
                          {selectedUser.phoneVerified && (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">
                            Inscrit le {new Date(selectedUser.joinDate).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Activity className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{selectedUser.loginCount} connexions</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    {selectedUser.role === 'entrepreneur' && (
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Statistiques Business</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                            <p className="text-2xl font-bold text-blue-600">{selectedUser.stats.sales}</p>
                            <p className="text-sm text-gray-500">Ventes</p>
                          </div>
                          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                            <p className="text-2xl font-bold text-green-600">
                              {(selectedUser.stats.revenue / 1000000).toFixed(1)}M
                            </p>
                            <p className="text-sm text-gray-500">Revenus XOF</p>
                          </div>
                          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                            <p className="text-2xl font-bold text-purple-600">{selectedUser.stats.customers}</p>
                            <p className="text-sm text-gray-500">Clients</p>
                          </div>
                          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                            <p className="text-2xl font-bold text-orange-600">{selectedUser.stats.products}</p>
                            <p className="text-sm text-gray-500">Produits</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedUser.role === 'client' && (
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Statistiques Client</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                            <p className="text-2xl font-bold text-blue-600">{selectedUser.stats.orders}</p>
                            <p className="text-sm text-gray-500">Commandes</p>
                          </div>
                          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                            <p className="text-2xl font-bold text-green-600">
                              {(selectedUser.stats.spent / 1000).toFixed(0)}K
                            </p>
                            <p className="text-sm text-gray-500">Dépensé XOF</p>
                          </div>
                          <div className="text-center p-4 bg-gold-50 dark:bg-gold-900/20 rounded-xl">
                            <p className="text-2xl font-bold text-gold-600">{selectedUser.stats.loyaltyPoints}</p>
                            <p className="text-sm text-gray-500">Points</p>
                          </div>
                          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                            <p className="text-2xl font-bold text-purple-600">{selectedUser.stats.favoriteStores}</p>
                            <p className="text-sm text-gray-500">Favoris</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Permissions */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Permissions</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.permissions.map((permission) => (
                          <span
                            key={permission}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                          >
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Status */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Statut du Compte</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Statut</span>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(selectedUser.status)}
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(selectedUser.status)}`}>
                              {selectedUser.status === 'active' ? 'Actif' : 'Suspendu'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">2FA</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            selectedUser.mfaEnabled 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {selectedUser.mfaEnabled ? 'Activé' : 'Désactivé'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Niveau</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Niveau {selectedUser.level} ({selectedUser.experiencePoints} XP)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <Button
                        variant="primary"
                        fullWidth
                        icon={<Edit className="w-4 h-4" />}
                        onClick={() => setShowUserModal(true)}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant={selectedUser.status === 'active' ? 'warning' : 'success'}
                        fullWidth
                        icon={selectedUser.status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      >
                        {selectedUser.status === 'active' ? 'Suspendre' : 'Activer'}
                      </Button>
                      <Button
                        variant="secondary"
                        fullWidth
                        icon={<Shield className="w-4 h-4" />}
                      >
                        Réinitialiser MFA
                      </Button>
                      <Button
                        variant="danger"
                        fullWidth
                        icon={<Trash2 className="w-4 h-4" />}
                      >
                        Supprimer
                      </Button>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Activité Récente</h4>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <p className="text-gray-900 dark:text-white">Dernière connexion</p>
                          <p className="text-gray-500">
                            {new Date(selectedUser.lastLogin).toLocaleString('fr-FR')}
                          </p>
                        </div>
                        <div className="text-sm">
                          <p className="text-gray-900 dark:text-white">Nombre de connexions</p>
                          <p className="text-gray-500">{selectedUser.loginCount} fois</p>
                        </div>
                        <div className="text-sm">
                          <p className="text-gray-900 dark:text-white">Membre depuis</p>
                          <p className="text-gray-500">
                            {new Date(selectedUser.joinDate).toLocaleDateString('fr-FR')}
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

export default UsersManagementPage;