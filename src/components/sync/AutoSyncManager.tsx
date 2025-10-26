import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, CheckCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import useDataSync from '../../hooks/useDataSync';

interface AutoSyncManagerProps {
  children: React.ReactNode;
}

const AutoSyncManager: React.FC<AutoSyncManagerProps> = ({ children }) => {
  const { syncStatus, syncData, isLoading, error } = useDataSync();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showSyncNotification, setShowSyncNotification] = useState(false);

  // Surveiller la connectivité réseau
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🔄 Reconnexion détectée - Synchronisation automatique...');
      syncData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('⚠️ Déconnexion détectée - Mode hors ligne');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncData]);

  // Surveiller les changements de statut de synchronisation
  useEffect(() => {
    if (syncStatus.status === 'syncing') {
      setShowSyncNotification(true);
    } else if (syncStatus.status === 'success') {
      setShowSyncNotification(true);
      setTimeout(() => setShowSyncNotification(false), 2000);
    } else if (syncStatus.status === 'error') {
      setShowSyncNotification(true);
      setTimeout(() => setShowSyncNotification(false), 5000);
    }
  }, [syncStatus.status]);

  // Synchronisation automatique lors du retour sur la page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Retour sur la page - Synchronisation automatique...');
        syncData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [syncData]);

  // Synchronisation automatique lors du focus de la fenêtre
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Focus de la fenêtre - Synchronisation automatique...');
      syncData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [syncData]);

  const getSyncIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4 text-red-500" />;
    if (syncStatus.status === 'syncing') return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
    if (syncStatus.status === 'success') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (syncStatus.status === 'error') return <AlertCircle className="w-4 h-4 text-red-500" />;
    return <Wifi className="w-4 h-4 text-gray-500" />;
  };

  const getSyncText = () => {
    if (!isOnline) return 'Hors ligne';
    if (syncStatus.status === 'syncing') return 'Synchronisation...';
    if (syncStatus.status === 'success') return 'Synchronisé';
    if (syncStatus.status === 'error') return 'Erreur de sync';
    return 'En ligne';
  };

  const getSyncColor = () => {
    if (!isOnline) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (syncStatus.status === 'syncing') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    if (syncStatus.status === 'success') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (syncStatus.status === 'error') return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  return (
    <>
      {children}
      
      {/* Synchronisation automatique invisible - aucun indicateur visible */}
    </>
  );
};

export default AutoSyncManager;
