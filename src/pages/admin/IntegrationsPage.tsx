import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Plus, 
  Search, 
  Filter, 
  Settings, 
  Play, 
  Pause, 
  Trash2,
  CheckCircle,
  AlertTriangle,
  Clock,
  Activity,
  Globe,
  Smartphone,
  Mail,
  MessageSquare,
  CreditCard,
  BarChart3,
  X,
  Eye,
  RefreshCw,
  Download
} from 'lucide-react';
import Button from '../../components/ui/Button';
import MetricCard from '../../components/ui/MetricCard';

const IntegrationsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('active');
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Données réelles des intégrations (remplacées par l'API)
  const [integrations, setIntegrations] = useState([
    {
      id: '1',
      name: 'Wave Money',
      type: 'payment',
      description: 'Intégration paiements mobiles Wave Money',
      status: 'active',
      icon: '📱',
      color: 'from-blue-500 to-cyan-500',
      lastSync: '2024-01-15T10:30:00Z',
      syncFrequency: 'Temps réel',
      errorCount: 0,
      successRate: 99.8,
      totalCalls: 2456,
      avgResponseTime: 245,
      config: {
        apiKey: 'wave_***********',
        webhookUrl: 'https://api.platform.com/webhooks/wave',
        environment: 'production',
        autoRetry: true,
        timeout: 30,
      },
      logs: [
        { timestamp: '2024-01-15T10:30:00Z', action: 'Payment processed', status: 'success', amount: '75000 XOF' },
        { timestamp: '2024-01-15T10:25:00Z', action: 'Webhook received', status: 'success', data: 'Payment confirmation' },
        { timestamp: '2024-01-15T10:20:00Z', action: 'API call', status: 'success', endpoint: '/payments/initiate' },
      ],
    },
    {
      id: '2',
      name: 'Orange Money',
      type: 'payment',
      description: 'Intégration paiements Orange Money',
      status: 'active',
      icon: '🟠',
      color: 'from-orange-500 to-red-500',
      lastSync: '2024-01-15T10:25:00Z',
      syncFrequency: 'Temps réel',
      errorCount: 2,
      successRate: 98.9,
      totalCalls: 1834,
      avgResponseTime: 312,
      config: {
        merchantId: 'OM_***********',
        apiKey: 'orange_***********',
        environment: 'production',
        autoRetry: true,
        timeout: 45,
      },
      logs: [
        { timestamp: '2024-01-15T10:25:00Z', action: 'Payment failed', status: 'error', error: 'Insufficient funds' },
        { timestamp: '2024-01-15T10:20:00Z', action: 'Payment processed', status: 'success', amount: '125000 XOF' },
      ],
    },
    {
      id: '3',
      name: 'WhatsApp Business',
      type: 'communication',
      description: 'Notifications et support client via WhatsApp',
      status: 'warning',
      icon: '💬',
      color: 'from-green-500 to-emerald-500',
      lastSync: '2024-01-15T09:45:00Z',
      syncFrequency: 'Manuel',
      errorCount: 5,
      successRate: 95.2,
      totalCalls: 892,
      avgResponseTime: 1200,
      config: {
        phoneNumber: '+221 77 123 45 67',
        accessToken: 'whatsapp_***********',
        webhookSecret: 'webhook_***********',
        messageTemplate: 'Votre commande #{order_id} a été confirmée',
      },
      logs: [
        { timestamp: '2024-01-15T09:45:00Z', action: 'Message sent', status: 'warning', message: 'Rate limit reached' },
        { timestamp: '2024-01-15T09:40:00Z', action: 'Template approved', status: 'success', template: 'order_confirmation' },
      ],
    },
    {
      id: '4',
      name: 'Google Analytics',
      type: 'analytics',
      description: 'Suivi et analyse du trafic web',
      status: 'inactive',
      icon: '📊',
      color: 'from-purple-500 to-pink-500',
      lastSync: '2024-01-10T14:20:00Z',
      syncFrequency: 'Quotidien',
      errorCount: 0,
      successRate: 100,
      totalCalls: 156,
      avgResponseTime: 890,
      config: {
        trackingId: 'GA_***********',
        propertyId: 'GA4_***********',
        dataRetention: '26 months',
        enhancedEcommerce: true,
      },
      logs: [
        { timestamp: '2024-01-10T14:20:00Z', action: 'Data sync', status: 'success', records: '1,234 events' },
      ],
    },
  ]);

  const availableIntegrations = [
    {
      name: 'Stripe',
      type: 'payment',
      description: 'Paiements par carte bancaire internationaux',
      icon: '💳',
      popular: true,
      features: ['Cartes internationales', 'Abonnements', 'Marketplace', 'Fraud protection'],
    },
    {
      name: 'Twilio',
      type: 'communication',
      description: 'SMS et appels téléphoniques',
      icon: '📞',
      popular: false,
      features: ['SMS globaux', 'Appels vocaux', 'Vérification 2FA', 'Chat programmable'],
    },
    {
      name: 'Facebook Pixel',
      type: 'analytics',
      description: 'Suivi des conversions Facebook',
      icon: '📘',
      popular: true,
      features: ['Tracking conversions', 'Audiences personnalisées', 'Optimisation pub', 'Retargeting'],
    },
    {
      name: 'Slack',
      type: 'communication',
      description: 'Notifications équipe via Slack',
      icon: '💬',
      popular: false,
      features: ['Notifications temps réel', 'Channels personnalisés', 'Bots', 'Workflows'],
    },
    {
      name: 'Zapier',
      type: 'automation',
      description: 'Automatisation entre applications',
      icon: '⚡',
      popular: true,
      features: ['5000+ apps', 'Workflows automatiques', 'Triggers avancés', 'Multi-étapes'],
    },
    {
      name: 'Shopify',
      type: 'ecommerce',
      description: 'Synchronisation boutique en ligne',
      icon: '🛒',
      popular: true,
      features: ['Sync produits', 'Gestion commandes', 'Inventaire temps réel', 'Multi-canal'],
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const tabs = [
    { id: 'active', label: 'Actives', count: integrations.filter(i => i.status === 'active').length },
    { id: 'available', label: 'Disponibles', count: availableIntegrations.length },
    { id: 'logs', label: 'Logs', count: 156 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Intégrations</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez les intégrations avec les services externes
          </p>
        </div>
        
        <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
          Nouvelle Intégration
        </Button>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Intégrations Actives"
          value={integrations.filter(i => i.status === 'active').length}
          format="number"
          icon={<Zap className="w-6 h-6" />}
          color="success"
        />
        <MetricCard
          title="Taux de Succès Moyen"
          value={97.8}
          format="percentage"
          icon={<CheckCircle className="w-6 h-6" />}
          color="primary"
        />
        <MetricCard
          title="Appels API Aujourd'hui"
          value={5672}
          format="number"
          icon={<Activity className="w-6 h-6" />}
          color="info"
        />
        <MetricCard
          title="Temps de Réponse Moyen"
          value={687}
          format="number"
          icon={<Clock className="w-6 h-6" />}
          color="warning"
        />
      </div>

      {/* Tabs */}
      <div className="card-premium">
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

        <div className="p-6">
          <AnimatePresence mode="wait">
            {selectedTab === 'active' && (
              <motion.div
                key="active"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Active Integrations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {integrations.map((integration, index) => (
                    <motion.div
                      key={integration.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                      onClick={() => setSelectedIntegration(integration)}
                    >
                      {/* Header */}
                      <div className={`h-2 bg-gradient-to-r ${integration.color}`} />
                      
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${integration.color} flex items-center justify-center text-white text-xl`}>
                              {integration.icon}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {integration.name}
                              </h3>
                              <p className="text-sm text-gray-500 capitalize">
                                {integration.type}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(integration.status)}
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(integration.status)}`}>
                              {integration.status === 'active' ? 'Actif' : 
                               integration.status === 'warning' ? 'Attention' : 
                               integration.status === 'error' ? 'Erreur' : 'Inactif'}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                          {integration.description}
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {integration.successRate}%
                            </p>
                            <p className="text-xs text-gray-500">Succès</p>
                          </div>
                          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {integration.avgResponseTime}ms
                            </p>
                            <p className="text-xs text-gray-500">Réponse</p>
                          </div>
                        </div>

                        {/* Last Sync */}
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                          <span>Dernière sync: {new Date(integration.lastSync).toLocaleString('fr-FR')}</span>
                          <span>{integration.totalCalls} appels</span>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={<Settings className="w-4 h-4" />}
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowConfigModal(true);
                            }}
                          >
                            Config
                          </Button>
                          <Button
                            variant={integration.status === 'active' ? 'warning' : 'success'}
                            size="sm"
                            icon={integration.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Toggle integration
                            }}
                          >
                            {integration.status === 'active' ? 'Pause' : 'Activer'}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {selectedTab === 'available' && (
              <motion.div
                key="available"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une intégration disponible..."
                    className="input-premium pl-10 w-full"
                  />
                </div>

                {/* Available Integrations */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableIntegrations.map((integration, index) => (
                    <motion.div
                      key={integration.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl">
                              {integration.icon}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {integration.name}
                              </h3>
                              <p className="text-sm text-gray-500 capitalize">
                                {integration.type}
                              </p>
                            </div>
                          </div>
                          
                          {integration.popular && (
                            <span className="bg-gold-100 text-gold-800 dark:bg-gold-900 dark:text-gold-200 text-xs px-2 py-1 rounded-full font-medium">
                              Populaire
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                          {integration.description}
                        </p>

                        {/* Features */}
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Fonctionnalités
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {integration.features.slice(0, 3).map((feature) => (
                              <span
                                key={feature}
                                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full"
                              >
                                {feature}
                              </span>
                            ))}
                            {integration.features.length > 3 && (
                              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                                +{integration.features.length - 3}
                              </span>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="primary"
                          size="sm"
                          fullWidth
                          icon={<Plus className="w-4 h-4" />}
                        >
                          Installer
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {selectedTab === 'logs' && (
              <motion.div
                key="logs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Logs Filters */}
                <div className="flex items-center space-x-4">
                  <select className="input-premium">
                    <option value="all">Toutes les intégrations</option>
                    {integrations.map((integration) => (
                      <option key={integration.id} value={integration.id}>
                        {integration.name}
                      </option>
                    ))}
                  </select>
                  
                  <select className="input-premium">
                    <option value="all">Tous les statuts</option>
                    <option value="success">Succès</option>
                    <option value="error">Erreurs</option>
                    <option value="warning">Avertissements</option>
                  </select>
                  
                  <Button variant="secondary" icon={<Download className="w-4 h-4" />}>
                    Exporter
                  </Button>
                </div>

                {/* Logs Table */}
                <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Timestamp
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Intégration
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Action
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Détails
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {integrations.flatMap(integration => 
                          integration.logs.map((log, logIndex) => (
                            <tr key={`${integration.id}-${logIndex}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                {new Date(log.timestamp).toLocaleString('fr-FR')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  <span className="text-lg">{integration.icon}</span>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {integration.name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                {log.action}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  log.status === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                  log.status === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}>
                                  {log.status === 'success' ? 'Succès' : 
                                   log.status === 'warning' ? 'Attention' : 'Erreur'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                {log.amount || log.message || log.data || log.error || log.records || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <Button variant="secondary" size="sm" icon={<Eye className="w-3 h-3" />}>
                                  Détails
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {selectedTab === 'available' && (
              <motion.div
                key="available"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une intégration disponible..."
                    className="input-premium pl-10 w-full"
                  />
                </div>

                {/* Available Integrations */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableIntegrations.map((integration, index) => (
                    <motion.div
                      key={integration.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl">
                              {integration.icon}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {integration.name}
                              </h3>
                              <p className="text-sm text-gray-500 capitalize">
                                {integration.type}
                              </p>
                            </div>
                          </div>
                          
                          {integration.popular && (
                            <span className="bg-gold-100 text-gold-800 dark:bg-gold-900 dark:text-gold-200 text-xs px-2 py-1 rounded-full font-medium">
                              Populaire
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                          {integration.description}
                        </p>

                        {/* Features */}
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Fonctionnalités
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {integration.features.slice(0, 3).map((feature) => (
                              <span
                                key={feature}
                                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full"
                              >
                                {feature}
                              </span>
                            ))}
                            {integration.features.length > 3 && (
                              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                                +{integration.features.length - 3}
                              </span>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="primary"
                          size="sm"
                          fullWidth
                          icon={<Plus className="w-4 h-4" />}
                        >
                          Installer
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Integration Detail Modal */}
      <AnimatePresence>
        {selectedIntegration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={() => setSelectedIntegration(null)}
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
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${selectedIntegration.color} flex items-center justify-center text-white text-2xl`}>
                    {selectedIntegration.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedIntegration.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedIntegration.description}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedIntegration(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Performance Metrics */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Métriques de Performance
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                          <p className="text-2xl font-bold text-green-600">{selectedIntegration.successRate}%</p>
                          <p className="text-sm text-gray-500">Taux de Succès</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                          <p className="text-2xl font-bold text-blue-600">{selectedIntegration.totalCalls}</p>
                          <p className="text-sm text-gray-500">Total Appels</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                          <p className="text-2xl font-bold text-purple-600">{selectedIntegration.avgResponseTime}ms</p>
                          <p className="text-sm text-gray-500">Temps Réponse</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                          <p className="text-2xl font-bold text-red-600">{selectedIntegration.errorCount}</p>
                          <p className="text-sm text-gray-500">Erreurs</p>
                        </div>
                      </div>
                    </div>

                    {/* Recent Logs */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Logs Récents
                      </h3>
                      <div className="space-y-3">
                        {selectedIntegration.logs.map((log: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                          >
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(log.status)}
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                  {log.action}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(log.timestamp).toLocaleString('fr-FR')}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-900 dark:text-white">
                                {log.amount || log.message || log.data || log.error || log.records || '-'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Status */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Statut</h4>
                      <div className="flex items-center space-x-2 mb-3">
                        {getStatusIcon(selectedIntegration.status)}
                        <span className={`text-sm px-2 py-1 rounded-full ${getStatusColor(selectedIntegration.status)}`}>
                          {selectedIntegration.status === 'active' ? 'Actif' : 
                           selectedIntegration.status === 'warning' ? 'Attention' : 
                           selectedIntegration.status === 'error' ? 'Erreur' : 'Inactif'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Dernière sync: {new Date(selectedIntegration.lastSync).toLocaleString('fr-FR')}
                      </p>
                    </div>

                    {/* Configuration */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Configuration</h4>
                      <div className="space-y-2">
                        {Object.entries(selectedIntegration.config).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {typeof value === 'boolean' ? (value ? 'Oui' : 'Non') : value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <Button
                        variant="primary"
                        fullWidth
                        icon={<Settings className="w-4 h-4" />}
                        onClick={() => setShowConfigModal(true)}
                      >
                        Configurer
                      </Button>
                      <Button
                        variant="secondary"
                        fullWidth
                        icon={<RefreshCw className="w-4 h-4" />}
                      >
                        Synchroniser
                      </Button>
                      <Button
                        variant={selectedIntegration.status === 'active' ? 'warning' : 'success'}
                        fullWidth
                        icon={selectedIntegration.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      >
                        {selectedIntegration.status === 'active' ? 'Désactiver' : 'Activer'}
                      </Button>
                      <Button
                        variant="danger"
                        fullWidth
                        icon={<Trash2 className="w-4 h-4" />}
                      >
                        Supprimer
                      </Button>
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

export default IntegrationsPage;