/**
 * Types TypeScript pour l'application
 */

// Types de base
export type ID = string;
export type Timestamp = string;
export type Currency = 'XOF' | 'EUR' | 'USD' | 'GBP';
export type Language = 'fr' | 'en' | 'ar' | 'wo';
export type Theme = 'light' | 'dark' | 'auto';

// Types d'utilisateurs
export type UserType = 'admin' | 'entrepreneur' | 'client' | 'employe' | 'support';

// Statuts génériques
export type Status = 'actif' | 'inactif' | 'suspendu' | 'archive';

// Priorités
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

// Types de notifications
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system' | 'marketing';

// Modes de paiement
export type PaymentMethod = 'cash' | 'card' | 'wave' | 'orange_money' | 'free_money' | 'virement' | 'cheque';

// Statuts de paiement
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';

// Interface utilisateur de base
export interface BaseUser {
  id: ID;
  email: string;
  first_name: string;
  last_name: string;
  type_utilisateur: UserType;
  telephone?: string;
  avatar?: string;
  theme_interface: Theme;
  langue: Language;
  mfa_actif: boolean;
  points_experience: number;
  niveau: number;
  badges: Badge[];
  statut: Status;
  date_creation: Timestamp;
  date_derniere_connexion?: Timestamp;
}

// Interface entreprise
export interface Company {
  id: ID;
  nom: string;
  secteur_activite: string;
  adresse_complete: string;
  telephone: string;
  email: string;
  site_web?: string;
  siret?: string;
  logo?: string;
  couleur_primaire: string;
  couleur_secondaire: string;
  devise_principale: Currency;
  fuseau_horaire: string;
  statut: Status;
  date_creation: Timestamp;
  plan_abonnement: SubscriptionPlan;
}

// Interface plan d'abonnement
export interface SubscriptionPlan {
  id: ID;
  nom: string;
  description: string;
  prix_mensuel: number;
  prix_annuel: number;
  devise: Currency;
  max_utilisateurs: number;
  max_produits: number;
  max_ventes_mensuelles: number;
  stockage_gb: number;
  fonctionnalites: Record<string, boolean>;
  populaire: boolean;
}

// Interface produit
export interface Product {
  id: ID;
  nom: string;
  description_courte: string;
  description_longue?: string;
  categorie: ID;
  categorie_nom: string;
  sous_categorie?: ID;
  marque?: ID;
  marque_nom?: string;
  sku: string;
  code_barre?: string;
  qr_code?: string;
  prix_achat: number;
  prix_vente: number;
  prix_promotion?: number;
  marge_beneficiaire: number;
  prix_ttc: number;
  tva_taux: number;
  unite_mesure: string;
  poids?: number;
  dimensions: ProductDimensions;
  couleurs_disponibles: string[];
  tailles_disponibles: string[];
  stock_minimum: number;
  stock_maximum: number;
  point_recommande: number;
  date_peremption?: string;
  duree_conservation?: number;
  statut: 'actif' | 'inactif' | 'rupture' | 'discontinue';
  popularite_score: number;
  nombre_vues: number;
  nombre_ventes: number;
  slug: string;
  en_promotion: boolean;
  date_debut_promotion?: Timestamp;
  date_fin_promotion?: Timestamp;
  vendable: boolean;
  achetable: boolean;
  visible_catalogue: boolean;
  stock_actuel: number;
  stock_disponible: number;
  en_rupture: boolean;
  stock_bas: boolean;
  images: ProductImage[];
  variantes: ProductVariant[];
  entreprise: ID;
  date_creation: Timestamp;
}

// Dimensions du produit
export interface ProductDimensions {
  longueur?: number;
  largeur?: number;
  hauteur?: number;
}

// Image de produit
export interface ProductImage {
  id: ID;
  image: string;
  alt_text?: string;
  principale: boolean;
  ordre_affichage: number;
  couleur?: string;
  taille?: string;
}

// Variante de produit
export interface ProductVariant {
  id: ID;
  couleur?: string;
  taille?: string;
  materiau?: string;
  prix_supplement: number;
  sku_variante: string;
  active: boolean;
  prix_final: number;
}

// Interface catégorie
export interface Category {
  id: ID;
  nom: string;
  description?: string;
  slug: string;
  parent?: ID;
  image?: string;
  icone?: string;
  couleur: string;
  ordre_affichage: number;
  visible: boolean;
  niveau: number;
  meta_titre?: string;
  meta_description?: string;
}

// Interface client
export interface Customer {
  id: ID;
  code_client: string;
  type_client: 'particulier' | 'professionnel' | 'entreprise';
  nom: string;
  prenom?: string;
  entreprise_nom?: string;
  email: string;
  telephone: string;
  telephone_secondaire?: string;
  adresse_facturation: string;
  adresse_livraison?: string;
  latitude?: number;
  longitude?: number;
  date_creation: Timestamp;
  date_derniere_commande?: Timestamp;
  total_achats: number;
  nombre_commandes: number;
  panier_moyen: number;
  segment: 'nouveau' | 'regulier' | 'vip' | 'inactif' | 'risque';
  score_fidelite: number;
  source_acquisition?: string;
  statut: Status;
  notes?: string;
  preferences: Record<string, any>;
  points_fidelite: number;
  niveau_fidelite: 'bronze' | 'argent' | 'or' | 'platine' | 'diamant';
  entrepreneur: ID;
}

// Interface vente
export interface Sale {
  id: ID;
  numero_facture: string;
  numero_commande?: string;
  client: ID;
  client_nom: string;
  entrepreneur: ID;
  vendeur?: ID;
  date_creation: Timestamp;
  date_livraison_prevue?: string;
  date_livraison_reelle?: string;
  statut: 'brouillon' | 'en_attente' | 'confirmee' | 'expediee' | 'livree' | 'terminee' | 'annulee' | 'retournee';
  sous_total: number;
  taxe_montant: number;
  remise_montant: number;
  frais_livraison: number;
  total_ttc: number;
  mode_paiement: PaymentMethod;
  statut_paiement: PaymentStatus;
  date_paiement?: Timestamp;
  reference_paiement?: string;
  notes?: string;
  signature_client?: string;
  adresse_livraison?: string;
  transporteur?: string;
  numero_suivi?: string;
  source_vente: 'pos' | 'online' | 'telephone' | 'email' | 'visite' | 'autre';
  lignes: SaleLine[];
}

// Ligne de vente
export interface SaleLine {
  id: ID;
  vente: ID;
  produit: ID;
  produit_nom: string;
  produit_sku: string;
  variante?: ID;
  quantite: number;
  prix_unitaire: number;
  remise_pourcentage: number;
  tva_taux: number;
  total_ht: number;
  total_tva: number;
  total_ttc: number;
  notes?: string;
}

// Interface projet
export interface Project {
  id: ID;
  nom: string;
  description: string;
  code_projet: string;
  entrepreneur: ID;
  client: ID;
  client_nom: string;
  responsable: ID;
  responsable_nom: string;
  equipe: ID[];
  date_debut: string;
  date_fin_prevue: string;
  date_fin_reelle?: string;
  statut: 'planifie' | 'en_cours' | 'en_attente' | 'termine' | 'annule' | 'suspendu';
  priorite: Priority;
  budget_prevu: number;
  budget_consomme: number;
  marge_prevue: number;
  marge_reelle: number;
  pourcentage_completion: number;
  documents: ID[];
  notes?: string;
  risques_identifies: ProjectRisk[];
  date_creation: Timestamp;
}

// Risque de projet
export interface ProjectRisk {
  id: string;
  description: string;
  probabilite: number;
  impact: number;
  score: number;
  mitigation?: string;
}

// Interface tâche de projet
export interface ProjectTask {
  id: ID;
  projet: ID;
  nom: string;
  description?: string;
  assignee?: ID;
  assignee_nom?: string;
  date_debut: Timestamp;
  date_fin: Timestamp;
  date_completion?: Timestamp;
  statut: 'a_faire' | 'en_cours' | 'en_attente' | 'terminee' | 'annulee';
  priorite: Priority;
  temps_estime: string; // Duration
  temps_reel?: string; // Duration
  cout_prevu: number;
  cout_reel: number;
  taches_prerequises: ID[];
  pourcentage_completion: number;
}

// Interface notification
export interface Notification {
  id: ID;
  utilisateur: ID;
  titre: string;
  message: string;
  type: NotificationType;
  canal: 'app' | 'email' | 'sms' | 'push' | 'webhook';
  lue: boolean;
  date_lecture?: Timestamp;
  action_url?: string;
  action_label?: string;
  metadata: Record<string, any>;
  date_expiration?: Timestamp;
  groupe?: string;
  date_creation: Timestamp;
}

// Interface badge
export interface Badge {
  id: ID;
  nom: string;
  description: string;
  icone: string;
  couleur: string;
  conditions: Record<string, any>;
  points_bonus: number;
  rare: boolean;
  date_obtention?: Timestamp;
}

// Interface métriques dashboard
export interface DashboardMetrics {
  ventes_jour: number;
  ventes_semaine: number;
  ventes_mois: number;
  clients_actifs: number;
  produits_stock: number;
  commandes_attente: number;
  marge_moyenne: number;
  taux_conversion: number;
  panier_moyen: number;
  croissance_ventes: number;
  periode: string;
  timestamp: Timestamp;
}

// Interface analytics
export interface Analytics {
  sales: SalesAnalytics;
  inventory: InventoryAnalytics;
  customers: CustomerAnalytics;
  financial: FinancialAnalytics;
}

export interface SalesAnalytics {
  periode: string;
  ventes_totales: number;
  nombre_transactions: number;
  panier_moyen: number;
  produits_top: TopProduct[];
  ventes_par_jour: DailySales[];
  ventes_par_categorie: CategorySales[];
  performance_vendeurs: SellerPerformance[];
}

export interface InventoryAnalytics {
  valeur_stock_total: number;
  nombre_produits: number;
  produits_rupture: number;
  produits_stock_bas: number;
  rotation_stock: number;
  produits_lents: SlowMovingProduct[];
  analyse_abc: ABCAnalysis[];
  mouvements_recents: StockMovement[];
}

export interface CustomerAnalytics {
  nombre_clients_total: number;
  nouveaux_clients: number;
  clients_actifs: number;
  clients_inactifs: number;
  valeur_vie_client: number;
  taux_retention: number;
  segments_clients: CustomerSegment[];
  acquisition_sources: AcquisitionSource[];
}

export interface FinancialAnalytics {
  revenus_totaux: number;
  benefices_nets: number;
  marge_brute: number;
  charges_totales: number;
  flux_tresorerie: CashFlow[];
  rentabilite_produits: ProductProfitability[];
}

// Types pour les graphiques
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

// Types pour les tableaux
export interface TableColumn<T = any> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: PaginationConfig;
  selection?: SelectionConfig<T>;
  filters?: FilterConfig;
  sorting?: SortingConfig;
  onRowClick?: (record: T) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
}

export interface PaginationConfig {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
}

export interface SelectionConfig<T = any> {
  type: 'checkbox' | 'radio';
  selectedRowKeys: string[];
  onSelect?: (record: T, selected: boolean) => void;
  onSelectAll?: (selected: boolean, selectedRows: T[]) => void;
}

export interface FilterConfig {
  [key: string]: {
    type: 'text' | 'select' | 'date' | 'number';
    options?: { label: string; value: any }[];
    placeholder?: string;
  };
}

export interface SortingConfig {
  field?: string;
  order?: 'asc' | 'desc';
}

// Types pour les formulaires
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'file' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: any }[];
  validation?: ValidationRule[];
  disabled?: boolean;
  hidden?: boolean;
  defaultValue?: any;
  description?: string;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

// Types pour les modals
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  maskClosable?: boolean;
  children: React.ReactNode;
}

// Types pour les alertes
export interface Alert {
  id: ID;
  type: NotificationType;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  closable?: boolean;
}

// Types pour les permissions
export interface Permission {
  id: ID;
  nom: string;
  code: string;
  description: string;
  module: string;
}

export interface Role {
  id: ID;
  nom: string;
  description: string;
  permissions: Permission[];
  couleur: string;
}

// Types pour les API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  count: number;
  next?: string;
  previous?: string;
  page_size: number;
  total_pages: number;
  current_page: number;
  has_next: boolean;
  has_previous: boolean;
}

// Types pour les erreurs
export interface ApiError {
  status: number;
  data: {
    message?: string;
    detail?: string;
    errors?: Record<string, string[]>;
  };
}

// Types pour les filtres
export interface FilterState {
  search: string;
  status: string;
  category: string;
  dateRange: [string, string] | null;
  priceRange: [number, number] | null;
  [key: string]: any;
}

// Types pour les exports
export interface ExportConfig {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  filename?: string;
  fields?: string[];
  filters?: Record<string, any>;
}

// Types pour les widgets dashboard
export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'map' | 'timeline';
  title: string;
  size: 'sm' | 'md' | 'lg' | 'xl';
  position: { x: number; y: number; w: number; h: number };
  config: Record<string, any>;
  data?: any;
  loading?: boolean;
  error?: string;
}

// Types pour les graphiques avancés
export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter';
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins: Record<string, any>;
  scales?: Record<string, any>;
  animation?: {
    duration: number;
    easing: string;
  };
}

// Types pour les intégrations
export interface Integration {
  id: ID;
  nom: string;
  type_integration: string;
  configuration: Record<string, any>;
  statut: 'active' | 'inactive' | 'erreur' | 'configuration' | 'suspendue';
  derniere_synchronisation?: Timestamp;
  nombre_erreurs: number;
  derniere_erreur?: string;
}

// Types pour les rapports
export interface CustomReport {
  id: ID;
  nom: string;
  description?: string;
  type_rapport: string;
  configuration: ReportConfig;
  frequence: 'manuel' | 'quotidien' | 'hebdomadaire' | 'mensuel' | 'trimestriel' | 'annuel';
  planification: Record<string, any>;
  derniere_execution?: Timestamp;
  prochaine_execution?: Timestamp;
  actif: boolean;
}

export interface ReportConfig {
  fields: string[];
  filters: Record<string, any>;
  groupBy?: string[];
  orderBy?: { field: string; direction: 'asc' | 'desc' }[];
  aggregations?: Record<string, 'sum' | 'avg' | 'count' | 'min' | 'max'>;
}

// Types pour les tâches asynchrones
export interface AsyncTask {
  id: ID;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  result?: any;
  error?: string;
  created_at: Timestamp;
  started_at?: Timestamp;
  completed_at?: Timestamp;
}

// Types pour les webhooks
export interface Webhook {
  id: ID;
  nom: string;
  url: string;
  secret: string;
  evenements: string[];
  actif: boolean;
  timeout: number;
  retry_count: number;
  nombre_appels: number;
  nombre_succes: number;
  nombre_echecs: number;
}

// Types utilitaires
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Types pour les événements
export interface AppEvent {
  type: string;
  payload: any;
  timestamp: Timestamp;
  source: string;
}

// Types pour la configuration
export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  websocket: {
    url: string;
    reconnectInterval: number;
    maxReconnectAttempts: number;
  };
  cache: {
    defaultTTL: number;
    maxSize: number;
  };
  ui: {
    theme: Theme;
    language: Language;
    currency: Currency;
    dateFormat: string;
    timeFormat: string;
  };
  features: Record<string, boolean>;
}

// Types pour les états Redux
export interface AuthState {
  user: BaseUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface UIState {
  theme: Theme;
  language: Language;
  currency: Currency;
  sidebarCollapsed: boolean;
  notifications: Notification[];
  modals: Record<string, boolean>;
  loading: Record<string, boolean>;
  errors: Record<string, string>;
}

export interface InventoryState {
  products: Product[];
  categories: Category[];
  selectedProduct: Product | null;
  filters: FilterState;
  view: 'list' | 'grid' | 'kanban';
  loading: boolean;
  error: string | null;
}

export interface SalesState {
  sales: Sale[];
  currentSale: Partial<Sale> | null;
  cart: CartItem[];
  selectedCustomer: Customer | null;
  paymentMethod: PaymentMethod;
  loading: boolean;
  error: string | null;
}

export interface CartItem {
  produit_id: ID;
  nom: string;
  
  sku: string;
  prix_unitaire: number;
  quantite: number;
  total: number;
  variante?: ProductVariant;
}

// Types pour les hooks
export interface UseApiOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchInterval?: number;
  cacheTime?: number;
  staleTime?: number;
}

export interface UseFormOptions<T = any> {
  initialValues?: Partial<T>;
  validationRules?: Record<string, ValidationRule[]>;
  onSubmit?: (values: T) => void | Promise<void>;
  onError?: (errors: Record<string, string[]>) => void;
}

// Types pour les composants
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  required?: boolean;
  disabled?: boolean;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Types pour les animations
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  repeat?: number;
  direction?: 'normal' | 'reverse' | 'alternate';
}

export interface TransitionConfig {
  enter: string;
  enterActive: string;
  exit: string;
  exitActive: string;
  duration: number;
}