import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Save, 
  Smartphone, 
  CreditCard, 
  Bell, 
  Palette,
  Store,
  Printer,
  Wifi,
  Shield,
  Key,
  Globe,
  Mail,
  Phone,
  Eye,
  EyeOff,
  TestTube,
  Camera,
  CheckCircle,
  AlertTriangle,
  Package
} from 'lucide-react';
import Button from '../../components/ui/Button';
import AnimatedForm from '../../components/forms/AnimatedForm';
import * as yup from 'yup';

const SettingsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('pos');
  const [showSecrets, setShowSecrets] = useState(false);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  const [settings, setSettings] = useState({
    pos: {
      storeName: 'Boutique Marie Diallo',
      receiptHeader: 'Boutique Marie Diallo\n15 Avenue Bourguiba, Dakar\nTél: +221 77 123 45 67',
      receiptFooter: 'Merci de votre visite !\nÀ bientôt chez nous',
      taxRate: 18,
      currency: 'XOF',
      autoprint: true,
      soundEnabled: true,
      barcodeScanner: true,
    },
    payments: {
      waveEnabled: true,
      waveApiKey: 'wave_sk_test_***********',
      waveWebhookSecret: 'whsec_***********',
      orangeEnabled: true,
      orangeMerchantId: 'OM_MARIE_001',
      orangeApiKey: 'orange_***********',
      freemoneyEnabled: false,
      freemoneyApiKey: '',
      cashEnabled: true,
      cardEnabled: false,
    },
    notifications: {
      stockAlerts: true,
      lowStockThreshold: 10,
      expiryAlerts: true,
      expiryDays: 30,
      salesNotifications: true,
      paymentNotifications: true,
      customerNotifications: false,
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
    },
    store: {
      storeName: 'Boutique Marie Diallo',
      storeDescription: 'Mode africaine authentique et produits artisanaux de qualité',
      storeAddress: '15 Avenue Bourguiba, Plateau, Dakar',
      storePhone: '+221 77 123 45 67',
      storeEmail: 'contact@boutiquemarie.sn',
      storeWebsite: 'https://boutiquemarie.sn',
      openingHours: {
        monday: { open: '09:00', close: '19:00', closed: false },
        tuesday: { open: '09:00', close: '19:00', closed: false },
        wednesday: { open: '09:00', close: '19:00', closed: false },
        thursday: { open: '09:00', close: '19:00', closed: false },
        friday: { open: '09:00', close: '19:00', closed: false },
        saturday: { open: '09:00', close: '20:00', closed: false },
        sunday: { open: '10:00', close: '18:00', closed: false },
      },
    },
    integrations: {
      whatsappEnabled: false,
      whatsappNumber: '',
      whatsappToken: '',
      facebookEnabled: false,
      facebookPageId: '',
      facebookAccessToken: '',
      instagramEnabled: false,
      instagramBusinessId: '',
    },
  });

  const tabs = [
    { id: 'pos', label: 'Point de Vente', icon: Store },
    { id: 'payments', label: 'Paiements', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'store', label: 'Boutique', icon: Globe },
    { id: 'integrations', label: 'Intégrations', icon: Wifi },
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

  const testConnection = async (service: string) => {
    setTestingConnection(service);
    
    try {
      // Simulation de test de connexion
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulation de résultat aléatoire
      const success = Math.random() > 0.3;
      
      if (success) {
        alert(`✅ Connexion ${service} réussie !`);
      } else {
        alert(`❌ Échec de connexion ${service}. Vérifiez vos paramètres.`);
      }
    } catch (error) {
      alert(`❌ Erreur lors du test ${service}`);
    } finally {
      setTestingConnection(null);
    }
  };

  const saveSettings = async () => {
    console.log('Sauvegarde des paramètres:', settings);
    // Simulation d'appel API
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('✅ Paramètres sauvegardés avec succès !');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Paramètres</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configurez votre boutique et vos intégrations
          </p>
        </div>
        
        <Button variant="primary" icon={<Save className="w-4 h-4" />} onClick={saveSettings}>
          Enregistrer Tout
        </Button>
      </div>

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
              {selectedTab === 'pos' && (
                <motion.div
                  key="pos"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Configuration Point de Vente
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nom de la Boutique
                      </label>
                      <input
                        type="text"
                        value={settings.pos.storeName}
                        onChange={(e) => updateSetting('pos', 'storeName', e.target.value)}
                        className="input-premium w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Taux de TVA (%)
                      </label>
                      <input
                        type="number"
                        value={settings.pos.taxRate}
                        onChange={(e) => updateSetting('pos', 'taxRate', parseFloat(e.target.value))}
                        className="input-premium w-full"
                        min="0"
                        max="30"
                        step="0.1"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        En-tête de Reçu
                      </label>
                      <textarea
                        value={settings.pos.receiptHeader}
                        onChange={(e) => updateSetting('pos', 'receiptHeader', e.target.value)}
                        className="input-premium w-full"
                        rows={4}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Pied de Page de Reçu
                      </label>
                      <textarea
                        value={settings.pos.receiptFooter}
                        onChange={(e) => updateSetting('pos', 'receiptFooter', e.target.value)}
                        className="input-premium w-full"
                        rows={4}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">Options POS</h4>
                    
                    <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <Printer className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Impression Automatique
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.pos.autoprint}
                        onChange={(e) => updateSetting('pos', 'autoprint', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </label>
                    
                    <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <Bell className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Sons Activés
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.pos.soundEnabled}
                        onChange={(e) => updateSetting('pos', 'soundEnabled', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </label>
                    
                    <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <Camera className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Scanner Code-barres
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.pos.barcodeScanner}
                        onChange={(e) => updateSetting('pos', 'barcodeScanner', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </label>
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
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
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        loading={testingConnection === 'wave'}
                        onClick={() => testConnection('wave')}
                        icon={<TestTube className="w-4 h-4" />}
                      >
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
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        loading={testingConnection === 'orange'}
                        onClick={() => testConnection('orange')}
                        icon={<TestTube className="w-4 h-4" />}
                      >
                        Tester Orange Money
                      </Button>
                    </div>
                  </div>

                  {/* Payment Methods Status */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { key: 'cashEnabled', name: 'Espèces', icon: '💵', color: 'green' },
                      { key: 'waveEnabled', name: 'Wave', icon: '📱', color: 'blue' },
                      { key: 'orangeEnabled', name: 'Orange', icon: '🟠', color: 'orange' },
                      { key: 'cardEnabled', name: 'Carte', icon: '💳', color: 'purple' },
                    ].map((method) => (
                      <div key={method.key} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <div className="text-2xl mb-2">{method.icon}</div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{method.name}</p>
                        <div className="flex items-center justify-center mt-2">
                          {settings.payments[method.key as keyof typeof settings.payments] ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    ))}
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Préférences de Notifications
                  </h3>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Alertes Business</h4>
                    
                    <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <Package className="w-4 h-4 text-gray-500" />
                        <div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">Alertes de Stock</span>
                          <p className="text-xs text-gray-500">Notifications quand le stock est bas</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.stockAlerts}
                        onChange={(e) => updateSetting('notifications', 'stockAlerts', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </label>
                    
                    {settings.notifications.stockAlerts && (
                      <div className="ml-7">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Seuil Stock Bas
                        </label>
                        <input
                          type="number"
                          value={settings.notifications.lowStockThreshold}
                          onChange={(e) => updateSetting('notifications', 'lowStockThreshold', parseInt(e.target.value))}
                          className="input-premium w-32"
                          min="1"
                          max="100"
                        />
                      </div>
                    )}
                    
                    <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <ShoppingCart className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Notifications de Ventes</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.salesNotifications}
                        onChange={(e) => updateSetting('notifications', 'salesNotifications', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </label>
                    
                    <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Notifications de Paiements</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.paymentNotifications}
                        onChange={(e) => updateSetting('notifications', 'paymentNotifications', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </label>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Canaux de Communication</h4>
                    
                    <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Notifications Email</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.emailNotifications}
                        onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </label>
                    
                    <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Notifications SMS</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.smsNotifications}
                        onChange={(e) => updateSetting('notifications', 'smsNotifications', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </label>
                    
                    <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <Bell className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Notifications Push</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.pushNotifications}
                        onChange={(e) => updateSetting('notifications', 'pushNotifications', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </label>
                  </div>
                </motion.div>
              )}

              {selectedTab === 'store' && (
                <motion.div
                  key="store"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Configuration Boutique
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nom de la Boutique
                      </label>
                      <input
                        type="text"
                        value={settings.store.storeName}
                        onChange={(e) => updateSetting('store', 'storeName', e.target.value)}
                        className="input-premium w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email de Contact
                      </label>
                      <input
                        type="email"
                        value={settings.store.storeEmail}
                        onChange={(e) => updateSetting('store', 'storeEmail', e.target.value)}
                        className="input-premium w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={settings.store.storePhone}
                        onChange={(e) => updateSetting('store', 'storePhone', e.target.value)}
                        className="input-premium w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Site Web
                      </label>
                      <input
                        type="url"
                        value={settings.store.storeWebsite}
                        onChange={(e) => updateSetting('store', 'storeWebsite', e.target.value)}
                        className="input-premium w-full"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={settings.store.storeDescription}
                      onChange={(e) => updateSetting('store', 'storeDescription', e.target.value)}
                      className="input-premium w-full"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Adresse Complète
                    </label>
                    <textarea
                      value={settings.store.storeAddress}
                      onChange={(e) => updateSetting('store', 'storeAddress', e.target.value)}
                      className="input-premium w-full"
                      rows={2}
                    />
                  </div>

                  {/* Opening Hours */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">Horaires d'Ouverture</h4>
                    <div className="space-y-3">
                      {Object.entries(settings.store.openingHours).map(([day, hours]) => {
                        const dayNames = {
                          monday: 'Lundi',
                          tuesday: 'Mardi',
                          wednesday: 'Mercredi',
                          thursday: 'Jeudi',
                          friday: 'Vendredi',
                          saturday: 'Samedi',
                          sunday: 'Dimanche',
                        };
                        
                        return (
                          <div key={day} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                            <div className="w-20">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {dayNames[day as keyof typeof dayNames]}
                              </span>
                            </div>
                            
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={!hours.closed}
                                onChange={(e) => updateSetting('store', 'openingHours', {
                                  ...settings.store.openingHours,
                                  [day]: { ...hours, closed: !e.target.checked }
                                })}
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">Ouvert</span>
                            </label>
                            
                            {!hours.closed && (
                              <>
                                <input
                                  type="time"
                                  value={hours.open}
                                  onChange={(e) => updateSetting('store', 'openingHours', {
                                    ...settings.store.openingHours,
                                    [day]: { ...hours, open: e.target.value }
                                  })}
                                  className="input-premium text-sm"
                                />
                                <span className="text-gray-500">à</span>
                                <input
                                  type="time"
                                  value={hours.close}
                                  onChange={(e) => updateSetting('store', 'openingHours', {
                                    ...settings.store.openingHours,
                                    [day]: { ...hours, close: e.target.value }
                                  })}
                                  className="input-premium text-sm"
                                />
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {selectedTab === 'integrations' && (
                <motion.div
                  key="integrations"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Intégrations Externes
                  </h3>
                  
                  {/* WhatsApp Business */}
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white">
                          💬
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">WhatsApp Business</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Notifications clients via WhatsApp</p>
                        </div>
                      </div>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.integrations.whatsappEnabled}
                          onChange={(e) => updateSetting('integrations', 'whatsappEnabled', e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Activé</span>
                      </label>
                    </div>
                    
                    {settings.integrations.whatsappEnabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Numéro WhatsApp Business
                          </label>
                          <input
                            type="tel"
                            value={settings.integrations.whatsappNumber}
                            onChange={(e) => updateSetting('integrations', 'whatsappNumber', e.target.value)}
                            className="input-premium w-full"
                            placeholder="+221 77 123 45 67"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Token d'Accès
                          </label>
                          <div className="relative">
                            <input
                              type={showSecrets ? 'text' : 'password'}
                              value={settings.integrations.whatsappToken}
                              onChange={(e) => updateSetting('integrations', 'whatsappToken', e.target.value)}
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
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        loading={testingConnection === 'whatsapp'}
                        onClick={() => testConnection('whatsapp')}
                        icon={<TestTube className="w-4 h-4" />}
                      >
                        Tester WhatsApp
                      </Button>
                    </div>
                  </div>

                  {/* Facebook */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                          📘
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">Facebook Business</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Synchronisation catalogue Facebook</p>
                        </div>
                      </div>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.integrations.facebookEnabled}
                          onChange={(e) => updateSetting('integrations', 'facebookEnabled', e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Activé</span>
                      </label>
                    </div>
                    
                    {settings.integrations.facebookEnabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            ID Page Facebook
                          </label>
                          <input
                            type="text"
                            value={settings.integrations.facebookPageId}
                            onChange={(e) => updateSetting('integrations', 'facebookPageId', e.target.value)}
                            className="input-premium w-full"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Token d'Accès
                          </label>
                          <div className="relative">
                            <input
                              type={showSecrets ? 'text' : 'password'}
                              value={settings.integrations.facebookAccessToken}
                              onChange={(e) => updateSetting('integrations', 'facebookAccessToken', e.target.value)}
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
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;