import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Package, Users, TrendingUp, Eye, Search, Filter } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import Button from '../../components/ui/Button';

interface Company {
  id: string;
  nom: string;
  secteur_activite: string;
  email: string;
  ville: string;
  region: string;
  statut: string;
  nombre_employes: number;
  chiffre_affaires_annuel: number;
  logo?: string;
  date_creation: string;
}

interface Product {
  id: string;
  nom: string;
  prix_vente: number;
  stock_disponible: number;
  statut: string;
  entreprise_nom: string;
  images: Array<{ image: string }>;
}

const CompaniesOverview: React.FC = () => {
  const { get } = useApi();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    totalProducts: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger les entreprises
      const companiesResponse = await get('/api/entreprises/');
      setCompanies(companiesResponse);
      
      // Charger les produits
      const productsResponse = await get('/api/produits/');
      setProducts(productsResponse);
      
      // Calculer les statistiques
      const activeCompanies = companiesResponse.filter((c: Company) => c.statut === 'actif').length;
      const totalRevenue = companiesResponse.reduce((sum: number, c: Company) => sum + (c.chiffre_affaires_annuel || 0), 0);
      
      setStats({
        totalCompanies: companiesResponse.length,
        activeCompanies,
        totalProducts: productsResponse.length,
        totalRevenue
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.secteur_activite.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.ville.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.entreprise_nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = !selectedCompany || product.entreprise_nom === selectedCompany;
    return matchesSearch && matchesCompany;
  });

  const getSecteurDisplayName = (secteur: string) => {
    const secteurs: Record<string, string> = {
      'commerce_general': 'Commerce Général',
      'commerce_alimentaire': 'Commerce Alimentaire',
      'commerce_textile': 'Commerce Textile & Vêtements',
      'commerce_electronique': 'Commerce Électronique & High-Tech',
      'commerce_pharmaceutique': 'Commerce Pharmaceutique',
      'commerce_automobile': 'Commerce Automobile',
      'commerce_immobilier': 'Commerce Immobilier',
      'commerce_artisanat': 'Commerce Artisanal',
      'commerce_import_export': 'Commerce Import/Export',
      'commerce_retail': 'Commerce de Détail',
      'commerce_wholesale': 'Commerce de Gros',
      'commerce_online': 'Commerce en Ligne',
      'autre': 'Autre'
    };
    return secteurs[secteur] || secteur;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold gradient-text mb-2">Vue d'ensemble des Entreprises</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Gérez et surveillez toutes les entreprises de la plateforme
          </p>
        </motion.div>

        {/* Statistiques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Entreprises</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCompanies}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Entreprises Actives</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeCompanies}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Produits</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalProducts}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Chiffre d'Affaires Total</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, secteur ou ville..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-premium w-full pl-10"
                />
              </div>
            </div>
            <div className="md:w-64">
              <select
                value={selectedCompany || ''}
                onChange={(e) => setSelectedCompany(e.target.value || null)}
                className="input-premium w-full"
              >
                <option value="">Toutes les entreprises</option>
                {companies.map(company => (
                  <option key={company.id} value={company.nom}>
                    {company.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Liste des entreprises */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {filteredCompanies.map((company) => (
            <div key={company.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  {company.logo ? (
                    <img
                      src={company.logo}
                      alt={company.nom}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-electric-500 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {company.nom}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {getSecteurDisplayName(company.secteur_activite)}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  company.statut === 'actif' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {company.statut}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Users className="w-4 h-4 mr-2" />
                  {company.nombre_employes} employé{company.nombre_employes > 1 ? 's' : ''}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Building2 className="w-4 h-4 mr-2" />
                  {company.ville}, {company.region}
                </div>
                {company.chiffre_affaires_annuel > 0 && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    {formatCurrency(company.chiffre_affaires_annuel)}/an
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Créée le {new Date(company.date_creation).toLocaleDateString('fr-FR')}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedCompany(company.nom)}
                  icon={<Eye className="w-4 h-4" />}
                >
                  Voir les produits
                </Button>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Produits de l'entreprise sélectionnée */}
        {selectedCompany && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Produits de {selectedCompany}
              </h2>
              <Button
                variant="secondary"
                onClick={() => setSelectedCompany(null)}
              >
                Fermer
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0].image}
                        alt={product.nom}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    {product.nom}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {formatCurrency(product.prix_vente)}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.stock_disponible > 0
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {product.stock_disponible} en stock
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.statut === 'actif'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {product.statut}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CompaniesOverview;

