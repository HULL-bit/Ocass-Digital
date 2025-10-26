import { useState, useEffect, useCallback } from 'react';
import dashboardApiService from '../services/api/dashboardApi';

export interface DashboardMetrics {
  totalUsers: number;
  totalCompanies: number;
  totalProducts: number;
  totalRevenue: number;
  activeUsers: number;
  newUsersThisMonth: number;
  newCompaniesThisMonth: number;
  usersGrowthPercentage: number;
  companiesGrowthPercentage: number;
  revenueGrowthPercentage: number;
  platformGrowth: Array<{
    name: string;
    users: number;
    companies: number;
    revenue: number;
  }>;
  sectorDistribution: Array<{
    name: string;
    value: number;
    color: string;
    companies: number;
  }>;
  recentActivities: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
    icon: any;
    color: string;
  }>;
  topCompanies: Array<{
    name: string;
    revenue: number;
    growth: number;
    users: number;
  }>;
  systemHealth: Array<{
    service: string;
    status: string;
    uptime: string;
    responseTime: string;
  }>;
}

export interface UseDashboardMetricsReturn {
  metrics: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
  refetch: (period?: string) => Promise<void>;
}

/**
 * Hook personnalisé pour gérer les métriques du dashboard
 * Garantit la cohérence des données et évite les variations aléatoires
 */
export const useDashboardMetrics = (userRole?: string): UseDashboardMetricsReturn => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async (period: string = 'today') => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`📊 Chargement des métriques pour la période: ${period}`);
      const data = await dashboardApiService.getDashboardMetrics(userRole, period);
      console.log('📊 Données reçues:', data);
      setMetrics(data as DashboardMetrics);
    } catch (err: any) {
      console.error('Erreur lors du chargement des métriques:', err);
      setError(err.message || 'Erreur lors du chargement des métriques');
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    fetchMetrics('today');
    
    // Désactiver le rechargement automatique pour stabiliser les données
    // const interval = setInterval(() => {
    //   fetchMetrics('today');
    // }, 10 * 60 * 1000);
    
    // return () => clearInterval(interval);
  }, [userRole]); // Supprimer fetchMetrics de la dépendance

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics
  };
};

export default useDashboardMetrics;
