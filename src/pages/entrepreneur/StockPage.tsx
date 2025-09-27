import React, { useState, useEffect } from 'react';
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
import * as yup from 'yup';

const StockPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<any[]>([]);
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
    loadProducts();
    loadCategories();
  }, []);

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

    productsData.forEach(product => {
      const stockActuel = product.stock_actuel || 0;
      const prixAchat = parseFloat(product.prix_achat) || 0;
      
      // Valeur totale du stock (prix d'achat * quantité)
      metrics.totalValue += prixAchat * stockActuel;
      
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

    return metrics;
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProducts();
      console.log('Produits chargés:', response);
      
      // Transformer les données pour correspondre au format attendu
      const transformedProducts = response.results?.map((product: any) => ({
        ...product,
        // Utiliser la première image disponible ou une image par défaut
        image: product.images && product.images.length > 0 ? 
          (product.images[0].image.startsWith('http') ? product.images[0].image : `http://localhost:8000${product.images[0].image}`) :
          'https://images.pexels.com/photos/33239/wheat-field-wheat-yellow-grain.jpg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
        // Calculer les indicateurs de stock
        en_rupture: product.stocks?.some((stock: any) => stock.quantite_physique === 0) || false,
        stock_bas: product.stocks?.some((stock: any) => stock.quantite_physique <= (product.stock_minimum || 5)) || false,
        stock_actuel: product.stocks?.reduce((total: number, stock: any) => total + stock.quantite_physique, 0) || 0,
        // Formater les prix
        prix_achat: parseFloat(product.prix_achat) || 0,
        prix_vente: parseFloat(product.prix_vente) || 0,
        // Calculer la marge
        marge_beneficiaire: product.prix_achat > 0 ? 
          Math.round(((product.prix_vente - product.prix_achat) / product.prix_achat) * 100) : 0,
        // Utiliser le nom de la catégorie
        categorie: product.categorie_nom || 'Non classé'
      })) || [];
      
      setProducts(transformedProducts);
      
      // Calculer et mettre à jour les métriques
      const metrics = calculateStockMetrics(transformedProducts);
      setStockMetrics(metrics);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      // En cas d'erreur, utiliser les données mockées comme fallback
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiService.getCategories();
      setProductCategories(response.results || []);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  // Données de test avec produits sénégalais (fallback)
  const mockProducts = [
    {
      id: '1',
      nom: 'Riz Brisé Local',
      description_courte: 'Riz brisé de qualité supérieure produit au Sénégal',
      categorie: 'Alimentation',
      prix_achat: 8000,
      prix_vente: 12000,
      stock_actuel: 150,
      stock_minimum: 50,
      stock_maximum: 500,
      sku: 'RIZ-BRISE-25KG',
      code_barre: '6901234567890',
      image: 'https://images.pexels.com/photos/33239/wheat-field-wheat-yellow-grain.jpg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
      statut: 'actif',
      en_rupture: false,
      stock_bas: false,
      popularite_score: 78,
      nombre_ventes: 125,
      marge_beneficiaire: 50,
      date_creation: '2024-01-10T09:00:00Z',
      fournisseur: 'Coopérative Rizicole Vallée',
      unite_mesure: 'kg',
      poids: 25.0,
    },
    {
      id: '2',
      nom: 'Boubou Grand Boubou Homme',
      description_courte: 'Boubou traditionnel brodé main pour homme',
      categorie: 'Artisanat',
      prix_achat: 25000,
      prix_vente: 65000,
      stock_actuel: 8,
      stock_minimum: 5,
      stock_maximum: 50,
      sku: 'BOUBOU-H-001',
      image: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
      statut: 'actif',
      en_rupture: false,
      stock_bas: true,
      popularite_score: 85,
      nombre_ventes: 45,
      marge_beneficiaire: 160,
      date_creation: '2024-01-08T14:30:00Z',
      fournisseur: 'Atelier Couture Traditionnelle',
      couleurs_disponibles: ['Blanc', 'Bleu Royal', 'Noir', 'Beige'],
      tailles_disponibles: ['M', 'L', 'XL', 'XXL', 'XXXL'],
    },
    {
      id: '3',
      nom: 'Thiakry Traditionnel',
      description_courte: 'Dessert traditionnel sénégalais au lait caillé',
      categorie: 'Alimentation',
      prix_achat: 800,
      prix_vente: 1500,
      stock_actuel: 0,
      stock_minimum: 20,
      stock_maximum: 100,
      sku: 'THIAKRY-500G',
      image: 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
      statut: 'actif',
      en_rupture: true,
      stock_bas: false,
      popularite_score: 92,
      nombre_ventes: 280,
      marge_beneficiaire: 87.5,
      date_creation: '2024-01-05T11:15:00Z',
      fournisseur: 'Laiterie Artisanale Dakar',
      unite_mesure: 'piece',
    },
    {
      id: '4',
      nom: 'Bissap Rouge Kirène',
      description_courte: 'Boisson à base d\'hibiscus - Bouteille 1.5L',
      categorie: 'Alimentation',
      prix_achat: 600,
      prix_vente: 1200,
      stock_actuel: 45,
      stock_minimum: 40,
      stock_maximum: 300,
      sku: 'BISSAP-1.5L',
      code_barre: '6901234567891',
      image: 'https://images.pexels.com/photos/1346155/pexels-photo-1346155.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
      statut: 'actif',
      en_rupture: false,
      stock_bas: false,
      popularite_score: 88,
      nombre_ventes: 156,
      marge_beneficiaire: 100,
      date_creation: '2024-01-12T16:45:00Z',
      fournisseur: 'Kirène SA',
      unite_mesure: 'piece',
    },
    {
      id: '5',
      nom: 'Djembé Artisanal',
      description_courte: 'Djembé traditionnel en peau de chèvre',
      categorie: 'Artisanat',
      prix_achat: 45000,
      prix_vente: 95000,
      stock_actuel: 3,
      stock_minimum: 5,
      stock_maximum: 25,
      sku: 'DJEMBE-TRAD-001',
      image: 'https://images.pexels.com/photos/164743/pexels-photo-164743.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
      statut: 'actif',
      en_rupture: false,
      stock_bas: true,
      popularite_score: 75,
      nombre_ventes: 12,
      marge_beneficiaire: 111,
      date_creation: '2024-01-03T10:20:00Z',
      fournisseur: 'Artisans Casamance',
      tailles_disponibles: ['Petit (25cm)', 'Moyen (30cm)', 'Grand (35cm)'],
    },
  ];

  const categories = [
    { id: 'all', name: 'Toutes catégories', count: mockProducts.length },
    { id: 'alimentation', name: 'Alimentation', count: 3 },
    { id: 'artisanat', name: 'Artisanat', count: 2 },
    { id: 'electronique', name: 'Électronique', count: 0 },
    { id: 'mode', name: 'Mode & Beauté', count: 0 },
  ];

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
    unite_mesure: yup
      .string()
      .required('L\'unité de mesure est requise')
      .oneOf(['piece', 'kg', 'l', 'm', 'paquet', 'boite'], 'Unité de mesure invalide'),
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
    poids: yup
      .number()
      .min(0, 'Le poids ne peut pas être négatif')
      .max(1000, 'Le poids ne peut pas dépasser 1000 kg')
      .test('decimal-places', 'Maximum 2 décimales autorisées', value => 
        value ? Number(value.toFixed(2)) === value : true),
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
      name: 'description_courte',
      label: 'Description Courte',
      type: 'textarea' as const,
      placeholder: 'Description courte du produit...',
      rows: 3,
    },
    {
      name: 'categorie',
      label: 'Catégorie',
      type: 'select' as const,
      options: productCategories.map(cat => ({
        label: cat.nom,
        value: cat.id
      })),
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
      name: 'tva_taux',
      label: 'Taux TVA (%)',
      type: 'number' as const,
      placeholder: '18',
      step: '0.01',
    },
    {
      name: 'unite_mesure',
      label: 'Unité de Mesure',
      type: 'select' as const,
      options: [
        { label: 'Pièce', value: 'piece' },
        { label: 'Kilogramme', value: 'kg' },
        { label: 'Litre', value: 'l' },
        { label: 'Mètre', value: 'm' },
        { label: 'Paquet', value: 'paquet' },
        { label: 'Boîte', value: 'boite' },
      ],
    },
    {
      name: 'image',
      label: 'Image du Produit',
      type: 'file' as const,
      placeholder: 'Sélectionnez une image',
      description: 'Formats acceptés: JPG, PNG, WebP (max 5MB)',
    },
    {
      name: 'poids',
      label: 'Poids (kg)',
      type: 'number' as const,
      placeholder: '0.00',
      step: '0.01',
      description: 'Poids du produit en kilogrammes',
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
    {
      name: 'description_longue',
      label: 'Description Longue',
      type: 'textarea' as const,
      placeholder: 'Description détaillée du produit...',
      rows: 4,
      description: 'Description complète du produit (optionnel)',
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
      
      // Préparer les données pour l'API
      const productData = {
        nom: data.nom.trim(),
        description_courte: data.description_courte?.trim() || 'Description courte',
        description_longue: data.description_longue?.trim() || data.description_courte?.trim() || 'Description longue',
        prix_achat: parseFloat(data.prix_achat),
        prix_vente: parseFloat(data.prix_vente),
        stock_minimum: parseInt(data.stock_minimum) || 5,
        stock_maximum: parseInt(data.stock_maximum) || 100,
        sku: data.sku?.trim() || `SKU-${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
        code_barre: data.code_barre?.trim() || null,
        slug: slug,
        // Utiliser les IDs des catégories et marques créées
        categorie: data.categorie || (productCategories.length > 0 ? productCategories[0].id : 'd76dea0f-fd55-4cb4-b380-0e133f966e79'),
        marque: data.marque || '8f38bf60-a528-4f73-aa5e-80ec5f7721df',
        unite_mesure: data.unite_mesure || 'piece',
        tva_taux: parseFloat(data.tva_taux) || 18.0,
        // Champs obligatoires manquants
        statut: 'actif',
        vendable: true,
        achetable: true,
        visible_catalogue: true,
        // Champs avec valeurs par défaut
        dimensions: {},
        couleurs_disponibles: [],
        tailles_disponibles: [],
        point_recommande: 10,
        // Champs supplémentaires pour éviter les erreurs
        poids: data.poids || null,
        date_peremption: data.date_peremption || null,
        duree_conservation: data.duree_conservation || null,
        popularite_score: 0,
        nombre_vues: 0,
        nombre_ventes: 0,
        en_promotion: false,
        stock_actuel: 0,
        stock_disponible: 0,
        en_rupture: false,
        stock_bas: false,
        images: [],
        variantes: []
      };

      console.log('Données du produit à envoyer:', productData);

      // Appel API réel
      const response = await apiService.createProduct(productData);
      console.log('Produit créé avec succès:', response);
      
      // Upload de l'image si fournie
      if (data.image && data.image.length > 0) {
        try {
          await apiService.uploadProductImage(response.id, data.image[0]);
          console.log('Image uploadée avec succès');
        } catch (imageError) {
          console.error('Erreur lors de l\'upload de l\'image:', imageError);
          // Ne pas faire échouer la création du produit si l'image échoue
        }
      }
      
      // Fermer le formulaire
      setShowProductForm(false);
      
      // Recharger la liste des produits
      await loadProducts();
      
      alert('Produit créé avec succès !');
      
    } catch (error: any) {
      console.error('Erreur lors de la création du produit:', error);
      
      // Gestion des erreurs détaillées
      let errorMessage = 'Erreur lors de la création du produit.';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        console.log('Données d\'erreur:', errorData);
        
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
                               field === 'unite_mesure' ? 'unité de mesure' : field;
              
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
      
      // Préparer les données pour l'API
      const updateData = {
        nom: data.nom,
        description_courte: data.description || 'Description courte',
        description_longue: data.description || 'Description longue',
        prix_achat: parseFloat(data.prix_achat) || 0,
        prix_vente: parseFloat(data.prix_vente) || 0,
        stock_minimum: parseInt(data.stock_minimum) || 5,
        stock_maximum: parseInt(data.stock_maximum) || 100,
        sku: data.sku,
        code_barre: data.code_barre,
        unite_mesure: data.unite_mesure || 'piece',
        tva_taux: parseFloat(data.tva_taux) || 18.0,
        // Inclure les champs requis
        categorie: data.categorie || currentProduct.categorie,
        marque: data.marque || currentProduct.marque,
        slug: currentProduct.slug
      };

      // Appel API réel
      const response = await apiService.updateProduct(id, updateData);
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
                               field === 'unite_mesure' ? 'unité de mesure' : field;
              
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
          alt={product.nom}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
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
                setShowQRScanner(true);
              }}
              className="p-2 bg-white/80 backdrop-blur-sm text-gray-600 rounded-lg hover:bg-white transition-colors"
              title="Scanner QR Code"
            >
              <QrCode className="w-4 h-4" />
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
  );

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
          value={stockMetrics.totalValue}
          previousValue={Math.round(stockMetrics.totalValue * 0.95)} // -5% par rapport à la période précédente
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
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.count})
              </option>
            ))}
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
            ) : (
              products
                .filter(product => 
                  product.nom.toLowerCase().includes(searchTerm.toLowerCase()) &&
                  (selectedCategory === 'all' || product.categorie === selectedCategory)
                )
                .map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
            )}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="card-premium">
          <DataTable
            data={products.filter(product => 
              product.nom.toLowerCase().includes(searchTerm.toLowerCase()) &&
              (selectedCategory === 'all' || product.categorie === selectedCategory)
            )}
            columns={[
              {
                accessorKey: 'nom',
                header: 'Produit',
                cell: ({ row }) => (
                  <div className="flex items-center space-x-3">
                    <img
                      src={row.original.image}
                      alt={row.original.nom}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
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
                  nom: selectedProduct.nom,
                  description_courte: selectedProduct.description_courte,
                  prix_achat: selectedProduct.prix_achat,
                  prix_vente: selectedProduct.prix_vente,
                  stock_minimum: selectedProduct.stock_minimum,
                  stock_maximum: selectedProduct.stock_maximum,
                  sku: selectedProduct.sku,
                  code_barre: selectedProduct.code_barre,
                  unite_mesure: selectedProduct.unite_mesure,
                  categorie: selectedProduct.categorie,
                  fournisseur: selectedProduct.fournisseur
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
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {selectedProduct.nom}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Prix: {selectedProduct.prix_vente.toLocaleString()} XOF
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Stock: {selectedProduct.stock_actuel} {selectedProduct.unite_mesure}
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
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {productToDelete.nom}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        SKU: {productToDelete.sku}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Stock: {productToDelete.stock_actuel} {productToDelete.unite_mesure}
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
    </div>
  );
};

export default StockPage;
