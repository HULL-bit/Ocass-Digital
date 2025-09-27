import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Lock,
  Key,
  Users,
  Activity,
  Globe,
  Server,
  Database,
  Wifi,
  FileText,
  Clock,
  Ban,
  Unlock,
  Search,
  Filter,
  Download,
  RefreshCw,
  X,
  Zap,
  Bug
} from 'lucide-react';
import Button from '../../components/ui/Button';
import MetricCard from '../../components/ui/MetricCard';
import apiService from '../../services/api/realApi';

const SecurityPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [securityMetrics, setSecurityMetrics] = useState({
    totalAlerts: 0,
    criticalAlerts: 0,
    resolvedAlerts: 0,
    activeUsers: 0,
    blockedIPs: 0,
    securityScore: 0
  });
  const [loading, setLoading] = useState(true);

  // Charger les données de sécurité
  React.useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      console.log('Chargement des données de sécurité...');
      
      // Récupérer les données des utilisateurs pour analyser la sécurité
      const usersResponse = await apiService.getUsers();
      const companiesResponse = await apiService.getCompanies();
      
      console.log('Données de sécurité récupérées:', {
        users: usersResponse.results?.length || 0,
        companies: companiesResponse.results?.length || 0
      });
      
      // Analyser les données pour détecter des problèmes de sécurité
      const totalUsers = usersResponse.results?.length || 0;
      const totalCompanies = companiesResponse.results?.length || 0;
      
      // Simuler des alertes de sécurité basées sur les vraies données
      const totalAlerts = Math.floor(totalUsers * 0.1) + Math.floor(totalCompanies * 0.05);
      const criticalAlerts = Math.floor(totalAlerts * 0.2);
      const resolvedAlerts = Math.floor(totalAlerts * 0.6);
      const activeUsers = Math.floor(totalUsers * 0.7);
      const blockedIPs = Math.floor(totalUsers * 0.02);
      
      // Calculer le score de sécurité
      const securityScore = Math.max(0, Math.min(100, 
        100 - (totalAlerts * 2) - (criticalAlerts * 5) - (blockedIPs * 3)
      ));
      
      setSecurityMetrics({
        totalAlerts,
        criticalAlerts,
        resolvedAlerts,
        activeUsers,
        blockedIPs,
        securityScore
      });
      
      // Synchroniser les données de sécurité pour assurer la cohérence
      console.log('Synchronisation des données de sécurité:', {
        totalUsers,
        totalCompanies,
        totalAlerts,
        criticalAlerts,
        securityScore
      });
      
    } catch (error) {
      console.error('Erreur lors du chargement des données de sécurité:', error);
    } finally {
      setLoading(false);
    }
  };

  const securityAlerts = [
    {
      id: '1',
      type: 'critical',
      title: 'Tentatives de connexion suspectes',
      description: '15 tentatives de connexion échouées depuis la même IP en 5 minutes',
      timestamp: '2024-01-15T10:25:00Z',
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'Dakar, Sénégal',
      resolved: false,
      severity: 'high',
      category: 'authentication',
      affectedUser: 'marie@boutiquemarie.sn',
      actions: ['Bloquer IP', 'Notifier utilisateur', 'Audit logs'],
    },
    {
      id: '2',
      type: 'warning',
      title: 'Accès API inhabituel',
      description: 'Pic d\'activité API détecté - 500% au-dessus de la normale',
      timestamp: '2024-01-15T09:45:00Z',
      ip: '10.0.0.25',
      endpoint: '/api/v1/products/products/',
      requestCount: 2500,
      resolved: false,
      severity: 'medium',
      category: 'api',
      actions: ['Analyser trafic', 'Vérifier rate limiting'],
    },
    {
      id: '3',
      type: 'info',
      title: 'Mise à jour sécurité disponible',
      description: 'Django 4.2.8 disponible avec correctifs de sécurité',
      timestamp: '2024-01-15T08:00:00Z',
      resolved: false,
      severity: 'low',
      category: 'system',
      updateVersion: 'Django 4.2.8',
      securityFixes: ['CVE-2024-1234', 'CVE-2024-5678'],
      actions: ['Planifier mise à jour', 'Tester en staging'],
    },
    {
      id: '4',
      type: 'success',
      title: 'Scan sécurité terminé',
      description: 'Scan de vulnérabilités terminé - Aucune faille critique détectée',
      timestamp: '2024-01-15T06:00:00Z',
      resolved: true,
      severity: 'info',
      category: 'scan',
      vulnerabilities: {
        critical: 0,
        high: 0,
        medium: 2,
        low: 5,
      },
      actions: ['Voir rapport détaillé'],
    },
  ];

  const activeUsers = [
    {
      id: '1',
      name: 'Marie Diallo',
      email: 'marie@boutiquemarie.sn',
      role: 'entrepreneur',
      ip: '192.168.1.50',
      location: 'Dakar, Sénégal',
      device: 'Chrome on Windows',
      loginTime: '2024-01-15T08:30:00Z',
      lastActivity: '2024-01-15T10:30:00Z',
      mfaEnabled: true,
      suspicious: false,
    },
    {
      id: '2',
      name: 'Amadou Ba',
      email: 'amadou@techsolutions.sn',
      role: 'entrepreneur',
      ip: '10.0.0.15',
      location: 'Dakar, Sénégal',
      device: 'Safari on macOS',
      loginTime: '2024-01-15T07:45:00Z',
      lastActivity: '2024-01-15T10:28:00Z',
      mfaEnabled: true,
      suspicious: false,
    },
    {
      id: '3',
      name: 'Utilisateur Inconnu',
      email: 'unknown@suspicious.com',
      role: 'unknown',
      ip: '192.168.1.100',
      location: 'Localisation inconnue',
      device: 'Bot/Crawler',
      loginTime: '2024-01-15T10:25:00Z',
      lastActivity: '2024-01-15T10:25:00Z',
      mfaEnabled: false,
      suspicious: true,
    },
  ];

  const auditLogs = [
    {
      id: '1',
      timestamp: '2024-01-15T10:30:00Z',
      user: 'marie@boutiquemarie.sn',
      action: 'CREATE',
      resource: 'Product',
      ip: '192.168.1.50',
      userAgent: 'Chrome/120.0.0.0',
      details: 'Création produit "Boubou Élégant"',
      riskLevel: 'low',
    },
    {
      id: '2',
      timestamp: '2024-01-15T10:25:00Z',
      user: 'unknown@suspicious.com',
      action: 'LOGIN_FAILED',
      resource: 'Authentication',
      ip: '192.168.1.100',
      userAgent: 'Bot/1.0',
      details: 'Tentative de connexion échouée',
      riskLevel: 'high',
    },
    {
      id: '3',
      timestamp: '2024-01-15T10:20:00Z',
      user: 'amadou@techsolutions.sn',
      action: 'UPDATE',
      resource: 'Company',
      ip: '10.0.0.15',
      userAgent: 'Safari/17.0',
      details: 'Modification informations entreprise',
      riskLevel: 'medium',
    },
  ];

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'alerts', label: 'Alertes', count: securityAlerts.filter(a => !a.resolved).length },
    { id: 'users', label: 'Sessions Actives', count: activeUsers.length },
    { id: 'logs', label: 'Logs d\'Audit', count: auditLogs.length },
    { id: 'settings', label: 'Paramètres' },
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Shield className="w-4 h-4 text-blue-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Centre de Sécurité</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Surveillance et protection avancée de la plateforme
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="secondary" icon={<RefreshCw className="w-4 h-4" />}>
            Actualiser
          </Button>
          <Button variant="primary" icon={<Bug className="w-4 h-4" />}>
            Scan Sécurité
          </Button>
        </div>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Score Sécurité"
          value={94}
          previousValue={91}
          format="number"
          icon={<Shield className="w-6 h-6" />}
          color="success"
        />
        <MetricCard
          title="Alertes Actives"
          value={3}
          previousValue={7}
          format="number"
          icon={<AlertTriangle className="w-6 h-6" />}
          color="warning"
        />
        <MetricCard
          title="Connexions Suspectes"
          value={12}
          previousValue={8}
          format="number"
          icon={<Eye className="w-6 h-6" />}
          color="danger"
        />
        <MetricCard
          title="Uptime Sécurité"
          value={99.9}
          previousValue={99.7}
          format="percentage"
          icon={<CheckCircle className="w-6 h-6" />}
          color="primary"
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
                {tab.count && (
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {selectedTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Security Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      name: 'Alertes totales',
                      value: securityMetrics.totalAlerts,
                      status: securityMetrics.totalAlerts > 10 ? 'warning' : 'good',
                      icon: AlertTriangle
                    },
                    {
                      name: 'Alertes critiques',
                      value: securityMetrics.criticalAlerts,
                      status: securityMetrics.criticalAlerts > 5 ? 'warning' : 'good',
                      icon: AlertTriangle
                    },
                    {
                      name: 'Alertes résolues',
                      value: securityMetrics.resolvedAlerts,
                      status: securityMetrics.resolvedAlerts > 5 ? 'good' : 'excellent',
                      icon: CheckCircle
                    },
                    {
                      name: 'Utilisateurs actifs',
                      value: securityMetrics.activeUsers,
                      status: securityMetrics.activeUsers > 50 ? 'good' : 'excellent',
                      icon: Users
                    },
                    {
                      name: 'IPs bloquées',
                      value: securityMetrics.blockedIPs,
                      status: securityMetrics.blockedIPs > 3 ? 'warning' : 'good',
                      icon: Ban
                    },
                    {
                      name: 'Score de sécurité',
                      value: `${securityMetrics.securityScore}%`,
                      status: securityMetrics.securityScore > 80 ? 'excellent' : 
                              securityMetrics.securityScore > 60 ? 'good' : 'warning',
                      icon: Shield
                    }
                  ].map((metric, index) => (
                    <motion.div
                      key={metric.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-xl border ${
                        metric.status === 'excellent' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                        metric.status === 'good' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
                        metric.status === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
                        'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {metric.name}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          metric.change > 0 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          metric.change < 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {metric.change > 0 ? '+' : ''}{metric.change}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {metric.value}
                      </p>
                      <p className="text-xs text-gray-500">{metric.period}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Recent Alerts */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Alertes Récentes
                  </h3>
                  <div className="space-y-3">
                    {securityAlerts.slice(0, 3).map((alert, index) => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-xl border cursor-pointer hover:shadow-lg transition-shadow ${getAlertColor(alert.type)}`}
                        onClick={() => setSelectedAlert(alert)}
                      >
                        <div className="flex items-start space-x-3">
                          {getAlertIcon(alert.type)}
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                              {alert.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {alert.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(alert.timestamp).toLocaleString('fr-FR')}
                            </p>
                          </div>
                          {!alert.resolved && (
                            <Button variant="secondary" size="sm">
                              Résoudre
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {selectedTab === 'alerts' && (
              <motion.div
                key="alerts"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Toutes les Alertes de Sécurité
                  </h3>
                  <div className="flex items-center space-x-2">
                    <select className="input-premium text-sm">
                      <option value="all">Toutes les alertes</option>
                      <option value="critical">Critiques</option>
                      <option value="warning">Avertissements</option>
                      <option value="unresolved">Non résolues</option>
                    </select>
                    <Button variant="secondary" size="sm" icon={<Download className="w-4 h-4" />}>
                      Exporter
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {securityAlerts.map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-6 rounded-xl border cursor-pointer hover:shadow-lg transition-shadow ${getAlertColor(alert.type)}`}
                      onClick={() => setSelectedAlert(alert)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          {getAlertIcon(alert.type)}
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {alert.title}
                              </h4>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                alert.severity === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              }`}>
                                {alert.severity === 'high' ? 'Haute' :
                                 alert.severity === 'medium' ? 'Moyenne' : 'Basse'}
                              </span>
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-300 mb-3">
                              {alert.description}
                            </p>
                            
                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                              <span>IP: {alert.ip}</span>
                              <span>Catégorie: {alert.category}</span>
                              <span>{new Date(alert.timestamp).toLocaleString('fr-FR')}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {!alert.resolved && (
                            <Button variant="primary" size="sm">
                              Résoudre
                            </Button>
                          )}
                          <Button variant="secondary" size="sm" icon={<Eye className="w-3 h-3" />}>
                            Détails
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {selectedTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Sessions Utilisateurs Actives
                  </h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-gray-600 dark:text-gray-400">{activeUsers.length} sessions actives</span>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Utilisateur</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Localisation</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Appareil</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Connexion</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Sécurité</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {activeUsers.map((user) => (
                        <tr key={user.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${user.suspicious ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                              <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full">
                                {user.role}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm text-gray-900 dark:text-white">{user.location}</p>
                              <p className="text-xs text-gray-500">{user.ip}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {user.device}
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm text-gray-900 dark:text-white">
                                {new Date(user.loginTime).toLocaleTimeString('fr-FR')}
                              </p>
                              <p className="text-xs text-gray-500">
                                Actif: {new Date(user.lastActivity).toLocaleTimeString('fr-FR')}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              {user.mfaEnabled ? (
                                <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full">
                                  2FA
                                </span>
                              ) : (
                                <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded-full">
                                  No 2FA
                                </span>
                              )}
                              {user.suspicious && (
                                <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded-full">
                                  Suspect
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              {user.suspicious ? (
                                <Button variant="danger" size="sm" icon={<Ban className="w-3 h-3" />}>
                                  Bloquer
                                </Button>
                              ) : (
                                <Button variant="secondary" size="sm" icon={<Eye className="w-3 h-3" />}>
                                  Voir
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Journal d'Audit
                  </h3>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher dans les logs..."
                        className="input-premium pl-10 w-64"
                      />
                    </div>
                    <Button variant="secondary" size="sm" icon={<Download className="w-4 h-4" />}>
                      Exporter
                    </Button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Timestamp</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Utilisateur</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Ressource</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">IP</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Risque</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {new Date(log.timestamp).toLocaleString('fr-FR')}
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{log.user}</p>
                              <p className="text-xs text-gray-500">{log.userAgent}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-mono text-gray-900 dark:text-white">
                              {log.action}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {log.resource}
                          </td>
                          <td className="px-6 py-4 text-sm font-mono text-gray-900 dark:text-white">
                            {log.ip}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${getRiskColor(log.riskLevel)}`}>
                              {log.riskLevel === 'high' ? 'Élevé' :
                               log.riskLevel === 'medium' ? 'Moyen' : 'Faible'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {selectedTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Paramètres de Sécurité
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Authentication Settings */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Lock className="w-5 h-5 mr-2" />
                      Authentification
                    </h4>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">2FA Obligatoire</span>
                        <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Vérification Email</span>
                        <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                      </label>
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                          Tentatives Max (avant verrouillage)
                        </label>
                        <input type="number" defaultValue={5} className="input-premium w-20" />
                      </div>
                    </div>
                  </div>

                  {/* Session Settings */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      Sessions
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                          Timeout Session (minutes)
                        </label>
                        <input type="number" defaultValue={30} className="input-premium w-20" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                          Sessions Max par Utilisateur
                        </label>
                        <input type="number" defaultValue={3} className="input-premium w-20" />
                      </div>
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Déconnexion Auto</span>
                        <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                      </label>
                    </div>
                  </div>

                  {/* API Security */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Zap className="w-5 h-5 mr-2" />
                      API Security
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                          Rate Limit (req/min)
                        </label>
                        <input type="number" defaultValue={1000} className="input-premium w-24" />
                      </div>
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">CORS Strict</span>
                        <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">API Key Required</span>
                        <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                      </label>
                    </div>
                  </div>

                  {/* Network Security */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Globe className="w-5 h-5 mr-2" />
                      Réseau
                    </h4>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">SSL Obligatoire</span>
                        <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">HSTS Activé</span>
                        <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                      </label>
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                          IPs Autorisées
                        </label>
                        <textarea 
                          className="input-premium w-full" 
                          rows={3}
                          placeholder="192.168.1.0/24&#10;10.0.0.0/8"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Alert Detail Modal */}
      <AnimatePresence>
        {selectedAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={() => setSelectedAlert(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark-800 rounded-2xl max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    {getAlertIcon(selectedAlert.type)}
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedAlert.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedAlert(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    {selectedAlert.description}
                  </p>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Détails Techniques</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Timestamp</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(selectedAlert.timestamp).toLocaleString('fr-FR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Adresse IP</span>
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                          {selectedAlert.ip}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Sévérité</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          selectedAlert.severity === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          selectedAlert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {selectedAlert.severity === 'high' ? 'Haute' :
                           selectedAlert.severity === 'medium' ? 'Moyenne' : 'Basse'}
                        </span>
                      </div>
                      {selectedAlert.affectedUser && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Utilisateur Affecté</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {selectedAlert.affectedUser}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Actions Recommandées</h3>
                    <div className="space-y-2">
                      {selectedAlert.actions.map((action: string, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{action}</span>
                          <Button variant="secondary" size="sm">
                            Exécuter
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button variant="secondary" fullWidth onClick={() => setSelectedAlert(null)}>
                      Fermer
                    </Button>
                    <Button variant="primary" fullWidth icon={<CheckCircle className="w-4 h-4" />}>
                      Marquer Résolu
                    </Button>
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

export default SecurityPage;