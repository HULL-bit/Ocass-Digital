/**
 * Service API réel pour communication backend Django
 */

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.commercial-platform.com/api/v1'
  : 'http://localhost:8000/api/v1'

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
    this.setupTokenRefresh();
  }

  private setupTokenRefresh() {
    // Vérifier et rafraîchir le token si nécessaire
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken && this.token) {
      // Vérifier si le token est expiré
      try {
        const tokenPayload = JSON.parse(atob(this.token.split('.')[1]));
        const now = Date.now() / 1000;
        if (tokenPayload.exp < now) {
          this.refreshToken();
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du token:', error);
      }
    }
  }

  private async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return;

      const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.token = data.access;
        localStorage.setItem('token', data.access);
        if (data.refresh) {
          localStorage.setItem('refreshToken', data.refresh);
        }
      } else {
        this.logout();
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      this.logout();
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log('API Request:', { url, options });
    
    const config: RequestInit = {
      ...options,
    };

    // Ne pas définir Content-Type pour FormData
    if (!(options.body instanceof FormData)) {
      config.headers = {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      };
    } else {
      config.headers = {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      };
    }

    // Mettre à jour le token si nécessaire
    this.token = localStorage.getItem('token');
    
    // Ajouter le token à l'en-tête si disponible
    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.token}`
      };
    }

    try {
      console.log('Making request to:', url);
      console.log('Request config:', config);
      
      const response = await fetch(url, config);
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expiré
          this.logout();
          window.location.href = '/auth/login';
          throw new Error('Session expirée');
        }
        
        let errorMessage = `Erreur ${response.status}`;
        let errorDetails = null;
        
        try {
          const errorData = await response.json();
          console.log('Error response data:', errorData);
          console.log('Full error details:', JSON.stringify(errorData, null, 2));
          errorMessage = errorData.message || errorData.detail || errorData.error || errorMessage;
          errorDetails = errorData;
        } catch (e) {
          console.log('Could not parse error response as JSON');
          // Ne pas essayer de lire le body si on l'a déjà lu
          errorMessage = `Erreur ${response.status}: ${response.statusText}`;
          errorDetails = { raw: 'Could not parse response' };
        }
        
        const error = new Error(errorMessage);
        (error as any).response = { data: errorDetails, status: response.status };
        throw error;
      }

      const responseData = await response.json();
      console.log('Response data:', responseData);
      return responseData;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string, type_utilisateur: string) {
    try {
      // Validation stricte des données d'entrée
      if (!email || !password || !type_utilisateur) {
        throw new Error('Données de connexion manquantes');
      }
      
      if (typeof email !== 'string' || typeof password !== 'string' || typeof type_utilisateur !== 'string') {
        throw new Error('Types de données incorrects');
      }
      
      if (email.trim() === '' || password.trim() === '' || type_utilisateur.trim() === '') {
        throw new Error('Données de connexion vides');
      }
      
      const loginData = { 
        email: email.trim(), 
        password: password.trim(), 
        type_utilisateur: type_utilisateur.trim() 
      };
      
      console.log('API Service login called with:', loginData);
      console.log('Login data JSON:', JSON.stringify(loginData));
      console.log('Data types:', {
        email: typeof email,
        password: typeof password,
        type_utilisateur: typeof type_utilisateur
      });
      
      const response = await this.request('/auth/login/', {
        method: 'POST',
        body: JSON.stringify(loginData),
      });

      console.log('Login response:', response);

      if (response.access) {
        this.token = response.access;
        localStorage.setItem('token', response.access);
        localStorage.setItem('refreshToken', response.refresh);
        localStorage.setItem('user', JSON.stringify(response.user));
        console.log('Token JWT sauvegardé:', response.access);
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);
      console.error('Login error details:', error.response);
      throw error;
    }
  }

  async register(userData: any) {
    try {
      console.log('Registering user with data:', userData);
      
      // Préparer les données selon le format attendu par Django
      const registrationData = {
        email: userData.email,
        first_name: userData.firstName || userData.first_name,
        last_name: userData.lastName || userData.last_name,
        telephone: userData.phone || userData.telephone,
        type_utilisateur: userData.type_utilisateur || userData.role,
        password: userData.password,
        confirm_password: userData.confirmPassword || userData.confirm_password,
        // Données entreprise pour les entrepreneurs
        ...(userData.type_utilisateur === 'entrepreneur' && userData.entreprise && {
          entreprise: {
            nom: userData.entreprise.nom || userData.companyName,
            description: userData.entreprise.description || userData.companyDescription,
            secteur_activite: userData.entreprise.secteur_activite || userData.sector,
            forme_juridique: userData.entreprise.forme_juridique || userData.legalForm,
            siret: userData.entreprise.siret || userData.siret,
            adresse_complete: userData.entreprise.adresse_complete || userData.companyAddress,
            telephone: userData.entreprise.telephone || userData.companyPhone,
            email: userData.entreprise.email || userData.companyEmail,
            site_web: userData.entreprise.site_web || userData.website,
          }
        })
      };

      console.log('Processed registration data:', registrationData);

      const response = await this.request('/auth/register/', {
        method: 'POST',
        body: JSON.stringify(registrationData),
      });

      console.log('Registration response:', response);

      if (response.access) {
        this.token = response.access;
        localStorage.setItem('token', response.access);
        localStorage.setItem('refreshToken', response.refresh);
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    } catch (error: any) {
      console.error('Registration error:', error);
      console.error('Registration error details:', error.response);
      throw error;
    }
  }

  async logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (refreshToken) {
      try {
        await this.request('/auth/logout/', {
          method: 'POST',
          body: JSON.stringify({ refresh: refreshToken }),
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  async getProfile() {
    return this.request('/auth/profile/');
  }

  async updateProfile(updates: any) {
    return this.request('/auth/profile/update/', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Products
  async getProducts(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/products/products/?${queryString}`);
  }

  // Products with pagination support - UPDATED
  async getAllProducts() {
    let allProducts = [];
    let page = 1;
    let hasNext = true;

    while (hasNext) {
      try {
        const response = await this.request(`/products/products/?page=${page}`);
        console.log('getAllProducts response:', response);
        
        // Vérifier si la réponse est un objet avec results ou directement un tableau
        if (response.results && Array.isArray(response.results)) {
          allProducts = allProducts.concat(response.results);
          hasNext = !!response.next;
          page++;
        } else if (Array.isArray(response)) {
          // Si la réponse est directement un tableau
          allProducts = allProducts.concat(response);
          hasNext = false;
        } else {
          console.warn('Unexpected response structure:', response);
          hasNext = false;
        }
      } catch (error) {
        console.error(`Error fetching page ${page}:`, error);
        hasNext = false;
      }
    }

    console.log('getAllProducts final result:', allProducts);
    return allProducts;
  }

  async getProduct(id: string) {
    return this.request(`/products/products/${id}/`);
  }

  async createProduct(productData: any) {
    try {
      console.log('Creating product with data:', productData);
      
      // Préparer les données selon le format attendu par Django
      const processedData = {
        nom: productData.nom,
        description_courte: productData.description_courte,
        description_longue: productData.description_longue,
        prix_achat: parseFloat(productData.prix_achat),
        prix_vente: parseFloat(productData.prix_vente),
        stock_minimum: parseInt(productData.stock_minimum),
        stock_maximum: parseInt(productData.stock_maximum) || null,
        sku: productData.sku,
        code_barre: productData.code_barre || null,
        slug: productData.slug,
        categorie: productData.categorie,
        marque: productData.marque,
        unite_mesure: productData.unite_mesure,
        tva_taux: parseFloat(productData.tva_taux) || 18.0,
        statut: productData.statut || 'actif',
        vendable: productData.vendable !== undefined ? productData.vendable : true,
        achetable: productData.achetable !== undefined ? productData.achetable : true,
        visible_catalogue: productData.visible_catalogue !== undefined ? productData.visible_catalogue : true,
        dimensions: productData.dimensions || {},
        couleurs_disponibles: productData.couleurs_disponibles || [],
        tailles_disponibles: productData.tailles_disponibles || [],
        point_recommande: productData.point_recommande || 10,
        poids: productData.poids || null,
        date_peremption: productData.date_peremption || null,
        duree_conservation: productData.duree_conservation || null,
        popularite_score: productData.popularite_score || 0,
        nombre_vues: productData.nombre_vues || 0,
        nombre_ventes: productData.nombre_ventes || 0,
        en_promotion: productData.en_promotion || false,
        stock_actuel: productData.stock_actuel || 0,
        stock_disponible: productData.stock_disponible || 0,
        en_rupture: productData.en_rupture || false,
        stock_bas: productData.stock_bas || false,
        images: productData.images || [],
        variantes: productData.variantes || []
      };

      console.log('Processed product data:', processedData);

      return await this.request('/products/products/', {
        method: 'POST',
        body: JSON.stringify(processedData),
      });
    } catch (error: any) {
      console.error('Erreur API createProduct:', error);
      throw error;
    }
  }

  async uploadProductImage(productId: string, imageFile: File) {
    try {
      console.log('Uploading image for product:', productId);
      
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('produit', productId);
      formData.append('principale', 'true');
      formData.append('alt_text', `Image du produit ${productId}`);
      
      console.log('FormData contents:', {
        image: imageFile.name,
        produit: productId,
        principale: 'true',
        alt_text: `Image du produit ${productId}`
      });
      
      return await this.request('/products/images/', {
        method: 'POST',
        body: formData,
        headers: {
          // Ne pas définir Content-Type, laissez le navigateur le faire pour FormData
        }
      });
    } catch (error: any) {
      console.error('Erreur API uploadProductImage:', error);
      throw error;
    }
  }

  async updateProduct(id: string, updates: any) {
    try {
      console.log('Updating product with data:', updates);
      
      // Préparer les données selon le format attendu par Django
      const processedData = {
        nom: updates.nom,
        description_courte: updates.description_courte,
        description_longue: updates.description_longue,
        prix_achat: parseFloat(updates.prix_achat),
        prix_vente: parseFloat(updates.prix_vente),
        stock_minimum: parseInt(updates.stock_minimum),
        stock_maximum: parseInt(updates.stock_maximum) || null,
        sku: updates.sku,
        code_barre: updates.code_barre || null,
        categorie: updates.categorie,
        marque: updates.marque,
        unite_mesure: updates.unite_mesure,
        tva_taux: parseFloat(updates.tva_taux) || 18.0,
        statut: updates.statut || 'actif',
        vendable: updates.vendable !== undefined ? updates.vendable : true,
        achetable: updates.achetable !== undefined ? updates.achetable : true,
        visible_catalogue: updates.visible_catalogue !== undefined ? updates.visible_catalogue : true,
        dimensions: updates.dimensions || {},
        couleurs_disponibles: updates.couleurs_disponibles || [],
        tailles_disponibles: updates.tailles_disponibles || [],
        point_recommande: updates.point_recommande || 10,
        poids: updates.poids || null,
        date_peremption: updates.date_peremption || null,
        duree_conservation: updates.duree_conservation || null,
        popularite_score: updates.popularite_score || 0,
        nombre_vues: updates.nombre_vues || 0,
        nombre_ventes: updates.nombre_ventes || 0,
        en_promotion: updates.en_promotion || false,
        stock_actuel: updates.stock_actuel || 0,
        stock_disponible: updates.stock_disponible || 0,
        en_rupture: updates.en_rupture || false,
        stock_bas: updates.stock_bas || false,
        images: updates.images || [],
        variantes: updates.variantes || []
      };

      console.log('Processed update data:', processedData);

      return await this.request(`/products/products/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(processedData),
      });
    } catch (error: any) {
      console.error('Erreur API updateProduct:', error);
      throw error;
    }
  }

  async deleteProduct(id: string) {
    return this.request(`/products/products/${id}/`, {
      method: 'DELETE',
    });
  }

  async getCategories() {
    return this.request('/products/categories/');
  }

  async createCategory(categoryData: any) {
    return this.request('/products/categories/', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  // Customers - Utiliser les endpoints users pour l'instant
  async getCustomers(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/users/users/?${queryString}`);
  }

  async getCustomer(id: string) {
    return this.request(`/users/users/${id}/`);
  }

  async createCustomer(customerData: any) {
    return this.request('/users/users/', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  async updateCustomer(id: string, updates: any) {
    return this.request(`/users/users/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteCustomer(id: string) {
    return this.request(`/users/users/${id}/`, {
      method: 'DELETE',
    });
  }

  // Sales
  async getSales(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/sales/ventes/?${queryString}`);
  }

  async getSale(id: string) {
    return this.request(`/sales/ventes/${id}/`);
  }

  async createSale(saleData: any) {
    return this.request('/sales/ventes/', {
      method: 'POST',
      body: JSON.stringify(saleData),
    });
  }

  async confirmSale(id: string) {
    return this.request(`/sales/ventes/${id}/confirm/`, {
      method: 'POST',
    });
  }

  async cancelSale(id: string, reason: string) {
    return this.request(`/sales/ventes/${id}/cancel/`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async printInvoice(id: string) {
    return this.request(`/sales/ventes/${id}/print_invoice/`, {
      method: 'POST',
    });
  }

  // Analytics
  async getDashboardMetrics(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/analytics/dashboard/?${queryString}`);
  }

  async getSalesAnalytics(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/analytics/sales/?${queryString}`);
  }

  async getInventoryAnalytics(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/analytics/inventory/?${queryString}`);
  }

  async getCustomerAnalytics(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/analytics/customers/?${queryString}`);
  }

  // Projects
  async getProjects(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/projects/projets/?${queryString}`);
  }

  async createProject(projectData: any) {
    return this.request('/projects/projets/', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(id: string, updates: any) {
    return this.request(`/projects/projets/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Notifications
  async getNotifications() {
    return this.request('/notifications/notifications/');
  }

  async markNotificationRead(id: string) {
    return this.request(`/notifications/notifications/${id}/mark_read/`, {
      method: 'POST',
    });
  }

  // Support
  async getTickets() {
    return this.request('/support/tickets/');
  }

  async createTicket(ticketData: any) {
    return this.request('/support/tickets/', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  }

  async getFAQ() {
    return this.request('/support/faq/');
  }

  // File Upload
  async uploadFile(file: File, type: string = 'general') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.request('/core/upload/', {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });
  }

  // Payments
  async processPayment(paymentData: any) {
    return this.request('/payments/process/', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getPaymentMethods() {
    return this.request('/payments/methods/');
  }

  // Admin endpoints
  async getUsers(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/users/users/?${queryString}`);
  }

  async getCompanies(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/companies/entreprises/?${queryString}`);
  }

  async updateUserStatus(id: string, status: string) {
    return this.request(`/users/users/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ statut: status }),
    });
  }

  // Integrations
  async getIntegrations() {
    return this.request('/integrations/integrations/');
  }

  async testIntegration(id: string) {
    return this.request(`/integrations/integrations/${id}/test/`, {
      method: 'POST',
    });
  }

  async updateIntegrationConfig(id: string, config: any) {
    return this.request(`/integrations/integrations/${id}/`, {
      method: 'PUT',
      body: JSON.stringify({ configuration: config }),
    });
  }
}

export const apiService = new ApiService();
export default apiService;