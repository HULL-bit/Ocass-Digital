/**
 * Service API pour les ventes
 */
import { apiSlice } from '../../store/api/apiSlice';

export interface Sale {
  id: string;
  numero_facture: string;
  numero_commande?: string;
  client: {
    id: string;
    nom: string;
    email: string;
  };
  entrepreneur: string;
  vendeur?: string;
  date_creation: string;
  date_livraison_prevue?: string;
  date_livraison_reelle?: string;
  statut: string;
  sous_total: number;
  taxe_montant: number;
  remise_montant: number;
  frais_livraison: number;
  total_ttc: number;
  mode_paiement: string;
  statut_paiement: string;
  date_paiement?: string;
  reference_paiement?: string;
  notes?: string;
  signature_client?: string;
  adresse_livraison?: string;
  transporteur?: string;
  numero_suivi?: string;
  source_vente: string;
  lignes: SaleLine[];
}

export interface SaleLine {
  id: string;
  produit: {
    id: string;
    nom: string;
    sku: string;
    prix_vente: number;
  };
  variante?: any;
  quantite: number;
  prix_unitaire: number;
  remise_pourcentage: number;
  tva_taux: number;
  total_ht: number;
  total_tva: number;
  total_ttc: number;
  notes?: string;
}

export interface Quote {
  id: string;
  numero_devis: string;
  client: any;
  entrepreneur: string;
  date_creation: string;
  date_validite: string;
  date_acceptation?: string;
  statut: string;
  sous_total: number;
  taxe_montant: number;
  remise_montant: number;
  total_ttc: number;
  vente_associee?: string;
  notes?: string;
  conditions_particulieres?: string;
  lignes: any[];
}

export const salesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Ventes
    getSales: builder.query<{ results: Sale[]; pagination: any }, any>({
      query: (params = {}) => ({
        url: 'sales/ventes/',
        params,
      }),
      providesTags: ['Sale'],
    }),
    getSale: builder.query<Sale, string>({
      query: (id) => `sales/ventes/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Sale', id }],
    }),
    createSale: builder.mutation<Sale, Partial<Sale>>({
      query: (sale) => ({
        url: 'sales/ventes/',
        method: 'POST',
        body: sale,
      }),
      invalidatesTags: ['Sale', 'Product'],
    }),
    updateSale: builder.mutation<Sale, { id: string } & Partial<Sale>>({
      query: ({ id, ...sale }) => ({
        url: `sales/ventes/${id}/`,
        method: 'PUT',
        body: sale,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Sale', id }],
    }),
    deleteSale: builder.mutation<void, string>({
      query: (id) => ({
        url: `sales/ventes/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Sale'],
    }),
    
    // Actions spéciales
    confirmSale: builder.mutation<Sale, string>({
      query: (id) => ({
        url: `sales/ventes/${id}/confirm/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Sale', id }],
    }),
    cancelSale: builder.mutation<Sale, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `sales/ventes/${id}/cancel/`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Sale', id }],
    }),
    printInvoice: builder.mutation<{ pdf_url: string }, string>({
      query: (id) => ({
        url: `sales/ventes/${id}/print_invoice/`,
        method: 'POST',
      }),
    }),
    
    // Devis
    getQuotes: builder.query<{ results: Quote[]; pagination: any }, any>({
      query: (params = {}) => ({
        url: 'sales/devis/',
        params,
      }),
      providesTags: ['Quote'],
    }),
    createQuote: builder.mutation<Quote, Partial<Quote>>({
      query: (quote) => ({
        url: 'sales/devis/',
        method: 'POST',
        body: quote,
      }),
      invalidatesTags: ['Quote'],
    }),
    convertQuoteToSale: builder.mutation<Sale, string>({
      query: (id) => ({
        url: `sales/devis/${id}/convert_to_sale/`,
        method: 'POST',
      }),
      invalidatesTags: ['Quote', 'Sale'],
    }),
    
    // Analytics ventes
    getSalesAnalytics: builder.query<any, { period?: string; entrepreneur_id?: string }>({
      query: (params) => ({
        url: 'analytics/sales/',
        params,
      }),
    }),
    getSalesMetrics: builder.query<any, { period?: string }>({
      query: (params) => ({
        url: 'analytics/dashboard/',
        params,
      }),
      keepUnusedDataFor: 60, // Cache 1 minute
    }),
  }),
});

export const {
  useGetSalesQuery,
  useGetSaleQuery,
  useCreateSaleMutation,
  useUpdateSaleMutation,
  useDeleteSaleMutation,
  useConfirmSaleMutation,
  useCancelSaleMutation,
  usePrintInvoiceMutation,
  useGetQuotesQuery,
  useCreateQuoteMutation,
  useConvertQuoteToSaleMutation,
  useGetSalesAnalyticsQuery,
  useGetSalesMetricsQuery,
} = salesApi;