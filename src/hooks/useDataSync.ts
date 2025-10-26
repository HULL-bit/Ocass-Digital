import { useState, useEffect } from 'react';
import dataSyncService, { SyncStatus, ProductData, CompanyData } from '../services/sync/DataSyncService';

export interface UseDataSyncReturn {
  syncStatus: SyncStatus;
  products: ProductData[];
  companies: CompanyData[];
  isLoading: boolean;
  error: string | null;
  syncData: () => Promise<void>;
  forceSync: () => Promise<void>;
}

export const useDataSync = (): UseDataSyncReturn => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(dataSyncService.getSyncStatus());
  const [products, setProducts] = useState<ProductData[]>([]);
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 Initialisation du hook de synchronisation automatique...');
    
    // Écouter les changements de statut de synchronisation
    const handleSyncStatusChange = (status: SyncStatus) => {
      setSyncStatus(status);
      if (status.error) {
        setError(status.error);
      } else {
        setError(null);
      }
    };

    dataSyncService.addListener(handleSyncStatusChange);

    // Écouter les événements de synchronisation
    const handleDataSynced = (event: CustomEvent) => {
      console.log('🔄 Données synchronisées automatiquement:', event.detail);
      loadCachedData();
    };

    window.addEventListener('dataSynced', handleDataSynced as EventListener);

    // Charger les données en cache au démarrage
    loadCachedData();

    // Vérifier la cohérence des données
    checkDataConsistency();

    // Déclencher la synchronisation automatique
    const autoSyncInterval = setInterval(() => {
      console.log('🔄 Synchronisation automatique via hook...');
      syncData();
    }, 3 * 60 * 1000); // Toutes les 3 minutes

    return () => {
      dataSyncService.removeListener(handleSyncStatusChange);
      window.removeEventListener('dataSynced', handleDataSynced as EventListener);
      clearInterval(autoSyncInterval);
    };
  }, []);

  const loadCachedData = () => {
    try {
      const cachedProducts = dataSyncService.getCachedProducts();
      const cachedCompanies = dataSyncService.getCachedCompanies();
      
      setProducts(cachedProducts);
      setCompanies(cachedCompanies);
      
      console.log('Données en cache chargées:', {
        products: cachedProducts.length,
        companies: cachedCompanies.length
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données en cache:', error);
      setError('Erreur lors du chargement des données');
    }
  };

  const checkDataConsistency = async () => {
    try {
      const isConsistent = await dataSyncService.checkDataConsistency();
      if (!isConsistent) {
        console.log('Données incohérentes, synchronisation nécessaire');
        await syncData();
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de cohérence:', error);
    }
  };

  const syncData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await dataSyncService.syncData();
      loadCachedData();
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      setError(error instanceof Error ? error.message : 'Erreur de synchronisation');
    } finally {
      setIsLoading(false);
    }
  };

  const forceSync = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await dataSyncService.forceSync();
      loadCachedData();
    } catch (error) {
      console.error('Erreur lors de la synchronisation forcée:', error);
      setError(error instanceof Error ? error.message : 'Erreur de synchronisation forcée');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    syncStatus,
    products,
    companies,
    isLoading,
    error,
    syncData,
    forceSync
  };
};

export default useDataSync;
