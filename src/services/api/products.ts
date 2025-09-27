/**
 * Service API pour les produits
 */
import { apiSlice } from '../../store/api/apiSlice';

export interface Product {
  id: string;
  nom: string;
  description_courte: string;
  description_longue: string;
  categorie: string;
  categorie_nom: string;
  marque?: string;
  marque_nom?: string;
  sku: string;
  code_barre?: string;
  qr_code?: string;
  prix_achat: number;
  prix_vente: number;
  prix_promotion?: number;
  marge_beneficiaire: number;
  prix_ttc: number;
  tva_taux: number;
  unite_mesure: string;
  poids?: number;
  dimensions: any;
  couleurs_disponibles: string[];
  tailles_disponibles: string[];
  stock_minimum: number;
  stock_maximum: number;
  point_recommande: number;
  date_peremption?: string;
  duree_conservation?: number;
  statut: string;
  popularite_score: number;
  nombre_vues: number;
  nombre_ventes: number;
  slug: string;
  en_promotion: boolean;
  date_debut_promotion?: string;
  date_fin_promotion?: string;
  vendable: boolean;
  achetable: boolean;
  visible_catalogue: boolean;
  stock_actuel: number;
  stock_disponible: number;
  en_rupture: boolean;
  stock_bas: boolean;
  images: any[];
  variantes: any[];
}

export interface Category {
  id: string;
  nom: string;
  description: string;
  slug: string;
  parent?: string;
  image?: string;
  icone?: string;
  couleur: string;
  ordre_affichage: number;
  visible: boolean;
  niveau: number;
}

export interface Supplier {
  id: string;
  nom: string;
  contact_nom: string;
  contact_fonction?: string;
  email: string;
  telephone: string;
  telephone_secondaire?: string;
  conditions_paiement: string;
  delai_livraison: number;
  montant_minimum_commande: number;
  evaluation: number;
  nombre_evaluations: number;
  statut: string;
  nombre_commandes: number;
  montant_total_commandes: number;
}

export const productsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Produits
    getProducts: builder.query<{ results: Product[]; pagination: any }, any>({
      query: (params = {}) => ({
        url: 'products/products/',
        params,
      }),
      providesTags: ['Product'],
    }),
    getProduct: builder.query<Product, string>({
      query: (id) => `products/products/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    createProduct: builder.mutation<Product, Partial<Product>>({
      query: (product) => ({
        url: 'products/products/',
        method: 'POST',
        body: product,
      }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation<Product, { id: string } & Partial<Product>>({
      query: ({ id, ...product }) => ({
        url: `products/products/${id}/`,
        method: 'PUT',
        body: product,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Product', id }],
    }),
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({
        url: `products/products/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
    incrementProductViews: builder.mutation<{ views: number }, string>({
      query: (id) => ({
        url: `products/products/${id}/increment_views/`,
        method: 'POST',
      }),
    }),
    getLowStockProducts: builder.query<Product[], void>({
      query: () => 'products/products/low_stock/',
      providesTags: ['Product'],
    }),
    getPopularProducts: builder.query<Product[], void>({
      query: () => 'products/products/popular/',
      providesTags: ['Product'],
    }),
    
    // Catégories
    getCategories: builder.query<Category[], void>({
      query: () => 'products/categories/',
      providesTags: ['Category'],
    }),
    createCategory: builder.mutation<Category, Partial<Category>>({
      query: (category) => ({
        url: 'products/categories/',
        method: 'POST',
        body: category,
      }),
      invalidatesTags: ['Category'],
    }),
    
    // Fournisseurs
    getSuppliers: builder.query<{ results: Supplier[]; pagination: any }, any>({
      query: (params = {}) => ({
        url: 'products/fournisseurs/',
        params,
      }),
      providesTags: ['Supplier'],
    }),
    createSupplier: builder.mutation<Supplier, Partial<Supplier>>({
      query: (supplier) => ({
        url: 'products/fournisseurs/',
        method: 'POST',
        body: supplier,
      }),
      invalidatesTags: ['Supplier'],
    }),
    
    // Bundles
    getBundles: builder.query<any[], void>({
      query: () => 'products/bundles/',
      providesTags: ['Bundle'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useIncrementProductViewsMutation,
  useGetLowStockProductsQuery,
  useGetPopularProductsQuery,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useGetBundlesQuery,
} = productsApi;