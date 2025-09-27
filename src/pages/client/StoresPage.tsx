import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api/realApi';
import { 
  Store, 
  MapPin, 
  Star, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Package,
  Users,
  TrendingUp,
  Award,
  Shield,
  Heart,
  Eye,
  Search,
  Filter,
  Navigation,
  X
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { getCompanyLogo, getCompanyLogoBySector } from '../../utils/companyLogos';

const StoresPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);


  const getCompanyBanner = (sector: string) => {
    const banners = {
      'Technologie': 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=2',
      'Mode & Beauté': 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=2',
      'Santé': 'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=2',
      'Alimentation': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=2',
      'Maison': 'https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=2',
      'Sport': 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=2',
      'Électronique': 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=2'
    };
    return banners[sector as keyof typeof banners] || banners['Technologie'];
  };

  // Charger les magasins depuis l'API
  useEffect(() => {
    loadStores();
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    try {
      const favorites = JSON.parse(localStorage.getItem('favoriteStores') || '[]');
      setStores(prevStores => 
        prevStores.map(store => ({
          ...store,
          isFavorite: favorites.includes(store.id)
        }))
      );
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error);
    }
  };

  const loadStores = async () => {
    try {
      setLoading(true);
      // Utiliser l'API des entreprises comme magasins
      const companiesResponse = await apiService.getCompanies();
      
      // L'API retourne un objet avec une propriété 'results' contenant le tableau
      const companies = companiesResponse.results || companiesResponse;
      
      // Transformer les entreprises en format magasin
      const transformedStores = companies.map((company: any) => ({
        id: company.id,
        name: company.nom || company.name,
        description: company.description || 'Entreprise locale',
        sector: company.secteur_activite || company.sector || 'Général',
        rating: 4.5 + Math.random() * 0.5, // Simulation
        reviews: Math.floor(Math.random() * 200) + 50, // Simulation
        logo: company.logo || getCompanyLogoBySector(company.secteur_activite) || getCompanyLogo(company.id),
        banner: company.banner || getCompanyBanner(company.secteur_activite || company.sector),
        address: company.adresse_complete || company.address || 'Adresse non disponible',
        phone: company.telephone || company.phone || '+221 XX XXX XX XX',
        email: company.email || 'contact@entreprise.sn',
        website: company.site_web || company.website || '#',
        location: { lat: 14.6928 + Math.random() * 0.1, lng: -17.4467 + Math.random() * 0.1 },
        verified: true,
        premium: Math.random() > 0.5,
        openingHours: {
          monday: '08:00 - 18:00',
          tuesday: '08:00 - 18:00',
          wednesday: '08:00 - 18:00',
          thursday: '08:00 - 18:00',
          friday: '08:00 - 18:00',
          saturday: '09:00 - 16:00',
          sunday: 'Fermé'
        },
        products: Math.floor(Math.random() * 100) + 10,
        followers: Math.floor(Math.random() * 1000) + 100,
        isFollowing: false,
        features: ['Livraison gratuite', 'Paiement sécurisé', 'Garantie qualité'],
        socialMedia: {
          facebook: '#',
          instagram: '#',
          twitter: '#'
        },
        stats: {
          products: Math.floor(Math.random() * 100) + 10,
          sales: Math.floor(Math.random() * 2000) + 100,
          customers: Math.floor(Math.random() * 500) + 50,
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
      // Utiliser les données mockées en cas d'erreur
      const mockStores = [
    {
      id: '1',
      name: 'TechSolutions Sénégal',
      description: 'Spécialiste en produits électroniques et solutions technologiques',
      sector: 'Technologie',
      rating: 4.9,
      reviews: 245,
      logo: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
      banner: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=2',
      address: '25 Rue de la République, Plateau, Dakar',
      phone: '+221 33 821 45 67',
      email: 'info@techsolutions.sn',
      website: 'https://techsolutions.sn',
      location: { lat: 14.6928, lng: -17.4467 },
      verified: true,
      premium: true,
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
        products: 89,
        sales: 2100,
        customers: 456,
        responseTime: '2h',
      },
      specialties: ['iPhone', 'MacBook', 'iPad', 'Accessoires'],
      badges: ['Vendeur Vérifié', 'Livraison Rapide', 'Service Client 5★'],
      isOpen: true,
      isFavorite: false,
    },
    {
      id: '2',
      name: 'Boutique Marie Diallo',
      description: 'Mode africaine moderne et accessoires de beauté authentiques',
      sector: 'Mode & Beauté',
      rating: 4.7,
      reviews: 189,
      logo: 'https://images.pexels.com/photos/4386476/pexels-photo-4386476.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
      banner: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=2',
      address: '15 Avenue Bourguiba, Plateau, Dakar',
      phone: '+221 77 123 45 67',
      email: 'contact@boutiquemarie.sn',
      website: 'https://boutiquemarie.sn',
      location: { lat: 14.6937, lng: -17.4441 },
      verified: true,
      premium: false,
      openingHours: {
        monday: '09:00 - 19:00',
        tuesday: '09:00 - 19:00',
        wednesday: '09:00 - 19:00',
        thursday: '09:00 - 19:00',
        friday: '09:00 - 19:00',
        saturday: '09:00 - 20:00',
        sunday: '10:00 - 18:00',
      },
      stats: {
        products: 234,
        sales: 1250,
        customers: 312,
        responseTime: '1h',
      },
      specialties: ['Robes Africaines', 'Bijoux', 'Chaussures', 'Cosmétiques'],
      badges: ['Artisan Local', 'Mode Éthique', 'Qualité Premium'],
      isOpen: true,
      isFavorite: true,
    },
    {
      id: '3',
      name: 'Pharmacie Moderne',
      description: 'Pharmacie complète avec médicaments et produits de santé',
      sector: 'Santé',
      rating: 4.8,
      reviews: 156,
      logo: 'https://images.pexels.com/photos/4386476/pexels-photo-4386476.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
      banner: 'https://images.pexels.com/photos/4386476/pexels-photo-4386476.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=2',
      address: '10 Avenue Cheikh Anta Diop, Fann, Dakar',
      phone: '+221 77 987 65 43',
      email: 'contact@pharmaciemoderne.sn',
      website: '',
      location: { lat: 14.6892, lng: -17.4634 },
      verified: true,
      premium: true,
      openingHours: {
        monday: '07:00 - 22:00',
        tuesday: '07:00 - 22:00',
        wednesday: '07:00 - 22:00',
        thursday: '07:00 - 22:00',
        friday: '07:00 - 22:00',
        saturday: '08:00 - 22:00',
        sunday: '08:00 - 20:00',
      },
      stats: {
        products: 567,
        sales: 890,
        customers: 678,
        responseTime: '30min',
      },
      specialties: ['Médicaments', 'Parapharmacie', 'Cosmétiques', 'Matériel Médical'],
      badges: ['Pharmacie Agréée', 'Garde 24h/7j', 'Conseil Expert'],
      isOpen: true,
      isFavorite: false,
    },
  ];
      
      setStores(mockStores);
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

  // Filtrer les magasins selon les critères
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
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.sector.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par favoris
    if (showFavoritesOnly) {
      filtered = filtered.filter(store => store.isFavorite);
    }

    return filtered;
  }, [stores, selectedSector, searchTerm, showFavoritesOnly]);

  const StoreCard = ({ store }: { store: any }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
      className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden group cursor-pointer"
      onClick={() => setSelectedStore(store)}
    >
      {/* Banner */}
      <div className="relative h-32 overflow-hidden">
        <img
          src={store.banner}
          alt={store.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            store.isOpen 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {store.isOpen ? 'Ouvert' : 'Fermé'}
          </span>
        </div>

        {/* Premium Badge */}
        {store.premium && (
          <div className="absolute top-3 right-3">
            <span className="bg-gold-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center">
              <Award className="w-3 h-3 mr-1" />
              Premium
            </span>
          </div>
        )}

        {/* Favorite Button */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Toggle favorite logic
              const favorites = JSON.parse(localStorage.getItem('favoriteStores') || '[]');
              if (favorites.includes(store.id)) {
                const newFavorites = favorites.filter((id: string) => id !== store.id);
                localStorage.setItem('favoriteStores', JSON.stringify(newFavorites));
              } else {
                favorites.push(store.id);
                localStorage.setItem('favoriteStores', JSON.stringify(favorites));
              }
              // Mettre à jour l'état local
              setStores(prevStores => 
                prevStores.map(s => 
                  s.id === store.id ? { ...s, isFavorite: !s.isFavorite } : s
                )
              );
            }}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              store.isFavorite 
                ? 'bg-red-500 text-white' 
                : 'bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Store Info */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-3">
          <img
            src={store.logo}
            alt={store.name}
            className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-gray-600"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">{store.name}</h3>
              {store.verified && (
                <Shield className="w-4 h-4 text-blue-500" />
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{store.sector}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
          {store.description}
        </p>

        {/* Rating */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(store.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {store.rating}
          </span>
          <span className="text-xs text-gray-500">({store.reviews} avis)</span>
        </div>

        {/* Location */}
        <div className="flex items-center space-x-2 mb-3">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
            {store.address}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{store.stats.products}</p>
            <p className="text-xs text-gray-500">Produits</p>
          </div>
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{store.stats.sales}</p>
            <p className="text-xs text-gray-500">Ventes</p>
          </div>
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{store.stats.responseTime}</p>
            <p className="text-xs text-gray-500">Réponse</p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1 mb-3">
          {store.badges.slice(0, 2).map((badge: string) => (
            <span
              key={badge}
              className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
            >
              {badge}
            </span>
          ))}
          {store.badges.length > 2 && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
              +{store.badges.length - 2}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button
            variant="primary"
            size="sm"
            fullWidth
            icon={<Store className="w-4 h-4" />}
            onClick={(e) => {
              e.stopPropagation();
              // Naviguer vers la page de produits de cette boutique
              navigate(`/client/catalog?company=${store.id}`);
            }}
          >
            Voir Produits
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Navigation className="w-4 h-4" />}
            onClick={(e) => {
              e.stopPropagation();
              // Ouvrir Google Maps avec l'adresse
              const address = encodeURIComponent(store.address);
              window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
            }}
          >
            Itinéraire
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
          <h1 className="text-3xl font-bold gradient-text">Boutiques Partenaires</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Découvrez nos boutiques partenaires près de chez vous
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant={showFavoritesOnly ? 'primary' : 'secondary'}
            size="sm"
            icon={<Heart className="w-4 h-4" />}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            {showFavoritesOnly ? 'Toutes les boutiques' : 'Mes favoris'}
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'secondary'}
            size="sm"
            icon={<Store className="w-4 h-4" />}
            onClick={() => setViewMode('grid')}
          >
            Boutiques
          </Button>
          <Button
            variant={viewMode === 'map' ? 'primary' : 'secondary'}
            size="sm"
            icon={<MapPin className="w-4 h-4" />}
            onClick={() => setViewMode('map')}
          >
            Carte
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="card-premium p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par nom, secteur, localisation..."
                className="input-premium pl-10 w-full"
              />
            </div>
          </div>

          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="input-premium w-48"
          >
            {sectors.map((sector) => (
              <option key={sector.id} value={sector.id}>
                {sector.name} ({sector.count})
              </option>
            ))}
          </select>

          <Button variant="secondary" icon={<Filter className="w-4 h-4" />}>
            Filtres Avancés
          </Button>
        </div>
      </div>

      {/* Stores Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredStores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="card-premium p-6">
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                Carte Interactive
              </h3>
              <p className="text-gray-500 mb-4">
                Carte Google Maps intégrée avec localisation des boutiques
              </p>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                  📍 {filteredStores.length} boutiques partenaires à Dakar
                </p>
                <div className="space-y-2">
                  {filteredStores.slice(0, 3).map((store) => (
                    <div key={store.id} className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-3 h-3 text-blue-500" />
                      <span className="text-gray-600 dark:text-gray-300">{store.name}</span>
                      <button
                        onClick={() => {
                          // Ouvrir Google Maps avec l'adresse
                          const address = encodeURIComponent(store.address);
                          window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
                        }}
                        className="text-blue-600 hover:text-blue-800 text-xs underline"
                      >
                        Voir sur Maps
                      </button>
                    </div>
                  ))}
                  {filteredStores.length > 3 && (
                    <p className="text-xs text-gray-500">+ {filteredStores.length - 3} autres boutiques</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Store Details Modal */}
      <AnimatePresence>
        {selectedStore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={() => setSelectedStore(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={selectedStore.banner}
                  alt={selectedStore.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40" />
                
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setSelectedStore(null)}
                    className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={selectedStore.logo}
                      alt={selectedStore.name}
                      className="w-16 h-16 rounded-xl object-cover border-2 border-white"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h2 className="text-2xl font-bold text-white">{selectedStore.name}</h2>
                        {selectedStore.verified && (
                          <Shield className="w-5 h-5 text-blue-400" />
                        )}
                        {selectedStore.premium && (
                          <Award className="w-5 h-5 text-gold-400" />
                        )}
                      </div>
                      <p className="text-white/90">{selectedStore.description}</p>
                      <div className="flex items-center space-x-3 mt-2">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-white font-medium">{selectedStore.rating}</span>
                          <span className="text-white/70">({selectedStore.reviews})</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedStore.isOpen 
                            ? 'bg-green-500 text-white' 
                            : 'bg-red-500 text-white'
                        }`}>
                          {selectedStore.isOpen ? 'Ouvert maintenant' : 'Fermé'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Info */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Contact Info */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Contact</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{selectedStore.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{selectedStore.email}</span>
                        </div>
                        {selectedStore.website && (
                          <div className="flex items-center space-x-2">
                            <Globe className="w-4 h-4 text-gray-500" />
                            <a href={selectedStore.website} className="text-sm text-primary-600 hover:underline">
                              Site web
                            </a>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{selectedStore.address}</span>
                        </div>
                      </div>
                    </div>

                    {/* Specialties */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Spécialités</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedStore.specialties.map((specialty: string) => (
                          <span
                            key={specialty}
                            className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-sm rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Badges */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Certifications</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedStore.badges.map((badge: string) => (
                          <span
                            key={badge}
                            className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm rounded-full flex items-center"
                          >
                            <Award className="w-3 h-3 mr-1" />
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Opening Hours */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Horaires d'ouverture</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {Object.entries(selectedStore.openingHours).map(([day, hours]) => {
                          const dayNames = {
                            monday: 'Lundi',
                            tuesday: 'Mardi',
                            wednesday: 'Mercredi',
                            thursday: 'Jeudi',
                            friday: 'Vendredi',
                            saturday: 'Samedi',
                            sunday: 'Dimanche',
                          };
                          
                          return (
                            <div key={day} className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">
                                {dayNames[day as keyof typeof dayNames]}
                              </span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {hours}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Stats */}
                    <div className="bg-gradient-to-r from-primary-500 to-electric-500 rounded-xl p-6 text-white">
                      <h3 className="font-semibold mb-4">Statistiques</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Produits</span>
                          <span className="font-bold">{selectedStore.stats.products}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ventes</span>
                          <span className="font-bold">{selectedStore.stats.sales}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Clients</span>
                          <span className="font-bold">{selectedStore.stats.customers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Temps de réponse</span>
                          <span className="font-bold">{selectedStore.stats.responseTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <Button
                        variant="primary"
                        fullWidth
                        icon={<Store className="w-4 h-4" />}
                        onClick={() => {
                          // Naviguer vers la page de produits de cette boutique
                          navigate(`/client/catalog?company=${selectedStore.id}`);
                        }}
                      >
                        Voir les Produits
                      </Button>
                      <Button
                        variant="secondary"
                        fullWidth
                        icon={<Heart className="w-4 h-4" />}
                        onClick={() => {
                          // Toggle favorite logic
                          const favorites = JSON.parse(localStorage.getItem('favoriteStores') || '[]');
                          if (favorites.includes(selectedStore.id)) {
                            const newFavorites = favorites.filter((id: string) => id !== selectedStore.id);
                            localStorage.setItem('favoriteStores', JSON.stringify(newFavorites));
                          } else {
                            favorites.push(selectedStore.id);
                            localStorage.setItem('favoriteStores', JSON.stringify(favorites));
                          }
                          // Mettre à jour l'état local
                          setStores(prevStores => 
                            prevStores.map(s => 
                              s.id === selectedStore.id ? { ...s, isFavorite: !s.isFavorite } : s
                            )
                          );
                          setSelectedStore({ ...selectedStore, isFavorite: !selectedStore.isFavorite });
                        }}
                      >
                        {selectedStore.isFavorite ? 'Retirer des Favoris' : 'Ajouter aux Favoris'}
                      </Button>
                      <Button
                        variant="secondary"
                        fullWidth
                        icon={<Phone className="w-4 h-4" />}
                        onClick={() => {
                          // Ouvrir l'application de téléphone ou WhatsApp
                          const phoneNumber = selectedStore.phone.replace(/\s/g, '');
                          const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}`;
                          window.open(whatsappUrl, '_blank');
                        }}
                      >
                        Contacter
                      </Button>
                      <Button
                        variant="secondary"
                        fullWidth
                        icon={<Navigation className="w-4 h-4" />}
                        onClick={() => {
                          // Ouvrir Google Maps avec l'adresse
                          const address = encodeURIComponent(selectedStore.address);
                          window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
                        }}
                      >
                        Voir sur la Carte
                      </Button>
                    </div>

                    {/* Quick Contact */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Contact Rapide</h4>
                      <div className="space-y-2">
                        <a
                          href={`tel:${selectedStore.phone}`}
                          className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-500"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Appeler maintenant</span>
                        </a>
                        <a
                          href={`mailto:${selectedStore.email}`}
                          className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-500"
                        >
                          <Mail className="w-4 h-4" />
                          <span>Envoyer un email</span>
                        </a>
                        {selectedStore.website && (
                          <a
                            href={selectedStore.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-500"
                          >
                            <Globe className="w-4 h-4" />
                            <span>Visiter le site</span>
                          </a>
                        )}
                      </div>
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

export default StoresPage;