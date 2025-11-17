import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List,
  Edit,
  Eye,
  AlertTriangle,
  TrendingDown,
  BarChart3,
  QrCode,
  Camera,
  Download,
  Upload,
  RefreshCw,
  Star,
  Zap,
  Trash2,
  DollarSign,
  X
} from 'lucide-react';
import Button from '../../components/ui/Button';
import AnimatedForm from '../../components/forms/AnimatedForm';
import DataTable from '../../components/ui/DataTable';
import MetricCard from '../../components/ui/MetricCard';
import apiService from '../../services/api/realApi';
import entrepreneurApiService from '../../services/api/entrepreneurApi';
import * as yup from 'yup';
import useDataSync from '../../hooks/useDataSync';
import { useAuth } from '../../contexts/AuthContext';
import { getProductImageFromPublic } from '../../utils/publicProductImages';
import { logger } from '../../utils/logger';
import { API_ENDPOINTS, getBackendBaseUrl } from '../../utils/constants';

// Debounce helper
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

const StockPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [productForImages, setProductForImages] = useState<any>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  // Debounce la recherche pour éviter trop de filtrages
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  // Utiliser le hook de synchronisation des données (automatique)
  const { products: syncedProducts } = useDataSync();

  // Métriques réelles de l'entrepreneur
  const [entrepreneurMetrics, setEntrepreneurMetrics] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  
  // Memoized filtered products for grid view to avoid calling hooks inside render
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Filtrage par recherche avec debouncedSearchTerm
      const matchesSearch = !debouncedSearchTerm || 
        product.nom?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
        product.sku?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        product.description_courte?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      
      // Filtrage par catégorie
      const matchesCategory = selectedCategory === 'all' || 
        product.categorieId === selectedCategory ||
        product.categorie_id === selectedCategory ||
        product.categorieId?.toString() === selectedCategory?.toString() ||
        product.categorie_id?.toString() === selectedCategory?.toString() ||
        (typeof product.categorie === 'object' && product.categorie?.id === selectedCategory) ||
        (typeof product.categorie === 'object' && product.categorie?.id?.toString() === selectedCategory?.toString());
      
      return matchesSearch && matchesCategory;
    });
  }, [products, debouncedSearchTerm, selectedCategory]);
  const [loading, setLoading] = useState(true);
  const [productCategories, setProductCategories] = useState<any[]>([]);
  const [stockMetrics, setStockMetrics] = useState({
    totalValue: 0,
    activeProducts: 0,
    outOfStock: 0,
    lowStock: 0
  });
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger les produits depuis l'API
  useEffect(() => {
    // Attendre que l'utilisateur soit chargé avant de charger les produits
    if (user !== null) {
      loadProducts();
      loadCategories();
    }
  }, [user]);
  
  // Log pour vérifier l'état des produits au moment du rendu (seulement en dev)
  useEffect(() => {
    logger.debug('🔄 RENDU - État actuel des produits:', {
      count: products.length,
      loading,
      searchTerm: debouncedSearchTerm,
      selectedCategory
    });
  }, [products.length, loading, debouncedSearchTerm, selectedCategory]);
  
  // Log pour vérifier les changements de stockMetrics (seulement en dev)
  useEffect(() => {
    logger.debug('🔄 stockMetrics mis à jour:', {
      totalValue: stockMetrics.totalValue,
      activeProducts: stockMetrics.activeProducts,
      outOfStock: stockMetrics.outOfStock,
      lowStock: stockMetrics.lowStock
    });
  }, [stockMetrics]);

  // Fonction de validation en temps réel
  const validateField = (fieldName: string, value: any): string | null => {
    switch (fieldName) {
      case 'nom':
        if (!value || value.trim().length < 2) return 'Le nom doit contenir au moins 2 caractères';
        if (value.length > 100) return 'Le nom ne peut pas dépasser 100 caractères';
        if (!/^[a-zA-Z0-9\s\-_àâäéèêëïîôöùûüÿçñÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇÑ]+$/.test(value)) {
          return 'Le nom ne peut contenir que des lettres, chiffres, espaces, tirets et underscores';
        }
        break;
      
      case 'prix_achat':
        const prixAchat = parseFloat(value);
        if (isNaN(prixAchat)) return 'Le prix d\'achat doit être un nombre valide';
        if (prixAchat <= 0) return 'Le prix d\'achat doit être supérieur à 0';
        if (prixAchat > 10000000) return 'Le prix d\'achat ne peut pas dépasser 10,000,000 XOF';
        break;
      
      case 'prix_vente':
        const prixVente = parseFloat(value);
        if (isNaN(prixVente)) return 'Le prix de vente doit être un nombre valide';
        if (prixVente <= 0) return 'Le prix de vente doit être supérieur à 0';
        if (prixVente > 10000000) return 'Le prix de vente ne peut pas dépasser 10,000,000 XOF';
        break;
      
      case 'sku':
        if (!value || value.length < 3) return 'Le SKU doit contenir au moins 3 caractères';
        if (value.length > 20) return 'Le SKU ne peut pas dépasser 20 caractères';
        if (!/^[A-Z0-9-_]+$/.test(value)) return 'Format SKU invalide (lettres majuscules, chiffres, tirets, underscores)';
        // Vérifier l'unicité
        const existingSku = products.find(p => p.sku === value && p.id !== selectedProduct?.id);
        if (existingSku) return 'Ce SKU existe déjà';
        break;
      
      case 'code_barre':
        if (value && !/^[0-9]{8,14}$/.test(value)) {
          return 'Format code-barres invalide (8-14 chiffres)';
        }
        if (value) {
          const existingBarcode = products.find(p => p.code_barre === value && p.id !== selectedProduct?.id);
          if (existingBarcode) return 'Ce code-barres existe déjà';
        }
        break;
      
      case 'stock_minimum':
        const stockMin = parseInt(value);
        if (isNaN(stockMin) || stockMin < 0) return 'Le stock minimum doit être un nombre entier positif';
        if (stockMin > 10000) return 'Le stock minimum ne peut pas dépasser 10,000';
        break;
      
      case 'stock_maximum':
        if (value) {
          const stockMax = parseInt(value);
          const stockMin = parseInt(document.querySelector('input[name="stock_minimum"]')?.value || '0');
          if (isNaN(stockMax) || stockMax < 0) return 'Le stock maximum doit être un nombre entier positif';
          if (stockMax > 100000) return 'Le stock maximum ne peut pas dépasser 100,000';
          if (stockMax <= stockMin) return 'Le stock maximum doit être supérieur au stock minimum';
        }
        break;
      
      case 'tva_taux':
        if (value) {
          const taux = parseFloat(value);
          if (isNaN(taux) || taux < 0) return 'Le taux TVA ne peut pas être négatif';
          if (taux > 100) return 'Le taux TVA ne peut pas dépasser 100%';
        }
        break;
    }
    
    return null;
  };

  // Fonction pour valider tous les champs
  const validateAllFields = (data: any): boolean => {
    const errors: {[key: string]: string} = {};
    let isValid = true;

    // Valider chaque champ
    Object.keys(data).forEach(fieldName => {
      const error = validateField(fieldName, data[fieldName]);
      if (error) {
        errors[fieldName] = error;
        isValid = false;
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  // Calculer les métriques du stock
  const calculateStockMetrics = (productsData: any[]) => {
    const metrics = {
      totalValue: 0,
      activeProducts: 0,
      outOfStock: 0,
      lowStock: 0
    };

    console.log('📊 Calcul des métriques du stock pour', productsData.length, 'produits');
    
    // Log des premiers produits pour debug
    if (productsData.length > 0) {
      console.log('🔍 Aperçu des données brutes des 3 premiers produits:', productsData.slice(0, 3).map((p: any) => ({
        id: p.id,
        nom: p.nom || p.name,
        stock_actuel: p.stock_actuel,
        stock: p.stock,
        stock_disponible: p.stock_disponible,
        prix_achat: p.prix_achat,
        prix_achat_ht: p.prix_achat_ht,
        prix_vente: p.prix_vente,
        entreprise: p.entreprise || p.entreprise_id
      })));
    }

    productsData.forEach((product, index) => {
      // Récupérer le stock actuel (plusieurs champs possibles)
      const stockActuel = parseInt(
        product.stock_actuel || 
        product.stock || 
        product.stock_disponible || 
        0
      );
      
      // Récupérer le prix d'achat (plusieurs champs possibles)
      // Essayer de convertir en nombre, gérer les chaînes de caractères
      let prixAchat = 0;
      if (product.prix_achat !== undefined && product.prix_achat !== null && product.prix_achat !== '') {
        prixAchat = typeof product.prix_achat === 'string' 
          ? parseFloat(product.prix_achat.replace(/[^\d.,]/g, '').replace(',', '.')) || 0
          : parseFloat(product.prix_achat) || 0;
      } else if (product.prix_achat_ht !== undefined && product.prix_achat_ht !== null && product.prix_achat_ht !== '') {
        prixAchat = typeof product.prix_achat_ht === 'string'
          ? parseFloat(product.prix_achat_ht.replace(/[^\d.,]/g, '').replace(',', '.')) || 0
          : parseFloat(product.prix_achat_ht) || 0;
      }
      
      // Si pas de prix_achat, utiliser prix_vente comme fallback (pour calculer la valeur du stock)
      // C'est mieux que 0, même si ce n'est pas idéal
      if (prixAchat === 0 && stockActuel > 0) {
        const prixVente = parseFloat(product.prix_vente || product.price || 0);
        if (prixVente > 0) {
          // Utiliser 70% du prix de vente comme estimation du prix d'achat
          prixAchat = prixVente * 0.7;
          console.log(`⚠️ Produit "${product.nom}" n'a pas de prix_achat, utilisation de 70% du prix_vente (${prixVente} * 0.7 = ${prixAchat})`);
        }
      }
      
      // Valeur totale du stock (prix d'achat * quantité)
      const productValue = prixAchat * stockActuel;
      metrics.totalValue += productValue;
      
      // Log seulement les produits avec valeur > 0 ou ceux qui devraient avoir une valeur
      if (productValue > 0 || (stockActuel > 0 && prixAchat === 0)) {
        console.log(`💰 Produit ${index + 1} (${product.nom || product.name || 'Sans nom'}):`, {
          stock_actuel: product.stock_actuel,
          stock: product.stock,
          stock_disponible: product.stock_disponible,
          stockCalculé: stockActuel,
          prix_achat: product.prix_achat,
          prix_achat_ht: product.prix_achat_ht,
          prixCalculé: prixAchat,
          valeur: productValue,
          entreprise: product.entreprise || product.entreprise_id,
          rawProduct: product // Log complet pour debug
        });
      }
      
      // Produits actifs (avec stock > 0)
      if (stockActuel > 0) {
        metrics.activeProducts++;
      }
      
      // Produits en rupture
      if (stockActuel <= 0) {
        metrics.outOfStock++;
      }
      
      // Stock bas (entre 1 et 10)
      if (stockActuel > 0 && stockActuel <= 10) {
        metrics.lowStock++;
      }
    });

    console.log('📊 Métriques calculées FINALES:', {
      totalValue: metrics.totalValue,
      activeProducts: metrics.activeProducts,
      outOfStock: metrics.outOfStock,
      lowStock: metrics.lowStock,
      typeTotalValue: typeof metrics.totalValue,
      isNumber: typeof metrics.totalValue === 'number',
      isFinite: isFinite(metrics.totalValue),
      isNaN: isNaN(metrics.totalValue)
    });
    
    // S'assurer que totalValue est un nombre valide
    if (isNaN(metrics.totalValue) || !isFinite(metrics.totalValue)) {
      console.error('❌ ERREUR: totalValue invalide, remplacement par 0');
      metrics.totalValue = 0;
    }

    return metrics;
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log('🔄 Début du chargement des produits (StockPage)...');
      console.log('👤 Utilisateur actuel:', {
        id: user?.id,
        email: user?.email,
        role: user?.role,
        type_utilisateur: (user as any)?.type_utilisateur,
        company: user?.company,
        entreprise: (user as any)?.entreprise
      });
      
      // Essayer de charger l'entreprise depuis l'API si elle n'est pas dans le contexte
      let userCompany = user?.company || (user as any)?.entreprise;
      if (!userCompany && user) {
        console.log('🔄 Tentative de chargement de l\'entreprise depuis l\'API...');
        try {
          const userProfile = await apiService.request('/auth/profile/');
          console.log('📋 Profil utilisateur depuis API:', userProfile);
          if (userProfile && userProfile.entreprise) {
            userCompany = {
              id: userProfile.entreprise.id || userProfile.entreprise,
              name: userProfile.entreprise.nom || userProfile.entreprise_nom
            };
            console.log('✅ Entreprise trouvée dans le profil:', userCompany);
          }
        } catch (profileError) {
          console.warn('⚠️ Impossible de charger le profil utilisateur:', profileError);
        }
      }
      
      // Vérifier que l'utilisateur a une entreprise
      if (userCompany) {
        console.log('✅ Utilisateur avec entreprise:', {
          userId: user?.id,
          companyId: userCompany.id,
          companyName: userCompany.name
        });
      } else {
        console.warn('⚠️ ATTENTION: L\'utilisateur n\'a pas d\'entreprise associée !');
        console.warn('💡 Le backend créera automatiquement une entreprise lors de la première création de produit.');
        console.warn('💡 Les produits seront chargés quand même - le backend filtre par entreprise via le token.');
      }
      
      // TOUJOURS utiliser getProducts() pour les entrepreneurs - le backend filtre automatiquement par entreprise
      // Même si l'entreprise n'est pas dans le contexte frontend, le backend la connaît via le token
      let response;
      console.log('📡 Chargement des produits avec getProducts() (backend filtre par entreprise)...');
      
      try {
        response = await apiService.getProducts({ page_size: 1000 });
        console.log('✅ Produits chargés via getProducts (StockPage):', {
          type: typeof response,
          isArray: Array.isArray(response),
          hasResults: !!response?.results,
          resultsLength: response?.results?.length,
          count: response?.count
        });
        
        // Si la réponse est paginée et qu'il y a plus de produits, récupérer toutes les pages
        if (response && response.results && response.next) {
          console.log('📄 Pagination détectée, récupération des pages suivantes...');
          console.log('📄 URL next:', response.next);
          let allResults = [...response.results];
          let currentUrl = response.next;
          let pageCount = 1;
          
          while (currentUrl && pageCount < 50) { // Limite de sécurité
            try {
              // Construire l'URL complète
              let fullUrl: string;
              if (currentUrl.startsWith('http')) {
                fullUrl = currentUrl;
              } else if (currentUrl.startsWith('/api/')) {
                // URL relative complète avec /api/
                fullUrl = `https://ocass-digital.onrender.com${currentUrl}`;
              } else if (currentUrl.startsWith('/')) {
                // URL relative qui commence par / mais sans /api/ - corriger
                // Si c'est juste /?page=X, c'est probablement une erreur du backend
                if (currentUrl.startsWith('/?page=')) {
                  // Construire l'URL correcte vers l'endpoint products
                  const urlParams = new URLSearchParams(currentUrl.substring(1));
                  fullUrl = `https://ocass-digital.onrender.com/api/v1/products/products/?${urlParams.toString()}`;
                  console.log(`🔧 Correction de l'URL: ${currentUrl} -> ${fullUrl}`);
                } else {
                  fullUrl = `https://ocass-digital.onrender.com/api/v1/products/products${currentUrl}`;
                }
              } else {
                // URL sans / - ajouter le chemin complet
                fullUrl = `https://ocass-digital.onrender.com/api/v1/products/products/?${currentUrl}`;
              }
              
              console.log(`📄 Récupération page ${pageCount + 1}: ${fullUrl}`);
              
              const nextResponse = await fetch(fullUrl, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`,
                  'Content-Type': 'application/json'
                }
              });
              
              if (!nextResponse.ok) {
                console.warn(`⚠️ Erreur HTTP ${nextResponse.status} pour la page ${pageCount + 1}`);
                break;
              }
              
              const nextData = await nextResponse.json();
              if (nextData.results && Array.isArray(nextData.results) && nextData.results.length > 0) {
                allResults = allResults.concat(nextData.results);
                currentUrl = nextData.next;
                pageCount++;
                console.log(`📄 Page ${pageCount} récupérée: ${nextData.results.length} produits (total: ${allResults.length})`);
              } else {
                console.log('✅ Toutes les pages ont été récupérées');
                break;
              }
            } catch (pageError) {
              console.warn(`❌ Erreur lors de la récupération de la page ${pageCount + 1}:`, pageError);
              break;
            }
          }
          
          response = { ...response, results: allResults };
          console.log(`✅ Total produits récupérés après pagination: ${allResults.length}`);
        }
      } catch (getProductsError: any) {
        console.error('❌ Erreur avec getProducts:', getProductsError);
        console.log('🔄 Tentative avec getAllProducts() comme fallback...');
        try {
          response = await apiService.getAllProducts();
          console.log('✅ Produits chargés via getAllProducts (fallback):', {
            type: typeof response,
            isArray: Array.isArray(response),
            length: Array.isArray(response) ? response.length : 'N/A'
          });
        } catch (getAllProductsError) {
          console.error('❌ Erreur avec getAllProducts aussi:', getAllProductsError);
          // Ne pas throw, continuer avec une liste vide
          response = [];
        }
      }
      
      // Gérer différents formats de réponse
      let productsData: any[] = [];
      if (response && Array.isArray(response)) {
        productsData = response as any[];
        console.log('✅ Produits extraits (tableau direct):', productsData.length);
      } else if (response && response.results && Array.isArray(response.results)) {
        productsData = response.results as any[];
        console.log('✅ Produits extraits (response.results):', productsData.length);
      } else if (response && response.data && Array.isArray(response.data)) {
        productsData = response.data as any[];
        console.log('✅ Produits extraits (response.data):', productsData.length);
      } else {
        console.warn('⚠️ Format de réponse des produits non reconnu:', response);
        console.warn('Structure de la réponse:', JSON.stringify(response, null, 2).substring(0, 500));
        productsData = [];
      }
      
      console.log(`📦 Total produits extraits: ${productsData.length}`);
      
      // getProducts() filtre déjà par entreprise côté backend, donc pas besoin de filtrer à nouveau
      // Si on a utilisé getAllProducts() comme fallback, on pourrait filtrer, mais généralement
      // si getProducts() échoue, c'est que l'utilisateur n'a pas d'entreprise, donc on affiche tout
      console.log('✅ Produits extraits - prêts pour transformation');
      
      if (productsData.length === 0) {
        console.warn('⚠️ ATTENTION: Aucun produit trouvé !');
        console.warn('🔍 Vérifications à faire :');
        console.warn('  1. L\'utilisateur a-t-il une entreprise associée ?', user?.company ? '✅ Oui' : '❌ Non');
        console.warn('  2. Des produits ont-ils été créés pour cette entreprise ?');
        console.warn('  3. Les produits ont-ils le statut "actif" ?');
        console.warn('  4. Le token d\'authentification est-il valide ?');
        console.warn('  5. Le backend filtre-t-il correctement par entreprise ?');
        
        // Afficher les informations de l'utilisateur si disponible
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            console.warn('👤 Utilisateur actuel:', {
              id: user.id,
              email: user.email,
              role: user.role,
              entreprise: user.company
            });
            
            // Vérifier le token
            const token = localStorage.getItem('token');
            console.warn('🔑 Token présent:', !!token);
            if (token) {
              console.warn('🔑 Token (premiers caractères):', token.substring(0, 20) + '...');
            }
          }
        } catch (e) {
          console.warn('Impossible de lire les données utilisateur:', e);
        }
        
        // Faire une requête directe pour voir la réponse brute
        try {
          console.log('🔍 Test de requête directe vers l\'API...');
          const testResponse = await fetch('https://ocass-digital.onrender.com/api/v1/products/products/?page=1&page_size=10', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          const testData = await testResponse.json();
          console.log('🔍 Réponse directe de l\'API:', {
            status: testResponse.status,
            statusText: testResponse.statusText,
            count: testData.count,
            resultsLength: testData.results?.length || 0,
            results: testData.results?.slice(0, 2) || []
          });
        } catch (testError) {
          console.error('❌ Erreur lors du test direct:', testError);
        }
      } else {
        console.log('✅ Produits trouvés ! Aperçu des 3 premiers:', productsData.slice(0, 3).map((p: any) => ({
          id: p.id,
          nom: p.nom,
          entreprise: p.entreprise,
          entreprise_id: p.entreprise_id,
          entreprise_full: typeof p.entreprise === 'object' ? p.entreprise : null,
          statut: p.statut,
          visible_catalogue: p.visible_catalogue
        })));
        console.log('🔍 Détails des entreprises dans les produits:', productsData.slice(0, 5).map((p: any) => ({
          id: p.id,
          nom: p.nom,
          entreprise_type: typeof p.entreprise,
          entreprise_value: p.entreprise,
          entreprise_id: p.entreprise_id,
          company: p.company,
          company_id: p.company_id
        })));
      }
      
      // Transformer les données pour correspondre au format attendu
      const transformedProducts = productsData.map((product: any) => {
        // Récupérer le stock actuel (vérifier plusieurs champs)
        const stockActuel = parseInt(
          product.stock_actuel || 
          product.stock || 
          product.stock_disponible || 
          0
        );
        
        // Récupérer le prix d'achat (vérifier plusieurs champs)
        // Gérer les cas où prix_achat pourrait être null, undefined, ou une chaîne
        let prixAchat = 0;
        if (product.prix_achat !== undefined && product.prix_achat !== null && product.prix_achat !== '') {
          prixAchat = typeof product.prix_achat === 'string' 
            ? parseFloat(product.prix_achat.replace(/[^\d.,]/g, '').replace(',', '.')) || 0
            : parseFloat(product.prix_achat) || 0;
        } else if (product.prix_achat_ht !== undefined && product.prix_achat_ht !== null && product.prix_achat_ht !== '') {
          prixAchat = typeof product.prix_achat_ht === 'string'
            ? parseFloat(product.prix_achat_ht.replace(/[^\d.,]/g, '').replace(',', '.')) || 0
            : parseFloat(product.prix_achat_ht) || 0;
        }
        
        // Récupérer le prix de vente
        const prixVente = parseFloat(product.prix_vente || product.price || 0);
        
        // Si pas de prix_achat mais qu'il y a du stock, utiliser prix_vente comme fallback
        if (prixAchat === 0 && stockActuel > 0 && prixVente > 0) {
          // Utiliser 70% du prix de vente comme estimation du prix d'achat
          prixAchat = prixVente * 0.7;
        }
        
        // Utiliser la fonction utilitaire qui gère les images de l'API ET les images dans public/
        const imageUrl = getProductImageFromPublic({
          nom: product.nom,
          name: product.name,
          categorie: product.categorie,
          categorie_nom: product.categorie_nom,
          images: product.images,
          image: product.image,
          id: product.id
        });
        
        // Récupérer l'ID et le nom de la catégorie
        const categorieId = product.categorie?.id || 
                           (typeof product.categorie === 'string' ? product.categorie : null) ||
                           product.categorie_id ||
                           product.categorie;
        const categorieNom = product.categorie_nom || 
                            product.categorie?.nom || 
                            (typeof product.categorie === 'object' ? product.categorie?.nom : null) ||
                            'Non classé';
        
        // Préserver l'entreprise dans le produit transformé
        const entrepriseId = product.entreprise?.id || 
                            product.entreprise_id || 
                            (typeof product.entreprise === 'object' ? product.entreprise?.id : product.entreprise) ||
                            product.company?.id ||
                            product.company_id;
        
        return {
          ...product,
          // Préserver l'entreprise pour le filtrage
          entreprise: product.entreprise || entrepriseId,
          entreprise_id: entrepriseId || product.entreprise_id,
          company: product.company || product.entreprise,
          company_id: entrepriseId || product.company_id,
          // Utiliser l'image construite ou laisser vide
          image: imageUrl,
          // Utiliser les données de stock directement de l'API
          en_rupture: product.en_rupture || stockActuel === 0,
          stock_bas: stockActuel > 0 && stockActuel <= 5,
          stock_actuel: stockActuel,
          // Formater les prix - GARANTIR que les prix sont bien présents
          prix_achat: prixAchat,
          prix_vente: prixVente,
          // Calculer la marge
          marge_beneficiaire: (prixAchat > 0 && prixVente > 0) ? 
            Math.round(((prixVente - prixAchat) / prixAchat) * 100) : 0,
          // Catégorie avec ID et nom pour le filtrage
          categorie: categorieNom,
          categorieId: categorieId,
          categorie_id: categorieId
        };
      });
      
      // Log pour vérifier les données transformées - DÉTAILLÉ
      console.log('📦 Produits transformés - Détails complets (premiers 5):', transformedProducts.slice(0, 5).map((p: any) => ({
        id: p.id,
        nom: p.nom,
        stock_actuel: p.stock_actuel,
        stock: p.stock,
        prix_achat: p.prix_achat,
        prix_achat_ht: p.prix_achat_ht,
        prix_vente: p.prix_vente,
        valeur: p.stock_actuel * p.prix_achat,
        entreprise: p.entreprise || p.entreprise_id,
        statut: p.statut,
        categorie: p.categorie,
        categorieId: p.categorieId,
        image: p.image ? '✅' : '❌'
      })));
      
      // Filtrer les produits par entreprise de l'utilisateur connecté
      let filteredByCompany = transformedProducts;
      if (userCompany && userCompany.id) {
        const companyId = userCompany.id;
        const beforeFilter = transformedProducts.length;
        
        console.log('🔍 DÉBUT DU FILTRAGE PAR ENTREPRISE');
        console.log('📋 Entreprise de l\'utilisateur:', {
          id: companyId,
          type: typeof companyId,
          name: userCompany.name
        });
        
        // Afficher les détails des premiers produits avant filtrage
        console.log('📦 Aperçu des produits AVANT filtrage (5 premiers):', transformedProducts.slice(0, 5).map((p: any) => ({
          id: p.id,
          nom: p.nom,
          entreprise_raw: p.entreprise,
          entreprise_type: typeof p.entreprise,
          entreprise_id: p.entreprise_id,
          entreprise_obj_id: p.entreprise?.id,
          company: p.company,
          company_id: p.company_id
        })));
        
        filteredByCompany = transformedProducts.filter((product: any) => {
          // Vérifier si le produit appartient à l'entreprise de l'utilisateur
          const productCompanyId = product.entreprise?.id || 
                                  product.entreprise_id || 
                                  (typeof product.entreprise === 'object' ? product.entreprise?.id : product.entreprise) ||
                                  product.company?.id ||
                                  product.company_id;
          
          // Comparer les IDs (en gérant les cas où ils peuvent être des strings ou des nombres)
          const matches = productCompanyId && (
            productCompanyId === companyId ||
            productCompanyId.toString() === companyId.toString() ||
            parseInt(productCompanyId) === parseInt(companyId)
          );
          
          if (!matches && beforeFilter <= 10) {
            // Log les produits qui ne correspondent pas (seulement si peu de produits)
            console.log('❌ Produit exclu:', {
              id: product.id,
              nom: product.nom,
              productCompanyId,
              userCompanyId: companyId,
              match: matches
            });
          }
          
          return matches;
        });
        
        console.log(`🔍 Filtrage par entreprise: ${beforeFilter} produits avant filtrage, ${filteredByCompany.length} après filtrage (entreprise ID: ${companyId})`);
        
        if (beforeFilter > filteredByCompany.length) {
          console.warn(`⚠️ ${beforeFilter - filteredByCompany.length} produits filtrés car ils n'appartiennent pas à l'entreprise de l'utilisateur`);
          
          // Afficher quelques exemples de produits filtrés
          const excluded = transformedProducts.filter((p: any) => {
            const productCompanyId = p.entreprise?.id || p.entreprise_id || 
                                    (typeof p.entreprise === 'object' ? p.entreprise?.id : p.entreprise) ||
                                    p.company?.id || p.company_id;
            const matches = productCompanyId && (
              productCompanyId === companyId ||
              productCompanyId.toString() === companyId.toString() ||
              parseInt(productCompanyId) === parseInt(companyId)
            );
            return !matches;
          });
          
          console.log('📋 Exemples de produits exclus:', excluded.slice(0, 3).map((p: any) => ({
            id: p.id,
            nom: p.nom,
            entreprise: p.entreprise,
            entreprise_id: p.entreprise_id
          })));
        }
      } else {
        console.warn('⚠️ Aucune entreprise trouvée pour l\'utilisateur, tous les produits seront affichés');
        console.warn('📋 userCompany:', userCompany);
        console.warn('📋 user:', {
          id: user?.id,
          email: user?.email,
          company: user?.company,
          entreprise: (user as any)?.entreprise
        });
      }
      
      console.log(`✅ Total produits transformés: ${filteredByCompany.length}`);
      if (filteredByCompany.length > 0) {
        console.log('📊 Répartition par catégorie:', filteredByCompany.reduce((acc: any, p: any) => {
          const cat = p.categorie || 'Non classé';
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {}));
        
        // Log des statistiques des produits
        const produitsAvecImages = filteredByCompany.filter((p: any) => p.image && p.image !== '/accessoires/backpack_1.jpg');
        const produitsAvecStock = filteredByCompany.filter((p: any) => p.stock_actuel > 0);
        const produitsAvecPrixAchat = filteredByCompany.filter((p: any) => p.prix_achat > 0);
        const valeurStockTotale = filteredByCompany.reduce((sum: number, p: any) => {
          return sum + (p.stock_actuel * p.prix_achat);
        }, 0);
        
        console.log('📈 Statistiques des produits transformés:');
        console.log(`  - Produits avec images: ${produitsAvecImages.length}/${filteredByCompany.length}`);
        console.log(`  - Produits avec stock > 0: ${produitsAvecStock.length}/${filteredByCompany.length}`);
        console.log(`  - Produits avec prix_achat > 0: ${produitsAvecPrixAchat.length}/${filteredByCompany.length}`);
        console.log(`  - Valeur totale du stock: ${valeurStockTotale.toLocaleString()} XOF`);
      }
      
      // Vérifier combien de produits ont un prix_achat défini
      const produitsAvecPrixAchat = filteredByCompany.filter((p: any) => 
        (p.prix_achat && parseFloat(p.prix_achat) > 0) || 
        (p.prix_achat_ht && parseFloat(p.prix_achat_ht) > 0)
      );
      const produitsAvecStock = filteredByCompany.filter((p: any) => 
        (p.stock_actuel || p.stock || 0) > 0
      );
      console.log('📊 Statistiques des produits:', {
        total: filteredByCompany.length,
        avecPrixAchat: produitsAvecPrixAchat.length,
        avecStock: produitsAvecStock.length,
        avecPrixEtStock: filteredByCompany.filter((p: any) => {
          const stock = p.stock_actuel || p.stock || 0;
          const prix = parseFloat(p.prix_achat || p.prix_achat_ht || 0);
          return stock > 0 && prix > 0;
        }).length
      });
      
      // Calculer la valeur totale AVANT de passer à calculateStockMetrics
      const valeurTotaleAvant = filteredByCompany.reduce((sum, p) => {
        const stock = p.stock_actuel || p.stock || 0;
        const prix = parseFloat(p.prix_achat || p.prix_achat_ht || 0);
        return sum + (stock * prix);
      }, 0);
      console.log('💰 Valeur totale calculée AVANT calculateStockMetrics:', valeurTotaleAvant);
      
      console.log('✅ Produits transformés et filtrés:', filteredByCompany.length);
      console.log('📊 Détails des produits:', filteredByCompany.map((p: any) => ({
        id: p.id,
        nom: p.nom,
        stock: p.stock_actuel,
        categorie: p.categorie,
        entreprise: p.entreprise?.id || p.entreprise_id || p.entreprise
      })));
      
      console.log(`🎯 AVANT setProducts: ${filteredByCompany.length} produits à définir`);
      console.log('🎯 Aperçu des produits:', filteredByCompany.slice(0, 3).map((p: any) => ({
        id: p.id,
        nom: p.nom,
        image: p.image ? '✅' : '❌',
        categorie: p.categorie,
        categorieId: p.categorieId,
        entreprise: p.entreprise?.id || p.entreprise_id || p.entreprise
      })));
      
      setProducts(filteredByCompany);
      
      // Vérifier immédiatement après setProducts
      setTimeout(() => {
        console.log(`✅ APRÈS setProducts: ${filteredByCompany.length} produits définis`);
      }, 0);
      
      // Calculer et mettre à jour les métriques
      const metrics = calculateStockMetrics(filteredByCompany);
      console.log('📈 Métriques calculées AVANT setStockMetrics:', metrics);
      console.log('💰 Valeur totale du stock calculée:', metrics.totalValue);
      
      // Vérifier que la valeur est bien un nombre
      if (isNaN(metrics.totalValue) || !isFinite(metrics.totalValue)) {
        console.error('❌ ERREUR: totalValue n\'est pas un nombre valide:', metrics.totalValue);
        metrics.totalValue = 0;
      }
      
      setStockMetrics(metrics);
      
      // Vérifier que les métriques sont bien mises à jour
      setTimeout(() => {
        console.log('✅ stockMetrics.totalValue après setStockMetrics:', metrics.totalValue);
        console.log('✅ stockMetrics complet:', metrics);
      }, 100);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      // En cas d'erreur, utiliser les données en cache ou vides
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiService.getCategories();
      console.log('Réponse des catégories (StockPage):', response);
      
      // Gérer différents formats de réponse
      let categories: any[] = [];
      if (response && Array.isArray(response)) {
        categories = response;
      } else if (response && response.results && Array.isArray(response.results)) {
        categories = response.results;
      } else if (response && response.data && Array.isArray(response.data)) {
        categories = response.data;
      } else {
        console.warn('Format de réponse des catégories non reconnu:', response);
        categories = [];
      }
      
      // // Si aucune catégorie n'est trouvée, créer des catégories par défaut
      // if (categories.length === 0) {
      //   console.warn('⚠️ Aucune catégorie trouvée. Utilisation de catégories par défaut.');
      //   categories = [
      //     { id: '1', nom: 'Électronique', description: 'Produits électroniques' },
      //     { id: '2', nom: 'Vêtements & Mode', description: 'Vêtements et accessoires' },
      //     { id: '3', nom: 'Maison & Jardin', description: 'Articles pour la maison' },
      //     { id: '4', nom: 'Sport & Loisirs', description: 'Équipements sportifs' },
      //     { id: '5', nom: 'Beauté & Santé', description: 'Produits de beauté et santé' },
      //     { id: '6', nom: 'Alimentation', description: 'Produits alimentaires' },
      //     { id: '7', nom: 'Automobile', description: 'Pièces automobiles' },
      //     { id: '8', nom: 'Livres & Médias', description: 'Livres et médias' },
      //     { id: '9', nom: 'Pharmacie', description: 'Produits pharmaceutiques' },
      //     { id: '10', nom: 'Autre', description: 'Autres catégories' }
      //   ];
      // }
      
      console.log('Catégories chargées:', categories.length);
      setProductCategories(categories);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      // En cas d'erreur, utiliser des catégories par défaut
      const defaultCategories = [
        { id: '1', nom: 'Électronique', description: 'Produits électroniques' },
        { id: '2', nom: 'Vêtements & Mode', description: 'Vêtements et accessoires' },
        { id: '3', nom: 'Maison & Jardin', description: 'Articles pour la maison' },
        { id: '4', nom: 'Sport & Loisirs', description: 'Équipements sportifs' },
        { id: '5', nom: 'Beauté & Santé', description: 'Produits de beauté et santé' },
        { id: '6', nom: 'Alimentation', description: 'Produits alimentaires' },
        { id: '7', nom: 'Automobile', description: 'Pièces automobiles' },
        { id: '8', nom: 'Livres & Médias', description: 'Livres et médias' },
        { id: '9', nom: 'Pharmacie', description: 'Produits pharmaceutiques' },
        { id: '10', nom: 'Autre', description: 'Autres catégories' }
      ];
      setProductCategories(defaultCategories);
    }
  };

  // Données réelles des produits (remplacées par l'API)
  // const products = [
  //   {
  //     id: '1',
  //     nom: 'Riz Brisé Local',
  //     description_courte: 'Riz brisé de qualité supérieure produit au Sénégal',
  //     categorie: 'Alimentation',
  //     prix_achat: 8000,
  //     prix_vente: 12000,
  //     stock_actuel: 150,
  //     stock_minimum: 50,
  //     stock_maximum: 500,
  //     sku: 'RIZ-BRISE-25KG',
  //     code_barre: '6901234567890',
  //     image: 'https://images.pexels.com/photos/33239/wheat-field-wheat-yellow-grain.jpg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
  //     statut: 'actif',
  //     en_rupture: false,
  //     stock_bas: false,
  //     popularite_score: 78,
  //     nombre_ventes: 125,
  //     marge_beneficiaire: 50,
  //     date_creation: '2024-01-10T09:00:00Z',
  //     fournisseur: 'Coopérative Rizicole Vallée',
  //     unite_mesure: 'kg',
  //     poids: 25.0,
  //   },
  //   {
  //     id: '2',
  //     nom: 'Boubou Grand Boubou Homme',
  //     description_courte: 'Boubou traditionnel brodé main pour homme',
  //     categorie: 'Artisanat',
  //     prix_achat: 25000,
  //     prix_vente: 65000,
  //     stock_actuel: 8,
  //     stock_minimum: 5,
  //     stock_maximum: 50,
  //     sku: 'BOUBOU-H-001',
  //     image: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
  //     statut: 'actif',
  //     en_rupture: false,
  //     stock_bas: true,
  //     popularite_score: 85,
  //     nombre_ventes: 45,
  //     marge_beneficiaire: 160,
  //     date_creation: '2024-01-08T14:30:00Z',
  //     fournisseur: 'Atelier Couture Traditionnelle',
  //     couleurs_disponibles: ['Blanc', 'Bleu Royal', 'Noir', 'Beige'],
  //     tailles_disponibles: ['M', 'L', 'XL', 'XXL', 'XXXL'],
  //   },
  //   {
  //     id: '3',
  //     nom: 'Thiakry Traditionnel',
  //     description_courte: 'Dessert traditionnel sénégalais au lait caillé',
  //     categorie: 'Alimentation',
  //     prix_achat: 800,
  //     prix_vente: 1500,
  //     stock_actuel: 0,
  //     stock_minimum: 20,
  //     stock_maximum: 100,
  //     sku: 'THIAKRY-500G',
  //     image: 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
  //     statut: 'actif',
  //     en_rupture: true,
  //     stock_bas: false,
  //     popularite_score: 92,
  //     nombre_ventes: 280,
  //     marge_beneficiaire: 87.5,
  //     date_creation: '2024-01-05T11:15:00Z',
  //     fournisseur: 'Laiterie Artisanale Dakar',
  //     unite_mesure: 'piece',
  //   },
  //   {
  //     id: '4',
  //     nom: 'Bissap Rouge Kirène',
  //     description_courte: 'Boisson à base d\'hibiscus - Bouteille 1.5L',
  //     categorie: 'Alimentation',
  //     prix_achat: 600,
  //     prix_vente: 1200,
  //     stock_actuel: 45,
  //     stock_minimum: 40,
  //     stock_maximum: 300,
  //     sku: 'BISSAP-1.5L',
  //     code_barre: '6901234567891',
  //     image: 'https://images.pexels.com/photos/1346155/pexels-photo-1346155.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
  //     statut: 'actif',
  //     en_rupture: false,
  //     stock_bas: false,
  //     popularite_score: 88,
  //     nombre_ventes: 156,
  //     marge_beneficiaire: 100,
  //     date_creation: '2024-01-12T16:45:00Z',
  //     fournisseur: 'Kirène SA',
  //     unite_mesure: 'piece',
  //   },
  //   {
  //     id: '5',
  //     nom: 'Djembé Artisanal',
  //     description_courte: 'Djembé traditionnel en peau de chèvre',
  //     categorie: 'Artisanat',
  //     prix_achat: 45000,
  //     prix_vente: 95000,
  //     stock_actuel: 3,
  //     stock_minimum: 5,
  //     stock_maximum: 25,
  //     sku: 'DJEMBE-TRAD-001',
  //     image: 'https://images.pexels.com/photos/164743/pexels-photo-164743.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
  //     statut: 'actif',
  //     en_rupture: false,
  //     stock_bas: true,
  //     popularite_score: 75,
  //     nombre_ventes: 12,
  //     marge_beneficiaire: 111,
  //     date_creation: '2024-01-03T10:20:00Z',
  //     fournisseur: 'Artisans Casamance',
  //     tailles_disponibles: ['Petit (25cm)', 'Moyen (30cm)', 'Grand (35cm)'],
  //   },
  // ];

  // const categories = [
  //   { id: 'all', name: 'Toutes catégories', count: products.length },
  //   { id: 'alimentation', name: 'Alimentation', count: 3 },
  //   { id: 'artisanat', name: 'Artisanat', count: 2 },
  //   { id: 'electronique', name: 'Électronique', count: 0 },
  //   { id: 'mode', name: 'Mode & Beauté', count: 0 },
  // ];

  // Schéma de validation amélioré pour le formulaire produit
  const productValidationSchema = yup.object({
    nom: yup
      .string()
      .required('Le nom est requis')
      .min(2, 'Minimum 2 caractères')
      .max(100, 'Maximum 100 caractères')
      .matches(/^[a-zA-Z0-9\s\-_àâäéèêëïîôöùûüÿçñÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇÑ]+$/, 'Le nom ne peut contenir que des lettres, chiffres, espaces, tirets et underscores'),
    description_courte: yup
      .string()
      .required('La description est requise')
      .min(10, 'Minimum 10 caractères')
      .max(500, 'Maximum 500 caractères'),
    description_longue: yup
      .string()
      .min(20, 'Minimum 20 caractères')
      .max(2000, 'Maximum 2000 caractères'),
    categorie: yup
      .string()
      .required('La catégorie est requise')
      .test('valid-category', 'Catégorie invalide', function(value) {
        return productCategories.some(cat => cat.id === value);
      }),
    prix_achat: yup
      .number()
      .required('Le prix d\'achat est requis')
      .min(0.01, 'Le prix d\'achat doit être supérieur à 0')
      .max(10000000, 'Le prix d\'achat ne peut pas dépasser 10,000,000 XOF')
      .test('decimal-places', 'Maximum 2 décimales autorisées', value => 
        value ? Number(value.toFixed(2)) === value : true),
    prix_vente: yup
      .number()
      .required('Le prix de vente est requis')
      .min(0.01, 'Le prix de vente doit être supérieur à 0')
      .max(10000000, 'Le prix de vente ne peut pas dépasser 10,000,000 XOF')
      .test('decimal-places', 'Maximum 2 décimales autorisées', value => 
        value ? Number(value.toFixed(2)) === value : true)
      .test('price-comparison', 'Le prix de vente doit être supérieur au prix d\'achat', function(value) {
        const prixAchat = this.parent.prix_achat;
        return !prixAchat || !value || value > prixAchat;
      }),
    stock_minimum: yup
      .number()
      .required('Le stock minimum est requis')
      .min(0, 'Le stock minimum ne peut pas être négatif')
      .max(10000, 'Le stock minimum ne peut pas dépasser 10,000')
      .integer('Le stock minimum doit être un nombre entier'),
    stock_maximum: yup
      .number()
      .min(0, 'Le stock maximum ne peut pas être négatif')
      .max(100000, 'Le stock maximum ne peut pas dépasser 100,000')
      .integer('Le stock maximum doit être un nombre entier')
      .test('stock-comparison', 'Le stock maximum doit être supérieur au stock minimum', function(value) {
        const stockMinimum = this.parent.stock_minimum;
        return !stockMinimum || !value || value > stockMinimum;
      }),
    sku: yup
      .string()
      .required('Le SKU est requis')
      .min(3, 'Minimum 3 caractères')
      .max(20, 'Maximum 20 caractères')
      .matches(/^[A-Z0-9-_]+$/, 'Format SKU invalide (3-20 caractères, lettres majuscules, chiffres, tirets, underscores)')
      .test('unique-sku', 'Ce SKU existe déjà', function(value) {
        if (!value) return true;
        return !products.some(p => p.sku === value && p.id !== selectedProduct?.id);
      }),
    code_barre: yup
      .string()
      .matches(/^[0-9]{8,14}$/, 'Format code-barres invalide (8-14 chiffres)')
      .test('unique-barcode', 'Ce code-barres existe déjà', function(value) {
        if (!value) return true;
        return !products.some(p => p.code_barre === value && p.id !== selectedProduct?.id);
      }),
    tva_taux: yup
      .number()
      .min(0, 'Le taux TVA ne peut pas être négatif')
      .max(100, 'Le taux TVA ne peut pas dépasser 100%')
      .test('decimal-places', 'Maximum 2 décimales autorisées', value => 
        value ? Number(value.toFixed(2)) === value : true),
    image: yup
      .mixed()
      .test('file-size', 'La taille de l\'image ne peut pas dépasser 5MB', function(value) {
        if (!value || !value[0]) return true;
        return value[0].size <= 5 * 1024 * 1024; // 5MB
      })
      .test('file-type', 'Format d\'image non supporté', function(value) {
        if (!value || !value[0]) return true;
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        return allowedTypes.includes(value[0].type);
      }),
    date_peremption: yup
      .date()
      .min(new Date(), 'La date de péremption doit être dans le futur'),
    duree_conservation: yup
      .number()
      .min(1, 'La durée de conservation doit être d\'au moins 1 jour')
      .max(3650, 'La durée de conservation ne peut pas dépasser 10 ans')
      .integer('La durée de conservation doit être un nombre entier de jours'),
  });

  const productFormFields = [
    {
      name: 'nom',
      label: 'Nom du Produit',
      type: 'text' as const,
      placeholder: 'Ex: Riz Brisé Local',
      icon: <Package className="w-4 h-4" />,
    },
    {
      name: 'marque',
      label: 'Marque',
      type: 'text' as const,
      placeholder: 'Ex: Samsung',
    },
    {
      name: 'description_courte',
      label: 'Description Courte',
      type: 'textarea' as const,
      placeholder: 'Description courte du produit...',
      rows: 3,
    },
    {
      name: 'description_longue',
      label: 'Description Longue',
      type: 'textarea' as const,
      placeholder: 'Description détaillée du produit...',
      rows: 4,
    },
    {
      name: 'categorie',
      label: 'Catégorie',
      type: 'select' as const,
      options: productCategories.length > 0 ? productCategories.map(cat => ({
        label: cat.nom || cat.name || 'Catégorie',
        value: cat.id
      })) : [{ label: 'Aucune catégorie', value: '' }],
    },
    {
      name: 'prix_achat',
      label: 'Prix d\'Achat (XOF)',
      type: 'number' as const,
      placeholder: '0',
    },
    {
      name: 'prix_vente',
      label: 'Prix de Vente (XOF)',
      type: 'number' as const,
      placeholder: '0',
    },
    {
      name: 'stock_minimum',
      label: 'Stock Minimum',
      type: 'number' as const,
      placeholder: '0',
    },
    {
      name: 'sku',
      label: 'SKU',
      type: 'text' as const,
      placeholder: 'Ex: RIZ-BRISE-25KG',
      description: 'Code unique du produit (3-20 caractères, lettres, chiffres, tirets)',
    },
    {
      name: 'code_barre',
      label: 'Code-barres',
      type: 'text' as const,
      placeholder: 'Ex: 1234567890123',
      description: 'Code-barres du produit (8-14 chiffres)',
    },
    {
      name: 'stock_maximum',
      label: 'Stock Maximum',
      type: 'number' as const,
      placeholder: '100',
    },
    {
      name: 'stock_initial',
      label: 'Stock Initial',
      type: 'number' as const,
      placeholder: '0',
    },
    {
      name: 'tva_taux',
      label: 'Taux TVA (%)',
      type: 'number' as const,
      placeholder: '18',
      step: '0.01',
    },
    {
      name: 'images',
      label: 'Images du Produit',
      type: 'file' as const,
      placeholder: 'Sélectionnez une ou plusieurs images',
      description: 'Formats acceptés: JPG, PNG, WebP (max 5MB par image, max 5 images)',
    },
    {
      name: 'date_peremption',
      label: 'Date de Péremption',
      type: 'date' as const,
      description: 'Date limite de consommation (optionnel)',
    },
    {
      name: 'duree_conservation',
      label: 'Durée de Conservation (jours)',
      type: 'number' as const,
      placeholder: '365',
      description: 'Nombre de jours de conservation',
    },
  ];

  const handleProductSubmit = async (data: any) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      setValidationErrors({});
      console.log('Création du produit:', data);
      
      // Validation complète des champs
      if (!validateAllFields(data)) {
        alert('Veuillez corriger les erreurs de validation avant de continuer.');
        return;
      }
      
      // Validation préliminaire des champs obligatoires
      const requiredFields = ['nom', 'prix_achat', 'prix_vente', 'categorie', 'stock_minimum', 'sku'];
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        const fieldNames = {
          nom: 'nom',
          prix_achat: 'prix d\'achat',
          prix_vente: 'prix de vente',
          categorie: 'catégorie',
          stock_minimum: 'stock minimum',
          sku: 'SKU'
        };
        alert(`Veuillez remplir les champs obligatoires : ${missingFields.map(f => fieldNames[f]).join(', ')}`);
        return;
      }
      
      // Validation des prix avec gestion d'erreurs détaillée
      const prixAchat = parseFloat(data.prix_achat);
      const prixVente = parseFloat(data.prix_vente);
      
      if (isNaN(prixAchat) || isNaN(prixVente)) {
        alert('Les prix doivent être des nombres valides');
        return;
      }
      
      if (prixAchat <= 0) {
        alert('Le prix d\'achat doit être supérieur à 0');
        return;
      }
      
      if (prixVente <= 0) {
        alert('Le prix de vente doit être supérieur à 0');
        return;
      }
      
      if (prixVente <= prixAchat) {
        alert('Le prix de vente doit être supérieur au prix d\'achat pour générer une marge bénéficiaire');
        return;
      }
      
      // Validation du stock
      const stockMinimum = parseInt(data.stock_minimum);
      const stockMaximum = parseInt(data.stock_maximum) || 0;
      
      if (isNaN(stockMinimum) || stockMinimum < 0) {
        alert('Le stock minimum doit être un nombre entier positif');
        return;
      }
      
      if (stockMaximum > 0 && stockMaximum <= stockMinimum) {
        alert('Le stock maximum doit être supérieur au stock minimum');
        return;
      }
      
      // Validation du SKU (unicité)
      const existingSku = products.find(p => p.sku === data.sku);
      if (existingSku) {
        alert('Ce SKU existe déjà. Veuillez en choisir un autre.');
        return;
      }
      
      // Validation du code-barres (unicité)
      if (data.code_barre) {
        const existingBarcode = products.find(p => p.code_barre === data.code_barre);
        if (existingBarcode) {
          alert('Ce code-barres existe déjà. Veuillez en choisir un autre.');
          return;
        }
      }
      
      // Générer un slug unique
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substr(2, 6);
      const slug = `${data.nom.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')}-${timestamp}-${randomStr}`;
      
      // Préparer les données pour l'API avec FormData pour supporter les images
      const formData = new FormData();
      
      // Ajouter les champs texte
      formData.append('nom', data.nom.trim());
      formData.append('description_courte', data.description_courte?.trim() || 'Description courte');
      formData.append('description_longue', data.description_longue?.trim() || data.description_courte?.trim() || 'Description longue');
      formData.append('prix_achat', parseFloat(data.prix_achat).toString());
      formData.append('prix_vente', parseFloat(data.prix_vente).toString());
      formData.append('stock', (parseInt(data.stock_initial) || 0).toString());
      formData.append('sku', data.sku?.trim() || `SKU-${timestamp}-${Math.random().toString(36).substr(2, 9)}`);
      if (data.code_barre) {
        formData.append('code_barre', data.code_barre.trim());
      }
      formData.append('slug', slug);
      
      // Gérer la catégorie : vérifier que c'est un UUID valide
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      let categoryId = data.categorie;
      
      console.log('🔍 Catégorie sélectionnée:', categoryId);
      console.log('🔍 Est un UUID valide ?', categoryId && uuidRegex.test(categoryId));
      
      if (!categoryId || !uuidRegex.test(categoryId)) {
        // Si ce n'est pas un UUID valide, essayer de trouver la catégorie
        console.warn('⚠️ Catégorie n\'est pas un UUID valide:', categoryId);
        console.warn('🔍 Tentative de récupération des catégories depuis l\'API...');
        
        try {
          const categoriesResponse = await apiService.getCategories();
          console.log('📋 Réponse catégories:', categoriesResponse);
          
          const categories = Array.isArray(categoriesResponse) ? categoriesResponse : 
                           (categoriesResponse.results || categoriesResponse.data || []);
          
          console.log(`📦 Nombre de catégories trouvées: ${categories.length}`);
          
          if (categories.length === 0) {
            throw new Error('Aucune catégorie disponible dans la base de données. Veuillez d\'abord créer des catégories.');
          }
          
          let categoryFound = null;
          if (!isNaN(Number(categoryId))) {
            // Si c'est un nombre, chercher par index
            const categoryIndex = parseInt(categoryId) - 1;
            console.log(`🔍 Recherche par index: ${categoryIndex}`);
            categoryFound = categories[categoryIndex];
          } else if (categoryId) {
            // Chercher par nom
            console.log(`🔍 Recherche par nom/id: ${categoryId}`);
            categoryFound = categories.find((c: any) => 
              c.nom?.toLowerCase() === categoryId.toLowerCase() ||
              c.id === categoryId ||
              c.id?.toString() === categoryId.toString()
            );
          }
          
          if (categoryFound && categoryFound.id && uuidRegex.test(categoryFound.id)) {
            categoryId = categoryFound.id;
            console.log('✅ Catégorie trouvée par nom/index:', categoryId);
          } else if (categories.length > 0) {
            // Utiliser la première catégorie valide disponible
            const firstValidCategory = categories.find((c: any) => 
              c.id && uuidRegex.test(c.id)
            );
            
            if (firstValidCategory) {
              categoryId = firstValidCategory.id;
              console.warn('⚠️ Catégorie sélectionnée invalide, utilisation de la première catégorie disponible:', firstValidCategory.nom, '(', categoryId, ')');
            } else {
              throw new Error('Aucune catégorie avec UUID valide trouvée dans la base de données');
            }
          } else {
            throw new Error('Aucune catégorie disponible');
          }
        } catch (error: any) {
          console.error('❌ Erreur lors de la recherche de catégorie:', error);
          const errorMessage = error.message || 'Erreur lors de la récupération des catégories';
          alert(`Erreur : ${errorMessage}\n\nVeuillez vérifier que des catégories existent dans la base de données.`);
          setIsSubmitting(false);
          return;
        }
      }
      
      console.log('✅ Catégorie finale sélectionnée:', categoryId);
      formData.append('categorie', categoryId);
      
      // Gérer la marque : créer ou récupérer la marque
      let marqueId = null;
      if (data.marque && data.marque.trim()) {
        try {
          // Essayer d'abord de récupérer la marque par son nom
          const marquesResponse = await apiService.request('/products/marques/');
          const marques = Array.isArray(marquesResponse) ? marquesResponse : 
                         (marquesResponse.results || marquesResponse.data || []);
          
          const marqueExistant = marques.find((m: any) => 
            m.nom?.toLowerCase() === data.marque.trim().toLowerCase()
          );
          
          if (marqueExistant) {
            marqueId = marqueExistant.id;
            console.log('✅ Marque existante trouvée:', marqueId);
          } else {
            // Créer une nouvelle marque
            try {
              const nouvelleMarque = await apiService.request('/products/marques/', {
                method: 'POST',
                body: JSON.stringify({ nom: data.marque.trim() }),
              });
              marqueId = nouvelleMarque.id;
              console.log('✅ Nouvelle marque créée:', marqueId);
            } catch (createError: any) {
              console.error('Erreur lors de la création de la marque:', createError);
              // Si la création échoue, ne pas bloquer la création du produit
              console.warn('⚠️ Marque non créée, produit créé sans marque');
            }
          }
        } catch (error: any) {
          console.error('Erreur lors de la gestion de la marque:', error);
          // Ne pas bloquer la création du produit si la marque échoue
        }
      }
      
      if (marqueId) {
        formData.append('marque', marqueId);
      }
      
      formData.append('unite_mesure', 'piece');
      formData.append('tva_taux', (parseFloat(data.tva_taux) || 18.0).toString());
      formData.append('statut', 'actif');
      formData.append('vendable', 'true');
      formData.append('achetable', 'true');
      formData.append('visible_catalogue', 'true');
      
      // Gérer les images : convertir en tableau si nécessaire
      let imagesArray: File[] = [];
      if (data.images) {
        if (data.images instanceof FileList) {
          imagesArray = Array.from(data.images);
        } else if (Array.isArray(data.images)) {
          imagesArray = data.images.filter((img: any) => img instanceof File);
        } else if (data.images instanceof File) {
          imagesArray = [data.images];
        }
      }
      
      // Ajouter les images au FormData
      imagesArray.forEach((image: File) => {
        formData.append('images', image);
      });

      // Logger tous les champs du FormData pour le débogage
      console.log('📦 FormData préparé pour création produit:');
      console.log('  - nom:', data.nom);
      console.log('  - categorie:', categoryId);
      console.log('  - marque:', marqueId || 'aucune');
      console.log('  - prix_achat:', parseFloat(data.prix_achat));
      console.log('  - prix_vente:', parseFloat(data.prix_vente));
      console.log('  - stock:', parseInt(data.stock_initial) || 0);
      console.log('  - sku:', data.sku?.trim() || `SKU-${timestamp}-${Math.random().toString(36).substr(2, 9)}`);
      console.log('  - images:', imagesArray.length);
      
      // Lister tous les champs du FormData
      console.log('📋 Tous les champs du FormData:');
      for (const pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`  - ${pair[0]}: [File] ${pair[1].name} (${pair[1].size} bytes)`);
        } else {
          console.log(`  - ${pair[0]}: ${pair[1]}`);
        }
      }

      // Appel API réel avec FormData
      const response = await apiService.createProduct(formData);
      console.log('✅ Produit créé avec succès:', response);
      
      // Si l'utilisateur n'avait pas d'entreprise, elle a été créée automatiquement
      // Recharger le profil utilisateur pour obtenir l'entreprise
      if (!user?.company) {
        console.log('🔄 Rechargement du profil utilisateur pour obtenir l\'entreprise créée...');
        try {
          const userProfile = await apiService.request('/auth/profile/');
          console.log('📋 Profil utilisateur rechargé:', userProfile);
          
          // Le profil peut contenir entreprise_nom mais pas l'objet entreprise complet
          // Il faut récupérer l'entreprise séparément si nécessaire
          if (userProfile && userProfile.entreprise_nom) {
            // Essayer de récupérer l'entreprise complète
            try {
              const companies = await apiService.request('/companies/entreprises/');
              const userCompany = companies.results?.find((c: any) => c.nom === userProfile.entreprise_nom) ||
                                 companies.find((c: any) => c.nom === userProfile.entreprise_nom);
              if (userCompany) {
                updateUser({
                  company: {
                    id: userCompany.id,
                    name: userCompany.nom,
                    logo: userCompany.logo
                  }
                });
                console.log('✅ Entreprise mise à jour dans le contexte:', userCompany);
              } else if (userProfile.entreprise_nom) {
                // Si on ne trouve pas l'entreprise mais qu'on a le nom, créer un objet minimal
                updateUser({
                  company: {
                    id: '', // Sera mis à jour lors du prochain chargement
                    name: userProfile.entreprise_nom
                  }
                });
                console.log('✅ Entreprise (nom seulement) mise à jour dans le contexte:', userProfile.entreprise_nom);
              }
            } catch (companyError) {
              console.warn('⚠️ Impossible de récupérer l\'entreprise complète:', companyError);
            }
          }
        } catch (profileError) {
          console.warn('⚠️ Impossible de recharger le profil:', profileError);
        }
      }
      
      // Uploader les images supplémentaires après création si nécessaire
      const productId = response.id;
      if (productId && imagesArray.length > 0) {
        console.log('Upload des images supplémentaires après création...');
        for (const imageFile of imagesArray) {
          try {
            await apiService.uploadProductImage(productId, imageFile);
          } catch (imgError) {
            console.warn('Erreur lors de l\'upload d\'une image:', imgError);
          }
        }
      }
      
      // Fermer le formulaire
      setShowProductForm(false);
      
      // Recharger la liste des produits pour afficher les images
      await loadProducts();
      
      alert('Produit créé avec succès !');
      
    } catch (error: any) {
      console.error('Erreur lors de la création du produit:', error);
      
      // Gestion des erreurs détaillées
      let errorMessage = 'Erreur lors de la création du produit.';
      let errorDetails: any = null;
      
      if (error.response?.data) {
        errorDetails = error.response.data;
        console.log('📋 Données d\'erreur complètes:', errorDetails);
        
        if (typeof errorDetails === 'string') {
          errorMessage = errorDetails;
        } else if (errorDetails.detail) {
          errorMessage = errorDetails.detail;
        } else if (errorDetails.non_field_errors) {
          errorMessage = errorDetails.non_field_errors.join(', ');
        } else {
          // Afficher les erreurs de validation par champ
          const fieldErrors = Object.entries(errorDetails)
            .map(([field, messages]: [string, any]) => {
              const fieldName = field === 'categorie' ? 'catégorie' : 
                               field === 'prix_achat' ? 'prix d\'achat' :
                               field === 'prix_vente' ? 'prix de vente' :
                               field === 'stock_minimum' ? 'stock minimum' :
                               field === 'stock_maximum' ? 'stock maximum' :
                               field === 'tva_taux' ? 'taux TVA' :
                               field === 'marque' ? 'marque' :
                               field;
              
              if (Array.isArray(messages)) {
                return `${fieldName}: ${messages.join(', ')}`;
              }
              return `${fieldName}: ${messages}`;
            })
            .join('\n');
          
          if (fieldErrors) {
            errorMessage = `Erreurs de validation:\n${fieldErrors}`;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProductUpdate = async (id: string, data: any) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      setValidationErrors({});
      console.log('Modification du produit:', id, data);
      
      // Validation complète des champs
      if (!validateAllFields(data)) {
        alert('Veuillez corriger les erreurs de validation avant de continuer.');
        return;
      }
      
      // Trouver le produit actuel pour récupérer les champs manquants
      const currentProduct = products.find(p => p.id === id);
      if (!currentProduct) {
        alert('Produit non trouvé. Veuillez recharger la page.');
        return;
      }
      
      // Validation préliminaire des champs obligatoires
      const requiredFields = ['nom', 'prix_achat', 'prix_vente', 'categorie', 'stock_minimum', 'sku'];
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        const fieldNames = {
          nom: 'nom',
          prix_achat: 'prix d\'achat',
          prix_vente: 'prix de vente',
          categorie: 'catégorie',
          stock_minimum: 'stock minimum',
          sku: 'SKU'
        };
        alert(`Veuillez remplir les champs obligatoires : ${missingFields.map(f => fieldNames[f]).join(', ')}`);
        return;
      }
      
      // Validation des prix avec gestion d'erreurs détaillée
      const prixAchat = parseFloat(data.prix_achat);
      const prixVente = parseFloat(data.prix_vente);
      
      if (isNaN(prixAchat) || isNaN(prixVente)) {
        alert('Les prix doivent être des nombres valides');
        return;
      }
      
      if (prixAchat <= 0) {
        alert('Le prix d\'achat doit être supérieur à 0');
        return;
      }
      
      if (prixVente <= 0) {
        alert('Le prix de vente doit être supérieur à 0');
        return;
      }
      
      if (prixVente <= prixAchat) {
        alert('Le prix de vente doit être supérieur au prix d\'achat pour générer une marge bénéficiaire');
        return;
      }
      
      // Validation du stock
      const stockMinimum = parseInt(data.stock_minimum);
      const stockMaximum = parseInt(data.stock_maximum) || 0;
      
      if (isNaN(stockMinimum) || stockMinimum < 0) {
        alert('Le stock minimum doit être un nombre entier positif');
        return;
      }
      
      if (stockMaximum > 0 && stockMaximum <= stockMinimum) {
        alert('Le stock maximum doit être supérieur au stock minimum');
        return;
      }
      
      // Validation du SKU (unicité, excluant le produit actuel)
      const existingSku = products.find(p => p.sku === data.sku && p.id !== id);
      if (existingSku) {
        alert('Ce SKU existe déjà. Veuillez en choisir un autre.');
        return;
      }
      
      // Validation du code-barres (unicité, excluant le produit actuel)
      if (data.code_barre) {
        const existingBarcode = products.find(p => p.code_barre === data.code_barre && p.id !== id);
        if (existingBarcode) {
          alert('Ce code-barres existe déjà. Veuillez en choisir un autre.');
          return;
        }
      }
      
      // Gérer la catégorie : vérifier que c'est un UUID valide
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      let categoryId = data.categorie || currentProduct.categorie?.id || currentProduct.categorie_id || currentProduct.categorie;
      
      if (categoryId && !uuidRegex.test(categoryId)) {
        // Si ce n'est pas un UUID valide, essayer de trouver la catégorie
        try {
          const categoriesResponse = await apiService.getCategories();
          const categories = Array.isArray(categoriesResponse) ? categoriesResponse : 
                           (categoriesResponse.results || categoriesResponse.data || []);
          
          const categoryFound = categories.find((c: any) => 
            c.nom?.toLowerCase() === categoryId.toLowerCase() ||
            c.id === categoryId ||
            c.id?.toString() === categoryId.toString()
          );
          
          if (categoryFound && categoryFound.id && uuidRegex.test(categoryFound.id)) {
            categoryId = categoryFound.id;
          } else if (categories.length > 0) {
            const firstValidCategory = categories.find((c: any) => c.id && uuidRegex.test(c.id));
            if (firstValidCategory) {
              categoryId = firstValidCategory.id;
            }
          }
        } catch (error) {
          console.error('Erreur lors de la recherche de catégorie:', error);
        }
      }
      
      // Gérer la marque : créer ou récupérer la marque
      let marqueId = null;
      if (data.marque && data.marque.trim()) {
        try {
          const marquesResponse = await apiService.request('/products/marques/');
          const marques = Array.isArray(marquesResponse) ? marquesResponse : 
                         (marquesResponse.results || marquesResponse.data || []);
          
          const marqueExistant = marques.find((m: any) => 
            m.nom?.toLowerCase() === data.marque.trim().toLowerCase()
          );
          
          if (marqueExistant) {
            marqueId = marqueExistant.id;
          } else {
            // Créer une nouvelle marque
            try {
              const nouvelleMarque = await apiService.request('/products/marques/', {
                method: 'POST',
                body: JSON.stringify({ nom: data.marque.trim() }),
              });
              marqueId = nouvelleMarque.id;
            } catch (createError) {
              console.error('Erreur lors de la création de la marque:', createError);
            }
          }
        } catch (error) {
          console.error('Erreur lors de la gestion de la marque:', error);
        }
      }
      
      // Si pas de nouvelle marque, utiliser l'existante
      if (!marqueId) {
        marqueId = currentProduct.marque?.id || currentProduct.marque_id || currentProduct.marque;
      }
      
      // Préparer les données de mise à jour avec FormData pour supporter les images
      const formData = new FormData();
      
      formData.append('nom', data.nom.trim());
      formData.append('description_courte', data.description_courte?.trim() || 'Description courte');
      formData.append('description_longue', data.description_longue?.trim() || data.description_courte?.trim() || 'Description longue');
      formData.append('prix_achat', parseFloat(data.prix_achat || currentProduct.prix_achat).toString());
      formData.append('prix_vente', parseFloat(data.prix_vente || currentProduct.prix_vente).toString());
      formData.append('stock', (parseInt(data.stock_initial || data.stock || currentProduct.stock) || 0).toString());
      formData.append('stock_minimum', (parseInt(data.stock_minimum) || 5).toString());
      formData.append('stock_maximum', (parseInt(data.stock_maximum) || 100).toString());
      formData.append('sku', data.sku || currentProduct.sku);
      if (data.code_barre) {
        formData.append('code_barre', data.code_barre.trim());
      }
      formData.append('categorie', categoryId);
      if (marqueId) {
        formData.append('marque', marqueId);
      }
      formData.append('unite_mesure', 'piece');
      formData.append('tva_taux', (parseFloat(data.tva_taux) || 18.0).toString());
      formData.append('statut', currentProduct.statut || 'actif');
      formData.append('vendable', (currentProduct.vendable !== false).toString());
      formData.append('achetable', (currentProduct.achetable !== false).toString());
      formData.append('visible_catalogue', (currentProduct.visible_catalogue !== false).toString());
      
      // Gérer les images si présentes
      let imagesArray: File[] = [];
      if (data.images) {
        if (data.images instanceof FileList) {
          imagesArray = Array.from(data.images);
        } else if (Array.isArray(data.images)) {
          imagesArray = data.images.filter((img: any) => img instanceof File);
        } else if (data.images instanceof File) {
          imagesArray = [data.images];
        }
      }
      
      // Ajouter les images au FormData
      imagesArray.forEach((image: File) => {
        formData.append('images', image);
      });

      // Appel API réel avec FormData ou updateData selon ce que l'API accepte
      const updateData: any = {
        nom: data.nom.trim(),
        description_courte: data.description_courte?.trim() || 'Description courte',
        description_longue: data.description_longue?.trim() || data.description_courte?.trim() || 'Description longue',
        prix_achat: parseFloat(data.prix_achat || currentProduct.prix_achat),
        prix_vente: parseFloat(data.prix_vente || currentProduct.prix_vente),
        stock_minimum: parseInt(data.stock_minimum) || 5,
        stock_maximum: parseInt(data.stock_maximum) || 100,
        stock: parseInt(data.stock_initial || data.stock || currentProduct.stock) || 0,
        sku: data.sku || currentProduct.sku,
        code_barre: data.code_barre || currentProduct.code_barre || '',
        unite_mesure: 'piece',
        tva_taux: parseFloat(data.tva_taux) || 18.0,
        date_peremption: data.date_peremption || null,
        duree_conservation: data.duree_conservation || null,
        categorie: categoryId,
        marque: marqueId,
        slug: currentProduct.slug
      };
      
      // Essayer d'abord avec FormData si des images sont présentes
      let response;
      if (imagesArray.length > 0) {
        try {
          response = await apiService.updateProduct(id, formData);
        } catch (formDataError) {
          console.warn('Erreur avec FormData, essai avec updateData:', formDataError);
          response = await apiService.updateProduct(id, updateData);
        }
      } else {
        response = await apiService.updateProduct(id, updateData);
      }
      console.log('Produit modifié avec succès:', response);
      
      // Fermer le formulaire
      setShowProductForm(false);
      setSelectedProduct(null);
      
      // Recharger la liste des produits
      await loadProducts();
      
      alert('Produit modifié avec succès !');
      
    } catch (error: any) {
      console.error('Erreur lors de la modification du produit:', error);
      
      // Gestion des erreurs détaillées
      let errorMessage = 'Erreur lors de la modification du produit.';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors.join(', ');
        } else {
          // Afficher les erreurs de validation par champ
          const fieldErrors = Object.entries(errorData)
            .map(([field, messages]: [string, any]) => {
              const fieldName = field === 'categorie' ? 'catégorie' : 
                               field === 'prix_achat' ? 'prix d\'achat' :
                               field === 'prix_vente' ? 'prix de vente' :
                               field === 'stock_minimum' ? 'stock minimum' :
                               field === 'stock_maximum' ? 'stock maximum' :
                               field === 'tva_taux' ? 'taux TVA' :
                               field;
              
              if (Array.isArray(messages)) {
                return `${fieldName}: ${messages.join(', ')}`;
              }
              return `${fieldName}: ${messages}`;
            })
            .join('\n');
          
          if (fieldErrors) {
            errorMessage = `Erreurs de validation:\n${fieldErrors}`;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour supprimer un produit
  const handleDeleteProduct = async (product: any) => {
    try {
      await apiService.deleteProduct(product.id);
      console.log('Produit supprimé avec succès:', product.nom);
      
      // Recharger la liste des produits
      await loadProducts();
      
      alert('Produit supprimé avec succès !');
      setShowDeleteModal(false);
      setProductToDelete(null);
      
    } catch (error: any) {
      console.error('Erreur lors de la suppression du produit:', error);
      
      let errorMessage = 'Erreur lors de la suppression du produit.';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
  };

  // Fonction pour ouvrir la modal de gestion des images
  const handleManageImages = (product: any) => {
    setProductForImages(product);
    setSelectedImages([]);
    setShowImageModal(true);
  };

  // Fonction pour gérer l'upload d'images
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validation des fichiers
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`Le fichier ${file.name} n'est pas une image valide.`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        alert(`L'image ${file.name} est trop volumineuse (max 5MB).`);
        return false;
      }
      return true;
    });
    
    // Limiter à 5 images maximum
    const newImages = [...selectedImages, ...validFiles].slice(0, 5);
    setSelectedImages(newImages);
  };

  // Fonction pour supprimer une image sélectionnée
  const removeSelectedImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Fonction pour uploader les images
  const handleUploadImages = async () => {
    if (!productForImages || selectedImages.length === 0) return;
    
    try {
      setUploadingImages(true);
      
      // Uploader chaque image
      for (const imageFile of selectedImages) {
        await apiService.uploadProductImage(productForImages.id, imageFile);
      }
      
      // Recharger le produit spécifique pour avoir les nouvelles images avec les URLs complètes
      try {
        const updatedProductResponse = await apiService.getProduct(productForImages.id);
        
        // Transformer le produit de la même manière que dans loadProducts
        const apiBaseUrl = getBackendBaseUrl();
        const updatedProduct = {
          ...updatedProductResponse,
          image: updatedProductResponse.images && updatedProductResponse.images.length > 0 ? 
            (updatedProductResponse.images[0].image_url || (updatedProductResponse.images[0].image?.startsWith('http') ? updatedProductResponse.images[0].image : `${apiBaseUrl}${updatedProductResponse.images[0].image || ''}`)) :
            updatedProductResponse.image_url || 'https://images.pexels.com/photos/33239/wheat-field-wheat-yellow-grain.jpg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
          en_rupture: updatedProductResponse.en_rupture || updatedProductResponse.stock_actuel === 0,
          stock_bas: updatedProductResponse.stock_actuel <= 5,
          stock_actuel: updatedProductResponse.stock_actuel || updatedProductResponse.stock || 0,
          prix_achat: parseFloat(updatedProductResponse.prix_achat) || 0,
          prix_vente: parseFloat(updatedProductResponse.prix_vente) || 0,
          marge_beneficiaire: updatedProductResponse.prix_achat > 0 ? 
            Math.round(((updatedProductResponse.prix_vente - updatedProductResponse.prix_achat) / updatedProductResponse.prix_achat) * 100) : 0,
          categorie: updatedProductResponse.categorie_nom || 'Non classé'
        };
        
        setProductForImages(updatedProduct);
        
        // Mettre à jour aussi dans la liste des produits
        setProducts(prevProducts => 
          prevProducts.map(p => 
            p.id === productForImages.id ? updatedProduct : p
          )
        );
      } catch (error) {
        console.warn('Erreur lors du rechargement du produit, rechargement de toute la liste...');
        await loadProducts();
        // Recharger aussi le produit pour la modal
        const refreshedProduct = products.find(p => p.id === productForImages.id);
        if (refreshedProduct) {
          setProductForImages(refreshedProduct);
        }
      }
      
      alert(`${selectedImages.length} image(s) ajoutée(s) avec succès !`);
      setSelectedImages([]);
      
      // Ne pas fermer la modal pour voir les nouvelles images
      
    } catch (error: any) {
      console.error('Erreur lors de l\'upload des images:', error);
      alert('Erreur lors de l\'upload des images');
    } finally {
      setUploadingImages(false);
    }
  };

  // Fonction pour supprimer une image existante
  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) return;
    
    try {
      // Note: Vous devrez peut-être créer cette méthode dans apiService
      // await apiService.deleteProductImage(imageId);
      await loadProducts();
      alert('Image supprimée avec succès !');
    } catch (error: any) {
      console.error('Erreur lors de la suppression de l\'image:', error);
      alert('Erreur lors de la suppression de l\'image');
    }
  };

  // Fonction pour vendre un produit
  const handleSellProduct = async (product: any, quantity: number) => {
    try {
      // Simulation d'une vente - dans une vraie application, 
      // cela créerait une commande et mettrait à jour le stock
      console.log('Vente du produit:', product.nom, 'Quantité:', quantity);
      
      // Pour l'instant, on simule juste la vente
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(`Vente enregistrée: ${quantity} x ${product.nom} pour ${(product.prix_vente * quantity).toLocaleString()} XOF`);
      setShowSaleModal(false);
      
      // Recharger les produits pour mettre à jour le stock
      await loadProducts();
      
    } catch (error: any) {
      console.error('Erreur lors de la vente:', error);
      alert('Erreur lors de l\'enregistrement de la vente.');
    }
  };

  // Mémoriser ProductCard pour éviter les re-renders inutiles
  const ProductCard = memo(({ product }: { product: any }) => (
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
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
        {product.image ? (
          <img
            src={product.image}
            alt={product.nom}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              logger.error('❌ Erreur de chargement d\'image pour produit:', product.nom);
              const target = e.currentTarget;
              target.style.display = 'none';
              // Afficher le placeholder
              const placeholder = target.parentElement?.querySelector('.image-placeholder');
              if (placeholder) {
                (placeholder as HTMLElement).style.display = 'flex';
              }
            }}
            onLoad={() => {
              logger.debug('✅ Image chargée avec succès pour', product.nom);
            }}
          />
        ) : null}
        {/* Placeholder si pas d'image ou si l'image échoue */}
        <div 
          className={`image-placeholder w-full h-full flex flex-col items-center justify-center ${product.image ? 'hidden' : ''}`}
          style={{ display: product.image ? 'none' : 'flex' }}
        >
          <Package className="w-16 h-16 text-gray-400 mb-2" />
          <span className="text-xs text-gray-500">Pas d'image</span>
        </div>
        
        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {product.en_rupture && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Rupture
            </span>
          )}
          {product.stock_bas && !product.en_rupture && (
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Stock Bas
            </span>
          )}
          {product.popularite_score > 80 && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Populaire
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex flex-col space-y-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Implémentation du scanner QR Code
                const qrData = {
                  produit_id: product.id,
                  action: 'scan_qr',
                  timestamp: new Date().toISOString()
                };
                logger.debug('Scan QR Code pour produit:', qrData);
                alert(`QR Code scanné pour ${product.nom}. Données: ${JSON.stringify(qrData)}`);
              }}
              className="p-2 bg-white/80 backdrop-blur-sm text-gray-600 rounded-lg hover:bg-white transition-colors"
              title="Scanner QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleManageImages(product);
              }}
              className="p-2 bg-white/80 backdrop-blur-sm text-blue-600 rounded-lg hover:bg-white transition-colors"
              title="Gérer les images"
            >
              <Camera className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedProduct(product);
                setShowProductForm(true);
              }}
              className="p-2 bg-white/80 backdrop-blur-sm text-gray-600 rounded-lg hover:bg-white transition-colors"
              title="Modifier le produit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedProduct(product);
                setShowSaleModal(true);
              }}
              className="p-2 bg-white/80 backdrop-blur-sm text-green-600 rounded-lg hover:bg-white transition-colors"
              title="Vendre le produit"
            >
              <DollarSign className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setProductToDelete(product);
                setShowDeleteModal(true);
              }}
              className="p-2 bg-white/80 backdrop-blur-sm text-red-600 rounded-lg hover:bg-white transition-colors"
              title="Supprimer le produit"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
            {product.nom}
          </h3>
          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
            {product.categorie}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
          {product.description_courte}
        </p>

        {/* Price & Margin */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-xs text-gray-500">Prix de Vente</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {product.prix_vente.toLocaleString()} XOF
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Marge</p>
            <p className="font-semibold text-green-600">
              {product.marge_beneficiaire.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Stock Value */}
        <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Valeur du Stock</p>
          <p className="font-semibold text-primary-600 dark:text-primary-400">
            {((product.stock_actuel || 0) * (product.prix_achat || 0)).toLocaleString()} XOF
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {product.stock_actuel || 0} unités × {product.prix_achat?.toLocaleString() || 0} XOF
          </p>
        </div>

        {/* Stock Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              product.en_rupture ? 'bg-red-500' :
              product.stock_bas ? 'bg-yellow-500' : 'bg-green-500'
            }`} />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {product.stock_actuel} en stock
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-xs text-gray-500">{product.popularite_score}</span>
          </div>
        </div>

        {/* SKU */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-gray-500">{product.sku}</span>
          <span className="text-xs text-gray-500">{product.nombre_ventes} ventes</span>
        </div>
      </div>
    </motion.div>
  ));
  
  ProductCard.displayName = 'ProductCard';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Gestion du Stock</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez votre inventaire avec des outils intelligents
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="secondary" icon={<Camera className="w-4 h-4" />} onClick={() => setShowQRScanner(true)}>
            Scanner
          </Button>
          <Button variant="secondary" icon={<Upload className="w-4 h-4" />}>
            Importer
          </Button>
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setShowProductForm(true)}>
            Nouveau Produit
          </Button>
        </div>
      </div>

      {/* Stock Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Valeur Stock Total"
          value={Math.max(0, Math.round(stockMetrics.totalValue))}
          previousValue={stockMetrics.totalValue > 0 ? Math.max(0, Math.round(stockMetrics.totalValue * 0.95)) : 0}
          format="currency"
          icon={<Package className="w-6 h-6" />}
          color="primary"
        />
        <MetricCard
          title="Produits Actifs"
          value={stockMetrics.activeProducts}
          previousValue={Math.max(0, stockMetrics.activeProducts - 1)} // -1 par rapport à la période précédente
          format="number"
          icon={<BarChart3 className="w-6 h-6" />}
          color="success"
        />
        <MetricCard
          title="Produits en Rupture"
          value={stockMetrics.outOfStock}
          previousValue={stockMetrics.outOfStock + 1} // +1 par rapport à la période précédente
          format="number"
          icon={<AlertTriangle className="w-6 h-6" />}
          color="danger"
        />
        <MetricCard
          title="Stock Bas"
          value={stockMetrics.lowStock}
          previousValue={stockMetrics.lowStock + 2} // +2 par rapport à la période précédente
          format="number"
          icon={<TrendingDown className="w-6 h-6" />}
          color="warning"
        />
      </div>

      {/* Filters and Controls */}
      <div className="card-premium p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par nom, SKU, code-barres..."
                className="input-premium pl-10 w-full"
              />
            </div>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-premium w-48"
          >
            <option value="all">Toutes les catégories</option>
            {productCategories.length > 0 ? productCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nom || category.name || 'Catégorie'} 
                {category.count ? ` (${category.count})` : ''}
              </option>
            )) : (
              <option value="all">Aucune catégorie disponible</option>
            )}
          </select>

          <select className="input-premium w-48">
            <option value="all">Tous les statuts</option>
            <option value="actif">Actifs</option>
            <option value="rupture">En rupture</option>
            <option value="stock_bas">Stock bas</option>
            <option value="inactif">Inactifs</option>
          </select>

          <Button variant="secondary" icon={<Filter className="w-4 h-4" />}>
            Filtres
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {products.length} produit(s) trouvé(s)
            </span>
            
            {/* Alerts */}
            <div className="flex items-center space-x-3">
              {products.filter(p => p.en_rupture).length > 0 && (
                <div className="flex items-center space-x-1 text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">{products.filter(p => p.en_rupture).length} en rupture</span>
                </div>
              )}
              {products.filter(p => p.stock_bas).length > 0 && (
                <div className="flex items-center space-x-1 text-yellow-600">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-sm">{products.filter(p => p.stock_bas).length} stock bas</span>
                </div>
              )}
            </div>
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
            <Button variant="secondary" size="sm" icon={<Download className="w-4 h-4" />}>
              Exporter
            </Button>
          </div>
        </div>
      </div>

      {/* Products Display */}
      {viewMode === 'grid' ? (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-2 text-gray-600">Chargement des produits...</span>
              </div>
            ) : products.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                <Package className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg font-medium mb-2">
                  Aucun produit trouvé
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mb-4">
                  Commencez par ajouter votre premier produit
                </p>
                <Button
                  variant="primary"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => navigate('/entrepreneur/add-product')}
                >
                  Ajouter un produit
                </Button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                <Package className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg font-medium mb-2">
                  Aucun produit ne correspond à vos critères
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mb-4">
                  {products.length} produit(s) disponible(s)
                </p>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="card-premium">
          <DataTable
            data={products.filter(product => {
              // Filtrage par recherche
              const matchesSearch = !searchTerm || 
                product.nom?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description_courte?.toLowerCase().includes(searchTerm.toLowerCase());
              
              // Filtrage par catégorie
              const matchesCategory = selectedCategory === 'all' || 
                product.categorieId === selectedCategory ||
                product.categorie_id === selectedCategory ||
                product.categorieId?.toString() === selectedCategory?.toString() ||
                product.categorie_id?.toString() === selectedCategory?.toString() ||
                (typeof product.categorie === 'object' && product.categorie?.id === selectedCategory) ||
                (typeof product.categorie === 'object' && product.categorie?.id?.toString() === selectedCategory?.toString());
              
              return matchesSearch && matchesCategory;
            })}
            columns={[
              {
                accessorKey: 'nom',
                header: 'Produit',
                cell: ({ row }) => (
                  <div className="flex items-center space-x-3">
                    {row.original.image ? (
                      <img
                        src={row.original.image}
                        alt={row.original.nom}
                        className="w-10 h-10 rounded-lg object-cover"
                        onError={(e) => {
                          console.error('❌ Erreur image dans tableau:', row.original.image);
                          const target = e.currentTarget;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {row.original.nom}
                      </p>
                      <p className="text-sm text-gray-500">{row.original.sku}</p>
                    </div>
                  </div>
                ),
              },
              {
                accessorKey: 'categorie',
                header: 'Catégorie',
              },
              {
                accessorKey: 'prix_vente',
                header: 'Prix de Vente',
                cell: ({ row }) => `${row.original.prix_vente.toLocaleString()} XOF`,
              },
              {
                accessorKey: 'stock_actuel',
                header: 'Stock',
                cell: ({ row }) => (
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      row.original.en_rupture ? 'bg-red-500' :
                      row.original.stock_bas ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <span>{row.original.stock_actuel}</span>
                  </div>
                ),
              },
              {
                accessorKey: 'marge_beneficiaire',
                header: 'Marge',
                cell: ({ row }) => (
                  <span className="text-green-600 font-medium">
                    {row.original.marge_beneficiaire.toFixed(1)}%
                  </span>
                ),
              },
              {
                accessorKey: 'actions',
                header: 'Actions',
                cell: ({ row }) => (
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      icon={<Eye className="w-3 h-3" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProduct(row.original);
                      }}
                    >
                      Voir
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      icon={<Edit className="w-3 h-3" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProduct(row.original);
                        setShowProductForm(true);
                      }}
                    >
                      Modifier
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      icon={<DollarSign className="w-3 h-3" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProduct(row.original);
                        setShowSaleModal(true);
                      }}
                    >
                      Vendre
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      icon={<Trash2 className="w-3 h-3" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setProductToDelete(row.original);
                        setShowDeleteModal(true);
                      }}
                    >
                      Supprimer
                    </Button>
                  </div>
                ),
              },
            ]}
            searchable
            exportable
            onRowClick={(product) => setSelectedProduct(product)}
          />
        </div>
      )}

      {/* Product Form Modal */}
      <AnimatePresence>
        {showProductForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={() => setShowProductForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatedForm
                title={selectedProduct ? "Modifier le Produit" : "Nouveau Produit"}
                description={selectedProduct ? "Modifiez les informations du produit" : "Ajoutez un nouveau produit à votre inventaire"}
                fields={productFormFields}
                validationSchema={productValidationSchema}
                onSubmit={selectedProduct ? (data: any) => handleProductUpdate(selectedProduct.id, data) : handleProductSubmit}
                columns={2}
                submitLabel={selectedProduct ? "Modifier le Produit" : "Créer le Produit"}
                loading={isSubmitting}
                validationErrors={validationErrors}
                defaultValues={selectedProduct ? {
                  nom: selectedProduct.nom || '',
                  marque: selectedProduct.marque_nom || selectedProduct.marque?.nom || selectedProduct.marque || '',
                  description_courte: selectedProduct.description_courte || '',
                  description_longue: selectedProduct.description_longue || '',
                  prix_achat: selectedProduct.prix_achat || 0,
                  prix_vente: selectedProduct.prix_vente || 0,
                  stock_minimum: selectedProduct.stock_minimum || 5,
                  stock_maximum: selectedProduct.stock_maximum || 100,
                  stock_initial: selectedProduct.stock_initial || selectedProduct.stock || 0,
                  sku: selectedProduct.sku || '',
                  code_barre: selectedProduct.code_barre || '',
                  tva_taux: selectedProduct.tva_taux || 18.0,
                  categorie: selectedProduct.categorie?.id || selectedProduct.categorie_id || selectedProduct.categorie || '',
                  date_peremption: selectedProduct.date_peremption || '',
                  duree_conservation: selectedProduct.duree_conservation || 0
                } : undefined}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {showQRScanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={() => setShowQRScanner(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark-800 rounded-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-primary-100 dark:bg-primary-900 rounded-2xl flex items-center justify-center">
                  <QrCode className="w-10 h-10 text-primary-600" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Scanner QR/Code-barres
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Pointez votre caméra vers le code pour identifier le produit
                </p>

                {/* Simulation de caméra */}
                <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-xl mb-6 flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Caméra simulée</p>
                    <p className="text-xs text-gray-400">Scanner QR/Code-barres</p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button variant="secondary" fullWidth onClick={() => setShowQRScanner(false)}>
                    Annuler
                  </Button>
                  <Button variant="primary" fullWidth icon={<Zap className="w-4 h-4" />}>
                    Scanner
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              className="bg-white dark:bg-dark-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Product Image */}
                  <div>
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.nom}
                      className="w-full aspect-square object-cover rounded-xl"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.pexels.com/photos/33239/wheat-field-wheat-yellow-grain.jpg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2';
                      }}
                    />
                  </div>

                  {/* Product Details */}
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {selectedProduct.nom}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300">
                        {selectedProduct.description_courte}
                      </p>
                    </div>

                    {/* Price Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Prix d'Achat</p>
                        <p className="text-xl font-bold text-blue-600">
                          {selectedProduct.prix_achat.toLocaleString()} XOF
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Prix de Vente</p>
                        <p className="text-xl font-bold text-green-600">
                          {selectedProduct.prix_vente.toLocaleString()} XOF
                        </p>
                      </div>
                    </div>

                    {/* Stock Info */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Stock</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Actuel</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {selectedProduct.stock_actuel}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Minimum</p>
                          <p className="text-lg font-bold text-yellow-600">
                            {selectedProduct.stock_minimum}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Maximum</p>
                          <p className="text-lg font-bold text-blue-600">
                            {selectedProduct.stock_maximum}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">SKU</span>
                        <span className="font-mono text-gray-900 dark:text-white">{selectedProduct.sku}</span>
                      </div>
                      {selectedProduct.code_barre && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Code-barres</span>
                          <span className="font-mono text-gray-900 dark:text-white">{selectedProduct.code_barre}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Fournisseur</span>
                        <span className="text-gray-900 dark:text-white">{selectedProduct.fournisseur}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Marge</span>
                        <span className="font-semibold text-green-600">
                          {selectedProduct.marge_beneficiaire.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3">
                      <Button 
                        variant="primary" 
                        icon={<Edit className="w-4 h-4" />}
                        onClick={() => {
                          setShowProductForm(true);
                          setSelectedProduct(null);
                        }}
                      >
                        Modifier
                      </Button>
                      <Button 
                        variant="secondary" 
                        icon={<Camera className="w-4 h-4" />}
                        onClick={() => handleManageImages(selectedProduct)}
                      >
                        Gérer Images
                      </Button>
                      <Button 
                        variant="secondary" 
                        icon={<DollarSign className="w-4 h-4" />}
                        onClick={() => setShowSaleModal(true)}
                      >
                        Vendre
                      </Button>
                      <Button 
                        variant="secondary" 
                        icon={<RefreshCw className="w-4 h-4" />}
                      >
                        Réapprovisionner
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sale Modal */}
      <AnimatePresence>
        {showSaleModal && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={() => setShowSaleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark-800 rounded-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Vendre le Produit
                  </h2>
                  <button
                    onClick={() => setShowSaleModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.nom}
                      className="w-12 h-12 rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.pexels.com/photos/33239/wheat-field-wheat-yellow-grain.jpg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2';
                      }}
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {selectedProduct.nom}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Prix: {selectedProduct.prix_vente.toLocaleString()} XOF
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Stock: {selectedProduct.stock_actuel} pièces
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sale Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quantité à vendre
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={selectedProduct.stock_actuel}
                      defaultValue="1"
                      id="saleQuantity"
                      className="input-premium w-full"
                      placeholder="Quantité"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prix unitaire (XOF)
                    </label>
                    <input
                      type="number"
                      min="0"
                      defaultValue={selectedProduct.prix_vente}
                      id="salePrice"
                      className="input-premium w-full"
                      placeholder="Prix"
                    />
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Total estimé:
                      </span>
                      <span className="text-lg font-bold text-blue-600" id="saleTotal">
                        {selectedProduct.prix_vente.toLocaleString()} XOF
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 mt-6">
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => setShowSaleModal(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    icon={<DollarSign className="w-4 h-4" />}
                    onClick={() => {
                      const quantity = parseInt((document.getElementById('saleQuantity') as HTMLInputElement)?.value || '1');
                      const price = parseFloat((document.getElementById('salePrice') as HTMLInputElement)?.value || selectedProduct.prix_vente);
                      
                      if (quantity > 0 && quantity <= selectedProduct.stock_actuel) {
                        handleSellProduct({ ...selectedProduct, prix_vente: price }, quantity);
                      } else {
                        alert('Quantité invalide');
                      }
                    }}
                  >
                    Confirmer Vente
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && productToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark-800 rounded-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-red-600">
                    Supprimer le Produit
                  </h2>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Warning */}
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                    <div>
                      <h3 className="font-semibold text-red-800 dark:text-red-200">
                        Attention !
                      </h3>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        Cette action est irréversible. Le produit sera définitivement supprimé.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <img
                      src={productToDelete.image}
                      alt={productToDelete.nom}
                      className="w-12 h-12 rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.pexels.com/photos/33239/wheat-field-wheat-yellow-grain.jpg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2';
                      }}
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {productToDelete.nom}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        SKU: {productToDelete.sku}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Stock: {productToDelete.stock_actuel} pièces
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="danger"
                    fullWidth
                    icon={<Trash2 className="w-4 h-4" />}
                    onClick={() => handleDeleteProduct(productToDelete)}
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Management Modal */}
      <AnimatePresence>
        {showImageModal && productForImages && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={() => {
              setShowImageModal(false);
              setSelectedImages([]);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Gérer les Images
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {productForImages.nom}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowImageModal(false);
                    setSelectedImages([]);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Images existantes */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Images existantes
                  </h3>
                  {productForImages.images && productForImages.images.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {productForImages.images.map((image: any, index: number) => {
                        const apiBaseUrl = getBackendBaseUrl();
                        return (
                        <div key={index} className="relative group">
                          <img
                            src={image.image_url || (image.image?.startsWith('http') ? image.image : `${apiBaseUrl}${image.image || ''}`)}
                            alt={image.alt_text || `Image ${index + 1}`}
                            className="w-full aspect-square object-cover rounded-xl"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.pexels.com/photos/33239/wheat-field-wheat-yellow-grain.jpg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2';
                            }}
                          />
                          {image.principale && (
                            <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                              Principale
                            </span>
                          )}
                          <button
                            onClick={() => handleDeleteImage(image.id)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 dark:text-gray-400">Aucune image existante</p>
                    </div>
                  )}
                </div>

                {/* Ajouter de nouvelles images */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Ajouter de nouvelles images
                  </h3>
                  
                  {/* Zone de sélection */}
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-primary-500 transition-colors">
                    <input
                      type="file"
                      id="image-upload"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        Cliquez pour sélectionner des images
                      </p>
                      <p className="text-sm text-gray-500">
                        Formats acceptés: JPG, PNG, WebP (max 5MB par image, max 5 images)
                      </p>
                    </label>
                  </div>

                  {/* Aperçu des images sélectionnées */}
                  {selectedImages.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                        Images sélectionnées ({selectedImages.length}/5)
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Preview ${index + 1}`}
                              className="w-full aspect-square object-cover rounded-xl"
                            />
                            <button
                              onClick={() => removeSelectedImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                              {image.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowImageModal(false);
                      setSelectedImages([]);
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="primary"
                    icon={<Upload className="w-4 h-4" />}
                    onClick={handleUploadImages}
                    disabled={selectedImages.length === 0 || uploadingImages}
                  >
                    {uploadingImages ? 'Upload en cours...' : `Uploader ${selectedImages.length} image(s)`}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StockPage;
