/**
 * Hook personnalisé pour les appels API avec gestion d'erreurs
 */
import { useState, useCallback } from 'react';
import apiService from '../services/api/realApi';
import { useNotifications } from '../contexts/NotificationContext';

interface UseApiOptions {
  showSuccessNotification?: boolean;
  showErrorNotification?: boolean;
  successMessage?: string;
}

export const useApi = (options: UseApiOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  const {
    showSuccessNotification = false,
    showErrorNotification = true,
    successMessage = 'Opération réussie',
  } = options;

  const execute = useCallback(async (apiCall: () => Promise<any>) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      
      if (showSuccessNotification) {
        addNotification({
          type: 'success',
          title: 'Succès',
          message: successMessage,
        });
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      
      if (showErrorNotification) {
        addNotification({
          type: 'error',
          title: 'Erreur',
          message: errorMessage,
        });
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addNotification, showSuccessNotification, showErrorNotification, successMessage]);

  // Méthodes spécifiques
  const login = useCallback((email: string, password: string, role: string) => {
    return execute(() => apiService.login(email, password, role));
  }, [execute]);

  const register = useCallback((userData: any) => {
    return execute(() => apiService.register(userData));
  }, [execute]);

  const getProducts = useCallback((params?: any) => {
    return execute(() => apiService.getProducts(params));
  }, [execute]);

  const createProduct = useCallback((productData: any) => {
    return execute(() => apiService.createProduct(productData));
  }, [execute]);

  const updateProduct = useCallback((id: string, updates: any) => {
    return execute(() => apiService.updateProduct(id, updates));
  }, [execute]);

  const deleteProduct = useCallback((id: string) => {
    return execute(() => apiService.deleteProduct(id));
  }, [execute]);

  const getCustomers = useCallback((params?: any) => {
    return execute(() => apiService.getCustomers(params));
  }, [execute]);

  const createCustomer = useCallback((customerData: any) => {
    return execute(() => apiService.createCustomer(customerData));
  }, [execute]);

  const getSales = useCallback((params?: any) => {
    return execute(() => apiService.getSales(params));
  }, [execute]);

  const createSale = useCallback((saleData: any) => {
    return execute(() => apiService.createSale(saleData));
  }, [execute]);

  const getDashboardMetrics = useCallback((params?: any) => {
    return execute(() => apiService.getDashboardMetrics(params));
  }, [execute]);

  const getSalesAnalytics = useCallback((params?: any) => {
    return execute(() => apiService.getSalesAnalytics(params));
  }, [execute]);

  const getNotifications = useCallback(() => {
    return execute(() => apiService.getNotifications());
  }, [execute]);

  const uploadFile = useCallback((file: File) => {
    return execute(() => apiService.uploadFile(file));
  }, [execute]);

  const processPayment = useCallback((paymentData: any) => {
    return execute(() => apiService.processPayment(paymentData));
  }, [execute]);

  return {
    loading,
    error,
    clearError: () => setError(null),
    
    // Auth methods
    login,
    register,
    
    // Product methods
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    
    // Customer methods
    getCustomers,
    createCustomer,
    
    // Sales methods
    getSales,
    createSale,
    
    // Analytics methods
    getDashboardMetrics,
    getSalesAnalytics,
    
    // Notification methods
    getNotifications,
    
    // File methods
    uploadFile,
    
    // Payment methods
    processPayment,
  };
};