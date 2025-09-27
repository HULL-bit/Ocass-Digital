import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Shield, 
  Database, 
  Mail, 
  Smartphone,
  Globe,
  Palette,
  Bell,
  Lock,
  Key,
  Server,
  Cloud,
  Zap,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import Button from '../../components/ui/Button';

const SystemSettingsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('general');
  const [showSecrets, setShowSecrets] = useState(false);
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Plateforme Commerciale',
      siteDescription: 'Plateforme commerciale révolutionnaire pour l\'Afrique',
      defaultLanguage: 'fr',
      defaultCurrency: 'XOF',
      timezone: 'Africa/Dakar',
      maintenanceMode: false,
      registrationEnabled: true,
      emailVerificationRequired: true,
    },
    security: {
      mfaRequired: false,
      passwordMinLength: 8,
      passwordComplexity: true,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      lockoutDuration: 15,
      ipWhitelist: '',
      sslRequired: true,
    },
    email: {
      provider: 'smtp',
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      fromEmail: 'noreply@platform.com',
      fromName: 'Plateforme Commerciale',
    },
    payments: {
      waveEnabled: true,
      waveApiKey: 'wave_***********',
      waveWebhookSecret: 'webhook_***********',
      orangeEnabled: true,
      orangeMerchantId: 'OM_***********',
      orangeApiKey: 'orange_***********',
      stripeEnabled: false,
      stripePublicKey: '',
      stripeSecretKey: '',
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      webhookNotifications: true,
      slackWebhook: '',
      discordWebhook: '',
    },
    storage: {
      provider: 'local',
      awsAccessKey: '',
      awsSecretKey: '',
      awsBucket: '',
      awsRegion: 'us-east-1',
      maxFileSize: 10,
      allowedFileTypes: 'jpg,jpeg,png,pdf,doc,docx',
    },
  });

  const tabs = [
    { id: 'general', label: 'Général', icon: Settings },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'payments', label: 'Paiements', icon: Smartphone },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'storage', label: 'Stockage', icon: Cloud },
  ];

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  const saveSettings = () => {
    console.log('Saving settings:', settings);
    // API call to save settings
  };

  const testConnection = (service: string) => {
    console.log(`Testing ${service} connection...`);
    // API call to test connection
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Paramètres Système</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configuration globale de la plateforme
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="secondary" icon={<RefreshCw className="w-4 h-4" />}>
            Réinitialiser
          </Button>
          <Button variant="primary" icon={<Save className="w-4 h-4" />} onClick={saveSettings}>
            Enregistrer
          </Button>
        </div>
      </div>

      {/* Settings Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
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

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="card-premium p-6">
            <AnimatePresence mode="wait">
              {selectedTab === 'general' && (
                <motion.div
                  key="general"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Paramètres Généraux
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nom du Site
                      </label>
                      <input
                        type="text"
                        value={settings.general.siteName}
                        onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                        className="input-premium w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Langue par Défaut
                      </label>
                      <select
                        value={settings.general.defaultLanguage}
                        onChange={(e) => updateSetting('general', 'defaultLanguage', e.target.value)}
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
                        Devise par Défaut
                      </label>
                      <select
                        value={settings.general.defaultCurrency}
                        onChange={(e) => updateSetting('general', 'defaultCurrency', e.target.value)}
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
                        value={settings.general.timezone}
                        onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                        className="input-premium w-full"
                      >
                        <option value="Africa/Dakar">Dakar (GMT+0)</option>
                        <option value="Africa/Casablanca">Casablanca (GMT+1)</option>
                        <option value="Europe/Paris">Paris (GMT+1)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description du Site
                    </label>
                    <textarea
                      value={settings.general.siteDescription}
                      onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                      className="input-premium w-full"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Options</h4>
                    
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.general.maintenanceMode}
                          onChange={(e) => updateSetting('general', 'maintenanceMode', e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Mode Maintenance</span>
                      </label>
                      
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.general.registrationEnabled}
                          onChange={(e) => updateSetting('general', 'registrationEnabled', e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Inscription Ouverte</span>
                      </label>
                      
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.general.emailVerificationRequired}
                          onChange={(e) => updateSetting('general', 'emailVerificationRequired', e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Vérification Email Obligatoire</span>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}

              {selectedTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Paramètres de Sécurité
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Longueur Minimale Mot de Passe
                      </label>
                      <input
                        type="number"
                        value={settings.security.passwordMinLength}
                        onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                        className="input-premium w-full"
                        min="6"
                        max="20"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Timeout Session (minutes)
                      </label>
                      <input
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                        className="input-premium w-full"
                        min="5"
                        max="120"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tentatives de Connexion Max
                      </label>
                      <input
                        type="number"
                        value={settings.security.maxLoginAttempts}
                        onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                        className="input-premium w-full"
                        min="3"
                        max="10"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Durée Verrouillage (minutes)
                      </label>
                      <input
                        type="number"
                        value={settings.security.lockoutDuration}
                        onChange={(e) => updateSetting('security', 'lockoutDuration', parseInt(e.target.value))}
                        className="input-premium w-full"
                        min="5"
                        max="60"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Liste Blanche IP (une par ligne)
                    </label>
                    <textarea
                      value={settings.security.ipWhitelist}
                      onChange={(e) => updateSetting('security', 'ipWhitelist', e.target.value)}
                      className="input-premium w-full"
                      rows={4}
                      placeholder="192.168.1.1&#10;10.0.0.1"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">Options de Sécurité</h4>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.security.mfaRequired}
                        onChange={(e) => updateSetting('security', 'mfaRequired', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">2FA Obligatoire</span>
                    </label>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.security.passwordComplexity}
                        onChange={(e) => updateSetting('security', 'passwordComplexity', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Complexité Mot de Passe</span>
                    </label>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.security.sslRequired}
                        onChange={(e) => updateSetting('security', 'sslRequired', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">SSL Obligatoire</span>
                    </label>
                  </div>
                </motion.div>
              )}

              {selectedTab === 'email' && (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Configuration Email
                    </h3>
                    <Button variant="secondary" size="sm" onClick={() => testConnection('email')}>
                      Tester Connexion
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Serveur SMTP
                      </label>
                      <input
                        type="text"
                        value={settings.email.smtpHost}
                        onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
                        className="input-premium w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Port SMTP
                      </label>
                      <input
                        type="number"
                        value={settings.email.smtpPort}
                        onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value))}
                        className="input-premium w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Utilisateur SMTP
                      </label>
                      <input
                        type="email"
                        value={settings.email.smtpUser}
                        onChange={(e) => updateSetting('email', 'smtpUser', e.target.value)}
                        className="input-premium w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Mot de Passe SMTP
                      </label>
                      <div className="relative">
                        <input
                          type={showSecrets ? 'text' : 'password'}
                          value={settings.email.smtpPassword}
                          onChange={(e) => updateSetting('email', 'smtpPassword', e.target.value)}
                          className="input-premium w-full pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecrets(!showSecrets)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Expéditeur
                      </label>
                      <input
                        type="email"
                        value={settings.email.fromEmail}
                        onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
                        className="input-premium w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nom Expéditeur
                      </label>
                      <input
                        type="text"
                        value={settings.email.fromName}
                        onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
                        className="input-premium w-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {selectedTab === 'payments' && (
                <motion.div
                  key="payments"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Configuration Paiements
                  </h3>
                  
                  {/* Wave Money */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                          📱
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">Wave Money</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Paiements mobiles Sénégal</p>
                        </div>
                      </div>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.payments.waveEnabled}
                          onChange={(e) => updateSetting('payments', 'waveEnabled', e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Activé</span>
                      </label>
                    </div>
                    
                    {settings.payments.waveEnabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Clé API Wave
                          </label>
                          <div className="relative">
                            <input
                              type={showSecrets ? 'text' : 'password'}
                              value={settings.payments.waveApiKey}
                              onChange={(e) => updateSetting('payments', 'waveApiKey', e.target.value)}
                              className="input-premium w-full pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowSecrets(!showSecrets)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            >
                              {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Secret Webhook
                          </label>
                          <div className="relative">
                            <input
                              type={showSecrets ? 'text' : 'password'}
                              value={settings.payments.waveWebhookSecret}
                              onChange={(e) => updateSetting('payments', 'waveWebhookSecret', e.target.value)}
                              className="input-premium w-full pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowSecrets(!showSecrets)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            >
                              {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4">
                      <Button variant="secondary" size="sm" onClick={() => testConnection('wave')}>
                        Tester Wave Money
                      </Button>
                    </div>
                  </div>

                  {/* Orange Money */}
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white">
                          🟠
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">Orange Money</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Paiements Orange</p>
                        </div>
                      </div>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.payments.orangeEnabled}
                          onChange={(e) => updateSetting('payments', 'orangeEnabled', e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Activé</span>
                      </label>
                    </div>
                    
                    {settings.payments.orangeEnabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Merchant ID
                          </label>
                          <input
                            type="text"
                            value={settings.payments.orangeMerchantId}
                            onChange={(e) => updateSetting('payments', 'orangeMerchantId', e.target.value)}
                            className="input-premium w-full"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Clé API Orange
                          </label>
                          <div className="relative">
                            <input
                              type={showSecrets ? 'text' : 'password'}
                              value={settings.payments.orangeApiKey}
                              onChange={(e) => updateSetting('payments', 'orangeApiKey', e.target.value)}
                              className="input-premium w-full pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowSecrets(!showSecrets)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            >
                              {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4">
                      <Button variant="secondary" size="sm" onClick={() => testConnection('orange')}>
                        Tester Orange Money
                      </Button>
                    </div>
                  </div>

                  {/* Security Options */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">Options Avancées</h4>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.security.mfaRequired}
                        onChange={(e) => updateSetting('security', 'mfaRequired', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">2FA Obligatoire pour Tous</span>
                    </label>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.security.passwordComplexity}
                        onChange={(e) => updateSetting('security', 'passwordComplexity', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Complexité Mot de Passe Renforcée</span>
                    </label>
                  </div>
                </motion.div>
              )}

              {selectedTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Configuration Notifications
                  </h3>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Canaux de Notification</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.notifications.emailNotifications}
                          onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Notifications Email</span>
                      </label>
                      
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.notifications.smsNotifications}
                          onChange={(e) => updateSetting('notifications', 'smsNotifications', e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <Smartphone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Notifications SMS</span>
                      </label>
                      
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.notifications.pushNotifications}
                          onChange={(e) => updateSetting('notifications', 'pushNotifications', e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <Bell className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Notifications Push</span>
                      </label>
                      
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.notifications.webhookNotifications}
                          onChange={(e) => updateSetting('notifications', 'webhookNotifications', e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <Zap className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Webhooks</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Webhook Slack
                      </label>
                      <input
                        type="url"
                        value={settings.notifications.slackWebhook}
                        onChange={(e) => updateSetting('notifications', 'slackWebhook', e.target.value)}
                        className="input-premium w-full"
                        placeholder="https://hooks.slack.com/..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Webhook Discord
                      </label>
                      <input
                        type="url"
                        value={settings.notifications.discordWebhook}
                        onChange={(e) => updateSetting('notifications', 'discordWebhook', e.target.value)}
                        className="input-premium w-full"
                        placeholder="https://discord.com/api/webhooks/..."
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {selectedTab === 'storage' && (
                <motion.div
                  key="storage"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Configuration Stockage
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fournisseur de Stockage
                    </label>
                    <select
                      value={settings.storage.provider}
                      onChange={(e) => updateSetting('storage', 'provider', e.target.value)}
                      className="input-premium w-full"
                    >
                      <option value="local">Stockage Local</option>
                      <option value="aws">Amazon S3</option>
                      <option value="gcp">Google Cloud Storage</option>
                      <option value="azure">Azure Blob Storage</option>
                    </select>
                  </div>
                  
                  {settings.storage.provider === 'aws' && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Configuration AWS S3</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Access Key ID
                          </label>
                          <input
                            type="text"
                            value={settings.storage.awsAccessKey}
                            onChange={(e) => updateSetting('storage', 'awsAccessKey', e.target.value)}
                            className="input-premium w-full"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Secret Access Key
                          </label>
                          <div className="relative">
                            <input
                              type={showSecrets ? 'text' : 'password'}
                              value={settings.storage.awsSecretKey}
                              onChange={(e) => updateSetting('storage', 'awsSecretKey', e.target.value)}
                              className="input-premium w-full pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowSecrets(!showSecrets)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            >
                              {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nom du Bucket
                          </label>
                          <input
                            type="text"
                            value={settings.storage.awsBucket}
                            onChange={(e) => updateSetting('storage', 'awsBucket', e.target.value)}
                            className="input-premium w-full"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Région
                          </label>
                          <select
                            value={settings.storage.awsRegion}
                            onChange={(e) => updateSetting('storage', 'awsRegion', e.target.value)}
                            className="input-premium w-full"
                          >
                            <option value="us-east-1">US East (N. Virginia)</option>
                            <option value="eu-west-1">EU (Ireland)</option>
                            <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Button variant="secondary" size="sm" onClick={() => testConnection('aws')}>
                          Tester Connexion AWS
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Taille Max Fichier (MB)
                      </label>
                      <input
                        type="number"
                        value={settings.storage.maxFileSize}
                        onChange={(e) => updateSetting('storage', 'maxFileSize', parseInt(e.target.value))}
                        className="input-premium w-full"
                        min="1"
                        max="100"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Types de Fichiers Autorisés
                      </label>
                      <input
                        type="text"
                        value={settings.storage.allowedFileTypes}
                        onChange={(e) => updateSetting('storage', 'allowedFileTypes', e.target.value)}
                        className="input-premium w-full"
                        placeholder="jpg,png,pdf,doc"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Save Changes Bar */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 right-6 bg-white dark:bg-dark-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4"
      >
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Vous avez des modifications non sauvegardées
          </span>
          <Button variant="primary" size="sm" icon={<Save className="w-4 h-4" />} onClick={saveSettings}>
            Sauvegarder
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default SystemSettingsPage;