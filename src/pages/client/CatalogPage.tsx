import React, { useState, useEffect } from 'react';
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


  // Synchroniser les données avec le service centralisé
  useEffect(() => {
    if (safeSyncedProducts.length > 0) {
      setProducts(safeSyncedProducts);
      setFilteredProducts(safeSyncedProducts);
      updateCategoryCounts(safeSyncedProducts);
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

  // Charger les produits quand les filtres changent
  useEffect(() => {
    loadProducts();
  }, [searchTerm, selectedCategory, priceRange, sortBy, currentPage]);

  // Re-filtrer les produits côté client
  useEffect(() => {
    if (products && products.length > 0) {
      setFilteredProducts(products);
      updateCategoryCounts(products);
    }
  }, [products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log('Chargement des produits...');
      
      // Construire les paramètres de requête
      const params = new URLSearchParams();
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      if (selectedCategory !== 'all') {
        params.append('categorie', selectedCategory);
      }
      
      
      if (priceRange[0] > 0) {
        params.append('prix_min', priceRange[0].toString());
      }
      
      if (priceRange[1] < 1000000) {
        params.append('prix_max', priceRange[1].toString());
      }
      
      // Ajouter le tri
      let ordering = '';
      switch (sortBy) {
        case 'price-low':
          ordering = 'prix_vente';
          break;
        case 'price-high':
          ordering = '-prix_vente';
          break;
        case 'newest':
          ordering = '-date_creation';
          break;
        case 'popularity':
        default:
          ordering = '-popularite_score';
          break;
      }
      if (ordering) {
        params.append('ordering', ordering);
      }
      
      // Ajouter la pagination
      params.append('page', currentPage.toString());
      params.append('page_size', '15');
      
      const response = await apiService.getProducts(params.toString());
      console.log('Produits chargés:', response);
      
      // Mettre à jour les informations de pagination
      setTotalPages(Math.ceil(response.count / 15));
      setTotalProducts(response.count);
      
      // Transformer les données pour correspondre au format attendu
      const transformedProducts = response.results?.map((product: any) => {

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
          image: product.images?.[0]?.image ? decodeURIComponent(product.images[0].image.replace('/media/', '')) : getProductImage(categoryName, product.nom, product.id),
          images: product.images?.length > 0 ? product.images.map((img: any) => img.image ? decodeURIComponent(img.image.replace('/media/', '')) : img.image) : productImages,
          category: categoryName,
          categoryId: product.categorie?.id,
          brand: product.marque_nom || product.marque || 'Marque inconnue',
          brandId: product.marque,
          stock: parseInt(product.stock_actuel) || parseInt(product.stock_disponible) || 0,
          inStock: (parseInt(product.stock_actuel) || parseInt(product.stock_disponible) || 0) > 0,
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
          company: product.entreprise?.nom || 'Entreprise inconnue',
          companyId: product.entreprise?.id,
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
      }) || [];
      
      setProducts(transformedProducts);
      
      // Appliquer le filtrage côté client si nécessaire
      let filteredProducts = transformedProducts;
      
      // Filtrage par entreprise côté client (en cas d'échec du filtrage serveur)
      if (selectedCompany !== 'all') {
        filteredProducts = transformedProducts.filter(product => {
          const productCompanyId = typeof product.entreprise === 'object' ? product.entreprise?.id : product.entreprise;
          return productCompanyId === selectedCompany || productCompanyId === parseInt(selectedCompany) || productCompanyId === selectedCompany.toString();
        });
        console.log(`Filtrage côté client - Entreprise: ${selectedCompany}, Produits filtrés: ${filteredProducts.length}`);
      }
      
      setFilteredProducts(filteredProducts);
      console.log('Produits transformés:', transformedProducts.length, 'Produits filtrés:', filteredProducts.length);
      
      // Mettre à jour les compteurs de catégories
      updateCategoryCounts(filteredProducts);
      
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

  const updateCategoryCounts = (productsList: any[]) => {
    setCategories(prevCategories => 
      prevCategories.map(category => {
        if (category.id === 'all') {
          return { ...category, count: productsList.length };
        }
        return {
          ...category,
          count: productsList.filter(p => p.category === category.name).length
        };
      })
    );
    
    setCompanies(prevCompanies => 
      prevCompanies.map(company => {
        if (company.id === 'all') {
          return { ...company, count: productsList.length };
        }
        return {
          ...company,
          count: productsList.filter(p => p.companyId === company.id).length
        };
      })
    );
  };

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
      {/* Debug Cart Info */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">🐛 Debug Panier</h3>
        <div className="text-sm text-yellow-700 dark:text-yellow-300">
          <p>Articles dans le panier: {cartItems.length}</p>
          <p>Total d'articles: {cartSummary.totalItems}</p>
          <p>Sous-total: {cartSummary.subtotal.toLocaleString()} XOF</p>
          <p>Total: {cartSummary.total.toLocaleString()} XOF</p>
        </div>
      </div>

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
                  {totalProducts} produit(s) trouvé(s) - Page {currentPage} sur {totalPages}
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
              {filteredProducts && filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Aucun produit trouvé
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Essayez de modifier vos critères de recherche
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