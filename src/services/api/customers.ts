/**
 * Service API pour les clients
 */
import { apiSlice } from '../../store/api/apiSlice';

export interface Customer {
  id: string;
  code_client: string;
  type_client: string;
  nom: string;
  prenom?: string;
  entreprise_nom?: string;
  email: string;
  telephone: string;
  telephone_secondaire?: string;
  adresse_facturation: string;
  adresse_livraison?: string;
  date_creation: string;
  date_derniere_commande?: string;
  total_achats: number;
  nombre_commandes: number;
  panier_moyen: number;
  segment: string;
  score_fidelite: number;
  source_acquisition?: string;
  statut: string;
  notes?: string;
  preferences: any;
  points_fidelite: number;
  niveau_fidelite: string;
}

export interface CustomerInteraction {
  id: string;
  client: string;
  type_interaction: string;
  sujet: string;
  description: string;
  utilisateur: string;
  duree_minutes?: number;
  action_requise: boolean;
  date_action_prevue?: string;
  action_terminee: boolean;
  date_creation: string;
}

export interface MarketingCampaign {
  id: string;
  nom: string;
  description: string;
  type_campagne: string;
  sujet: string;
  contenu: string;
  contenu_html?: string;
  segment_cible: string;
  criteres_ciblage: any;
  date_envoi_prevue: string;
  date_envoi_reelle?: string;
  statut: string;
  nombre_destinataires: number;
  nombre_envoyes: number;
  nombre_ouverts: number;
  nombre_clics: number;
  nombre_conversions: number;
  taux_ouverture: number;
  taux_clic: number;
  taux_conversion: number;
}

export const customersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Clients
    getCustomers: builder.query<{ results: Customer[]; pagination: any }, any>({
      query: (params = {}) => ({
        url: 'customers/clients/',
        params,
      }),
      providesTags: ['Customer'],
    }),
    getCustomer: builder.query<Customer, string>({
      query: (id) => `customers/clients/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Customer', id }],
    }),
    createCustomer: builder.mutation<Customer, Partial<Customer>>({
      query: (customer) => ({
        url: 'customers/clients/',
        method: 'POST',
        body: customer,
      }),
      invalidatesTags: ['Customer'],
    }),
    updateCustomer: builder.mutation<Customer, { id: string } & Partial<Customer>>({
      query: ({ id, ...customer }) => ({
        url: `customers/clients/${id}/`,
        method: 'PUT',
        body: customer,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Customer', id }],
    }),
    deleteCustomer: builder.mutation<void, string>({
      query: (id) => ({
        url: `customers/clients/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Customer'],
    }),
    
    // Actions clients
    addLoyaltyPoints: builder.mutation<{ points: number }, { id: string; points: number }>({
      query: ({ id, points }) => ({
        url: `customers/clients/${id}/add_loyalty_points/`,
        method: 'POST',
        body: { points },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Customer', id }],
    }),
    
    // Interactions
    getCustomerInteractions: builder.query<CustomerInteraction[], string>({
      query: (customerId) => `customers/clients/${customerId}/interactions/`,
      providesTags: ['CustomerInteraction'],
    }),
    createCustomerInteraction: builder.mutation<CustomerInteraction, Partial<CustomerInteraction>>({
      query: (interaction) => ({
        url: 'customers/interactions/',
        method: 'POST',
        body: interaction,
      }),
      invalidatesTags: ['CustomerInteraction'],
    }),
    
    // Campagnes marketing
    getMarketingCampaigns: builder.query<{ results: MarketingCampaign[]; pagination: any }, any>({
      query: (params = {}) => ({
        url: 'customers/campagnes/',
        params,
      }),
      providesTags: ['MarketingCampaign'],
    }),
    createMarketingCampaign: builder.mutation<MarketingCampaign, Partial<MarketingCampaign>>({
      query: (campaign) => ({
        url: 'customers/campagnes/',
        method: 'POST',
        body: campaign,
      }),
      invalidatesTags: ['MarketingCampaign'],
    }),
    launchCampaign: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `customers/campagnes/${id}/launch/`,
        method: 'POST',
      }),
      invalidatesTags: ['MarketingCampaign'],
    }),
    
    // Segmentation
    getCustomerSegments: builder.query<any, void>({
      query: () => 'customers/segments/',
    }),
    segmentCustomers: builder.mutation<any, { criteria: any }>({
      query: (data) => ({
        url: 'customers/segment/',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useAddLoyaltyPointsMutation,
  useGetCustomerInteractionsQuery,
  useCreateCustomerInteractionMutation,
  useGetMarketingCampaignsQuery,
  useCreateMarketingCampaignMutation,
  useLaunchCampaignMutation,
  useGetCustomerSegmentsQuery,
  useSegmentCustomersMutation,
} = customersApi;