import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Product', 'Sale', 'Customer', 'Project', 'User', 'Company'],
  endpoints: (builder) => ({
    // Products
    getProducts: builder.query({
      query: (params) => ({
        url: 'products/',
        params,
      }),
      providesTags: ['Product'],
    }),
    createProduct: builder.mutation({
      query: (product) => ({
        url: 'products/',
        method: 'POST',
        body: product,
      }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...product }) => ({
        url: `products/${id}/`,
        method: 'PUT',
        body: product,
      }),
      invalidatesTags: ['Product'],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `products/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
    
    // Sales
    getSales: builder.query({
      query: (params) => ({
        url: 'sales/',
        params,
      }),
      providesTags: ['Sale'],
    }),
    createSale: builder.mutation({
      query: (sale) => ({
        url: 'sales/',
        method: 'POST',
        body: sale,
      }),
      invalidatesTags: ['Sale', 'Product'],
    }),
    
    // Customers
    getCustomers: builder.query({
      query: (params) => ({
        url: 'customers/',
        params,
      }),
      providesTags: ['Customer'],
    }),
    createCustomer: builder.mutation({
      query: (customer) => ({
        url: 'customers/',
        method: 'POST',
        body: customer,
      }),
      invalidatesTags: ['Customer'],
    }),
    
    // Analytics
    getDashboardMetrics: builder.query({
      query: (period = 'today') => ({
        url: `analytics/dashboard/?period=${period}`,
      }),
      keepUnusedDataFor: 300, // 5 minutes cache
    }),
    getSalesAnalytics: builder.query({
      query: (params) => ({
        url: 'analytics/sales/',
        params,
      }),
    }),
    getInventoryAnalytics: builder.query({
      query: (params) => ({
        url: 'analytics/inventory/',
        params,
      }),
    }),
    
    // Projects
    getProjects: builder.query({
      query: (params) => ({
        url: 'projects/',
        params,
      }),
      providesTags: ['Project'],
    }),
    createProject: builder.mutation({
      query: (project) => ({
        url: 'projects/',
        method: 'POST',
        body: project,
      }),
      invalidatesTags: ['Project'],
    }),
    
    // Users (Admin)
    getUsers: builder.query({
      query: (params) => ({
        url: 'users/',
        params,
      }),
      providesTags: ['User'],
    }),
    
    // Companies (Admin)
    getCompanies: builder.query({
      query: (params) => ({
        url: 'companies/',
        params,
      }),
      providesTags: ['Company'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetSalesQuery,
  useCreateSaleMutation,
  useGetCustomersQuery,
  useCreateCustomerMutation,
  useGetDashboardMetricsQuery,
  useGetSalesAnalyticsQuery,
  useGetInventoryAnalyticsQuery,
  useGetProjectsQuery,
  useCreateProjectMutation,
  useGetUsersQuery,
  useGetCompaniesQuery,
} = apiSlice;