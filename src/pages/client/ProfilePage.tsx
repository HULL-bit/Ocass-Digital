import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera,
  Edit,
  Save,
  Shield,
  Bell,
  Heart,
  Gift,
  Star,
  Award,
  Calendar,
  CreditCard,
  Truck,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Download
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('profile');
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '+221 77 345 67 89',
    dateOfBirth: '1990-05-15',
    address: '25 Rue de la Paix, Médina, Dakar',
    bio: 'Passionné de technologie et amateur de mode africaine authentique.',
    language: 'fr',
    currency: 'XOF',
    theme: 'light',
    notifications: {
      email: true,
      sms: false,
      push: true,
      marketing: false,
      orderUpdates: true,
      promotions: true,
    },
  });

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'addresses', label: 'Adresses', icon: MapPin },
    { id: 'preferences', label: 'Préférences', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'loyalty', label: 'Fidélité', icon: Gift },
  ];

  const addresses = [
    {
      id: '1',
      name: 'Domicile',
      address: '25 Rue de la Paix, Médina, Dakar',
      phone: '+221 77 345 67 89',
      isDefault: true,
      type: 'home',
    },
    {
      id: '2',
      name: 'Bureau',
      address: '15 Avenue Bourguiba, Plateau, Dakar',
      phone: '+221 77 345 67 89',
      isDefault: false,
      type: 'work',
    },
  ];

  const loyaltyHistory = [
    {
      id: '1',
      type: 'earned',
      points: 125,
      description: 'Achat iPhone 15 Pro',
      date: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      type: 'redeemed',
      points: -50,
      description: 'Réduction sur commande',
      date: '2024-01-10T14:20:00Z',
    },
    {
      id: '3',
      type: 'earned',
      points: 35,
      description: 'Avis produit publié',
      date: '2024-01-08T16:45:00Z',
    },
  ];

  const favoriteStores = [
    {
      id: '1',
      name: 'TechSolutions Sénégal',
      logo: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      rating: 4.9,
      orders: 12,
      totalSpent: 2450000,
    },
    {
      id: '2',
      name: 'Boutique Marie Diallo',
      logo: 'https://images.pexels.com/photos/4386476/pexels-photo-4386476.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      rating: 4.7,
      orders: 8,
      totalSpent: 890000,
    },
  ];

  const handleSave = () => {
    updateUser({
      firstName: formData.firstName,
      lastName: formData.lastName,
      preferences: {
        ...user?.preferences,
        language: formData.language,
        currency: formData.currency,
        theme: formData.theme as 'light' | 'dark',
        notifications: formData.notifications.email,
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
            Gérez vos informations personnelles et préférences
          </p>
        </div>
        
        <Button
          variant={isEditing ? 'success' : 'primary'}
          icon={isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
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
                  src={user?.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2'}
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
                Client Premium
              </p>
              
              {/* Loyalty Level */}
              <div className="bg-gradient-to-r from-gold-500 to-amber-500 rounded-xl p-4 text-white mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Niveau Or</span>
                  <Gift className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">1,250 points</span>
                  <span className="text-xs opacity-90">750 pour Platine</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                  <div className="bg-white h-2 rounded-full" style={{ width: '62%' }} />
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Informations Personnelles
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      disabled={!isEditing}
                      className="input-premium w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      disabled={!isEditing}
                      className="input-premium w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                        className="input-premium pl-10 w-full"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Téléphone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                        className="input-premium pl-10 w-full"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date de Naissance
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        disabled={!isEditing}
                        className="input-premium pl-10 w-full"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Adresse Principale
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        disabled={!isEditing}
                        className="input-premium pl-10 w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Purchase Statistics */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Statistiques d'Achat
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <CreditCard className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-600">23</p>
                      <p className="text-sm text-gray-500">Commandes</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                      <Gift className="w-6 h-6 text-green-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-600">450K</p>
                      <p className="text-sm text-gray-500">Total Dépensé</p>
                    </div>
                    <div className="text-center p-4 bg-gold-50 dark:bg-gold-900/20 rounded-xl">
                      <Star className="w-6 h-6 text-gold-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gold-600">1,250</p>
                      <p className="text-sm text-gray-500">Points Fidélité</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                      <Heart className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-purple-600">7</p>
                      <p className="text-sm text-gray-500">Favoris</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {selectedTab === 'addresses' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Mes Adresses
                  </h3>
                  <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
                    Nouvelle Adresse
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {address.name}
                              </h4>
                              {address.isDefault && (
                                <span className="bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 text-xs px-2 py-1 rounded-full">
                                  Par défaut
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {address.address}
                            </p>
                            <p className="text-sm text-gray-500">
                              {address.phone}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button variant="secondary" size="sm" icon={<Edit className="w-3 h-3" />}>
                            Modifier
                          </Button>
                          {!address.isDefault && (
                            <Button variant="secondary" size="sm" icon={<Trash2 className="w-3 h-3" />}>
                              Supprimer
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
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
                      { key: 'orderUpdates', label: 'Mises à jour Commandes', icon: Truck },
                      { key: 'promotions', label: 'Offres Promotionnelles', icon: Gift },
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

            {selectedTab === 'loyalty' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Programme de Fidélité
                  </h3>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Points Disponibles</p>
                    <p className="text-2xl font-bold text-gold-600">1,250</p>
                  </div>
                </div>
                
                {/* Loyalty Progress */}
                <div className="bg-gradient-to-r from-gold-500 to-amber-500 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-bold">Niveau Or</h4>
                      <p className="text-sm opacity-90">Membre depuis juin 2023</p>
                    </div>
                    <Award className="w-12 h-12 opacity-80" />
                  </div>
                  
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progression vers Platine</span>
                      <span>1,250 / 2,000 points</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3">
                      <div className="bg-white h-3 rounded-full" style={{ width: '62%' }} />
                    </div>
                  </div>
                  
                  <p className="text-sm opacity-90">
                    Plus que 750 points pour atteindre le niveau Platine !
                  </p>
                </div>

                {/* Points History */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Historique des Points
                  </h4>
                  <div className="space-y-3">
                    {loyaltyHistory.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            transaction.type === 'earned' 
                              ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                              : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                          }`}>
                            {transaction.type === 'earned' ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {transaction.description}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(transaction.date).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <span className={`font-bold ${
                          transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.points > 0 ? '+' : ''}{transaction.points}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Favorite Stores */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Boutiques Favorites
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {favoriteStores.map((store) => (
                      <div
                        key={store.id}
                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <img
                            src={store.logo}
                            alt={store.name}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white">
                              {store.name}
                            </h5>
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-500">{store.rating}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-sm text-gray-500">Commandes</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{store.orders}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Dépensé</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {(store.totalSpent / 1000).toFixed(0)}K XOF
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
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
                        Dernière modification il y a 2 mois
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
                        Données Personnelles
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Télécharger ou supprimer vos données
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="secondary" size="sm" icon={<Download className="w-3 h-3" />}>
                        Exporter
                      </Button>
                    </div>
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