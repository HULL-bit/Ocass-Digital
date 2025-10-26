import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import MetricCard from '../../components/ui/MetricCard';
import apiService from '../../services/api/realApi';

// Type pour les produits avec les propriétés attendues
interface ProductWithDetails {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image?: string;
  sku?: string;
  category_id?: number;
  company_id?: number;
  created_at?: string;
}

interface CompanyProductsProps {}

const CompanyProductsPage: React.FC<CompanyProductsProps> = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'created_at'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [company, setCompany] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);

  // Métriques calculées
  const totalProducts = products.length;
  const inStockProducts = products.filter(p => p.stock > 0).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;
  const averagePrice = products.length > 0 
    ? products.reduce((sum, p) => sum + p.price, 0) / products.length 
    : 0;

  useEffect(() => {
    console.log('CompanyProductsPage mounted with companyId:', companyId);
    if (companyId) {
      loadCompanyData();
      loadProducts();
      loadCategories();
    } else {
      console.error('No companyId provided to CompanyProductsPage');
      setError('Aucun ID d\'entreprise fourni');
      setLoading(false);
    }
  }, [companyId]);

  const loadCompanyData = async () => {
    try {
      const response = await apiService.getCompanies();
      const companies = response.results || response;
      const foundCompany = companies.find((c: any) => c.id === companyId);
      if (foundCompany) {
        setCompany(foundCompany);
      } else {
        console.warn('Entreprise non trouvée avec l\'ID:', companyId);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données de l\'entreprise:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      // Utiliser getAllProducts() pour récupérer tous les produits (gestion de la pagination)
      const allProducts = await apiService.getAllProducts();
      
      console.log('loadProducts - allProducts type:', typeof allProducts);
      console.log('loadProducts - allProducts is array:', Array.isArray(allProducts));
      console.log('loadProducts - allProducts:', allProducts);
      
      // Vérifier que allProducts est bien un tableau
      if (!Array.isArray(allProducts)) {
        console.error('allProducts is not an array:', allProducts);
        setError('Erreur: Les données reçues ne sont pas dans le format attendu');
        setProducts([]);
        return;
      }
      
      // Filtrer les produits par entreprise (companyId est un UUID)
      console.log('Filtering products for companyId:', companyId);
      console.log('Sample product structure:', allProducts[0]);
      
      const companyProducts = allProducts.filter((p: any) => {
        console.log(`Product ${p.nom} - entreprise: ${p.entreprise}, companyId: ${companyId}`);
        // Vérifier si p.entreprise est un objet avec un id ou directement l'id
        const productCompanyId = typeof p.entreprise === 'object' ? p.entreprise?.id : p.entreprise;
        console.log(`Product ${p.nom} - productCompanyId: ${productCompanyId}, companyId: ${companyId}`);
        return productCompanyId === companyId || productCompanyId === (companyId ? parseInt(companyId) : null) || productCompanyId === companyId?.toString();
      });
      
      console.log('Filtered products count:', companyProducts.length);
      
      setProducts(companyProducts);
      setError(null);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      setError('Erreur lors du chargement des produits');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      // Vérifier si l'utilisateur est connecté
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No authentication token found, skipping categories load');
        setCategories([]);
        return;
      }
      
      const response = await apiService.getCategories();
      console.log('Categories response:', response);
      
      // L'API retourne un objet paginé avec une propriété 'results'
      const categoriesData = response.results || response;
      
      if (Array.isArray(categoriesData)) {
        setCategories(categoriesData);
      } else {
        console.warn('Categories data is not an array:', categoriesData);
        setCategories([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      setCategories([]);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await apiService.deleteProduct(productId);
        await loadProducts(); // Recharger la liste
        console.log('Produit supprimé avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du produit');
      }
    }
  };

  const handleUpdateStock = async (productId: string, newStock: number) => {
    try {
      const product = products.find(p => p.id.toString() === productId);
      if (product) {
        await apiService.updateProduct(productId, {
          ...product,
          stock: newStock
        });
        await loadProducts(); // Recharger la liste
        console.log('Stock mis à jour avec succès');
      } else {
        console.error('Produit non trouvé avec l\'ID:', productId);
        alert('Produit non trouvé');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du stock:', error);
      alert('Erreur lors de la mise à jour du stock');
    }
  };

  // Filtrage et tri des produits
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !filterCategory || product.category_id === parseInt(filterCategory);
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];
      
      if (sortBy === 'created_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const columns = [
    {
      id: 'name',
      header: 'Nom',
      cell: (product: ProductWithDetails) => (
        <div className="flex items-center space-x-3">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name || 'Produit'}
              className="w-10 h-10 rounded-lg object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center ${product.image ? 'hidden' : ''}`}>
            <Package className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{product.name || 'Nom non disponible'}</div>
            <div className="text-sm text-gray-500">{product.sku || 'SKU non disponible'}</div>
          </div>
        </div>
      )
    },
    {
      id: 'category',
      header: 'Catégorie',
      cell: (product: ProductWithDetails) => {
        const category = categories.find(c => c.id === product.category_id);
        return <span className="text-gray-600">{category?.name || 'Non définie'}</span>;
      }
    },
    {
      id: 'price',
      header: 'Prix',
      cell: (product: ProductWithDetails) => (
        <span className="font-medium text-green-600">
          {product.price ? product.price.toLocaleString() : '0'} FCFA
        </span>
      )
    },
    {
      id: 'stock',
      header: 'Stock',
      cell: (product: ProductWithDetails) => {
        const stock = product.stock || 0;
        return (
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              stock > 10 
                ? 'bg-green-100 text-green-800' 
                : stock > 0 
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
            }`}>
              {stock} unités
            </span>
            {stock === 0 && (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
          </div>
        );
      }
    },
    {
      id: 'status',
      header: 'Statut',
      cell: (product: ProductWithDetails) => {
        const stock = product.stock || 0;
        return (
          <div className="flex items-center space-x-2">
            {stock > 0 ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
            <span className={stock > 0 ? 'text-green-600' : 'text-red-600'}>
              {stock > 0 ? 'En stock' : 'Rupture'}
            </span>
          </div>
        );
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (product: ProductWithDetails) => {
        const stock = product.stock || 0;
        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const newStock = prompt('Nouveau stock:', stock.toString());
                if (newStock && !isNaN(parseInt(newStock))) {
                  handleUpdateStock(product.id.toString(), parseInt(newStock));
                }
              }}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDeleteProduct(product.id.toString())}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        );
      }
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={loadProducts}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Produits de {company?.name || 'l\'entreprise'}
          </h1>
          <p className="text-gray-600">
            Gestion des produits de l'entreprise
          </p>
        </div>
        <Button onClick={loadProducts}>
          <Plus className="w-4 h-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Total Produits"
          value={totalProducts}
          icon={<Package className="w-5 h-5" />}
        />
        <MetricCard
          title="En Stock"
          value={inStockProducts}
          icon={<CheckCircle className="w-5 h-5" />}
        />
        <MetricCard
          title="Rupture de Stock"
          value={outOfStockProducts}
          icon={<AlertCircle className="w-5 h-5" />}
        />
        <MetricCard
          title="Prix Moyen"
          value={Math.round(averagePrice)}
          format="currency"
          currency="FCFA"
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Toutes les catégories</option>
              {Array.isArray(categories) && categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as any);
                setSortOrder(order as any);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name-asc">Nom (A-Z)</option>
              <option value="name-desc">Nom (Z-A)</option>
              <option value="price-asc">Prix (Croissant)</option>
              <option value="price-desc">Prix (Décroissant)</option>
              <option value="stock-asc">Stock (Croissant)</option>
              <option value="stock-desc">Stock (Décroissant)</option>
              <option value="created_at-desc">Plus récent</option>
              <option value="created_at-asc">Plus ancien</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau des produits */}
      <div className="bg-white rounded-lg shadow">
        <DataTable
          data={filteredProducts}
          columns={columns}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default CompanyProductsPage;
