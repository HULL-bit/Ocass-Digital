/**
 * Constantes de l'application
 */

// Types d'utilisateurs
export const USER_TYPES = {
  ADMIN: 'admin',
  ENTREPRENEUR: 'entrepreneur',
  CLIENT: 'client',
  EMPLOYE: 'employe',
  SUPPORT: 'support',
} as const;

// Statuts génériques
export const STATUTS = {
  ACTIF: 'actif',
  INACTIF: 'inactif',
  SUSPENDU: 'suspendu',
  ARCHIVE: 'archive',
} as const;

// Devises
export const CURRENCIES = {
  XOF: 'XOF',
  EUR: 'EUR',
  USD: 'USD',
  GBP: 'GBP',
} as const;

// Modes de paiement
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  WAVE: 'wave',
  ORANGE_MONEY: 'orange_money',
  FREE_MONEY: 'free_money',
  VIREMENT: 'virement',
  CHEQUE: 'cheque',
} as const;

// Statuts de paiement
export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

// Statuts de vente
export const SALE_STATUSES = {
  BROUILLON: 'brouillon',
  EN_ATTENTE: 'en_attente',
  CONFIRMEE: 'confirmee',
  EXPEDIEE: 'expediee',
  LIVREE: 'livree',
  TERMINEE: 'terminee',
  ANNULEE: 'annulee',
  RETOURNEE: 'retournee',
} as const;

// Statuts de projet
export const PROJECT_STATUSES = {
  PLANIFIE: 'planifie',
  EN_COURS: 'en_cours',
  EN_ATTENTE: 'en_attente',
  TERMINE: 'termine',
  ANNULE: 'annule',
  SUSPENDU: 'suspendu',
} as const;

// Priorités
export const PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

// Types de notifications
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  SYSTEM: 'system',
  MARKETING: 'marketing',
} as const;

// Unités de mesure
export const UNITS = {
  PIECE: 'piece',
  KG: 'kg',
  G: 'g',
  L: 'l',
  ML: 'ml',
  M: 'm',
  CM: 'cm',
  M2: 'm2',
  M3: 'm3',
  PACK: 'pack',
  CARTON: 'carton',
  PALETTE: 'palette',
} as const;

// Secteurs d'activité
export const BUSINESS_SECTORS = {
  COMMERCE: 'commerce',
  SERVICES: 'services',
  INDUSTRIE: 'industrie',
  AGRICULTURE: 'agriculture',
  TECHNOLOGIE: 'technologie',
  SANTE: 'sante',
  EDUCATION: 'education',
  TRANSPORT: 'transport',
  IMMOBILIER: 'immobilier',
  FINANCE: 'finance',
  TOURISME: 'tourisme',
  ARTISANAT: 'artisanat',
  AUTRE: 'autre',
} as const;

// Segments clients
export const CUSTOMER_SEGMENTS = {
  NOUVEAU: 'nouveau',
  REGULIER: 'regulier',
  VIP: 'vip',
  INACTIF: 'inactif',
  RISQUE: 'risque',
} as const;

// Niveaux de fidélité
export const LOYALTY_LEVELS = {
  BRONZE: 'bronze',
  ARGENT: 'argent',
  OR: 'or',
  PLATINE: 'platine',
  DIAMANT: 'diamant',
} as const;

// Périodes d'analyse
export const ANALYSIS_PERIODS = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  THIS_WEEK: 'this_week',
  LAST_WEEK: 'last_week',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  THIS_QUARTER: 'this_quarter',
  LAST_QUARTER: 'last_quarter',
  THIS_YEAR: 'this_year',
  LAST_YEAR: 'last_year',
  CUSTOM: 'custom',
} as const;

// Configuration des graphiques
export const CHART_COLORS = {
  PRIMARY: '#3B82F6',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  DANGER: '#EF4444',
  INFO: '#06B6D4',
  PURPLE: '#8B5CF6',
  PINK: '#EC4899',
  INDIGO: '#6366F1',
} as const;

// Formats d'export
export const EXPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'excel',
  CSV: 'csv',
  JSON: 'json',
} as const;

// Tailles de pagination
export const PAGE_SIZES = [10, 25, 50, 100, 200] as const;

// Délais de cache (en secondes)
export const CACHE_DURATIONS = {
  SHORT: 60,        // 1 minute
  MEDIUM: 300,      // 5 minutes
  LONG: 1800,       // 30 minutes
  VERY_LONG: 3600,  // 1 heure
} as const;

// Limites de l'application
export const LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGES_PER_PRODUCT: 10,
  MAX_VARIANTS_PER_PRODUCT: 50,
  MAX_ITEMS_PER_BUNDLE: 20,
  MAX_SEARCH_RESULTS: 1000,
  MAX_EXPORT_ROWS: 10000,
} as const;

// Messages par défaut
export const DEFAULT_MESSAGES = {
  LOADING: 'Chargement en cours...',
  ERROR: 'Une erreur est survenue',
  SUCCESS: 'Opération réussie',
  NO_DATA: 'Aucune donnée disponible',
  UNAUTHORIZED: 'Accès non autorisé',
  NETWORK_ERROR: 'Erreur de connexion',
  VALIDATION_ERROR: 'Erreur de validation',
} as const;

// Regex patterns
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  SKU: /^[A-Z0-9-_]{3,20}$/,
  BARCODE: /^[0-9]{8,13}$/,
  POSTAL_CODE: /^[0-9]{5}$/,
} as const;

// Configuration WebSocket
export const WEBSOCKET_CONFIG = {
  RECONNECT_INTERVAL: 3000,
  MAX_RECONNECT_ATTEMPTS: 5,
  PING_INTERVAL: 30000,
  TIMEOUT: 10000,
} as const;

// Configuration des animations
export const ANIMATION_CONFIG = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
    VERY_SLOW: 1000,
  },
  EASING: {
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out',
    BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

// Configuration des toasts
export const TOAST_CONFIG = {
  DURATION: {
    SHORT: 3000,
    MEDIUM: 5000,
    LONG: 8000,
    PERSISTENT: 0,
  },
  POSITION: {
    TOP_RIGHT: 'top-right',
    TOP_LEFT: 'top-left',
    BOTTOM_RIGHT: 'bottom-right',
    BOTTOM_LEFT: 'bottom-left',
    TOP_CENTER: 'top-center',
    BOTTOM_CENTER: 'bottom-center',
  },
} as const;

// Thèmes
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
} as const;

// Langues supportées
export const LANGUAGES = {
  FR: 'fr',
  EN: 'en',
  AR: 'ar',
  WO: 'wo',
} as const;

// Configuration des permissions
export const PERMISSIONS = {
  // Produits
  PRODUCTS_VIEW: 'products:view',
  PRODUCTS_CREATE: 'products:create',
  PRODUCTS_EDIT: 'products:edit',
  PRODUCTS_DELETE: 'products:delete',
  
  // Ventes
  SALES_VIEW: 'sales:view',
  SALES_CREATE: 'sales:create',
  SALES_EDIT: 'sales:edit',
  SALES_DELETE: 'sales:delete',
  
  // Clients
  CUSTOMERS_VIEW: 'customers:view',
  CUSTOMERS_CREATE: 'customers:create',
  CUSTOMERS_EDIT: 'customers:edit',
  CUSTOMERS_DELETE: 'customers:delete',
  
  // Projets
  PROJECTS_VIEW: 'projects:view',
  PROJECTS_CREATE: 'projects:create',
  PROJECTS_EDIT: 'projects:edit',
  PROJECTS_DELETE: 'projects:delete',
  
  // Analytics
  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_EXPORT: 'analytics:export',
  
  // Administration
  ADMIN_USERS: 'admin:users',
  ADMIN_COMPANIES: 'admin:companies',
  ADMIN_SYSTEM: 'admin:system',
  
  // Wildcard
  ALL: '*',
} as const;

// URLs de l'API
// Vite utilise import.meta.env pour les variables d'environnement
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD 
  ? 'https://ocass-digital.onrender.com/api/v1'
  : 'http://localhost:8000/api/v1');

const WS_BASE_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('https://', 'wss://').replace('http://', 'ws://')
  : (import.meta.env.PROD 
    ? 'wss://ocass-digital.onrender.com/ws'
    : 'ws://localhost:8000/ws');

export const API_ENDPOINTS = {
  BASE_URL: API_BASE_URL,
  WEBSOCKET_URL: WS_BASE_URL,
} as const;

// Configuration des features flags
export const FEATURE_FLAGS = {
  AI_RECOMMENDATIONS: true,
  VOICE_RECOGNITION: true,
  AR_PRODUCT_VIEW: false,
  ADVANCED_ANALYTICS: true,
  MULTI_WAREHOUSE: true,
  MOBILE_PAYMENTS: true,
  CHATBOT: true,
  GAMIFICATION: true,
} as const;