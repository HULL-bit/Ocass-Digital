/**
 * Service de synchronisation centralisé pour les données de la plateforme
 * Assure la cohérence des produits et entreprises sur les 3 interfaces
 */

import apiService from '../api/realApi';

export interface SyncStatus {
  status: 'syncing' | 'success' | 'error' | 'idle';
  lastSync: Date | null;
  error?: string;
  dataCounts: {
    products: number;
    companies: number;
    users: number;
  };
}

export interface ProductData {
  id: string;
  nom: string;
  description_courte: string;
  prix_vente: number;
  stock_actuel: number;
  categorie: string;
  entreprise: string;
  image: string;
  statut: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyData {
  id: string;
  nom: string;
  description: string;
  secteur_activite: string;
  adresse_complete: string;
  telephone: string;
  email: string;
  logo: string;
  statut: string;
  created_at: string;
  updated_at: string;
}

class DataSyncService {
  private static instance: DataSyncService;
  private syncStatus: SyncStatus = {
    status: 'idle',
    lastSync: null,
    dataCounts: { products: 0, companies: 0, users: 0 }
  };
  private listeners: ((status: SyncStatus) => void)[] = [];
  private syncInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.initializeSync();
  }

  public static getInstance(): DataSyncService {
    if (!DataSyncService.instance) {
      DataSyncService.instance = new DataSyncService();
    }
    return DataSyncService.instance;
  }

  private initializeSync() {
    console.log('🔄 Initialisation de la synchronisation automatique...');
    
    // Vérifier si l'utilisateur est authentifié avant de démarrer la sync
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ Aucun token d\'authentification, synchronisation désactivée');
      return;
    }
    
    // Vérifier la cohérence au démarrage
    this.checkDataConsistency();
    
    // Synchronisation automatique toutes les 2 minutes
    this.syncInterval = setInterval(() => {
      console.log('🔄 Synchronisation automatique déclenchée...');
      this.syncData();
    }, 2 * 60 * 1000);
    
    // Synchronisation immédiate au démarrage
    setTimeout(() => {
      console.log('🔄 Synchronisation immédiate au démarrage...');
      this.syncData();
    }, 1000);
    
    // Synchronisation automatique lors de la visibilité de la page
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        console.log('🔄 Synchronisation automatique lors du retour sur la page...');
        this.syncData();
      }
    });
    
    // Synchronisation automatique lors de la reconnexion réseau
    window.addEventListener('online', () => {
      console.log('🔄 Synchronisation automatique lors de la reconnexion...');
      this.syncData();
    });
    
    // Synchronisation automatique lors du focus de la fenêtre
    window.addEventListener('focus', () => {
      console.log('🔄 Synchronisation automatique lors du focus...');
      this.syncData();
    });
  }

  public addListener(listener: (status: SyncStatus) => void) {
    this.listeners.push(listener);
  }

  public removeListener(listener: (status: SyncStatus) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.syncStatus));
  }

  private updateStatus(status: Partial<SyncStatus>) {
    this.syncStatus = { ...this.syncStatus, ...status };
    this.notifyListeners();
  }

  public async syncData(): Promise<SyncStatus> {
    console.log('🔄 Démarrage de la synchronisation des données...');
    
    // Vérifier si l'utilisateur est authentifié
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ Aucun token d\'authentification, arrêt de la synchronisation');
      this.updateStatus({ 
        status: 'error', 
        error: 'Utilisateur non authentifié' 
      });
      return this.syncStatus;
    }
    
    this.updateStatus({ status: 'syncing' });

    try {
      // Synchroniser les produits
      const products = await this.syncProducts();
      
      // Synchroniser les entreprises
      const companies = await this.syncCompanies();
      
      // Synchroniser les utilisateurs (seulement si l'utilisateur est authentifié)
      const users = await this.syncUsers();

      // Synchroniser le panier avec les données du catalogue
      this.syncCartWithCatalog(products);

      // Mettre à jour le cache local
      this.updateLocalCache({
        products,
        companies,
        users,
        timestamp: Date.now()
      });

      this.updateStatus({
        status: 'success',
        lastSync: new Date(),
        dataCounts: {
          products: products.length,
          companies: companies.length,
          users: users.length
        }
      });

      console.log('✅ Synchronisation terminée:', {
        products: products.length,
        companies: companies.length,
        users: users.length
      });

      // Déclencher un événement global
      window.dispatchEvent(new CustomEvent('dataSynced', {
        detail: { products, companies, users }
      }));

      return this.syncStatus;
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation:', error);
      this.updateStatus({
        status: 'error',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
      return this.syncStatus;
    }
  }

  private async syncProducts(): Promise<ProductData[]> {
    try {
      const response = await apiService.getAllProducts();
      
      // Vérifier si la réponse est un tableau ou un objet avec results
      const products = Array.isArray(response) ? response : (response?.results || []);
      
      // Normaliser les données des produits
      const normalizedProducts = products.map(product => ({
        id: product.id,
        nom: product.nom || product.name || 'Produit sans nom',
        description_courte: product.description_courte || product.description || '',
        prix_vente: parseFloat(product.prix_vente || product.price || 0),
        stock_actuel: parseInt(product.stock_actuel || product.stock || 0),
        categorie: product.categorie || product.category || 'Non classé',
        entreprise: product.entreprise || product.company || 'Entreprise inconnue',
        image: product.image || product.images?.[0] || '/default-product.png',
        statut: product.statut || product.status || 'actif',
        created_at: product.created_at || product.date_creation || new Date().toISOString(),
        updated_at: product.updated_at || product.date_modification || new Date().toISOString()
      }));

      return normalizedProducts;
    } catch (error) {
      console.error('Erreur lors de la synchronisation des produits:', error);
      return [];
    }
  }

  private async syncCompanies(): Promise<CompanyData[]> {
    try {
      const response = await apiService.getCompanies();
      
      // Vérifier si la réponse est un tableau ou un objet avec results
      const companies = Array.isArray(response) ? response : (response?.results || []);
      
      // Normaliser les données des entreprises
      const normalizedCompanies = companies.map(company => ({
        id: company.id,
        nom: company.nom || company.name || 'Entreprise sans nom',
        description: company.description || '',
        secteur_activite: company.secteur_activite || company.sector || 'Non défini',
        adresse_complete: company.adresse_complete || company.address || '',
        telephone: company.telephone || company.phone || '',
        email: company.email || '',
        logo: company.logo || '/default-company.png',
        statut: company.statut || company.status || 'actif',
        created_at: company.created_at || company.date_creation || new Date().toISOString(),
        updated_at: company.updated_at || company.date_modification || new Date().toISOString()
      }));

      return normalizedCompanies;
    } catch (error) {
      console.error('Erreur lors de la synchronisation des entreprises:', error);
      return [];
    }
  }

  private async syncUsers(): Promise<any[]> {
    try {
      const users = await apiService.getUsers();
      return users;
    } catch (error) {
      console.error('Erreur lors de la synchronisation des utilisateurs:', error);
      // Si c'est une erreur d'authentification, arrêter la synchronisation
      if (error instanceof Error && error.message.includes('Session expirée')) {
        console.log('Session expirée, arrêt de la synchronisation automatique');
        this.destroy();
        return [];
      }
      return [];
    }
  }

  private updateLocalCache(data: any) {
    const cacheData = {
      ...data,
      version: '1.0',
      syncId: Date.now().toString()
    };
    
    localStorage.setItem('sync_cache', JSON.stringify(cacheData));
    localStorage.setItem('products_cache', JSON.stringify(data.products));
    localStorage.setItem('companies_cache', JSON.stringify(data.companies));
  }

  private syncCartWithCatalog(products: ProductData[]): void {
    try {
      // Importer le service de panier dynamiquement pour éviter les dépendances circulaires
      import('../cart/CartService').then(({ default: CartService }) => {
        const cartService = CartService.getInstance();
        cartService.syncWithCatalog(products);
        console.log('🛒 Panier synchronisé avec le catalogue');
      });
    } catch (error) {
      console.error('Erreur lors de la synchronisation du panier:', error);
    }
  }

  public async checkDataConsistency(): Promise<boolean> {
    try {
      const cachedData = localStorage.getItem('sync_cache');
      if (!cachedData) {
        return false;
      }

      const data = JSON.parse(cachedData);
      const now = Date.now();
      const cacheAge = now - data.timestamp;

      // Vérifier si le cache est trop ancien (plus de 10 minutes)
      if (cacheAge > 10 * 60 * 1000) {
        console.log('Cache trop ancien, synchronisation nécessaire');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la vérification de cohérence:', error);
      return false;
    }
  }

  public getCachedProducts(): ProductData[] {
    try {
      const cached = localStorage.getItem('products_cache');
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des produits en cache:', error);
      return [];
    }
  }

  public getCachedCompanies(): CompanyData[] {
    try {
      const cached = localStorage.getItem('companies_cache');
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des entreprises en cache:', error);
      return [];
    }
  }

  public async forceSync(): Promise<SyncStatus> {
    console.log('🔄 Forçage de la synchronisation...');
    
    // Nettoyer le cache
    localStorage.removeItem('sync_cache');
    localStorage.removeItem('products_cache');
    localStorage.removeItem('companies_cache');
    
    return await this.syncData();
  }

  public getSyncStatus(): SyncStatus {
    return this.syncStatus;
  }

  public destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.listeners = [];
  }

  public restart() {
    console.log('🔄 Redémarrage de la synchronisation...');
    this.destroy();
    this.initializeSync();
  }
}

export const dataSyncService = DataSyncService.getInstance();
export default dataSyncService;
