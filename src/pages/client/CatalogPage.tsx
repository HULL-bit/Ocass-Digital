import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Heart, 
  ShoppingCart, 
  Star, 
  Eye,
  Tag,
  Package,
  Zap,
  TrendingUp,
  MapPin,
  Truck,
  Shield,
  Award,
  X,
  Plus,
  Minus
} from 'lucide-react';
import Button from '../../components/ui/Button';
import apiService from '../../services/api/realApi';
import clientApiService from '../../services/api/clientApi';
import useDataSync from '../../hooks/useDataSync';
import useCart from '../../hooks/useCart';
import { getCompanyLogo } from '../../utils/companyLogos';
import { getProductImage, getProductImages } from '../../utils/productImages';

const CatalogPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popularity');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  // Utiliser le hook de synchronisation des données (automatique)
  const { products: syncedProducts, companies: syncedCompanies } = useDataSync();
  
  // Protection contre les valeurs undefined
  const safeSyncedProducts = syncedProducts || [];
  const safeSyncedCompanies = syncedCompanies || [];
  
  // Utiliser le hook du panier
  const { 
    cartItems, 
    cartSummary, 
    addToCart, 
    updateQuantity, 
    removeFromCart, 
    isInCart, 
    getItemQuantity 
  } = useCart();
  
  // Métriques réelles du client
  const [clientMetrics, setClientMetrics] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  
  // Nouveaux états pour le filtrage et la pagination
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showFilters, setShowFilters] = useState(false);


  const updateCategoryCounts = useCallback((productsList: any[]) => {
    setCategories(prevCategories => {
      // Vérifier si les catégories ont déjà été initialisées
      if (prevCategories.length === 0) {
        return prevCategories;
      }
      return prevCategories.map(category => {
        if (category.id === 'all') {
          return { ...category, count: productsList.length };
        }
        return {
          ...category,
          count: productsList.filter(p => p.category === category.name || p.categoryId === category.id).length
        };
      });
    });
    
    setCompanies(prevCompanies => {
      // Vérifier si les entreprises ont déjà été initialisées
      if (prevCompanies.length === 0) {
        return prevCompanies;
      }
      return prevCompanies.map(company => {
        if (company.id === 'all') {
          return { ...company, count: productsList.length };
        }
        return {
          ...company,
          count: productsList.filter(p => {
            const productCompanyId = p.companyId || (typeof p.entreprise === 'object' ? p.entreprise?.id : p.entreprise);
            return productCompanyId === company.id || 
                   productCompanyId === parseInt(company.id) || 
                   productCompanyId?.toString() === company.id?.toString();
          }).length
        };
      });
    });
  }, []);

  // Mettre à jour les compteurs de catégories quand les produits changent
  useEffect(() => {
    if (products && products.length > 0) {
      updateCategoryCounts(products);
    }
  }, [products, updateCategoryCounts]);

  // Synchroniser les données avec le service centralisé
  useEffect(() => {
    if (safeSyncedProducts.length > 0) {
      setProducts(safeSyncedProducts);
    }
  }, [safeSyncedProducts]);

  useEffect(() => {
    if (safeSyncedCompanies.length > 0) {
      setCompanies(safeSyncedCompanies);
    }
  }, [safeSyncedCompanies]);

  // Charger les données réelles du client
  useEffect(() => {
    const loadClientData = async () => {
      try {
        const metrics = await clientApiService.getClientMetrics();
        setClientMetrics(metrics);
      } catch (error) {
        console.error('Erreur lors du chargement des métriques client:', error);
      }
    };

    loadClientData();
  }, []);

  // Charger les produits depuis l'API
  useEffect(() => {
    loadProducts();
    loadCategories();
    loadFavorites();
  }, [searchParams]);

  // Filtrer les produits avec useMemo pour éviter les re-renders inutiles
  const filteredProductsMemo = useMemo(() => {
    if (!products || products.length === 0) {
      return [];
    }

    let filtered = [...products];
    
    // Filtrage par recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.name?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.brand?.toLowerCase().includes(searchLower) ||
        product.category?.toLowerCase().includes(searchLower)
      );
    }
    
    // Filtrage par catégorie
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => {
        const categoryMatch = product.categoryId === selectedCategory || 
                             product.category === selectedCategory ||
                             product.categoryId?.toString() === selectedCategory?.toString();
        
        // Vérifier aussi par nom de catégorie si disponible
        const selectedCat = categories?.find((c: any) => c.id === selectedCategory || c.id?.toString() === selectedCategory?.toString());
        const nameMatch = selectedCat && product.category?.toLowerCase() === selectedCat.name?.toLowerCase();
        
        return categoryMatch || nameMatch;
      });
    }
    
    // Filtrage par prix
    if (priceRange[0] > 0 || priceRange[1] < 1000000) {
      filtered = filtered.filter(product => 
        product.price >= priceRange[0] && product.price <= priceRange[1]
      );
    }
    
    // Filtrage par entreprise
    if (selectedCompany !== 'all') {
      filtered = filtered.filter(product => {
        const productCompanyId = product.companyId || (typeof product.entreprise === 'object' ? product.entreprise?.id : product.entreprise);
        return productCompanyId === selectedCompany || 
               productCompanyId === parseInt(selectedCompany) || 
               productCompanyId?.toString() === selectedCompany?.toString();
      });
    }
    
    // Appliquer le tri
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        break;
      case 'popularity':
      default:
        filtered.sort((a, b) => {
          const scoreA = a.isPopular ? 100 : (a.rating || 0) * 20;
          const scoreB = b.isPopular ? 100 : (b.rating || 0) * 20;
          return scoreB - scoreA;
        });
        break;
    }
    
    return filtered;
  }, [products, searchTerm, selectedCategory, priceRange, sortBy, selectedCompany, categories]);

  // Synchroniser les produits filtrés avec le state
  useEffect(() => {
    setFilteredProducts(filteredProductsMemo);
    setTotalProducts(filteredProductsMemo.length);
    setTotalPages(1);
    console.log('Produits filtrés:', filteredProductsMemo.length, 'sur', products.length, 'total');
  }, [filteredProductsMemo, products.length]);

  // Charger les produits au montage et quand nécessaire
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log('Chargement de tous les produits...');
      
      // Récupérer TOUS les produits sans pagination
      let allProductsData = [];
      
      try {
        // Essayer d'abord getAllProducts() qui récupère tout
        const allProducts = await apiService.getAllProducts();
        console.log('Produits chargés via getAllProducts:', allProducts.length);
        
        if (Array.isArray(allProducts)) {
          allProductsData = allProducts;
        } else if (allProducts && Array.isArray(allProducts.results)) {
          allProductsData = allProducts.results;
        }
      } catch (error) {
        console.warn('Erreur avec getAllProducts, essai avec getProducts paginé:', error);
        // Fallback: récupérer tous les produits avec pagination
        let page = 1;
        let hasMore = true;
        const productsPerPage = 100;
        
        while (hasMore) {
          const params = new URLSearchParams();
          params.append('page', page.toString());
          params.append('page_size', productsPerPage.toString());
          
          const response = await apiService.getProducts(params.toString());
          if (response && response.results && Array.isArray(response.results)) {
            allProductsData = allProductsData.concat(response.results);
            hasMore = response.next && response.results.length === productsPerPage;
            page++;
          } else {
            hasMore = false;
          }
        }
      }
      
      console.log('Total produits récupérés:', allProductsData.length);
      
      // Filtrer uniquement les produits visibles dans le catalogue et actifs
      const visibleProducts = allProductsData.filter((product: any) => {
        const isVisible = product.visible_catalogue !== false && product.statut === 'actif';
        return isVisible;
      });
      
      console.log(`📊 Produits visibles: ${visibleProducts.length} sur ${allProductsData.length} total`);
      
      // Transformer les données pour correspondre au format attendu
      let transformedProducts = visibleProducts.map((product: any) => {

        const categoryName = product.categorie?.nom || 'Autre';
        const productImages = getProductImages(categoryName, product.nom);
        
        return {
          ...product,
          id: product.id,
          name: product.nom,
          description: product.description_courte || product.description_longue || 'Aucune description',
          price: parseFloat(product.prix_vente) || 0,
          originalPrice: parseFloat(product.prix_achat) || 0,
          discount: product.prix_achat && product.prix_vente ? 
            Math.round(((parseFloat(product.prix_achat) - parseFloat(product.prix_vente)) / parseFloat(product.prix_achat)) * 100) : 0,
          rating: 4.0 + Math.random() * 1.0, // Simulation entre 4.0 et 5.0
          reviews: Math.floor(Math.random() * 300) + 20, // Simulation entre 20 et 320
          image: (() => {
            if (product.images && product.images.length > 0) {
              const firstImage = product.images[0];
              if (firstImage.image_url) return firstImage.image_url;
              if (firstImage.image) {
                return firstImage.image.startsWith('http') ? firstImage.image : `http://localhost:8000${firstImage.image}`;
              }
            }
            return getProductImage(categoryName, product.nom, product.id);
          })(),
          images: product.images?.length > 0 ? product.images.map((img: any) => 
            img.image_url || (img.image?.startsWith('http') ? img.image : `http://localhost:8000${img.image}`) || img.image
          ) : productImages,
          category: categoryName,
          categoryId: product.categorie?.id,
          brand: product.marque_nom || product.marque || 'Marque inconnue',
          brandId: product.marque,
          stock: parseInt(product.stock) || parseInt(product.stock_actuel) || parseInt(product.stock_disponible) || 0,
          inStock: (parseInt(product.stock) || parseInt(product.stock_actuel) || parseInt(product.stock_disponible) || 0) > 0,
          colors: product.couleurs_disponibles || ['Noir', 'Blanc'],
          sizes: product.tailles_disponibles || ['S', 'M', 'L'],
          weight: product.poids || 0,
          dimensions: product.dimensions || {},
          features: [
            'Qualité premium',
            'Garantie 1 an',
            'Livraison gratuite'
          ],
          tags: product.tags || ['nouveau', 'populaire'],
          company: product.entreprise?.nom || product.entreprise_nom || 'Entreprise inconnue',
          companyId: typeof product.entreprise === 'object' ? product.entreprise?.id : product.entreprise,
          companyLogo: product.entreprise?.logo || getCompanyLogo(product.entreprise?.id || product.id),
          seller: {
            name: product.entreprise?.nom || 'Entreprise inconnue',
            logo: product.entreprise?.logo || getCompanyLogo(product.entreprise?.id || product.id),
            rating: 4.5 + Math.random() * 0.5, // Simulation entre 4.5 et 5.0
            verified: true,
            location: 'Dakar, Sénégal'
          },
          isNew: product.date_creation ? 
            new Date(product.date_creation) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) : false,
          isPopular: (product.popularite_score || 0) > 80,
          isOnSale: product.en_promotion || false,
          shipping: {
            free: true,
            estimated: '2-3 jours',
            return: '30 jours'
          },
          createdAt: product.date_creation,
          updatedAt: product.date_modification
        };
      });
      
      console.log('✅ Tous les produits transformés:', transformedProducts.length);
      
      // Ajouter les produits mockés de la page d'accueil pour qu'ils apparaissent dans le catalogue
      const mockProducts = [
        // TechSolutions Sénégal
        {
          id: 'mock-ts-1',
          name: 'Ordinateur Pro 14" M3',
          description: 'Ordinateur professionnel haute performance avec processeur M3',
          price: 1450000,
          originalPrice: 1450000,
          discount: 0,
          rating: 4.8,
          reviews: 124,
          image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=800&auto=format&fit=crop',
          images: ['https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=800&auto=format&fit=crop'],
          category: 'Électronique',
          categoryId: '1',
          brand: 'TechSolutions',
          brandId: 'tech',
          stock: 15,
          inStock: true,
          colors: ['Gris', 'Argent'],
          sizes: ['14"'],
          weight: 1.4,
          dimensions: { longueur: 30, largeur: 21, hauteur: 1.5 },
          features: ['Processeur M3', '16GB RAM', '512GB SSD', 'Garantie 2 ans'],
          tags: ['nouveau', 'populaire', 'professionnel'],
          company: 'TechSolutions Sénégal',
          companyId: '1',
          companyLogo: '/Res/iwaria-inc-tvTFMDwH-cQ-unsplash.jpg',
          seller: {
            name: 'TechSolutions Sénégal',
            logo: '/Res/iwaria-inc-tvTFMDwH-cQ-unsplash.jpg',
            rating: 4.9,
            verified: true,
            location: 'Dakar, Sénégal'
          },
          isNew: false,
          isPopular: true,
          isOnSale: false,
          shipping: { free: true, estimated: '2-3 jours', return: '30 jours' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'mock-ts-2',
          name: 'Casque Sans Fil ANC',
          description: 'Casque audio premium avec réduction de bruit active',
          price: 165000,
          originalPrice: 165000,
          discount: 0,
          rating: 4.7,
          reviews: 89,
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
          images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop'],
          category: 'Électronique',
          categoryId: '1',
          brand: 'TechSolutions',
          brandId: 'tech',
          stock: 25,
          inStock: true,
          colors: ['Noir', 'Blanc'],
          sizes: ['Unique'],
          weight: 0.3,
          dimensions: { longueur: 20, largeur: 18, hauteur: 8 },
          features: ['ANC', 'Bluetooth 5.0', 'Autonomie 30h', 'Garantie 1 an'],
          tags: ['populaire', 'audio'],
          company: 'TechSolutions Sénégal',
          companyId: '1',
          companyLogo: '/Res/iwaria-inc-tvTFMDwH-cQ-unsplash.jpg',
          seller: {
            name: 'TechSolutions Sénégal',
            logo: '/Res/iwaria-inc-tvTFMDwH-cQ-unsplash.jpg',
            rating: 4.9,
            verified: true,
            location: 'Dakar, Sénégal'
          },
          isNew: false,
          isPopular: true,
          isOnSale: false,
          shipping: { free: true, estimated: '2-3 jours', return: '30 jours' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'mock-ts-3',
          name: 'Clavier Mécanique Pro',
          description: 'Clavier mécanique rétroéclairé pour gaming et bureautique',
          price: 120000,
          originalPrice: 120000,
          discount: 0,
          rating: 4.6,
          reviews: 67,
          image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?q=80&w=800&auto=format&fit=crop',
          images: ['https://images.unsplash.com/photo-1541140532154-b024d705b90a?q=80&w=800&auto=format&fit=crop'],
          category: 'Électronique',
          categoryId: '1',
          brand: 'TechSolutions',
          brandId: 'tech',
          stock: 18,
          inStock: true,
          colors: ['Noir', 'RGB'],
          sizes: ['Plein format'],
          weight: 1.2,
          dimensions: { longueur: 44, largeur: 13, hauteur: 3 },
          features: ['Switches mécaniques', 'Rétroéclairage RGB', 'Anti-ghosting', 'Garantie 1 an'],
          tags: ['gaming', 'professionnel'],
          company: 'TechSolutions Sénégal',
          companyId: '1',
          companyLogo: '/Res/iwaria-inc-tvTFMDwH-cQ-unsplash.jpg',
          seller: {
            name: 'TechSolutions Sénégal',
            logo: '/Res/iwaria-inc-tvTFMDwH-cQ-unsplash.jpg',
            rating: 4.9,
            verified: true,
            location: 'Dakar, Sénégal'
          },
          isNew: false,
          isPopular: true,
          isOnSale: false,
          shipping: { free: true, estimated: '2-3 jours', return: '30 jours' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'mock-ts-4',
          name: 'Caméra 4K Créateur',
          description: 'Caméra 4K professionnelle pour création de contenu',
          price: 890000,
          originalPrice: 890000,
          discount: 0,
          rating: 4.9,
          reviews: 156,
          image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800&auto=format&fit=crop',
          images: ['https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800&auto=format&fit=crop'],
          category: 'Électronique',
          categoryId: '1',
          brand: 'TechSolutions',
          brandId: 'tech',
          stock: 8,
          inStock: true,
          colors: ['Noir'],
          sizes: ['Unique'],
          weight: 0.6,
          dimensions: { longueur: 10, largeur: 7, hauteur: 5 },
          features: ['4K 60fps', 'Stabilisation', 'Wi-Fi', 'Garantie 2 ans'],
          tags: ['nouveau', 'populaire', 'professionnel'],
          company: 'TechSolutions Sénégal',
          companyId: '1',
          companyLogo: '/Res/iwaria-inc-tvTFMDwH-cQ-unsplash.jpg',
          seller: {
            name: 'TechSolutions Sénégal',
            logo: '/Res/iwaria-inc-tvTFMDwH-cQ-unsplash.jpg',
            rating: 4.9,
            verified: true,
            location: 'Dakar, Sénégal'
          },
          isNew: true,
          isPopular: true,
          isOnSale: false,
          shipping: { free: true, estimated: '2-3 jours', return: '30 jours' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        // Boutique Marie Diallo
        {
          id: 'mock-bm-1',
          name: 'Robe Wax Royale',
          description: 'Robe élégante en tissu wax authentique',
          price: 95000,
          originalPrice: 95000,
          discount: 0,
          rating: 4.8,
          reviews: 203,
          image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?q=80&w=800&auto=format&fit=crop',
          images: ['https://images.unsplash.com/photo-1594633313593-bab3825d0caf?q=80&w=800&auto=format&fit=crop'],
          category: 'Vêtements & Mode',
          categoryId: '2',
          brand: 'Boutique Marie Diallo',
          brandId: 'boutique',
          stock: 45,
          inStock: true,
          colors: ['Multi', 'Rouge', 'Bleu'],
          sizes: ['S', 'M', 'L', 'XL'],
          weight: 0.5,
          dimensions: { longueur: 100, largeur: 50, hauteur: 1 },
          features: ['Tissu wax authentique', 'Taille ajustable', 'Lavable', 'Garantie qualité'],
          tags: ['populaire', 'traditionnel'],
          company: 'Boutique Marie Diallo',
          companyId: '2',
          companyLogo: '/Res/boutque.jpg',
          seller: {
            name: 'Boutique Marie Diallo',
            logo: '/Res/boutque.jpg',
            rating: 4.7,
            verified: true,
            location: 'Dakar, Sénégal'
          },
          isNew: false,
          isPopular: true,
          isOnSale: false,
          shipping: { free: true, estimated: '2-3 jours', return: '30 jours' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'mock-bm-2',
          name: 'Sac Cuir Artisan',
          description: 'Sac en cuir artisanal fait main',
          price: 78000,
          originalPrice: 78000,
          discount: 0,
          rating: 4.6,
          reviews: 142,
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
          images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop'],
          category: 'Vêtements & Mode',
          categoryId: '2',
          brand: 'Boutique Marie Diallo',
          brandId: 'boutique',
          stock: 32,
          inStock: true,
          colors: ['Marron', 'Noir'],
          sizes: ['Unique'],
          weight: 0.8,
          dimensions: { longueur: 35, largeur: 25, hauteur: 15 },
          features: ['Cuir véritable', 'Fait main', 'Fermeture sécurisée', 'Garantie artisan'],
          tags: ['artisan', 'premium'],
          company: 'Boutique Marie Diallo',
          companyId: '2',
          companyLogo: '/Res/boutque.jpg',
          seller: {
            name: 'Boutique Marie Diallo',
            logo: '/Res/boutque.jpg',
            rating: 4.7,
            verified: true,
            location: 'Dakar, Sénégal'
          },
          isNew: false,
          isPopular: true,
          isOnSale: false,
          shipping: { free: true, estimated: '2-3 jours', return: '30 jours' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'mock-bm-3',
          name: 'Boubou Homme Brodé',
          description: 'Boubou traditionnel brodé main pour homme',
          price: 65000,
          originalPrice: 65000,
          discount: 0,
          rating: 4.7,
          reviews: 178,
          image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop',
          images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop'],
          category: 'Vêtements & Mode',
          categoryId: '2',
          brand: 'Boutique Marie Diallo',
          brandId: 'boutique',
          stock: 28,
          inStock: true,
          colors: ['Blanc', 'Bleu', 'Beige'],
          sizes: ['S', 'M', 'L', 'XL'],
          weight: 0.7,
          dimensions: { longueur: 120, largeur: 60, hauteur: 1 },
          features: ['Brodé main', 'Tissu premium', 'Taille ajustable', 'Traditionnel'],
          tags: ['traditionnel', 'populaire'],
          company: 'Boutique Marie Diallo',
          companyId: '2',
          companyLogo: '/Res/boutque.jpg',
          seller: {
            name: 'Boutique Marie Diallo',
            logo: '/Res/boutque.jpg',
            rating: 4.7,
            verified: true,
            location: 'Dakar, Sénégal'
          },
          isNew: false,
          isPopular: true,
          isOnSale: false,
          shipping: { free: true, estimated: '2-3 jours', return: '30 jours' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'mock-bm-4',
          name: 'Sandales Cuir Premium',
          description: 'Sandales en cuir premium confortables',
          price: 35000,
          originalPrice: 35000,
          discount: 0,
          rating: 4.5,
          reviews: 234,
          image: 'https://images.unsplash.com/photo-1544966503-7cc4ac881e57?q=80&w=800&auto=format&fit=crop',
          images: ['https://images.unsplash.com/photo-1544966503-7cc4ac881e57?q=80&w=800&auto=format&fit=crop'],
          category: 'Vêtements & Mode',
          categoryId: '2',
          brand: 'Boutique Marie Diallo',
          brandId: 'boutique',
          stock: 56,
          inStock: true,
          colors: ['Marron', 'Noir'],
          sizes: ['40', '41', '42', '43', '44', '45'],
          weight: 0.4,
          dimensions: { longueur: 28, largeur: 10, hauteur: 3 },
          features: ['Cuir véritable', 'Semelle confort', 'Lavable', 'Toutes tailles'],
          tags: ['confort', 'premium'],
          company: 'Boutique Marie Diallo',
          companyId: '2',
          companyLogo: '/Res/boutque.jpg',
          seller: {
            name: 'Boutique Marie Diallo',
            logo: '/Res/boutque.jpg',
            rating: 4.7,
            verified: true,
            location: 'Dakar, Sénégal'
          },
          isNew: false,
          isPopular: true,
          isOnSale: false,
          shipping: { free: true, estimated: '2-3 jours', return: '30 jours' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        // Pharmacie Moderne
        {
          id: 'mock-pm-1',
          name: 'Vitamine C 1000mg',
          description: 'Complément alimentaire vitamine C haute dose',
          price: 8500,
          originalPrice: 8500,
          discount: 0,
          rating: 4.6,
          reviews: 312,
          image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800&auto=format&fit=crop',
          images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800&auto=format&fit=crop'],
          category: 'Pharmacie',
          categoryId: '9',
          brand: 'Pharmacie Moderne',
          brandId: 'pharma',
          stock: 120,
          inStock: true,
          colors: ['Orange'],
          sizes: ['60 comprimés'],
          weight: 0.1,
          dimensions: { longueur: 8, largeur: 4, hauteur: 4 },
          features: ['1000mg par comprimé', 'Complément alimentaire', 'Boîte de 60', 'Garantie qualité'],
          tags: ['santé', 'populaire'],
          company: 'Pharmacie Moderne',
          companyId: '3',
          companyLogo: '/Res/SuperMarche.jpg',
          seller: {
            name: 'Pharmacie Moderne',
            logo: '/Res/SuperMarche.jpg',
            rating: 4.8,
            verified: true,
            location: 'Dakar, Sénégal'
          },
          isNew: false,
          isPopular: true,
          isOnSale: false,
          shipping: { free: true, estimated: '2-3 jours', return: '30 jours' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'mock-pm-2',
          name: 'Gel Hydroalcoolique',
          description: 'Gel désinfectant pour les mains 500ml',
          price: 2500,
          originalPrice: 2500,
          discount: 0,
          rating: 4.8,
          reviews: 456,
          image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=800&auto=format&fit=crop',
          images: ['https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=800&auto=format&fit=crop'],
          category: 'Pharmacie',
          categoryId: '9',
          brand: 'Pharmacie Moderne',
          brandId: 'pharma',
          stock: 200,
          inStock: true,
          colors: ['Transparent'],
          sizes: ['500ml'],
          weight: 0.6,
          dimensions: { longueur: 8, largeur: 6, hauteur: 20 },
          features: ['70% alcool', 'Sans rinçage', 'Hydratant', 'Pratique'],
          tags: ['hygiène', 'essentiel'],
          company: 'Pharmacie Moderne',
          companyId: '3',
          companyLogo: '/Res/SuperMarche.jpg',
          seller: {
            name: 'Pharmacie Moderne',
            logo: '/Res/SuperMarche.jpg',
            rating: 4.8,
            verified: true,
            location: 'Dakar, Sénégal'
          },
          isNew: false,
          isPopular: true,
          isOnSale: false,
          shipping: { free: true, estimated: '2-3 jours', return: '30 jours' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'mock-pm-3',
          name: 'Crème Solaire SPF50',
          description: 'Protection solaire haute performance SPF50',
          price: 9800,
          originalPrice: 9800,
          discount: 0,
          rating: 4.7,
          reviews: 189,
          image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800&auto=format&fit=crop',
          images: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800&auto=format&fit=crop'],
          category: 'Pharmacie',
          categoryId: '9',
          brand: 'Pharmacie Moderne',
          brandId: 'pharma',
          stock: 85,
          inStock: true,
          colors: ['Blanc'],
          sizes: ['200ml'],
          weight: 0.3,
          dimensions: { longueur: 6, largeur: 4, hauteur: 18 },
          features: ['SPF50', 'Résistant à l\'eau', 'Hypoallergénique', 'Protection UVA/UVB'],
          tags: ['santé', 'protection'],
          company: 'Pharmacie Moderne',
          companyId: '3',
          companyLogo: '/Res/SuperMarche.jpg',
          seller: {
            name: 'Pharmacie Moderne',
            logo: '/Res/SuperMarche.jpg',
            rating: 4.8,
            verified: true,
            location: 'Dakar, Sénégal'
          },
          isNew: false,
          isPopular: true,
          isOnSale: false,
          shipping: { free: true, estimated: '2-3 jours', return: '30 jours' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'mock-pm-4',
          name: 'Tensiomètre Bras',
          description: 'Tensiomètre électronique pour bras professionnel',
          price: 29500,
          originalPrice: 29500,
          discount: 0,
          rating: 4.9,
          reviews: 267,
          image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=800&auto=format&fit=crop',
          images: ['https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=800&auto=format&fit=crop'],
          category: 'Pharmacie',
          categoryId: '9',
          brand: 'Pharmacie Moderne',
          brandId: 'pharma',
          stock: 42,
          inStock: true,
          colors: ['Blanc', 'Bleu'],
          sizes: ['Unique'],
          weight: 0.5,
          dimensions: { longueur: 15, largeur: 12, hauteur: 8 },
          features: ['Électronique', 'Écran LCD', 'Mémoire', 'Précis', 'Garantie 2 ans'],
          tags: ['santé', 'médical', 'populaire'],
          company: 'Pharmacie Moderne',
          companyId: '3',
          companyLogo: '/Res/SuperMarche.jpg',
          seller: {
            name: 'Pharmacie Moderne',
            logo: '/Res/SuperMarche.jpg',
            rating: 4.8,
            verified: true,
            location: 'Dakar, Sénégal'
          },
          isNew: false,
          isPopular: true,
          isOnSale: false,
          shipping: { free: true, estimated: '2-3 jours', return: '30 jours' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      // Combiner les produits de l'API avec les produits mockés (éviter les doublons)
      const existingProductNames = new Set(transformedProducts.map(p => p.name?.toLowerCase()));
      const uniqueMockProducts = mockProducts.filter(mock => !existingProductNames.has(mock.name.toLowerCase()));
      
      const allProducts = [...transformedProducts, ...uniqueMockProducts];
      
      console.log('✅ Produits API:', transformedProducts.length, 'Produits mockés ajoutés:', uniqueMockProducts.length, 'Total:', allProducts.length);
      
      // Stocker tous les produits (sans filtres)
      setProducts(allProducts);
      
      // Les filtres seront appliqués dans le useEffect ci-dessus
      console.log('📦 Produits chargés et prêts à être affichés');
      
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      // En cas d'erreur, utiliser les données en cache ou vides
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fonctions pour gérer le panier
  const handleAddToCart = (product: any) => {
    console.log('handleAddToCart appelé avec:', { 
      product: product.name || product.nom, 
      productId: product.id,
      quantity, 
      selectedColor, 
      selectedSize 
    });
    
    // S'assurer que le produit a un ID valide
    if (!product.id) {
      console.error('Produit sans ID:', product);
      return;
    }
    
    const success = addToCart(product, quantity, selectedColor, selectedSize);
    console.log('Résultat addToCart:', success);
    
    if (success) {
      // Afficher une notification de succès
      console.log('Produit ajouté au panier:', product.name || product.nom);
      // Réinitialiser les sélections
      setSelectedColor('');
      setSelectedSize('');
      setQuantity(1);
    } else {
      console.error('Erreur lors de l\'ajout au panier');
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    const success = removeFromCart(productId);
    if (success) {
      console.log('Produit retiré du panier:', productId);
    }
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    const success = updateQuantity(productId, newQuantity);
    if (success) {
      console.log('Quantité mise à jour:', productId, newQuantity);
    }
  };

  // Fonctions pour gérer les favoris
  const toggleFavorite = (productId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
        // Retirer des favoris dans le localStorage
        const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const updatedFavorites = savedFavorites.filter((id: number) => id !== productId);
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
        console.log('💖 Produit retiré des favoris:', productId);
      } else {
        newFavorites.add(productId);
        // Ajouter aux favoris dans le localStorage
        const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        savedFavorites.push(productId);
        localStorage.setItem('favorites', JSON.stringify(savedFavorites));
        console.log('💖 Produit ajouté aux favoris:', productId);
      }
      
      // Déclencher un événement pour notifier les autres composants
      window.dispatchEvent(new CustomEvent('favoritesUpdated', {
        detail: { favorites: Array.from(newFavorites) }
      }));
      
      return newFavorites;
    });
  };

  const isFavorite = (productId: number) => {
    return favorites.has(productId);
  };

  // Charger les favoris depuis le localStorage
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(new Set(savedFavorites));
  }, []);


  // Fonction pour changer de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fonction pour réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedCompany('all');
    setPriceRange([0, 1000000]);
    setCurrentPage(1);
  };


  const loadCategories = async () => {
    try {
      const response = await apiService.getCategories();
      console.log('Catégories chargées:', response);
      
      const transformedCategories = [
        { id: 'all', name: 'Toutes les catégories', count: 0, icon: '📦' },
        ...(response.results?.map((category: any) => ({
          id: category.id,
          name: category.nom,
          count: 0, // Sera mis à jour après le chargement des produits
          icon: '🏷️'
        })) || [])
      ];
      
      setCategories(transformedCategories);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      // En cas d'erreur, utiliser seulement la catégorie "Toutes"
      setCategories([
        { id: 'all', name: 'Toutes les catégories', count: products?.length || 0, icon: '📦' }
      ]);
    }
  };

  const loadCompanies = async () => {
    try {
      const response = await apiService.getCompanies();
      console.log('Entreprises chargées:', response);
      
      const transformedCompanies = [
        { id: 'all', name: 'Toutes les entreprises', count: 0, icon: '🏢' },
        ...(response.results?.map((company: any) => ({
          id: company.id,
          name: company.nom || company.name,
          count: 0, // Sera mis à jour après le chargement des produits
          icon: '🏢'
        })) || [])
      ];
      
      setCompanies(transformedCompanies);
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises:', error);
      // En cas d'erreur, utiliser seulement l'entreprise "Toutes"
      setCompanies([
        { id: 'all', name: 'Toutes les entreprises', count: 0, icon: '🏢' }
      ]);
    }
  };

  const loadFavorites = () => {
    try {
      const savedFavorites = localStorage.getItem('favorites');
      if (savedFavorites) {
        setFavorites(new Set(JSON.parse(savedFavorites)));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error);
    }
  };



  const handleQuickAdd = (product: any) => {
    if (product.inStock) {
      handleAddToCart(product);
    }
  };

  const mockProducts = [
    {
      id: '1',
      name: 'iPhone 15 Pro',
      description: 'Le smartphone le plus avancé avec puce A17 Pro et caméra révolutionnaire',
      price: 850000,
      originalPrice: 950000,
      discount: 10,
      rating: 4.8,
      reviews: 124,
      image: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
      images: [
        'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
        'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
      ],
      category: 'Électronique',
      brand: 'Apple',
      inStock: true,
      stockCount: 15,
      isNew: true,
      isFavorite: false,
      colors: ['Titane Naturel', 'Titane Bleu', 'Titane Blanc', 'Titane Noir'],
      sizes: ['128GB', '256GB', '512GB', '1TB'],
      seller: {
        name: 'TechSolutions Sénégal',
        rating: 4.9,
        logo: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2',
        location: 'Dakar, Sénégal',
        verified: true,
      },
      shipping: {
        free: true,
        time: '24-48h',
        methods: ['Livraison Express', 'Point Relais'],
      },
      features: ['5G', 'Face ID', 'Caméra Pro', 'USB-C'],
    },
    {
      id: '2',
      name: 'MacBook Air M3',
      description: 'Ordinateur portable ultra-fin avec puce M3 et autonomie exceptionnelle',
      price: 1150000,
      originalPrice: 1150000,
      discount: 0,
      rating: 4.9,
      reviews: 89,
      image: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
      images: [
        'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
      ],
      category: 'Électronique',
      brand: 'Apple',
      inStock: true,
      stockCount: 8,
      isNew: false,
      isFavorite: true,
      colors: ['Gris Sidéral', 'Argent', 'Or', 'Minuit'],
      sizes: ['256GB', '512GB', '1TB', '2TB'],
      seller: {
        name: 'TechSolutions Sénégal',
        rating: 4.9,
        logo: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2',
        location: 'Dakar, Sénégal',
        verified: true,
      },
      shipping: {
        free: true,
        time: '24-48h',
        methods: ['Livraison Express'],
      },
      features: ['Puce M3', '18h autonomie', 'Écran Retina', 'Touch ID'],
    },
    {
      id: '3',
      name: 'Robe Élégante Africaine',
      description: 'Robe traditionnelle moderne en wax premium, confectionnée par des artisans locaux',
      price: 35000,
      originalPrice: 45000,
      discount: 22,
      rating: 4.6,
      reviews: 67,
      image: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
      images: [
        'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
      ],
      category: 'Mode & Beauté',
      brand: 'Artisan Local',
      inStock: true,
      stockCount: 25,
      isNew: false,
      isFavorite: false,
      colors: ['Bleu Royal', 'Rouge Passion', 'Vert Émeraude', 'Jaune Soleil'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      seller: {
        name: 'Boutique Marie Diallo',
        rating: 4.7,
        logo: 'https://images.pexels.com/photos/4386476/pexels-photo-4386476.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2',
        location: 'Dakar, Sénégal',
        verified: true,
      },
      shipping: {
        free: false,
        cost: 2500,
        time: '2-3 jours',
        methods: ['Livraison Standard', 'Point Relais'],
      },
      features: ['Wax Authentique', 'Fait Main', 'Coupe Moderne', 'Artisan Local'],
    },
    {
      id: '4',
      name: 'Air Jordan 1 Retro',
      description: 'Baskets iconiques Air Jordan 1 en cuir premium avec design légendaire',
      price: 145000,
      originalPrice: 145000,
      discount: 0,
      rating: 4.9,
      reviews: 203,
      image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
      images: [
        'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
      ],
      category: 'Mode & Beauté',
      brand: 'Nike',
      inStock: true,
      stockCount: 12,
      isNew: true,
      isFavorite: true,
      colors: ['Chicago', 'Bred', 'Royal', 'Shadow', 'Court Purple'],
      sizes: ['38', '39', '40', '41', '42', '43', '44', '45'],
      seller: {
        name: 'Boutique Marie Diallo',
        rating: 4.7,
        logo: 'https://images.pexels.com/photos/4386476/pexels-photo-4386476.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2',
        location: 'Dakar, Sénégal',
        verified: true,
      },
      shipping: {
        free: true,
        time: '24-48h',
        methods: ['Livraison Express', 'Point Relais'],
      },
      features: ['Cuir Premium', 'Semelle Air', 'Design Iconique', 'Édition Limitée'],
    },
  ];


  const ProductCard = ({ product }: { product: any }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
      className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden group cursor-pointer"
      onClick={() => setSelectedProduct(product)}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2';
          }}
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {product.isNew && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Nouveau
            </span>
          )}
          {product.discount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              -{product.discount}%
            </span>
          )}
          {!product.inStock && (
            <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Rupture
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(product.id);
            }}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              favorites.has(product.id)
                ? 'bg-red-500 text-white' 
                : 'bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Company */}
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
            <img 
              src={product.companyLogo} 
              alt={product.company}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling.style.display = 'flex';
              }}
            />
            <Package className="w-3 h-3 text-blue-600 hidden" />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">{product.company}</span>
          <Shield className="w-3 h-3 text-blue-500" />
        </div>

        {/* Product Info */}
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Rating */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {(product.rating || 0).toFixed(1)}
          </span>
          <span className="text-xs text-gray-500">({product.reviews || 0})</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {(product.price || 0).toLocaleString()} XOF
              </span>
              {product.discount > 0 && (
                <span className="text-sm text-gray-500 line-through">
                  {(product.originalPrice || 0).toLocaleString()} XOF
                </span>
              )}
            </div>
            {product.shipping?.free && (
              <span className="text-xs text-green-600 font-medium">Livraison gratuite</span>
            )}
          </div>
        </div>

        {/* Stock Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1">
            <Package className="w-3 h-3 text-gray-500" />
            <span className={`text-xs ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
              {product.inStock ? `${product.stock} en stock` : 'Rupture de stock'}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Truck className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-500">{product.shipping?.estimated || '2-3 jours'}</span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <div className="flex items-center space-x-2">
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(product);
            }}
            disabled={!product.inStock}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {product.inStock ? 'Ajouter au panier' : 'Rupture de stock'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProduct(product);
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Catalogue Produits</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {selectedCompany !== 'all' 
              ? `Produits de ${companies.find(c => c.id === selectedCompany)?.name || 'cette entreprise'}`
              : 'Découvrez notre sélection de produits premium'
            }
          </p>
          {selectedCompany !== 'all' && (
            <div className="mt-2">
              <button
                onClick={() => setSelectedCompany('all')}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                ← Voir tous les produits
              </button>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'secondary'}
            size="sm"
            icon={<Grid className="w-4 h-4" />}
            onClick={() => setViewMode('grid')}
          >
            Grille
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'secondary'}
            size="sm"
            icon={<List className="w-4 h-4" />}
            onClick={() => setViewMode('list')}
          >
            Liste
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Search */}
          <div className="card-premium p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher des produits..."
                className="input-premium pl-10 w-full"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="card-premium p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Catégories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors
                    ${selectedCategory === category.id
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <div className="flex items-center space-x-2">
                    <span>{category.icon}</span>
                    <span className="text-sm">{category.name}</span>
                  </div>
                  <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Companies */}
          <div className="card-premium p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Entreprises</h3>
            <div className="space-y-2">
              {companies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => setSelectedCompany(company.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors
                    ${selectedCompany === company.id
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <div className="flex items-center space-x-2">
                    <span>{company.icon}</span>
                    <span className="text-sm">{company.name}</span>
                  </div>
                  <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
                    {company.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="card-premium p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Fourchette de Prix</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                  className="input-premium text-sm w-20"
                  placeholder="Min"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000000])}
                  className="input-premium text-sm w-20"
                  placeholder="Max"
                />
                <span className="text-xs text-gray-500">XOF</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{(priceRange[0] || 0).toLocaleString()} XOF</span>
                <span className="font-medium">{(priceRange[1] || 0).toLocaleString()} XOF</span>
              </div>
            </div>
          </div>

          {/* Reset Filters */}
          <div className="card-premium p-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetFilters}
              className="w-full"
            >
              Réinitialiser les filtres
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {/* Sort and Filter Bar */}
          <div className="card-premium p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredProducts?.length || 0} produit(s) affiché(s) sur {products?.length || 0} total
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-premium text-sm"
                >
                  <option value="popularity">Popularité</option>
                  <option value="price-low">Prix croissant</option>
                  <option value="price-high">Prix décroissant</option>
                  <option value="rating">Mieux notés</option>
                  <option value="newest">Plus récents</option>
                </select>
                
                <Button variant="secondary" size="sm" icon={<Filter className="w-4 h-4" />}>
                  Filtres
                </Button>
              </div>
            </div>
          </div>

          {/* Products */}
          <motion.div
            layout
            className={`
              grid gap-6
              ${viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                : 'grid-cols-1'
              }
            `}
          >
            <AnimatePresence>
              {loading ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Chargement des produits...</span>
                </div>
              ) : filteredProducts && filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : products && products.length > 0 ? (
                <div className="col-span-full text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Aucun produit ne correspond à vos filtres
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {products.length} produit(s) disponible(s) mais aucun ne correspond à vos critères de recherche
                  </p>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setSelectedCompany('all');
                      setPriceRange([0, 1000000]);
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              ) : (
                <div className="col-span-full text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Aucun produit disponible
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Les produits seront affichés ici une fois qu'ils seront ajoutés au catalogue
                  </p>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                icon={<Minus className="w-4 h-4" />}
              >
                Précédent
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`
                        px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${currentPage === page
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }
                      `}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                icon={<Plus className="w-4 h-4" />}
              >
                Suivant
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Images */}
                <div className="p-6">
                  <div className="aspect-square rounded-xl overflow-hidden mb-4">
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {selectedProduct.images && selectedProduct.images.length > 1 && (
                    <div className="flex space-x-2">
                      {selectedProduct.images.map((img: string, index: number) => (
                        <img
                          key={index}
                          src={img}
                          alt={`${selectedProduct.name} ${index + 1}`}
                          className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200 dark:border-gray-600 cursor-pointer hover:border-primary-500"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <img
                        src={selectedProduct.seller?.logo || selectedProduct.companyLogo || '/default-company.png'}
                        alt={selectedProduct.seller?.name || selectedProduct.company || 'Vendeur'}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedProduct.seller?.name || selectedProduct.company || 'Vendeur inconnu'}
                        </p>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-500">{selectedProduct.seller?.rating || '4.5'}</span>
                          {selectedProduct.seller?.verified && (
                            <Shield className="w-3 h-3 text-blue-500" />
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedProduct.name}
                  </h2>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {selectedProduct.description}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(selectedProduct.rating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedProduct.rating || 0}
                    </span>
                    <span className="text-sm text-gray-500">({selectedProduct.reviews || 0} avis)</span>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        {(selectedProduct.price || 0).toLocaleString()} XOF
                      </span>
                      {selectedProduct.discount > 0 && (
                        <span className="text-lg text-gray-500 line-through">
                          {(selectedProduct.originalPrice || 0).toLocaleString()} XOF
                        </span>
                      )}
                      {selectedProduct.discount > 0 && (
                        <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full font-medium">
                          -{selectedProduct.discount}%
                        </span>
                      )}
                    </div>
                    {selectedProduct.shipping.free ? (
                      <span className="text-sm text-green-600 font-medium">✓ Livraison gratuite</span>
                    ) : (
                      <span className="text-sm text-gray-600">
                        Livraison: {(selectedProduct.shipping?.cost || 0).toLocaleString()} XOF
                      </span>
                    )}
                  </div>

                  {/* Variants */}
                  {selectedProduct.colors && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Couleur</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.colors.map((color: string) => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`px-3 py-1 rounded-lg text-sm border transition-colors ${
                              selectedColor === color
                                ? 'border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-900 dark:text-primary-400'
                                : 'border-gray-300 dark:border-gray-600 hover:border-primary-500'
                            }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedProduct.sizes && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Taille</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.sizes.map((size: string) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`px-3 py-1 rounded-lg text-sm border transition-colors ${
                              selectedSize === size
                                ? 'border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-900 dark:text-primary-400'
                                : 'border-gray-300 dark:border-gray-600 hover:border-primary-500'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Quantité</h4>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(selectedProduct.stockCount, quantity + 1))}
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 mb-6">
                    <Button
                      variant="primary"
                      fullWidth
                      size="lg"
                      icon={<ShoppingCart className="w-5 h-5" />}
                      onClick={() => handleAddToCart(selectedProduct)}
                    >
                      Ajouter au Panier - {((selectedProduct.price || 0) * quantity).toLocaleString()} XOF
                    </Button>
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="secondary" 
                        icon={<Heart className="w-4 h-4" />}
                        onClick={() => toggleFavorite(selectedProduct.id)}
                      >
                        {isFavorite(selectedProduct.id) ? 'Retiré des favoris' : 'Ajouter aux favoris'}
                      </Button>
                      <Button variant="secondary" icon={<Eye className="w-4 h-4" />}>
                        Comparer
                      </Button>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Caractéristiques</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.features.map((feature: string) => (
                        <span
                          key={feature}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Livraison</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Truck className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">Délai: {selectedProduct.shipping.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">Depuis: {selectedProduct.seller?.location || 'Dakar, Sénégal'}</span>
                      </div>
                      {selectedProduct.shipping.free && (
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-600">Livraison gratuite</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CatalogPage;