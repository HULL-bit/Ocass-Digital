
// Vite utilise import.meta.env pour les variables d'environnement
// Construire l'URL de base correctement
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    const baseUrl = import.meta.env.VITE_API_URL.trim();
    // Si l'URL contient déjà /api/v1, ne pas l'ajouter
    if (baseUrl.endsWith('/api/v1')) {
      return baseUrl;
    } else if (baseUrl.endsWith('/api')) {
      return `${baseUrl}/v1`;
    } else {
      return `${baseUrl}/api/v1`;
    }
  }
  return import.meta.env.PROD 
    ? 'https://ocass-digital.onrender.com/api/v1'
    : 'http://localhost:8000/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

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

  private async request(endpoint: string, options: RequestInit = {}, retryCount = 0): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    const maxRetries = 3;
    
    // Log seulement en mode développement ou pour les erreurs
    if (process.env.NODE_ENV === 'development' && retryCount === 0) {
      console.log('API Request:', url);
    }
    
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
      const response = await fetch(url, config);
      
      // Lire le contenu de la réponse une seule fois
      const contentType = response.headers.get('content-type');
      const hasJsonContent = contentType && contentType.includes('application/json');
      
      // Lire le texte de la réponse une seule fois
      const text = await response.text();
      
      if (!response.ok) {
        // Log l'URL complète en cas d'erreur pour le débogage
        if (response.status === 404) {
          console.error(`❌ 404 Not Found: ${url}`);
          console.error(`   Endpoint: ${endpoint}`);
          console.error(`   API_BASE_URL: ${API_BASE_URL}`);
        }
        
        if (response.status === 401) {
          // Token expiré - essayer de rafraîchir
          if (retryCount === 0) {
            try {
              await this.refreshToken();
              return this.request(endpoint, options, 1);
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
              this.logout();
              throw new Error('Session expirée');
            }
          } else {
            this.logout();
            throw new Error('Session expirée');
          }
        }
        
        let errorMessage = `Erreur ${response.status}`;
        let errorDetails = null;
        
        // Traiter la réponse d'erreur
        if (text && text.trim() !== '') {
          try {
            const errorData = JSON.parse(text);
            // Log détaillé des erreurs pour le débogage
            console.error('❌ Error response (status', response.status, '):', errorData);
            console.error('📋 Clés d\'erreur:', Object.keys(errorData));
            
            // Afficher toutes les erreurs dans la console de manière structurée
            Object.entries(errorData).forEach(([key, value]: [string, any]) => {
              if (Array.isArray(value)) {
                console.error(`  ❌ ${key}:`, value.join(', '));
              } else if (typeof value === 'object') {
                console.error(`  ❌ ${key}:`, JSON.stringify(value));
              } else {
                console.error(`  ❌ ${key}:`, value);
              }
            });
            
            errorMessage = errorData.message || errorData.detail || errorData.error || errorMessage;
            errorDetails = errorData;
          } catch (e) {
            // Si le parsing échoue, utiliser le texte brut
            errorMessage = `Erreur ${response.status}: ${response.statusText}`;
            errorDetails = { raw: text };
          }
        } else {
          // Réponse d'erreur vide
          errorMessage = `Erreur ${response.status}: ${response.statusText}`;
          errorDetails = { message: errorMessage };
        }
        
        const error = new Error(errorMessage);
        (error as any).response = { data: errorDetails, status: response.status };
        throw error;
      }

      // Traiter la réponse de succès
      // Si la réponse est vide (204 No Content, etc.), retourner un objet de succès
      if (response.status === 204 || (text.trim() === '' && response.status === 200)) {
        return { success: true };
      }
      
      // Si pas de contenu et pas de statut spécial, retourner un objet vide
      if (!text || text.trim() === '') {
        return {};
      }
      
      // Essayer de parser le JSON seulement si c'est du contenu JSON ou si le status est OK
      if (hasJsonContent || response.status === 200 || response.status === 201) {
        try {
          return JSON.parse(text);
        } catch (parseError) {
          // Si le parsing échoue, retourner un objet vide ou un objet de succès selon le statut
          console.warn('Failed to parse JSON response:', parseError);
          if (response.status === 200 || response.status === 201) {
            return { success: true };
          }
          return {};
        }
      }
      
      // Si ce n'est pas JSON, retourner un objet vide
      return {};
    } catch (error) {
      console.error('API Error:', error);
      
      // Retry logic pour les erreurs de réseau
      if (retryCount < maxRetries && (error as any).name === 'TypeError') {
        console.log(`Retrying request (${retryCount + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.request(endpoint, options, retryCount + 1);
      }
      
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
      
      // Log seulement en mode développement
      if (process.env.NODE_ENV === 'development') {
        console.log('API Service login called');
      }
      
      const response = await this.request('/auth/login/', {
        method: 'POST',
        body: JSON.stringify(loginData),
      });

      if (response.access) {
        this.token = response.access;
        localStorage.setItem('token', response.access);
        localStorage.setItem('refreshToken', response.refresh);
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);
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
    try {
      console.log('Fetching products with params:', params);
      
      // Vérifier si l'utilisateur est un entrepreneur
      // Les entrepreneurs doivent utiliser l'endpoint normal pour que le filtrage par entreprise fonctionne
      const userStr = localStorage.getItem('user');
      let isEntrepreneur = false;
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          isEntrepreneur = user.type_utilisateur === 'entrepreneur' || user.role === 'entrepreneur';
        } catch (e) {
          console.warn('Erreur lors de la lecture de l\'utilisateur:', e);
        }
      }
      
      // Utiliser l'endpoint ultra-rapide seulement si :
      // 1. Pas de paramètres spéciaux
      // 2. L'utilisateur n'est PAS un entrepreneur (pour que le filtrage par entreprise fonctionne)
      if (!params.search && !params.category && !params.brand && !isEntrepreneur) {
        const ultraFastUrl = `/products/products/ultra_fast_list/?page=${params.page || 1}&page_size=${params.page_size || 15}`;
        console.log('Using ultra-fast endpoint:', ultraFastUrl);
        return await this.request(ultraFastUrl);
      }
      
      // Utiliser l'endpoint normal pour les entrepreneurs ou si des paramètres spéciaux sont présents
      // L'endpoint normal utilise get_queryset() qui filtre correctement par entreprise
      const queryString = new URLSearchParams(params).toString();
      const url = `/products/products/?${queryString}`;
      console.log(`Using normal endpoint (entrepreneur: ${isEntrepreneur}):`, url);
      return await this.request(url);
    } catch (error: any) {
      console.error('Erreur API getProducts:', error);
      throw error;
    }
  }

  // Products with pagination support - OPTIMISÉ
  async getAllProducts() {
    try {
      // fast_list est bloqué dans le backend, utiliser directement le fallback
      // qui utilise l'endpoint standard /products/products/
      console.log('🔄 Utilisation directe de getAllProductsFallback (fast_list bloqué)');
      return await this.getAllProductsFallback();
      
      /* Code commenté - fast_list est bloqué
      try {
        const response = await this.request('/products/products/fast_list/');
        console.log('getAllProducts (optimisé) response type:', typeof response);
        console.log('getAllProducts (optimisé) response keys:', response ? Object.keys(response) : 'null');
        
        // Gérer différents formats de réponse
        let allProducts = [];
        
        // Cas 1: Objet avec results (format paginé standard)
        if (response && response.results && Array.isArray(response.results)) {
          allProducts = response.results;
          console.log('✅ Produits extraits depuis response.results:', allProducts.length);
          
          // Si la réponse est paginée, récupérer toutes les pages
          if (response.next) {
            console.log('📄 Pagination détectée, récupération des pages suivantes...');
            let currentPage = 2; // On a déjà la page 1
            let hasMore = !!response.next;
            
            while (hasMore) {
              try {
                const nextResponse = await this.request(`/products/products/fast_list/?page=${currentPage}`);
                if (nextResponse && nextResponse.results && Array.isArray(nextResponse.results) && nextResponse.results.length > 0) {
                  allProducts = allProducts.concat(nextResponse.results);
                  hasMore = !!nextResponse.next;
                  currentPage++;
                  console.log(`📄 Page ${currentPage - 1} récupérée: ${nextResponse.results.length} produits (total: ${allProducts.length})`);
                } else {
                  hasMore = false;
                }
              } catch (pageError) {
                console.warn(`Erreur lors de la récupération de la page ${currentPage}:`, pageError);
                hasMore = false;
              }
            }
          }
        }
        // Cas 2: Objet avec data
        else if (response && response.data !== undefined) {
          if (Array.isArray(response.data)) {
            allProducts = response.data;
            console.log('✅ Produits extraits depuis response.data:', allProducts.length);
          } else if (response.data && response.data.results && Array.isArray(response.data.results)) {
            allProducts = response.data.results;
            console.log('✅ Produits extraits depuis response.data.results:', allProducts.length);
          } else {
            console.warn('⚠️ response.data existe mais n\'est pas un tableau:', response.data);
          }
        }
        // Cas 3: Tableau direct
        else if (Array.isArray(response)) {
          allProducts = response;
          console.log('✅ Produits extraits depuis tableau direct:', allProducts.length);
        }
        // Cas 4: Endpoint bloqué (status: 'blocked')
        else if (response && response.status === 'blocked') {
          console.warn('⚠️ Endpoint fast_list bloqué, utilisation du fallback');
          return await this.getAllProductsFallback();
        }
        // Cas 5: Objet vide ou format inconnu
        else {
          console.warn('⚠️ Format de réponse inattendu de fast_list, utilisation du fallback');
          console.warn('Structure de la réponse:', JSON.stringify(response, null, 2).substring(0, 500));
          // Si fast_list retourne un objet vide ou bloqué, utiliser le fallback
          return await this.getAllProductsFallback();
        }

        console.log('✅ getAllProducts (optimisé) final result:', allProducts.length, 'produits');
        
        // Mettre en cache les produits pour la synchronisation
        if (allProducts.length > 0) {
          localStorage.setItem('cached_products', JSON.stringify({
            products: allProducts,
            timestamp: Date.now(),
            version: '2.0-optimized'
          }));
          return allProducts;
        } else {
          // Si aucun produit, essayer le fallback
          console.warn('⚠️ fast_list retourne 0 produit, utilisation du fallback');
          return await this.getAllProductsFallback();
        }
      } catch (fastListError: any) {
        console.warn('⚠️ Erreur avec fast_list, utilisation du fallback:', fastListError);
        return await this.getAllProductsFallback();
      }
      */
    } catch (error) {
      console.error('❌ Erreur lors du chargement des produits:', error);
      // Fallback vers l'ancienne méthode si l'endpoint optimisé n'existe pas
      return await this.getAllProductsFallback();
    }
  }

  // Méthode de fallback pour la compatibilité
  async getAllProductsFallback() {
    console.log('🔄 Utilisation de getAllProductsFallback()...');
    let allProducts = [];
    let page = 1;
    let hasNext = true;
    const maxPages = 100; // Sécurité pour éviter les boucles infinies

    while (hasNext && page <= maxPages) {
      try {
        console.log(`📄 Récupération de la page ${page}...`);
        const response = await this.request(`/products/products/?page=${page}&page_size=100`);
        console.log(`📄 Page ${page} réponse:`, {
          hasResults: !!response?.results,
          resultsLength: response?.results?.length || 0,
          hasNext: !!response?.next,
          isArray: Array.isArray(response),
          hasData: !!response?.data
        });
        
        // Gérer différents formats de réponse
        if (response && response.results && Array.isArray(response.results)) {
          if (response.results.length > 0) {
            allProducts = allProducts.concat(response.results);
            hasNext = !!response.next;
            page++;
            console.log(`✅ Page ${page - 1} récupérée: ${response.results.length} produits (total: ${allProducts.length})`);
          } else {
            hasNext = false;
            console.log('✅ Toutes les pages ont été récupérées (page vide)');
          }
        } else if (Array.isArray(response)) {
          allProducts = allProducts.concat(response);
          hasNext = false;
          console.log('✅ Réponse directe (tableau) récupérée:', response.length, 'produits');
        } else if (response && response.data !== undefined) {
          // Gérer response.data
          if (Array.isArray(response.data)) {
            allProducts = allProducts.concat(response.data);
            hasNext = false;
            console.log('✅ Produits récupérés depuis response.data:', response.data.length);
          } else if (response.data && response.data.results && Array.isArray(response.data.results)) {
            allProducts = allProducts.concat(response.data.results);
            hasNext = !!response.data.next;
            page++;
            console.log(`✅ Page ${page - 1} récupérée depuis response.data.results: ${response.data.results.length} produits`);
          } else {
            console.warn('⚠️ response.data existe mais format inattendu:', response.data);
            hasNext = false;
          }
        } else {
          console.warn('⚠️ Structure de réponse inattendue dans le fallback:', {
            type: typeof response,
            keys: response ? Object.keys(response) : 'null',
            isArray: Array.isArray(response)
          });
          hasNext = false;
        }
      } catch (error: any) {
        console.error(`❌ Erreur lors de la récupération de la page ${page}:`, error);
        hasNext = false;
      }
    }

    console.log(`✅ getAllProductsFallback final result: ${allProducts.length} produits`);
    
    // Mettre en cache les produits
    if (allProducts.length > 0) {
      localStorage.setItem('cached_products', JSON.stringify({
        products: allProducts,
        timestamp: Date.now(),
        version: '2.0-fallback'
      }));
    }
    
    return allProducts;
  }

  async getProduct(id: string) {
    return this.request(`/products/products/${id}/`);
  }

  async createProduct(productData: any) {
    try {
      console.log('Creating product with data:', productData);
      
      // Si productData est déjà un FormData, l'utiliser directement
      let formData: FormData;
      if (productData instanceof FormData) {
        formData = productData;
        console.log('✅ Utilisation du FormData fourni directement');
      } else {
        // Sinon, créer un nouveau FormData
        formData = new FormData();
        
        // Ajouter les champs de base
        formData.append('nom', productData.nom);
        formData.append('description_courte', productData.description_courte || 'Description courte');
        formData.append('description_longue', productData.description_longue || productData.description_courte || 'Description longue');
        formData.append('prix_achat', productData.prix_achat.toString());
        formData.append('prix_vente', productData.prix_vente.toString());
        
        // Gérer le stock - utiliser stock_initial ou stock selon ce qui est disponible
        const stockValue = productData.stock_initial || productData.stock || 0;
        formData.append('stock', stockValue.toString());
        formData.append('sku', productData.sku);
        if (productData.code_barre) {
          formData.append('code_barre', productData.code_barre);
        }
        formData.append('slug', productData.slug);
        formData.append('categorie', productData.categorie);
        formData.append('marque', productData.marque);
        formData.append('unite_mesure', productData.unite_mesure || 'piece');
        formData.append('tva_taux', (productData.tva_taux || 18.0).toString());
        formData.append('statut', productData.statut || 'actif');
        formData.append('vendable', (productData.vendable !== undefined ? productData.vendable : true).toString());
        formData.append('achetable', (productData.achetable !== undefined ? productData.achetable : true).toString());
        formData.append('visible_catalogue', (productData.visible_catalogue !== undefined ? productData.visible_catalogue : true).toString());
        
        // Ajouter les champs optionnels
        if (productData.dimensions && Object.keys(productData.dimensions).length > 0) {
          formData.append('dimensions', JSON.stringify(productData.dimensions));
        }
        if (productData.couleurs_disponibles && productData.couleurs_disponibles.length > 0) {
          formData.append('couleurs_disponibles', JSON.stringify(productData.couleurs_disponibles));
        }
        if (productData.tailles_disponibles && productData.tailles_disponibles.length > 0) {
          formData.append('tailles_disponibles', JSON.stringify(productData.tailles_disponibles));
        }
        if (productData.point_recommande) {
          formData.append('point_recommande', productData.point_recommande.toString());
        }
        if (productData.poids) {
          formData.append('poids', productData.poids.toString());
        }
        if (productData.date_peremption) {
          formData.append('date_peremption', productData.date_peremption);
        }
        if (productData.duree_conservation) {
          formData.append('duree_conservation', productData.duree_conservation.toString());
        }
        
        // Ajouter les images si présentes
        if (productData.images && productData.images.length > 0) {
          productData.images.forEach((image: File) => {
            formData.append('images', image);
          });
          console.log(`✅ ${productData.images.length} image(s) ajoutée(s) au FormData`);
        } else {
          console.log("⚠️ Aucune image fournie pour le produit");
        }
      }
      
      console.log('FormData prepared for product creation');

      return await this.request('/products/products/', {
        method: 'POST',
        body: formData,
        headers: {
          // Ne pas définir Content-Type, laissez le navigateur le faire pour FormData
        }
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
      formData.append('produit', productId); // L'ID du produit
      formData.append('principale', 'false'); // Le backend gérera automatiquement la première comme principale
      formData.append('alt_text', `Image du produit ${productId}`);
      
      console.log('FormData contents:', {
        image: imageFile.name,
        produit: productId,
        principale: 'false',
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
      
      // Vérifier s'il y a des images à uploader
      const hasImages = updates.images && updates.images.length > 0;
      
      if (hasImages) {
        // Utiliser FormData pour supporter les images
        const formData = new FormData();
        
        // Ajouter les champs de base
        formData.append('nom', updates.nom);
        formData.append('description_courte', updates.description_courte);
        formData.append('description_longue', updates.description_longue);
        formData.append('prix_achat', updates.prix_achat.toString());
        formData.append('prix_vente', updates.prix_vente.toString());
        formData.append('stock', (updates.stock || updates.stock_initial || 0).toString());
        formData.append('sku', updates.sku);
        if (updates.code_barre) {
          formData.append('code_barre', updates.code_barre);
        }
        formData.append('categorie', updates.categorie);
        formData.append('marque', updates.marque);
        formData.append('unite_mesure', updates.unite_mesure || 'piece');
        formData.append('tva_taux', (updates.tva_taux || 18.0).toString());
        formData.append('statut', updates.statut || 'actif');
        formData.append('vendable', (updates.vendable !== undefined ? updates.vendable : true).toString());
        formData.append('achetable', (updates.achetable !== undefined ? updates.achetable : true).toString());
        formData.append('visible_catalogue', (updates.visible_catalogue !== undefined ? updates.visible_catalogue : true).toString());
        
        // Ajouter les champs optionnels
        if (updates.couleurs_disponibles && updates.couleurs_disponibles.length > 0) {
          formData.append('couleurs_disponibles', JSON.stringify(updates.couleurs_disponibles));
        }
        if (updates.tailles_disponibles && updates.tailles_disponibles.length > 0) {
          formData.append('tailles_disponibles', JSON.stringify(updates.tailles_disponibles));
        }
        if (updates.date_peremption) {
          formData.append('date_peremption', updates.date_peremption);
        }
        if (updates.duree_conservation) {
          formData.append('duree_conservation', updates.duree_conservation.toString());
        }
        
        // Ajouter les images
        updates.images.forEach((image: File) => {
          formData.append('images', image);
        });
        
        console.log(`✅ ${updates.images.length} image(s) ajoutée(s) au FormData pour la mise à jour`);
        
        return await this.request(`/products/products/${id}/`, {
          method: 'PUT',
          body: formData,
          headers: {
            // Ne pas définir Content-Type, laissez le navigateur le faire pour FormData
          }
        });
      } else {
        // Utiliser JSON pour les mises à jour sans images
        const processedData = {
          nom: updates.nom,
          description_courte: updates.description_courte,
          description_longue: updates.description_longue,
          prix_achat: parseFloat(updates.prix_achat),
          prix_vente: parseFloat(updates.prix_vente),
          stock: parseInt(updates.stock || updates.stock_initial || 0),
          sku: updates.sku,
          code_barre: updates.code_barre || null,
          categorie: updates.categorie,
          marque: updates.marque,
          unite_mesure: updates.unite_mesure || 'piece',
          tva_taux: parseFloat(updates.tva_taux) || 18.0,
          statut: updates.statut || 'actif',
          vendable: updates.vendable !== undefined ? updates.vendable : true,
          achetable: updates.achetable !== undefined ? updates.achetable : true,
          visible_catalogue: updates.visible_catalogue !== undefined ? updates.visible_catalogue : true,
          couleurs_disponibles: updates.couleurs_disponibles || [],
          tailles_disponibles: updates.tailles_disponibles || [],
          date_peremption: updates.date_peremption || null,
          duree_conservation: updates.duree_conservation || null,
          en_promotion: updates.en_promotion || false
        };

        console.log('Processed update data (JSON):', processedData);

        return await this.request(`/products/products/${id}/`, {
          method: 'PUT',
          body: JSON.stringify(processedData),
          headers: {
            'Content-Type': 'application/json',
          }
        });
      }
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

  // Créer un Client (CRM) pour les ventes
  async createClient(clientData: any) {
    return this.request('/customers/clients/', {
      method: 'POST',
      body: JSON.stringify(clientData),
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

  // Analytics
  async getDashboardMetrics(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/analytics/dashboard-summary/?${queryString}`);
  }

  async getEntrepreneurDashboard(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/analytics/entrepreneur-dashboard/?${queryString}`);
  }

  async getClientDashboard(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/analytics/client-dashboard/?${queryString}`);
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
    try {
      const queryString = new URLSearchParams(params).toString();
      return await this.request(`/users/users/?${queryString}`);
    } catch (error: any) {
      // Si l'erreur est 401 ou 403, c'est probablement normal (utilisateur non-admin)
      // Ne pas la logger comme une erreur critique
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        console.log('ℹ️ Accès non autorisé pour getUsers (normal pour les non-admins)');
        throw error; // Re-lancer l'erreur pour que le code appelant puisse la gérer
      }
      // Pour les autres erreurs, logger normalement
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
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

  // Synchronisation des données
  async syncData() {
    try {
      console.log('Démarrage de la synchronisation des données...');
      
      // Synchroniser les produits
      const products = await this.getAllProducts();
      
      // Synchroniser les clients
      const customers = await this.getCustomers();
      
      // Synchroniser les ventes
      const sales = await this.getSales();
      
      // Mettre à jour le cache global
      const syncData = {
        products,
        customers,
        sales,
        timestamp: Date.now(),
        version: '1.0'
      };
      
      localStorage.setItem('sync_data', JSON.stringify(syncData));
      
      console.log('Synchronisation terminée:', syncData);
      return syncData;
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      throw error;
    }
  }

  // Vérifier la cohérence des données
  async checkDataConsistency() {
    try {
      const cachedData = localStorage.getItem('sync_data');
      if (!cachedData) {
        return { consistent: false, reason: 'Aucune donnée en cache' };
      }
      
      const data = JSON.parse(cachedData);
      const now = Date.now();
      const cacheAge = now - data.timestamp;
      
      // Vérifier si le cache est trop ancien (plus de 5 minutes)
      if (cacheAge > 5 * 60 * 1000) {
        return { consistent: false, reason: 'Cache trop ancien', age: cacheAge };
      }
      
      return { consistent: true, data };
    } catch (error) {
      console.error('Erreur lors de la vérification de cohérence:', error);
      return { consistent: false, reason: 'Erreur de parsing' };
    }
  }

  // Forcer la synchronisation
  async forceSync() {
    try {
      console.log('Forçage de la synchronisation...');
      
      // Nettoyer le cache
      localStorage.removeItem('sync_data');
      localStorage.removeItem('cached_products');
      localStorage.removeItem('cached_companies');
      
      // Relancer la synchronisation
      return await this.syncData();
    } catch (error) {
      console.error('Erreur lors du forçage de synchronisation:', error);
      throw error;
    }
  }

  // === MÉTHODES POUR LES VENTES ===

  // Créer une vente
  async createSale(saleData: any) {
    try {
      // S'assurer que lignes_data est toujours un tableau
      const processedData = { ...saleData };
      
      // GARANTIR que lignes_data est toujours un tableau, même s'il est undefined, null, ou autre
      if (!processedData.lignes_data) {
        // Si lignes_data est undefined, null, ou falsy, initialiser un tableau vide
        processedData.lignes_data = [];
      } else if (!Array.isArray(processedData.lignes_data)) {
        // Si lignes_data n'est pas un tableau, le convertir
        console.warn('⚠️ lignes_data n\'est pas un tableau, conversion en cours...', processedData.lignes_data);
        // Si c'est un objet, le convertir en tableau
        if (typeof processedData.lignes_data === 'object' && processedData.lignes_data !== null) {
          // Si c'est un objet avec des clés numériques ou des valeurs, utiliser Object.values
          processedData.lignes_data = Object.values(processedData.lignes_data);
        } else {
          // Sinon, envelopper dans un tableau
          processedData.lignes_data = [processedData.lignes_data];
        }
      }
      
      // Valider qu'il y a au moins une ligne
      if (processedData.lignes_data.length === 0) {
        throw new Error('Au moins une ligne de vente est requise');
      }
      
      // Valider chaque ligne
      processedData.lignes_data = processedData.lignes_data.map((ligne: any, index: number) => {
        if (!ligne || typeof ligne !== 'object') {
          throw new Error(`Ligne ${index + 1} invalide: doit être un objet`);
        }
        
        // S'assurer que produit est présent
        if (!ligne.produit) {
          throw new Error(`Ligne ${index + 1}: le champ 'produit' est requis`);
        }
        
        // S'assurer que les valeurs numériques sont bien des nombres
        return {
          produit: ligne.produit,
          quantite: Number(ligne.quantite) || 1,
          prix_unitaire: Number(ligne.prix_unitaire) || 0,
          remise_pourcentage: Number(ligne.remise_pourcentage) || 0,
          tva_taux: Number(ligne.tva_taux) || 18.00,
          variante: ligne.variante || null,
          notes: ligne.notes || ''
        };
      });
      
      // Validation finale avant envoi
      if (!Array.isArray(processedData.lignes_data)) {
        console.error('❌ ERREUR CRITIQUE: lignes_data n\'est toujours pas un tableau après traitement!', {
          type: typeof processedData.lignes_data,
          value: processedData.lignes_data,
          isArray: Array.isArray(processedData.lignes_data)
        });
        throw new Error('Erreur de format: lignes_data doit être un tableau');
      }
      
      // Créer une copie propre pour éviter tout problème de sérialisation
      const finalData = {
        ...processedData,
        lignes_data: JSON.parse(JSON.stringify(processedData.lignes_data))
      };
      
      console.log('📦 Données de vente traitées:', JSON.stringify(finalData, null, 2));
      console.log('📦 Validation finale lignes_data:', {
        isArray: Array.isArray(finalData.lignes_data),
        length: finalData.lignes_data.length,
        type: typeof finalData.lignes_data,
        stringified: JSON.stringify(finalData.lignes_data).substring(0, 200)
      });
      
      console.log('📤 Envoi de la requête POST vers /sales/ventes/...');
      const response = await this.request('/sales/ventes/', {
        method: 'POST',
        body: JSON.stringify(finalData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('✅ Réponse reçue du serveur:', response);
      return response;
    } catch (error: any) {
      console.error('❌ ========== ERREUR DANS createSale ==========');
      console.error('❌ Erreur lors de la création de vente:', error);
      console.error('❌ Type d\'erreur:', typeof error);
      console.error('❌ Message:', error?.message);
      console.error('❌ Response:', error?.response);
      console.error('❌ Response Status:', error?.response?.status);
      console.error('❌ Response Data:', error?.response?.data);
      console.error('❌ Response Headers:', error?.response?.headers);
      
      // Améliorer le message d'erreur
      if (error?.response?.data) {
        const errorData = error.response.data;
        console.error('❌ Détails de l\'erreur API:', JSON.stringify(errorData, null, 2));
      }
      
      throw error;
    }
  }

  // Obtenir les ventes
  async getSales(params: any = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `/sales/ventes/?${queryString}`;
      
      return await this.request(url);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des ventes:', error);
      throw error;
    }
  }

  // Obtenir une vente par ID
  async getSale(saleId: string) {
    try {
      return await this.request(`/sales/ventes/${saleId}/`);
    } catch (error: any) {
      console.error('Erreur lors de la récupération de la vente:', error);
      throw error;
    }
  }

  // Mettre à jour le statut d'une vente
  async updateSaleStatus(saleId: string, status: string) {
    try {
      return await this.request(`/sales/ventes/${saleId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ statut: status }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  }

  // Confirmer une vente
  async confirmSale(saleId: string) {
    try {
      return await this.request(`/sales/ventes/${saleId}/confirm/`, {
        method: 'POST',
      });
    } catch (error: any) {
      console.error('Erreur lors de la confirmation de la vente:', error);
      throw error;
    }
  }

  // Annuler une vente
  async cancelSale(saleId: string, reason: string = '') {
    try {
      return await this.request(`/sales/ventes/${saleId}/cancel/`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error: any) {
      console.error('Erreur lors de l\'annulation de la vente:', error);
      throw error;
    }
  }

  // Générer une facture PDF
  async generateInvoicePDF(saleId: string) {
    try {
      // L'endpoint print_invoice retourne directement un PDF (HttpResponse)
      // On doit utiliser fetch directement pour obtenir le blob
      const response = await fetch(`${API_BASE_URL}/sales/ventes/${saleId}/print_invoice/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token || localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      return {
        pdf_url: url,
        blob: blob,
      };
    } catch (error: any) {
      console.error('Erreur lors de la génération du PDF:', error);
      throw error;
    }
  }

  // Télécharger une facture PDF directement
  async downloadInvoicePDF(saleId: string, filename?: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/sales/ventes/${saleId}/print_invoice/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token || localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la génération du PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `facture-${saleId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { success: true };
    } catch (error: any) {
      console.error('Erreur lors du téléchargement du PDF:', error);
      throw error;
    }
  }

  // Récupérer les commandes du client
  async getClientOrders(params?: { status?: string; page_size?: number }) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status && params.status !== 'all') {
        // Mapper les statuts frontend vers les statuts backend
        const statusMap: Record<string, string> = {
          'processing': 'en_attente',
          'shipped': 'expediee',
          'delivered': 'livree',
          'cancelled': 'annulee'
        };
        const backendStatus = statusMap[params.status] || params.status;
        queryParams.append('statut', backendStatus);
      }
      if (params?.page_size) {
        queryParams.append('page_size', params.page_size.toString());
      }
      queryParams.append('ordering', '-date_creation');
      
      // Construire l'endpoint correctement (sans / avant le ?)
      const queryString = queryParams.toString();
      const endpoint = `/sales/ventes${queryString ? '?' + queryString : ''}`;
      console.log('🔍 Appel API getClientOrders:', endpoint);
      console.log('🔍 Paramètres de requête:', Object.fromEntries(queryParams));
      
      const response = await this.request(endpoint);
      console.log('📦 Réponse brute getClientOrders:', response);
      console.log('📦 Type de réponse:', typeof response);
      console.log('📦 Est un tableau?', Array.isArray(response));
      
      // Gérer différents formats de réponse
      let orders = [];
      if (Array.isArray(response)) {
        orders = response;
        console.log('✅ Réponse est un tableau direct');
      } else if (response?.results && Array.isArray(response.results)) {
        orders = response.results;
        console.log('✅ Réponse contient results:', response.results.length);
        if (response.pagination) {
          console.log('📊 Pagination:', response.pagination);
        }
      } else if (response?.data && Array.isArray(response.data)) {
        orders = response.data;
        console.log('✅ Réponse contient data:', response.data.length);
      } else if (response && typeof response === 'object') {
        // Essayer de trouver les résultats dans différentes structures
        const possibleKeys = ['results', 'data', 'items', 'orders', 'ventes'];
        for (const key of possibleKeys) {
          if (response[key] && Array.isArray(response[key])) {
            orders = response[key];
            console.log(`✅ Réponse contient ${key}:`, response[key].length);
            break;
          }
        }
        
        if (orders.length === 0) {
          console.warn('⚠️ Format de réponse inattendu:', {
            type: typeof response,
            isArray: Array.isArray(response),
            hasResults: !!response?.results,
            hasData: !!response?.data,
            hasPagination: !!response?.pagination,
            keys: Object.keys(response)
          });
          // Afficher toute la structure pour débogage
          console.warn('⚠️ Structure complète de la réponse:', JSON.stringify(response, null, 2));
        }
      }
      
      console.log(`📦 ${orders.length} commande(s) récupérée(s) pour le client`);
      
      // Log détaillé pour le débogage
      if (orders.length > 0) {
        console.log('📦 Détails des commandes:', orders.map((o: any) => ({
          id: o.id,
          numero_facture: o.numero_facture,
          client_id: o.client,
          client_email: o.client_email || o.client?.email,
          statut: o.statut,
          date_creation: o.date_creation,
          entrepreneur: o.entrepreneur
        })));
      } else {
        console.warn('⚠️ Aucune commande trouvée pour le client');
        console.warn('⚠️ Réponse complète:', JSON.stringify(response, null, 2));
        console.warn('⚠️ Type de réponse:', typeof response);
        if (response && typeof response === 'object') {
          console.warn('⚠️ Clés de la réponse:', Object.keys(response));
          if (response.count !== undefined) {
            console.warn('⚠️ Nombre total de commandes (count):', response.count);
          }
        }
      }
      
      return orders;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des commandes:', error);
      // Retourner un tableau vide au lieu de lancer une erreur
      return [];
    }
  }

  // === MÉTHODES POUR LA GESTION DES STOCKS ===

  // Mettre à jour le stock d'un produit
  async updateProductStock(productId: string, quantityChange: number) {
    try {
      console.log('Mise à jour du stock:', productId, quantityChange);
      
      // Utiliser directement PATCH pour mettre à jour uniquement le stock
      // Cela évite d'appeler getProduct qui peut causer des erreurs 500
      const currentStockResponse = await this.request(`/products/products/${productId}/`, {
        method: 'GET',
      });
      
      // Gérer différents formats de réponse
      const currentStock = currentStockResponse.stock || 
                          currentStockResponse.stock_actuel || 
                          currentStockResponse.stock_disponible || 
                          0;
      
      const newStock = Math.max(0, parseInt(String(currentStock)) + quantityChange);
      
      // Utiliser PATCH pour mettre à jour uniquement le stock
      return await this.request(`/products/products/${productId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ stock: newStock }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du stock:', error);
      // Ne pas bloquer la vente si la mise à jour du stock échoue
      console.warn('La vente a été créée mais le stock n\'a pas pu être mis à jour. Veuillez le mettre à jour manuellement.');
      throw error;
    }
  }
}

export const apiService = new ApiService();
export default apiService;