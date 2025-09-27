/**
 * Service API pour les analytics
 */
import { apiSlice } from '../../store/api/apiSlice';

export interface DashboardMetrics {
  ventes_jour: number;
  ventes_semaine: number;
  ventes_mois: number;
  clients_actifs: number;
  produits_stock: number;
  commandes_attente: number;
  marge_moyenne: number;
  taux_conversion: number;
  panier_moyen: number;
  croissance_ventes: number;
}

export interface SalesAnalytics {
  periode: string;
  ventes_totales: number;
  nombre_transactions: number;
  panier_moyen: number;
  produits_top: any[];
  ventes_par_jour: any[];
  ventes_par_categorie: any[];
  performance_vendeurs: any[];
}

export interface InventoryAnalytics {
  valeur_stock_total: number;
  nombre_produits: number;
  produits_rupture: number;
  produits_stock_bas: number;
  rotation_stock: number;
  produits_lents: any[];
  analyse_abc: any[];
  mouvements_recents: any[];
}

export interface CustomerAnalytics {
  nombre_clients_total: number;
  nouveaux_clients: number;
  clients_actifs: number;
  clients_inactifs: number;
  valeur_vie_client: number;
  taux_retention: number;
  segments_clients: any[];
  acquisition_sources: any[];
}

export interface CustomReport {
  id: string;
  nom: string;
  description?: string;
  type_rapport: string;
  configuration: any;
  frequence: string;
  planification: any;
  derniere_execution?: string;
  prochaine_execution?: string;
  actif: boolean;
}

export const analyticsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Dashboard métriques
    getDashboardMetrics: builder.query<DashboardMetrics, { period?: string; entrepreneur_id?: string }>({
      query: (params = {}) => ({
        url: 'analytics/dashboard/',
        params,
      }),
      keepUnusedDataFor: 60, // Cache 1 minute
    }),
    
    // Analytics ventes
    getSalesAnalytics: builder.query<SalesAnalytics, { period?: string; start_date?: string; end_date?: string }>({
      query: (params = {}) => ({
        url: 'analytics/sales/',
        params,
      }),
    }),
    getSalesTrends: builder.query<any[], { period?: string }>({
      query: (params = {}) => ({
        url: 'analytics/sales/trends/',
        params,
      }),
    }),
    getSalesForecasting: builder.query<any, { days?: number }>({
      query: (params = {}) => ({
        url: 'analytics/sales/forecasting/',
        params,
      }),
    }),
    
    // Analytics inventaire
    getInventoryAnalytics: builder.query<InventoryAnalytics, { entrepreneur_id?: string }>({
      query: (params = {}) => ({
        url: 'analytics/inventory/',
        params,
      }),
    }),
    getABCAnalysis: builder.query<any[], void>({
      query: () => 'analytics/inventory/abc_analysis/',
    }),
    getSlowMovingItems: builder.query<any[], { days?: number }>({
      query: (params = {}) => ({
        url: 'analytics/inventory/slow_moving/',
        params,
      }),
    }),
    
    // Analytics clients
    getCustomerAnalytics: builder.query<CustomerAnalytics, { entrepreneur_id?: string }>({
      query: (params = {}) => ({
        url: 'analytics/customers/',
        params,
      }),
    }),
    getCustomerLifetimeValue: builder.query<any[], void>({
      query: () => 'analytics/customers/lifetime_value/',
    }),
    getChurnPrediction: builder.query<any[], void>({
      query: () => 'analytics/customers/churn_prediction/',
    }),
    
    // Analytics financiers
    getFinancialAnalytics: builder.query<any, { period?: string }>({
      query: (params = {}) => ({
        url: 'analytics/financial/',
        params,
      }),
    }),
    getProfitabilityAnalysis: builder.query<any[], { period?: string }>({
      query: (params = {}) => ({
        url: 'analytics/financial/profitability/',
        params,
      }),
    }),
    getCashFlowAnalysis: builder.query<any, { period?: string }>({
      query: (params = {}) => ({
        url: 'analytics/financial/cash_flow/',
        params,
      }),
    }),
    
    // Rapports personnalisés
    getCustomReports: builder.query<{ results: CustomReport[]; pagination: any }, any>({
      query: (params = {}) => ({
        url: 'analytics/reports/',
        params,
      }),
      providesTags: ['CustomReport'],
    }),
    createCustomReport: builder.mutation<CustomReport, Partial<CustomReport>>({
      query: (report) => ({
        url: 'analytics/reports/',
        method: 'POST',
        body: report,
      }),
      invalidatesTags: ['CustomReport'],
    }),
    executeReport: builder.mutation<{ execution_id: string }, string>({
      query: (id) => ({
        url: `analytics/reports/${id}/execute/`,
        method: 'POST',
      }),
    }),
    downloadReport: builder.query<{ download_url: string }, { id: string; format: string }>({
      query: ({ id, format }) => ({
        url: `analytics/reports/${id}/download/`,
        params: { format },
      }),
    }),
    
    // Comparaisons et benchmarks
    getBenchmarkData: builder.query<any, { sector?: string; size?: string }>({
      query: (params = {}) => ({
        url: 'analytics/benchmark/',
        params,
      }),
    }),
    getCompetitorAnalysis: builder.query<any[], void>({
      query: () => 'analytics/competitors/',
    }),
    
    // Alertes intelligentes
    getSmartAlerts: builder.query<any[], void>({
      query: () => 'analytics/alerts/',
      keepUnusedDataFor: 30,
    }),
    createAlert: builder.mutation<any, { type: string; conditions: any; actions: any }>({
      query: (alert) => ({
        url: 'analytics/alerts/',
        method: 'POST',
        body: alert,
      }),
    }),
  }),
});

export const {
  useGetDashboardMetricsQuery,
  useGetSalesAnalyticsQuery,
  useGetSalesTrendsQuery,
  useGetSalesForecastingQuery,
  useGetInventoryAnalyticsQuery,
  useGetABCAnalysisQuery,
  useGetSlowMovingItemsQuery,
  useGetCustomerAnalyticsQuery,
  useGetCustomerLifetimeValueQuery,
  useGetChurnPredictionQuery,
  useGetFinancialAnalyticsQuery,
  useGetProfitabilityAnalysisQuery,
  useGetCashFlowAnalysisQuery,
  useGetCustomReportsQuery,
  useCreateCustomReportMutation,
  useExecuteReportMutation,
  useDownloadReportQuery,
  useGetBenchmarkDataQuery,
  useGetCompetitorAnalysisQuery,
  useGetSmartAlertsQuery,
  useCreateAlertMutation,
} = analyticsApi;