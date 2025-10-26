/**
 * Service API pour l'interface entrepreneur
 */

import apiService from './realApi';

export interface EntrepreneurMetrics {
  totalProducts: number;
  totalCustomers: number;
  totalSales: number;
  totalRevenue: number;
  lowStockProducts: number;
  recentSales: Array<{
    id: string;
    customer: string;
    amount: number;
    date: string;
    status: string;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  customerSegments: Array<{
    id: string;
    name: string;
    count: number;
    color: string;
  }>;
  inventoryAlerts: Array<{
    id: string;
    name: string;
    stock: number;
    minStock: number;
    status: string;
  }>;
}

class EntrepreneurApiService {
  /**
   * Récupère les métriques de l'entrepreneur
   */
  async getEntrepreneurMetrics(): Promise<EntrepreneurMetrics> {
    try {
      // Récupérer les données de base
      const [products, customers, sales] = await Promise.all([
        this.getProductsData(),
        this.getCustomersData(),
        this.getSalesData()
      ]);

      // Calculer les métriques
      const totalProducts = products.length;
      const totalCustomers = customers.length;
      const totalSales = sales.length;
      const totalRevenue = sales.reduce((sum, sale) => sum + (sale.montant_total || 0), 0);
      const lowStockProducts = products.filter(p => p.stock_actuel <= p.stock_minimum).length;

      // Récupérer les ventes récentes
      const recentSales = this.getRecentSales(sales);

      // Récupérer les produits les plus vendus
      const topProducts = this.getTopProducts(products);

      // Récupérer les segments de clients
      const customerSegments = this.getCustomerSegments(customers);

      // Récupérer les alertes d'inventaire
      const inventoryAlerts = this.getInventoryAlerts(products);

      return {
        totalProducts,
        totalCustomers,
        totalSales,
        totalRevenue,
        lowStockProducts,
        recentSales,
        topProducts,
        customerSegments,
        inventoryAlerts
      };
    } catch (error) {
      console.error('Erreur lors du chargement des métriques entrepreneur:', error);
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

  private async getCustomersData() {
    try {
      const response = await apiService.getCustomers();
      return response.results || response || [];
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
      return [];
    }
  }

  private async getSalesData() {
    try {
      const response = await apiService.getSales();
      return response.results || response || [];
    } catch (error) {
      console.error('Erreur lors du chargement des ventes:', error);
      return [];
    }
  }

  private getRecentSales(sales: any[]) {
    return sales.slice(0, 5).map(sale => ({
      id: sale.id,
      customer: sale.client?.nom || 'Client inconnu',
      amount: sale.montant_total || 0,
      date: sale.date_creation,
      status: sale.statut || 'en_attente'
    }));
  }

  private getTopProducts(products: any[]) {
    return products
      .sort((a, b) => (b.nombre_ventes || 0) - (a.nombre_ventes || 0))
      .slice(0, 5)
      .map(product => ({
        id: product.id,
        name: product.nom,
        sales: product.nombre_ventes || 0,
        revenue: (product.nombre_ventes || 0) * product.prix_vente
      }));
  }

  private getCustomerSegments(customers: any[]) {
    const segments = [
      { id: 'nouveau', name: 'Nouveaux', count: 0, color: 'blue' },
      { id: 'regulier', name: 'Réguliers', count: 0, color: 'green' },
      { id: 'vip', name: 'VIP', count: 0, color: 'purple' }
    ];

    customers.forEach(customer => {
      const totalPurchases = customer.total_achats || 0;
      if (totalPurchases === 0) {
        segments[0].count++; // Nouveaux
      } else if (totalPurchases < 100000) {
        segments[1].count++; // Réguliers
      } else {
        segments[2].count++; // VIP
      }
    });

    return segments;
  }

  private getInventoryAlerts(products: any[]) {
    return products
      .filter(product => product.stock_actuel <= product.stock_minimum)
      .slice(0, 10)
      .map(product => ({
        id: product.id,
        name: product.nom,
        stock: product.stock_actuel,
        minStock: product.stock_minimum,
        status: product.stock_actuel === 0 ? 'rupture' : 'stock_bas'
      }));
  }

  /**
   * Récupère les produits avec filtrage pour l'inventaire
   */
  async getFilteredProducts(filters: any = {}) {
    try {
      const products = await this.getProductsData();
      
      let filteredProducts = products;
      
      // Filtrage par statut de stock
      if (filters.stockStatus) {
        switch (filters.stockStatus) {
          case 'en_stock':
            filteredProducts = filteredProducts.filter(p => p.stock_actuel > p.stock_minimum);
            break;
          case 'stock_bas':
            filteredProducts = filteredProducts.filter(p => p.stock_actuel <= p.stock_minimum && p.stock_actuel > 0);
            break;
          case 'rupture':
            filteredProducts = filteredProducts.filter(p => p.stock_actuel === 0);
            break;
        }
      }
      
      // Filtrage par catégorie
      if (filters.category && filters.category !== 'all') {
        filteredProducts = filteredProducts.filter(product => 
          product.categorie?.nom === filters.category
        );
      }
      
      // Recherche textuelle
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredProducts = filteredProducts.filter(product => 
          product.nom.toLowerCase().includes(searchTerm) ||
          product.sku.toLowerCase().includes(searchTerm)
        );
      }
      
      return filteredProducts;
    } catch (error) {
      console.error('Erreur lors du filtrage des produits:', error);
      return [];
    }
  }

  /**
   * Récupère les clients avec filtrage
   */
  async getFilteredCustomers(filters: any = {}) {
    try {
      const customers = await this.getCustomersData();
      
      let filteredCustomers = customers;
      
      // Filtrage par segment
      if (filters.segment && filters.segment !== 'all') {
        filteredCustomers = filteredCustomers.filter(customer => {
          const totalPurchases = customer.total_achats || 0;
          switch (filters.segment) {
            case 'nouveau':
              return totalPurchases === 0;
            case 'regulier':
              return totalPurchases > 0 && totalPurchases < 100000;
            case 'vip':
              return totalPurchases >= 100000;
            default:
              return true;
          }
        });
      }
      
      // Recherche textuelle
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredCustomers = filteredCustomers.filter(customer => 
          customer.nom?.toLowerCase().includes(searchTerm) ||
          customer.email?.toLowerCase().includes(searchTerm) ||
          customer.telephone?.includes(searchTerm)
        );
      }
      
      return filteredCustomers;
    } catch (error) {
      console.error('Erreur lors du filtrage des clients:', error);
      return [];
    }
  }
}

export const entrepreneurApiService = new EntrepreneurApiService();
export default entrepreneurApiService;
