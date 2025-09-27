import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Camera,
  Edit,
  Save,
  Shield,
  Bell,
  Palette,
  Globe,
  DollarSign,
  Calendar,
  Award,
  TrendingUp,
  Users,
  Package,
  Star,
  Download
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import AnimatedForm from '../../components/forms/AnimatedForm';
import * as yup from 'yup';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('profile');

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '+221 77 123 45 67',
    companyName: user?.company?.name || '',
    companyAddress: '15 Avenue Bourguiba, Plateau, Dakar',
    companyPhone: '+221 33 821 45 67',
    companyEmail: 'contact@boutiquemarie.sn',
    companyWebsite: 'https://boutiquemarie.sn',
    bio: 'Entrepreneure passionnée par la mode africaine authentique et les produits artisanaux de qualité.',
    language: 'fr',
    currency: 'XOF',
    theme: 'light',
    timezone: 'Africa/Dakar',
    notifications: {
      email: true,
      sms: false,
      push: true,
      marketing: true,
      stockAlerts: true,
      salesNotifications: true,
    },
  });

  const tabs = [
    { id: 'profile', label: 'Profil Personnel', icon: User },
    { id: 'company', label: 'Entreprise', icon: Building2 },
    { id: 'preferences', label: 'Préférences', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
  ];

  const businessStats = {
    totalSales: 2350000,
    totalOrders: 82,
    totalCustomers: 156,
    totalProducts: 234,
    averageOrderValue: 28659,
    conversionRate: 3.2,
    customerSatisfaction: 4.7,
    monthlyGrowth: 22.8,
  };

  const achievements = [
    {
      id: '1',
      name: 'Premier Pas',
      description: 'Première vente réalisée',
      icon: '🎯',
      earned: true,
      date: '2023-06-15',
    },
    {
      id: '2',
      name: 'Vendeur Pro',
      description: '100 ventes réalisées',
      icon: '🏆',
      earned: true,
      date: '2023-09-20',
    },
    {
      id: '3',
      name: 'Client Fidèle',
      description: '50 clients fidélisés',
      icon: '❤️',
      earned: true,
      date: '2023-11-10',
    },
    {
      id: '4',
      name: 'Maître Artisan',
      description: '500 produits artisanaux vendus',
      icon: '🎨',
      earned: false,
      progress: 78,
      target: 100,
    },
  ];

  const profileValidationSchema = yup.object({
    firstName: yup.string().required('Le prénom est requis'),
    lastName: yup.string().required('Le nom est requis'),
    email: yup.string().email('Email invalide').required('L\'email est requis'),
    phone: yup.string().required('Le téléphone est requis'),
  });

  const profileFormFields = [
    {
      name: 'firstName',
      label: 'Prénom',
      type: 'text' as const,
      placeholder: 'Votre prénom',
      icon: <User className="w-4 h-4" />,
    },
    {
      name: 'lastName',
      label: 'Nom',
      type: 'text' as const,
      placeholder: 'Votre nom',
      icon: <User className="w-4 h-4" />,
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email' as const,
      placeholder: 'votre@email.sn',
      icon: <Mail className="w-4 h-4" />,
    },
    {
      name: 'phone',
      label: 'Téléphone',
      type: 'text' as const,
      placeholder: '+221 77 123 45 67',
      icon: <Phone className="w-4 h-4" />,
    },
    {
      name: 'bio',
      label: 'Biographie',
      type: 'textarea' as const,
      placeholder: 'Parlez-nous de vous...',
      rows: 4,
    },
  ];

  const handleSave = async (data: any) => {
    console.log('Mise à jour profil:', data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    updateUser({
      firstName: data.firstName,
      lastName: data.lastName,
      preferences: {
        ...user?.preferences,
        language: data.language,
        currency: data.currency,
        theme: data.theme as 'light' | 'dark',
      },
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Mon Profil</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez vos informations personnelles et d'entreprise
          </p>
        </div>
        
        <Button
          variant={isEditing ? 'success' : 'primary'}
          icon={isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Enregistrer' : 'Modifier'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Profile Card */}
          <div className="card-premium p-6 mb-6">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <img
                  src={user?.avatar || 'https://images.pexels.com/photos/3992656/pexels-photo-3992656.png?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2'}
                  alt={user?.firstName}
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary-500"
                />
                {isEditing && (
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Entrepreneur • {user?.company?.name}
              </p>
              
              {/* Level & XP */}
              <div className="bg-gradient-to-r from-primary-500 to-electric-500 rounded-xl p-4 text-white mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Niveau 3</span>
                  <Award className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">2,500 XP</span>
                  <span className="text-xs opacity-90">500 pour Niveau 4</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                  <div className="bg-white h-2 rounded-full" style={{ width: '83%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="card-premium p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`
                      w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-colors
                      ${selectedTab === tab.id
                        ? 'bg-primary-500 text-white shadow-lg'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="card-premium p-6">
            {selectedTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {isEditing ? (
                  <AnimatedForm
                    title="Modifier le Profil"
                    fields={profileFormFields}
                    validationSchema={profileValidationSchema}
                    defaultValues={formData}
                    onSubmit={handleSave}
                    columns={2}
                    submitLabel="Enregistrer les Modifications"
                  />
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Informations Personnelles
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-gray-600 dark:text-gray-400">Prénom</label>
                          <p className="font-medium text-gray-900 dark:text-white">{formData.firstName}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 dark:text-gray-400">Email</label>
                          <p className="font-medium text-gray-900 dark:text-white">{formData.email}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 dark:text-gray-400">Biographie</label>
                          <p className="text-gray-700 dark:text-gray-300">{formData.bio}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-gray-600 dark:text-gray-400">Nom</label>
                          <p className="font-medium text-gray-900 dark:text-white">{formData.lastName}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 dark:text-gray-400">Téléphone</label>
                          <p className="font-medium text-gray-900 dark:text-white">{formData.phone}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {selectedTab === 'company' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Informations Entreprise
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400">Nom de l'Entreprise</label>
                      <p className="font-medium text-gray-900 dark:text-white">{formData.companyName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400">Email Entreprise</label>
                      <p className="font-medium text-gray-900 dark:text-white">{formData.companyEmail}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400">Site Web</label>
                      <p className="font-medium text-primary-600">{formData.companyWebsite}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400">Adresse</label>
                      <p className="font-medium text-gray-900 dark:text-white">{formData.companyAddress}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400">Téléphone</label>
                      <p className="font-medium text-gray-900 dark:text-white">{formData.companyPhone}</p>
                    </div>
                  </div>
                </div>

                {/* Company Stats */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Statistiques Entreprise
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <DollarSign className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-600">
                        {(businessStats.totalSales / 1000000).toFixed(1)}M
                      </p>
                      <p className="text-sm text-gray-500">Ventes Totales</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                      <ShoppingCart className="w-6 h-6 text-green-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-600">{businessStats.totalOrders}</p>
                      <p className="text-sm text-gray-500">Commandes</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                      <Users className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-purple-600">{businessStats.totalCustomers}</p>
                      <p className="text-sm text-gray-500">Clients</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                      <Package className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-orange-600">{businessStats.totalProducts}</p>
                      <p className="text-sm text-gray-500">Produits</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {selectedTab === 'performance' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Performance & Réalisations
                </h3>

                {/* KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white">
                    <TrendingUp className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-xl font-bold">{businessStats.monthlyGrowth}%</p>
                    <p className="text-sm opacity-90">Croissance</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white">
                    <DollarSign className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-xl font-bold">{(businessStats.averageOrderValue / 1000).toFixed(0)}K</p>
                    <p className="text-sm opacity-90">Panier Moyen</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white">
                    <Star className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-xl font-bold">{businessStats.customerSatisfaction}</p>
                    <p className="text-sm opacity-90">Satisfaction</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-white">
                    <Target className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-xl font-bold">{businessStats.conversionRate}%</p>
                    <p className="text-sm opacity-90">Conversion</p>
                  </div>
                </div>

                {/* Achievements */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Badges & Réalisations
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-xl border-2 ${
                          achievement.earned
                            ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                            : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                            achievement.earned 
                              ? 'bg-green-100 dark:bg-green-900' 
                              : 'bg-gray-100 dark:bg-gray-600'
                          }`}>
                            {achievement.icon}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900 dark:text-white">
                              {achievement.name}
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {achievement.description}
                            </p>
                            {achievement.earned ? (
                              <p className="text-xs text-green-600 mt-1">
                                Obtenu le {new Date(achievement.date).toLocaleDateString('fr-FR')}
                              </p>
                            ) : (
                              <div className="mt-2">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Progression</span>
                                  <span>{achievement.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                  <div 
                                    className="bg-primary-500 h-2 rounded-full"
                                    style={{ width: `${achievement.progress}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {selectedTab === 'preferences' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Préférences
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Langue
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                      disabled={!isEditing}
                      className="input-premium w-full"
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                      <option value="ar">العربية</option>
                      <option value="wo">Wolof</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Devise
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                      disabled={!isEditing}
                      className="input-premium w-full"
                    >
                      <option value="XOF">Franc CFA (XOF)</option>
                      <option value="EUR">Euro (EUR)</option>
                      <option value="USD">Dollar US (USD)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fuseau Horaire
                    </label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                      disabled={!isEditing}
                      className="input-premium w-full"
                    >
                      <option value="Africa/Dakar">Dakar (GMT+0)</option>
                      <option value="Africa/Casablanca">Casablanca (GMT+1)</option>
                      <option value="Europe/Paris">Paris (GMT+1)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Thème
                    </label>
                    <select
                      value={formData.theme}
                      onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                      disabled={!isEditing}
                      className="input-premium w-full"
                    >
                      <option value="light">Clair</option>
                      <option value="dark">Sombre</option>
                      <option value="auto">Automatique</option>
                    </select>
                  </div>
                </div>

                {/* Notifications */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Préférences de Notifications
                  </h4>
                  <div className="space-y-3">
                    {[
                      { key: 'email', label: 'Notifications par Email', icon: Mail },
                      { key: 'sms', label: 'Notifications par SMS', icon: Phone },
                      { key: 'push', label: 'Notifications Push', icon: Bell },
                      { key: 'stockAlerts', label: 'Alertes de Stock', icon: Package },
                      { key: 'salesNotifications', label: 'Notifications de Ventes', icon: ShoppingCart },
                      { key: 'marketing', label: 'Communications Marketing', icon: Star },
                    ].map((notif) => {
                      const IconComponent = notif.icon;
                      return (
                        <label key={notif.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                          <div className="flex items-center space-x-3">
                            <IconComponent className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {notif.label}
                            </span>
                          </div>
                          <input
                            type="checkbox"
                            checked={formData.notifications[notif.key as keyof typeof formData.notifications]}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              notifications: {
                                ...prev.notifications,
                                [notif.key]: e.target.checked,
                              }
                            }))}
                            disabled={!isEditing}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {selectedTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Sécurité du Compte
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Authentification à Deux Facteurs
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Sécurisez votre compte avec la 2FA
                      </p>
                    </div>
                    <Button variant="primary" size="sm">
                      Activer 2FA
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Changer le Mot de Passe
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Dernière modification il y a 3 mois
                      </p>
                    </div>
                    <Button variant="secondary" size="sm">
                      Modifier
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Sessions Actives
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Gérez vos sessions de connexion
                      </p>
                    </div>
                    <Button variant="secondary" size="sm">
                      Voir Sessions
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Sauvegarde des Données
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Exportez vos données business
                      </p>
                    </div>
                    <Button variant="secondary" size="sm" icon={<Download className="w-3 h-3" />}>
                      Exporter
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;