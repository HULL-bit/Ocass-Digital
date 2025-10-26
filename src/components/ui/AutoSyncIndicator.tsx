import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import useDataSync from '../../hooks/useDataSync';

interface AutoSyncIndicatorProps {
  className?: string;
}

const AutoSyncIndicator: React.FC<AutoSyncIndicatorProps> = ({ className = '' }) => {
  const { syncStatus, isLoading, error } = useDataSync();
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    if (syncStatus.status === 'syncing' || syncStatus.status === 'success' || syncStatus.status === 'error') {
      setShowStatus(true);
      const timer = setTimeout(() => setShowStatus(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [syncStatus.status]);

  const getStatusIcon = () => {
    switch (syncStatus.status) {
      case 'syncing':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (syncStatus.status) {
      case 'syncing':
        return 'Synchronisation...';
      case 'success':
        return 'Synchronisé';
      case 'error':
        return 'Erreur de sync';
      default:
        return 'En attente';
    }
  };

  const getStatusColor = () => {
    switch (syncStatus.status) {
      case 'syncing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence>
        {showStatus && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium ${getStatusColor()}`}
          >
            {getStatusIcon()}
            <span>{getStatusText()}</span>
            {syncStatus.lastSync && (
              <span className="text-xs opacity-75">
                {new Date(syncStatus.lastSync).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicateur de synchronisation automatique */}
      {!showStatus && (
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Sync auto</span>
        </div>
      )}

      {/* Détails de synchronisation (optionnel) */}
      {syncStatus.dataCounts && (
        <div className="mt-1 text-xs text-gray-400">
          {syncStatus.dataCounts.products} produits • {syncStatus.dataCounts.companies} entreprises
        </div>
      )}
    </div>
  );
};

export default AutoSyncIndicator;
