import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, 
  Plus, 
  Download, 
  Upload, 
  RefreshCw,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  HardDrive,
  Cloud,
  Shield,
  Archive,
  Trash2,
  Eye,
  X,
  Server,
  FileText,
  Settings
} from 'lucide-react';
import Button from '../../components/ui/Button';
import MetricCard from '../../components/ui/MetricCard';

const BackupsPage: React.FC = () => {
  const [selectedBackup, setSelectedBackup] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const mockBackups = [
    {
      id: '1',
      nom_fichier: 'backup_full_20240115_023000.sql.gz',
      type_sauvegarde: 'complete',
      taille_fichier: 2450000000, // 2.45 GB
      date_debut: '2024-01-15T02:30:00Z',
      date_fin: '2024-01-15T02:45:00Z',
      duree: '15 minutes',
      statut: 'terminee',
      automatique: true,
      restaurable: true,
      date_expiration: '2024-04-15T02:30:00Z',
      checksum: 'sha256:a1b2c3d4e5f6...',
      compression: 'gzip',
      tables_incluses: ['users', 'companies', 'products', 'sales', 'customers'],
      description: 'Sauvegarde complète automatique quotidienne',
    },
    {
      id: '2',
      nom_fichier: 'backup_incremental_20240114_120000.sql.gz',
      type_sauvegarde: 'incrementale',
      taille_fichier: 450000000, // 450 MB
      date_debut: '2024-01-14T12:00:00Z',
      date_fin: '2024-01-14T12:08:00Z',
      duree: '8 minutes',
      statut: 'terminee',
      automatique: true,
      restaurable: true,
      date_expiration: '2024-02-14T12:00:00Z',
      checksum: 'sha256:f6e5d4c3b2a1...',
      compression: 'gzip',
      tables_incluses: ['sales', 'inventory', 'notifications'],
      description: 'Sauvegarde incrémentale des données transactionnelles',
    },
    {
      id: '3',
      nom_fichier: 'backup_config_20240113_180000.json',
      type_sauvegarde: 'configuration',
      taille_fichier: 15000000, // 15 MB
      date_debut: '2024-01-13T18:00:00Z',
      date_fin: '2024-01-13T18:01:00Z',
      duree: '1 minute',
      statut: 'terminee',
      automatique: false,
      restaurable: true,
      date_expiration: '2024-07-13T18:00:00Z',
      checksum: 'sha256:123abc456def...',
      compression: 'none',
      tables_incluses: ['settings', 'integrations', 'permissions'],
      description: 'Sauvegarde manuelle de la configuration système',
    },
    {
      id: '4',
      nom_fichier: 'backup_full_20240112_023000.sql.gz',
      type_sauvegarde: 'complete',
      taille_fichier: 2380000000, // 2.38 GB
      date_debut: '2024-01-12T02:30:00Z',
      date_fin: '2024-01-12T02:30:00Z',
      duree: null,
      statut: 'erreur',
      automatique: true,
      restaurable: false,
      erreur: 'Espace disque insuffisant',
      description: 'Échec sauvegarde - Espace disque insuffisant',
    },
  ];

  const backupTypes = [
    { id: 'complete', name: 'Complète', description: 'Sauvegarde complète de toutes les données', icon: Database, color: 'blue' },
    { id: 'incrementale', name: 'Incrémentale', description: 'Sauvegarde des modifications uniquement', icon: Archive, color: 'green' },
    { id: 'differentielle', name: 'Différentielle', description: 'Sauvegarde des changements depuis la dernière complète', icon: FileText, color: 'yellow' },
    { id: 'configuration', name: 'Configuration', description: 'Sauvegarde des paramètres système uniquement', icon: Settings, color: 'purple' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'terminee':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'en_cours':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'erreur':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'terminee':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'en_cours':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'erreur':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const createBackup = (type: string) => {
    console.log(`Création sauvegarde ${type}...`);
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Gestion des Sauvegardes</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Protégez vos données avec des sauvegardes automatiques et manuelles
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="secondary" icon={<RefreshCw className="w-4 h-4" />}>
            Actualiser
          </Button>
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreateModal(true)}>
            Nouvelle Sauvegarde
          </Button>
        </div>
      </div>

      {/* Backup Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Sauvegardes Totales"
          value={156}
          previousValue={142}
          format="number"
          icon={<Database className="w-6 h-6" />}
          color="primary"
        />
        <MetricCard
          title="Espace Utilisé"
          value={45.8}
          previousValue={42.1}
          format="number"
          icon={<HardDrive className="w-6 h-6" />}
          color="warning"
        />
        <MetricCard
          title="Taux de Succès"
          value={98.5}
          previousValue={97.2}
          format="percentage"
          icon={<CheckCircle className="w-6 h-6" />}
          color="success"
        />
        <MetricCard
          title="Dernière Sauvegarde"
          value={2}
          previousValue={24}
          format="number"
          icon={<Clock className="w-6 h-6" />}
          color="info"
        />
      </div>

      {/* Backup List */}
      <div className="card-premium p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Historique des Sauvegardes
          </h3>
          <div className="flex items-center space-x-2">
            <select className="input-premium text-sm">
              <option value="all">Tous les types</option>
              <option value="complete">Complètes</option>
              <option value="incrementale">Incrémentales</option>
              <option value="configuration">Configuration</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {mockBackups.map((backup, index) => (
            <motion.div
              key={backup.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setSelectedBackup(backup)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Database className="w-5 h-5 text-primary-500" />
                    <span className="font-mono text-sm text-gray-900 dark:text-white">
                      {backup.nom_fichier}
                    </span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(backup.statut)}
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(backup.statut)}`}>
                        {backup.statut === 'terminee' ? 'Terminée' :
                         backup.statut === 'en_cours' ? 'En cours' : 'Erreur'}
                      </span>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full capitalize">
                      {backup.type_sauvegarde}
                    </span>
                    {backup.automatique && (
                      <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full">
                        Auto
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {backup.description}
                  </p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <HardDrive className="w-4 h-4" />
                      <span>{formatFileSize(backup.taille_fichier)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(backup.date_debut).toLocaleDateString('fr-FR')}</span>
                    </div>
                    {backup.duree && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{backup.duree}</span>
                      </div>
                    )}
                    {backup.erreur && (
                      <div className="flex items-center space-x-1 text-red-500">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{backup.erreur}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {backup.restaurable && backup.statut === 'terminee' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Upload className="w-3 h-3" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Restore backup
                      }}
                    >
                      Restaurer
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Download className="w-3 h-3" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Download backup
                    }}
                  >
                    Télécharger
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Eye className="w-3 h-3" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBackup(backup);
                    }}
                  >
                    Détails
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Create Backup Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={() => setShowCreateModal(false)}
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
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Nouvelle Sauvegarde
                  </h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {backupTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <motion.button
                        key={type.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => createBackup(type.id)}
                        className={`p-6 rounded-xl border-2 transition-all text-center hover:shadow-lg ${
                          type.color === 'blue' ? 'border-blue-200 hover:border-blue-500 bg-blue-50 dark:bg-blue-900/20' :
                          type.color === 'green' ? 'border-green-200 hover:border-green-500 bg-green-50 dark:bg-green-900/20' :
                          type.color === 'yellow' ? 'border-yellow-200 hover:border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                          'border-purple-200 hover:border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        }`}
                      >
                        <IconComponent className={`w-12 h-12 mx-auto mb-3 ${
                          type.color === 'blue' ? 'text-blue-500' :
                          type.color === 'green' ? 'text-green-500' :
                          type.color === 'yellow' ? 'text-yellow-500' :
                          'text-purple-500'
                        }`} />
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {type.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {type.description}
                        </p>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backup Detail Modal */}
      <AnimatePresence>
        {selectedBackup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={() => setSelectedBackup(null)}
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
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Détails de la Sauvegarde
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">{selectedBackup.nom_fichier}</p>
                </div>
                
                <button
                  onClick={() => setSelectedBackup(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Backup Info */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Informations</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Type</span>
                          <span className="font-medium text-gray-900 dark:text-white capitalize">
                            {selectedBackup.type_sauvegarde}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Taille</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatFileSize(selectedBackup.taille_fichier)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Statut</span>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(selectedBackup.statut)}
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(selectedBackup.statut)}`}>
                              {selectedBackup.statut === 'terminee' ? 'Terminée' :
                               selectedBackup.statut === 'en_cours' ? 'En cours' : 'Erreur'}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Date création</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {new Date(selectedBackup.date_debut).toLocaleString('fr-FR')}
                          </span>
                        </div>
                        {selectedBackup.duree && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Durée</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {selectedBackup.duree}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Expiration</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {new Date(selectedBackup.date_expiration).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tables Included */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Tables Incluses</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedBackup.tables_incluses.map((table: string) => (
                          <span
                            key={table}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                          >
                            {table}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Sécurité</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Checksum</span>
                          <span className="font-mono text-xs text-gray-900 dark:text-white">
                            {selectedBackup.checksum?.substring(0, 20)}...
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Compression</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {selectedBackup.compression || 'Aucune'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Restaurable</span>
                          <span className={`font-medium ${selectedBackup.restaurable ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedBackup.restaurable ? 'Oui' : 'Non'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {selectedBackup.restaurable && selectedBackup.statut === 'terminee' && (
                        <Button
                          variant="primary"
                          fullWidth
                          icon={<Upload className="w-4 h-4" />}
                        >
                          Restaurer cette Sauvegarde
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        fullWidth
                        icon={<Download className="w-4 h-4" />}
                      >
                        Télécharger
                      </Button>
                      <Button
                        variant="secondary"
                        fullWidth
                        icon={<Shield className="w-4 h-4" />}
                      >
                        Vérifier Intégrité
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

export default BackupsPage;