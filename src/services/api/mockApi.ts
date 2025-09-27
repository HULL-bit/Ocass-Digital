/**
 * API Mock pour simulation backend
 */

// Simulation de délai réseau
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Données mock sénégalaises
export const mockData = {
  users: [
    {
      id: 'admin-1',
      email: 'admin@platform.com',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'admin',
      avatar: 'https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      permissions: ['*'],
    },
    {
      id: 'entrepreneur-1',
      email: 'marie@boutiquemarie.sn',
      firstName: 'Marie',
      lastName: 'Diallo',
      role: 'entrepreneur',
      avatar: 'https://images.pexels.com/photos/3992656/pexels-photo-3992656.png?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      company: {
        id: 'company-1',
        name: 'Boutique Marie Diallo',
        logo: 'https://images.pexels.com/photos/4386476/pexels-photo-4386476.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      },
      permissions: ['inventory:*', 'sales:*', 'customers:*'],
    },
    {
      id: 'client-1',
      email: 'abdou.samb@email.sn',
      firstName: 'Abdou',
      lastName: 'Samb',
      role: 'client',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      permissions: ['profile:*', 'orders:read'],
    },
  ],

  products: [
    {
      id: '1',
      nom: 'Riz Brisé Local',
      description_courte: 'Riz brisé de qualité supérieure produit au Sénégal',
      description_longue: 'Riz brisé cultivé dans la vallée du fleuve Sénégal, parfait pour le thiéboudienne et autres plats traditionnels.',
      categorie: 'Alimentation',
      prix_achat: 8000,
      prix_vente: 12000,
      stock_actuel: 150,
      stock_minimum: 50,
      sku: 'RIZ-BRISE-25KG',
      image: 'https://images.pexels.com/photos/33239/wheat-field-wheat-yellow-grain.jpg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
      statut: 'actif',
      popularite_score: 78,
      nombre_ventes: 125,
      marge_beneficiaire: 50,
      date_creation: '2024-01-10T09:00:00Z',
    },
    {
      id: '2',
      nom: 'Boubou Grand Boubou Homme',
      description_courte: 'Boubou traditionnel brodé main pour homme',
      description_longue: 'Magnifique boubou traditionnel sénégalais avec broderies artisanales, confectionné par des maîtres tailleurs.',
      categorie: 'Artisanat',
      prix_achat: 25000,
      prix_vente: 65000,
      stock_actuel: 8,
      stock_minimum: 5,
      sku: 'BOUBOU-H-001',
      image: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
      statut: 'actif',
      popularite_score: 85,
      nombre_ventes: 45,
      marge_beneficiaire: 160,
      couleurs_disponibles: ['Blanc', 'Bleu Royal', 'Noir', 'Beige'],
      tailles_disponibles: ['M', 'L', 'XL', 'XXL', 'XXXL'],
    },
    {
      id: '3',
      nom: 'Thiakry Traditionnel',
      description_courte: 'Dessert traditionnel sénégalais au lait caillé',
      description_longue: 'Thiakry artisanal préparé selon la recette traditionnelle avec du lait caillé, couscous et arômes naturels.',
      categorie: 'Alimentation',
      prix_achat: 800,
      prix_vente: 1500,
      stock_actuel: 0,
      stock_minimum: 20,
      sku: 'THIAKRY-500G',
      image: 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
      statut: 'actif',
      en_rupture: true,
      popularite_score: 92,
      nombre_ventes: 280,
    },
  ],

  customers: [
    {
      id: '1',
      nom: 'Aminata Diop',
      prenom: 'Aminata',
      email: 'aminata.diop@email.sn',
      telephone: '+221 77 123 45 67',
      adresse_facturation: 'Plateau, Dakar',
      segment: 'vip',
      points_fidelite: 450,
      niveau_fidelite: 'or',
      total_achats: 850000,
      nombre_commandes: 28,
    },
    {
      id: '2',
      nom: 'Ousmane Ndiaye',
      prenom: 'Ousmane',
      email: 'ousmane.ndiaye@email.sn',
      telephone: '+221 77 234 56 78',
      adresse_facturation: 'Médina, Dakar',
      segment: 'regulier',
      points_fidelite: 125,
      niveau_fidelite: 'bronze',
      total_achats: 320000,
      nombre_commandes: 12,
    },
  ],

  sales: [
    {
      id: 'VTE-001',
      numero_facture: 'FAC202401001',
      client: {
        id: '1',
        nom: 'Aminata Diop',
        email: 'aminata.diop@email.sn',
      },
      date_creation: '2024-01-15T10:30:00Z',
      statut: 'terminee',
      sous_total: 850000,
      total_ttc: 850000,
      mode_paiement: 'wave',
      statut_paiement: 'completed',
      lignes: [
        {
          id: '1',
          produit: {
            id: '1',
            nom: 'iPhone 15 Pro',
            sku: 'IPH15PRO128',
          },
          quantite: 1,
          prix_unitaire: 850000,
          total_ttc: 850000,
        },
      ],
    },
  ],

  analytics: {
    dashboard: {
      ventes_jour: 125000,
      ventes_semaine: 875000,
      ventes_mois: 2350000,
      clients_actifs: 156,
      produits_stock: 234,
      commandes_attente: 12,
      marge_moyenne: 22.8,
      taux_conversion: 3.2,
      panier_moyen: 28659,
      croissance_ventes: 18.5,
    },
    sales: {
      periode: 'month',
      ventes_totales: 2350000,
      nombre_transactions: 82,
      panier_moyen: 28659,
      produits_top: [
        { nom: 'Riz Brisé Local', ventes: 125, revenus: 1500000 },
        { nom: 'Boubou Grand Boubou', ventes: 45, revenus: 2925000 },
      ],
      ventes_par_jour: [
        { date: '2024-01-01', ventes: 45000 },
        { date: '2024-01-02', ventes: 67000 },
        { date: '2024-01-03', ventes: 89000 },
      ],
    },
  },
};

// API Mock Service
export class MockApiService {
  // Authentication
  static async login(email: string, password: string, role: string) {
    await delay(1000);
    
    const user = mockData.users.find(u => u.email === email && u.role === role);
    if (user && password === 'password') {
      return {
        success: true,
        data: {
          access: 'mock-jwt-token',
          refresh: 'mock-refresh-token',
          user,
          permissions: user.permissions,
        },
      };
    }
    
    throw new Error('Identifiants invalides');
  }

  static async register(userData: any) {
    await delay(1500);
    
    const newUser = {
      id: `user-${Date.now()}`,
      ...userData,
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      permissions: userData.role === 'admin' ? ['*'] : ['profile:*'],
    };
    
    mockData.users.push(newUser);
    
    return {
      success: true,
      data: {
        access: 'mock-jwt-token',
        refresh: 'mock-refresh-token',
        user: newUser,
      },
    };
  }

  // Products
  static async getProducts(params: any = {}) {
    await delay(800);
    
    let products = [...mockData.products];
    
    // Filtrage
    if (params.search) {
      products = products.filter(p => 
        p.nom.toLowerCase().includes(params.search.toLowerCase()) ||
        p.sku.toLowerCase().includes(params.search.toLowerCase())
      );
    }
    
    if (params.categorie && params.categorie !== 'all') {
      products = products.filter(p => p.categorie.toLowerCase() === params.categorie.toLowerCase());
    }
    
    return {
      success: true,
      data: {
        results: products,
        pagination: {
          count: products.length,
          page_size: 50,
          current_page: 1,
          total_pages: 1,
        },
      },
    };
  }

  static async createProduct(productData: any) {
    await delay(1200);
    
    const newProduct = {
      id: `product-${Date.now()}`,
      ...productData,
      stock_actuel: 0,
      popularite_score: 0,
      nombre_ventes: 0,
      date_creation: new Date().toISOString(),
      statut: 'actif',
    };
    
    mockData.products.push(newProduct);
    
    return {
      success: true,
      data: newProduct,
    };
  }

  static async updateProduct(id: string, updates: any) {
    await delay(1000);
    
    const index = mockData.products.findIndex(p => p.id === id);
    if (index !== -1) {
      mockData.products[index] = { ...mockData.products[index], ...updates };
      return {
        success: true,
        data: mockData.products[index],
      };
    }
    
    throw new Error('Produit non trouvé');
  }

  static async deleteProduct(id: string) {
    await delay(800);
    
    const index = mockData.products.findIndex(p => p.id === id);
    if (index !== -1) {
      mockData.products.splice(index, 1);
      return { success: true };
    }
    
    throw new Error('Produit non trouvé');
  }

  // Customers
  static async getCustomers(params: any = {}) {
    await delay(600);
    
    let customers = [...mockData.customers];
    
    if (params.search) {
      customers = customers.filter(c => 
        c.nom.toLowerCase().includes(params.search.toLowerCase()) ||
        c.email.toLowerCase().includes(params.search.toLowerCase())
      );
    }
    
    return {
      success: true,
      data: {
        results: customers,
        pagination: {
          count: customers.length,
          page_size: 50,
          current_page: 1,
          total_pages: 1,
        },
      },
    };
  }

  static async createCustomer(customerData: any) {
    await delay(1000);
    
    const newCustomer = {
      id: `customer-${Date.now()}`,
      ...customerData,
      points_fidelite: 0,
      niveau_fidelite: 'bronze',
      total_achats: 0,
      nombre_commandes: 0,
      segment: 'nouveau',
      date_creation: new Date().toISOString(),
    };
    
    mockData.customers.push(newCustomer);
    
    return {
      success: true,
      data: newCustomer,
    };
  }

  // Sales
  static async getSales(params: any = {}) {
    await delay(700);
    
    return {
      success: true,
      data: {
        results: mockData.sales,
        pagination: {
          count: mockData.sales.length,
          page_size: 50,
          current_page: 1,
          total_pages: 1,
        },
      },
    };
  }

  static async createSale(saleData: any) {
    await delay(1500);
    
    const newSale = {
      id: `sale-${Date.now()}`,
      numero_facture: `FAC${Date.now()}`,
      ...saleData,
      date_creation: new Date().toISOString(),
      statut: 'confirmee',
      statut_paiement: 'completed',
    };
    
    mockData.sales.push(newSale);
    
    return {
      success: true,
      data: newSale,
    };
  }

  // Analytics
  static async getDashboardMetrics(params: any = {}) {
    await delay(500);
    
    // Simulation de données variables
    const baseMetrics = mockData.analytics.dashboard;
    const variation = () => Math.random() * 0.1 - 0.05; // ±5% variation
    
    return {
      success: true,
      data: {
        ...baseMetrics,
        ventes_jour: Math.floor(baseMetrics.ventes_jour * (1 + variation())),
        clients_actifs: Math.floor(baseMetrics.clients_actifs * (1 + variation())),
        commandes_attente: Math.floor(baseMetrics.commandes_attente * (1 + variation())),
        timestamp: new Date().toISOString(),
      },
    };
  }

  static async getSalesAnalytics(params: any = {}) {
    await delay(800);
    
    return {
      success: true,
      data: mockData.analytics.sales,
    };
  }

  // Notifications
  static async getNotifications() {
    await delay(400);
    
    const notifications = [
      {
        id: '1',
        titre: 'Stock bas détecté',
        message: 'Le produit Thiakry Traditionnel est en rupture de stock',
        type: 'warning',
        lue: false,
        date_creation: new Date().toISOString(),
        action_url: '/entrepreneur/inventory',
      },
      {
        id: '2',
        titre: 'Nouvelle vente !',
        message: 'Vente de 65,000 XOF réalisée (Boubou Grand Boubou)',
        type: 'success',
        lue: false,
        date_creation: new Date(Date.now() - 300000).toISOString(),
      },
      {
        id: '3',
        titre: 'Paiement reçu',
        message: 'Paiement Wave Money de 12,000 XOF confirmé',
        type: 'success',
        lue: true,
        date_creation: new Date(Date.now() - 600000).toISOString(),
      },
    ];
    
    return {
      success: true,
      data: notifications,
    };
  }

  // File Upload Simulation
  static async uploadFile(file: File) {
    await delay(2000);
    
    // Simulation d'upload
    const mockUrl = `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000)}/mock-upload.jpg`;
    
    return {
      success: true,
      data: {
        url: mockUrl,
        filename: file.name,
        size: file.size,
      },
    };
  }

  // Payment Processing
  static async processPayment(paymentData: any) {
    await delay(3000);
    
    // Simulation de traitement paiement
    const success = Math.random() > 0.1; // 90% de succès
    
    if (success) {
      return {
        success: true,
        data: {
          reference: `PAY${Date.now()}`,
          status: 'completed',
          amount: paymentData.amount,
          method: paymentData.method,
        },
      };
    } else {
      throw new Error('Échec du paiement. Veuillez réessayer.');
    }
  }

  // Real-time data simulation
  static subscribeToUpdates(callback: (data: any) => void) {
    const interval = setInterval(() => {
      const updateTypes = ['stock_alert', 'new_sale', 'payment_received', 'new_customer'];
      const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)];
      
      const updates = {
        stock_alert: {
          type: 'stock_alert',
          data: {
            product_name: 'Thiakry Traditionnel',
            current_stock: 0,
            minimum_stock: 20,
          },
        },
        new_sale: {
          type: 'new_sale',
          data: {
            amount: Math.floor(Math.random() * 100000) + 10000,
            customer: 'Aminata Diop',
            product: 'Boubou Grand Boubou',
          },
        },
        payment_received: {
          type: 'payment_received',
          data: {
            amount: Math.floor(Math.random() * 50000) + 5000,
            method: Math.random() > 0.5 ? 'Wave Money' : 'Orange Money',
            reference: `PAY${Date.now()}`,
          },
        },
        new_customer: {
          type: 'new_customer',
          data: {
            name: 'Nouveau Client',
            email: 'nouveau@email.sn',
          },
        },
      };
      
      callback(updates[randomType as keyof typeof updates]);
    }, 15000); // Mise à jour toutes les 15 secondes
    
    return () => clearInterval(interval);
  }
}

// Hook pour utiliser l'API Mock
export const useMockApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = async (apiFunction: () => Promise<any>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    apiCall,
    clearError: () => setError(null),
  };
};