/**
 * Hook pour analytics et métriques avec vraies APIs
 */
import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import apiService from '../services/api/realApi';

export interface AnalyticsConfig {
  period?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useAnalytics = (config: AnalyticsConfig = {}) => {
  const { period = 'month', autoRefresh = false, refreshInterval = 30000 } = config;
  const user = useSelector((state: RootState) => state.auth.user);
  
  // États pour les données API
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);
  const [salesAnalytics, setSalesAnalytics] = useState<any>(null);
  const [inventoryAnalytics, setInventoryAnalytics] = useState<any>(null);
  const [customerAnalytics, setCustomerAnalytics] = useState<any>(null);
  
  // États de chargement
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [salesLoading, setSalesLoading] = useState(false);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [customerLoading, setCustomerLoading] = useState(false);
  
  // États d'erreur
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [salesError, setSalesError] = useState<string | null>(null);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [customerError, setCustomerError] = useState<string | null>(null);

  // Données mock en fallback
  const mockDashboardMetrics = {
    ventes_jour: 125000,
    clients_actifs: 45,
    produits_stock: 156,
    commandes_attente: 8,
    croissance_ventes: 12.5,
    taux_conversion: 3.2,
    panier_moyen: 8500,
    marge_moyenne: 18.5
  };
  
  const mockSalesAnalytics = {
    total_ventes: 1250000,
    commandes_traitees: 45,
    nouveaux_clients: 12,
    ventes_par_jour: [
      { date: '2024-01-01', ventes: 45000 },
      { date: '2024-01-02', ventes: 52000 },
      { date: '2024-01-03', ventes: 48000 },
      { date: '2024-01-04', ventes: 61000 },
      { date: '2024-01-05', ventes: 55000 },
    ],
    ventes_par_categorie: [
      { categorie: 'Électronique', ventes: 125000, pourcentage: 35 },
      { categorie: 'Vêtements', ventes: 98000, pourcentage: 28 },
      { categorie: 'Maison', ventes: 75000, pourcentage: 21 },
      { categorie: 'Sport', ventes: 58000, pourcentage: 16 },
    ],
    top_produits: [
      { nom: 'Smartphone Samsung', ventes: 45, revenus: 225000 },
      { nom: 'Laptop HP', ventes: 23, revenus: 184000 },
      { nom: 'AirPods', ventes: 67, revenus: 134000 },
    ]
  };
  
  const mockInventoryAnalytics = {
    valeur_stock_total: 2500000,
    produits_rupture: 3,
    produits_stock_bas: 8,
    rotation_stock: 4.2,
    stock_total: 1247,
    stock_critique: 23,
    produits_populaires: [
      { nom: 'Smartphone Samsung', stock: 45, ventes_mois: 67 },
      { nom: 'Laptop HP', stock: 12, ventes_mois: 23 },
      { nom: 'AirPods', stock: 89, ventes_mois: 45 },
    ],
    valeur_stock: 12500000
  };
  
  const mockCustomerAnalytics = {
    clients_totaux: 1247,
    nouveaux_clients: 45,
    clients_actifs: 892,
    panier_moyen: 8500,
    taux_fidelite: 78.5,
    segments: [
      { nom: 'VIP', nombre: 45, pourcentage: 3.6 },
      { nom: 'Fidèles', nombre: 234, pourcentage: 18.8 },
      { nom: 'Occasionnels', nombre: 567, pourcentage: 45.5 },
      { nom: 'Nouveaux', nombre: 401, pourcentage: 32.1 },
    ]
  };

  // Fonctions de chargement des données
  const loadDashboardMetrics = useCallback(async () => {
    setDashboardLoading(true);
    setDashboardError(null);
    try {
      const data = await apiService.getDashboardMetrics({ period });
      setDashboardMetrics(data);
    } catch (error: any) {
      console.error('Erreur dashboard metrics:', error);
      setDashboardError(error.message || 'Erreur lors du chargement des métriques');
      // Utiliser les données mock en cas d'erreur
      setDashboardMetrics(mockDashboardMetrics);
    } finally {
      setDashboardLoading(false);
    }
  }, [period]);

  const loadSalesAnalytics = useCallback(async () => {
    setSalesLoading(true);
    setSalesError(null);
    try {
      const data = await apiService.getSalesAnalytics({ period });
      setSalesAnalytics(data);
    } catch (error: any) {
      console.error('Erreur sales analytics:', error);
      setSalesError(error.message || 'Erreur lors du chargement des analytics de ventes');
      // Utiliser les données mock en cas d'erreur
      setSalesAnalytics(mockSalesAnalytics);
    } finally {
      setSalesLoading(false);
    }
  }, [period]);

  const loadInventoryAnalytics = useCallback(async () => {
    setInventoryLoading(true);
    setInventoryError(null);
    try {
      const data = await apiService.getInventoryAnalytics({ period });
      setInventoryAnalytics(data);
    } catch (error: any) {
      console.error('Erreur inventory analytics:', error);
      setInventoryError(error.message || 'Erreur lors du chargement des analytics d\'inventaire');
      // Utiliser les données mock en cas d'erreur
      setInventoryAnalytics(mockInventoryAnalytics);
    } finally {
      setInventoryLoading(false);
    }
  }, [period]);

  const loadCustomerAnalytics = useCallback(async () => {
    setCustomerLoading(true);
    setCustomerError(null);
    try {
      const data = await apiService.getCustomerAnalytics({ period });
      setCustomerAnalytics(data);
    } catch (error: any) {
      console.error('Erreur customer analytics:', error);
      setCustomerError(error.message || 'Erreur lors du chargement des analytics clients');
      // Utiliser les données mock en cas d'erreur
      setCustomerAnalytics(mockCustomerAnalytics);
    } finally {
      setCustomerLoading(false);
    }
  }, [period]);

  // Charger toutes les données au montage
  useEffect(() => {
    loadDashboardMetrics();
    loadSalesAnalytics();
    loadInventoryAnalytics();
    loadCustomerAnalytics();
  }, [loadDashboardMetrics, loadSalesAnalytics, loadInventoryAnalytics, loadCustomerAnalytics]);

  // Auto-refresh si activé
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadDashboardMetrics();
      loadSalesAnalytics();
      loadInventoryAnalytics();
      loadCustomerAnalytics();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadDashboardMetrics, loadSalesAnalytics, loadInventoryAnalytics, loadCustomerAnalytics]);

  // Fonctions de refetch
  const refetchDashboard = useCallback(() => loadDashboardMetrics(), [loadDashboardMetrics]);
  const refetchSales = useCallback(() => loadSalesAnalytics(), [loadSalesAnalytics]);
  const refetchInventory = useCallback(() => loadInventoryAnalytics(), [loadInventoryAnalytics]);
  const refetchCustomers = useCallback(() => loadCustomerAnalytics(), [loadCustomerAnalytics]);

  return {
    // Données
    dashboardMetrics: dashboardMetrics || mockDashboardMetrics,
    salesAnalytics: salesAnalytics || mockSalesAnalytics,
    inventoryAnalytics: inventoryAnalytics || mockInventoryAnalytics,
    customerAnalytics: customerAnalytics || mockCustomerAnalytics,
    
    // États de chargement
    dashboardLoading,
    salesLoading,
    inventoryLoading,
    customerLoading,
    
    // États d'erreur
    dashboardError,
    salesError,
    inventoryError,
    customerError,
    
    // Fonctions de refetch
    refetchDashboard,
    refetchSales,
    refetchInventory,
    refetchCustomers,
    
    // Fonctions utilitaires
    refreshAll: () => {
      loadDashboardMetrics();
      loadSalesAnalytics();
      loadInventoryAnalytics();
      loadCustomerAnalytics();
    },
    
    // Configuration
    period,
    user,
  };
};