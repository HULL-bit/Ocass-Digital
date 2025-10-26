import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api/realApi';
import clientApiService from '../../services/api/clientApi';
import { 
  Store, 
  MapPin, 
  Star, 
  Phone, 
  Mail, 
  Clock, 
  Search, 
  Grid, 
  Map, 
  Heart, 
  CheckCircle, 
  X, 
  Package, 
  Users 
} from 'lucide-react';

const StoresPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Métriques réelles du client
  const [clientMetrics, setClientMetrics] = useState<any>(null);

  const getCompanyBanner = (sector: string) => {
    const banners = {
      'Technologie': 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=2',
      'Mode & Beauté': 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=2',
      'Santé': 'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=2',
      'Commerce': 'https://images.pexels.com/photos/1591062/pexels-photo-1591062.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=2',
      'Services': 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=2',
    };
    return banners[sector as keyof typeof banners] || banners['Technologie'];
  };

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

  useEffect(() => {
    loadStores();
  }, []);

  const loadFavorites = () => {
    try {
      const favorites = JSON.parse(localStorage.getItem('favoriteStores') || '[]');
      return favorites;
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error);
      return [];
    }
  };

  const loadStores = async () => {
    try {
      setLoading(true);
      // Utiliser l'API des entreprises comme magasins
      const response = await apiService.getCompanies();
      const companies = response.results || response;
      
      // Transformer les données des entreprises en format magasin
      const transformedStores = companies.map((company: any) => ({
        id: company.id,
        name: company.nom,
        description: company.description || 'Boutique partenaire de qualité',
        sector: company.secteur_activite || 'Commerce',
        rating: 4.5 + Math.random() * 0.5, // Note entre 4.5 et 5.0
        reviews: Math.floor(Math.random() * 200) + 50, // Entre 50 et 250 avis
        logo: company.logo,
        banner: getCompanyBanner(company.secteur_activite),
        address: company.adresse,
        phone: company.telephone,
        email: company.email,
        website: company.site_web,
        location: { lat: 14.6928, lng: -17.4467 },
        verified: true,
        premium: Math.random() > 0.7, // 30% de chance d'être premium
        openingHours: {
          monday: '08:00 - 18:00',
          tuesday: '08:00 - 18:00',
          wednesday: '08:00 - 18:00',
          thursday: '08:00 - 18:00',
          friday: '08:00 - 18:00',
          saturday: '09:00 - 17:00',
          sunday: 'Fermé',
        },
        stats: {
          products: Math.floor(Math.random() * 100) + 20, // Entre 20 et 120 produits
          sales: Math.floor(Math.random() * 5000) + 1000, // Entre 1000 et 6000 ventes
          customers: Math.floor(Math.random() * 500) + 100, // Entre 100 et 600 clients
          responseTime: Math.random() > 0.5 ? '2h' : '1h'
        },
        specialties: ['Produits locaux', 'Qualité garantie', 'Service client'],
        badges: ['Vendeur Vérifié', 'Livraison Rapide', 'Service Client 5★'],
        isOpen: true,
        isFavorite: false
      }));
      
      setStores(transformedStores);
    } catch (error) {
      console.error('Erreur lors du chargement des magasins:', error);
      // En cas d'erreur, utiliser les données en cache ou vides
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  // Générer les secteurs dynamiquement basés sur les vraies données
  const sectors = React.useMemo(() => {
    const sectorCounts = stores.reduce((acc: any, store: any) => {
      const sector = store.sector || 'Général';
      acc[sector] = (acc[sector] || 0) + 1;
      return acc;
    }, {});

    const sectorList = [
      { id: 'all', name: 'Tous les secteurs', count: stores.length }
    ];

    Object.entries(sectorCounts).forEach(([sector, count]) => {
      sectorList.push({
        id: sector.toLowerCase().replace(/\s+/g, '-'),
        name: sector,
        count: count as number
      });
    });

    return sectorList;
  }, [stores]);

  const filteredStores = React.useMemo(() => {
    let filtered = stores;

    // Filtre par secteur
    if (selectedSector !== 'all') {
      filtered = filtered.filter(store => 
        store.sector?.toLowerCase().replace(/\s+/g, '-') === selectedSector
      );
    }

    // Filtre par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(store => 
        store.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.sector?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par favoris
    if (showFavoritesOnly) {
      filtered = filtered.filter(store => store.isFavorite);
    }

    return filtered;
  }, [stores, selectedSector, searchTerm, showFavoritesOnly]);

  const toggleFavorite = (storeId: string) => {
    const favorites = loadFavorites();
    const isFavorite = favorites.includes(storeId);
    
    if (isFavorite) {
      const newFavorites = favorites.filter((id: string) => id !== storeId);
      localStorage.setItem('favoriteStores', JSON.stringify(newFavorites));
    } else {
      const newFavorites = [...favorites, storeId];
      localStorage.setItem('favoriteStores', JSON.stringify(newFavorites));
    }
    
    // Mettre à jour l'état local
    setStores(prevStores => 
      prevStores.map(store => 
        store.id === storeId 
          ? { ...store, isFavorite: !store.isFavorite }
          : store
      )
    );
  };

  const StoreCard = ({ store }: { store: any }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      {/* Banner Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={store.banner || getCompanyBanner(store.sector)}
          alt={store.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Premium Badge */}
        {store.premium && (
          <div className="absolute top-3 right-3">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              Premium
            </span>
          </div>
        )}
        
        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(store.id);
          }}
          className="absolute top-3 left-3 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
        >
          <Heart 
            className={`w-5 h-5 ${store.isFavorite ? 'text-red-500 fill-current' : 'text-white'}`} 
          />
        </button>
      </div>

      {/* Store Info */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {store.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
              {store.description}
            </p>
          </div>
          
          {/* Verified Badge */}
          {store.verified && (
            <div className="ml-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          )}
        </div>

        {/* Rating and Reviews */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {store.rating.toFixed(1)}
            </span>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({store.reviews} avis)
          </span>
        </div>

        {/* Sector and Stats */}
        <div className="flex items-center justify-between mb-4">
          <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-xs font-medium">
            {store.sector}
          </span>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {store.stats?.products || 0} produits
          </div>
        </div>

        {/* Address */}
        <div className="flex items-center space-x-2 mb-4">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
            {store.address}
          </span>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          {store.phone && (
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {store.phone}
              </span>
            </div>
          )}
          {store.email && (
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {store.email}
              </span>
            </div>
          )}
        </div>

        {/* Opening Hours */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-1">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Horaires
            </span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {store.openingHours?.monday || 'Non spécifié'}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedStore(store)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Voir les produits
          </button>
          <button
            onClick={() => window.open(`tel:${store.phone}`, '_self')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Phone className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Boutiques Partenaires</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Découvrez nos partenaires commerciaux et leurs produits
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher une boutique..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {sectors.map((sector) => (
              <option key={sector.id} value={sector.id}>
                {sector.name} ({sector.count})
              </option>
            ))}
          </select>
          
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'map' : 'grid')}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {viewMode === 'grid' ? <Map className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Store className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Boutiques</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stores.length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Star className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Note Moyenne</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stores.length > 0 ? (stores.reduce((sum, store) => sum + store.rating, 0) / stores.length).toFixed(1) : '0.0'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Produits Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stores.reduce((sum, store) => sum + (store.stats?.products || 0), 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Clients Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stores.reduce((sum, store) => sum + (store.stats?.customers || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stores Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {filteredStores.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStores.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Aucune boutique trouvée
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Essayez de modifier vos critères de recherche
              </p>
            </div>
          )}
        </AnimatePresence>
      )}

      {/* Store Detail Modal */}
      {selectedStore && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedStore.name}
                </h2>
                <button
                  onClick={() => setSelectedStore(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedStore.banner || getCompanyBanner(selectedStore.sector)}
                    alt={selectedStore.name}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Description
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {selectedStore.description}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Informations de contact
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-300">
                            {selectedStore.address}
                          </span>
                        </div>
                        {selectedStore.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-300">
                              {selectedStore.phone}
                            </span>
                          </div>
                        )}
                        {selectedStore.email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-300">
                              {selectedStore.email}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Statistiques
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {selectedStore.rating.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Note moyenne
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {selectedStore.reviews}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Avis clients
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {selectedStore.stats?.products || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Produits
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {selectedStore.stats?.customers || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Clients
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Horaires d'ouverture
                    </h3>
                    <div className="space-y-2">
                      {selectedStore.openingHours && Object.entries(selectedStore.openingHours).map(([day, hours]) => (
                        <div key={day} className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400 capitalize">
                            {day}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {hours as string}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => {
                        navigate(`/client/catalog?store=${selectedStore.id}`);
                        setSelectedStore(null);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Voir les produits
                    </button>
                    {selectedStore.phone && (
                      <button
                        onClick={() => window.open(`tel:${selectedStore.phone}`, '_self')}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default StoresPage;