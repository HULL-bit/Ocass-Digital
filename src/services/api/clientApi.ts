/**
 * Service API pour l'interface client
 */

import apiService from './realApi';

export interface ClientMetrics {
  totalProducts: number;
  totalStores: number;
  totalOrders: number;
  totalWishlistItems: number;
  recentOrders: Array<{
    id: string;
    status: string;
    total: number;
    date: string;
    items: number;
  }>;
  favoriteStores: Array<{
    id: string;
    name: string;
    rating: number;
    products: number;
  }>;
  wishlistItems: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
    store: string;
  }>;
}

class ClientApiService {
  /**
   * Récupère les métriques du client
   */
  async getClientMetrics(): Promise<ClientMetrics> {
    try {
      // Récupérer les données de base
      const [products, companies, orders] = await Promise.all([
        this.getProductsData(),
        this.getStoresData(),
        this.getOrdersData()
      ]);

      // Calculer les métriques
      const totalProducts = products.length;
      const totalStores = companies.length;
      const totalOrders = orders.length;
      const totalWishlistItems = this.getWishlistItems().length;

      // Récupérer les commandes récentes
      const recentOrders = this.getRecentOrders(orders);

      // Récupérer les magasins favoris
      const favoriteStores = this.getFavoriteStores(companies);

      // Récupérer les articles de la wishlist
      const wishlistItems = this.getWishlistItems();

      return {
        totalProducts,
        totalStores,
        totalOrders,
        totalWishlistItems,
        recentOrders,
        favoriteStores,
        wishlistItems
      };
    } catch (error) {
      console.error('Erreur lors du chargement des métriques client:', error);
      throw error;
    }
  }

  private async getProductsData() {
    try {
      const response = await apiService.getAllProducts();
      return response || [];
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      return [];
    }
  }

  private async getStoresData() {
    try {
      const response = await apiService.getCompanies();
      return response.results || response || [];
    } catch (error) {
      console.error('Erreur lors du chargement des magasins:', error);
      return [];
    }
  }

  private async getOrdersData() {
    try {
      // Simuler les commandes pour l'instant
      // TODO: Implémenter l'API des commandes
      return [];
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
      return [];
    }
  }

  private getRecentOrders(orders: any[]) {
    // Simuler les commandes récentes
    return [
      {
        id: 'CMD-001',
        status: 'livré',
        total: 45000,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        items: 3
      },
      {
        id: 'CMD-002',
        status: 'en_cours',
        total: 32000,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        items: 2
      }
    ];
  }

  private getFavoriteStores(companies: any[]) {
    return companies.slice(0, 3).map(company => ({
      id: company.id,
      name: company.nom || company.name,
      rating: 4.5 + Math.random() * 0.5,
      products: Math.floor(Math.random() * 100) + 10
    }));
  }

  private getWishlistItems() {
    try {
      const wishlist = localStorage.getItem('wishlist');
      return wishlist ? JSON.parse(wishlist) : [];
    } catch (error) {
      console.error('Erreur lors du chargement de la wishlist:', error);
      return [];
    }
  }

  /**
   * Récupère les produits avec filtrage
   */
  async getFilteredProducts(filters: any = {}) {
    try {
      const products = await this.getProductsData();
      
      let filteredProducts = products;
      
      // Filtrage par catégorie
      if (filters.category && filters.category !== 'all') {
        filteredProducts = filteredProducts.filter(product => 
          product.categorie?.nom === filters.category
        );
      }
      
      
      // Filtrage par prix
      if (filters.priceMin) {
        filteredProducts = filteredProducts.filter(product => 
          product.prix_vente >= filters.priceMin
        );
      }
      
      if (filters.priceMax) {
        filteredProducts = filteredProducts.filter(product => 
          product.prix_vente <= filters.priceMax
        );
      }
      
      // Recherche textuelle
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredProducts = filteredProducts.filter(product => 
          product.nom.toLowerCase().includes(searchTerm) ||
          product.description_courte?.toLowerCase().includes(searchTerm)
        );
      }
      
      return filteredProducts;
    } catch (error) {
      console.error('Erreur lors du filtrage des produits:', error);
      return [];
    }
  }

  /**
   * Récupère les magasins avec filtrage
   */
  async getFilteredStores(filters: any = {}) {
    try {
      const stores = await this.getStoresData();
      
      let filteredStores = stores;
      
      // Filtrage par secteur
      if (filters.sector && filters.sector !== 'all') {
        filteredStores = filteredStores.filter(store => 
          store.secteur_activite === filters.sector
        );
      }
      
      // Recherche textuelle
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredStores = filteredStores.filter(store => 
          store.nom.toLowerCase().includes(searchTerm) ||
          store.description?.toLowerCase().includes(searchTerm)
        );
      }
      
      return filteredStores;
    } catch (error) {
      console.error('Erreur lors du filtrage des magasins:', error);
      return [];
    }
  }
}

export const clientApiService = new ClientApiService();
export default clientApiService;
