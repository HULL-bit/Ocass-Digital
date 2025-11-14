import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Star, RefreshCw, Package } from 'lucide-react';
import apiService from '../../services/api/realApi';
import { getProductImageFromPublic } from '../../utils/publicProductImages';

// Cache pour les images transformées
const imageCache = new Map<string, string>();

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

const PublicCatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'popular' | 'price_asc' | 'price_desc'>('popular');
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const pageSize = 12;
  
  // Debounce la recherche pour éviter trop de filtrages
  const debouncedQuery = useDebounce(query, 300);

  // Charger les produits depuis l'API
  useEffect(() => {
    loadProducts();
  }, [page]);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Utiliser l'endpoint ultra_fast_list qui est optimisé pour les performances
      const response = await apiService.request(
        `/products/products/ultra_fast_list/?page=${page}&page_size=${pageSize}`
      );
      
      if (response && response.results && Array.isArray(response.results)) {
        // Transformer les données pour correspondre au format attendu - avec cache
        const transformedProducts = response.results.map((product: any) => {
          const productId = product.id || product.uuid;
          const cacheKey = `${productId}-${product.nom || product.name}`;
          
          // Utiliser le cache pour les images
          let imageUrl = imageCache.get(cacheKey);
          if (!imageUrl) {
            imageUrl = getProductImageFromPublic({
              nom: product.nom,
              name: product.name,
              categorie: product.categorie,
              categorie_nom: product.categorie?.nom || product.categorie_nom || product.categorie,
              images: product.images || [],
              image: product.image || product.image_url,
              id: productId
            });
            imageCache.set(cacheKey, imageUrl);
          }
          
          return {
            id: productId,
            nom: product.nom || product.name || 'Produit sans nom',
            prix_vente: parseFloat(product.prix_vente || product.price || 0),
            image: imageUrl,
            categorie: product.categorie?.nom || product.categorie_nom || product.categorie || product.category || '',
            description_courte: product.description_courte || product.description || '',
            stock: product.stock || product.stock_actuel || product.stock_disponible || 0,
            popularite_score: product.popularite_score || product.nombre_ventes || 0,
            nombre_ventes: product.nombre_ventes || product.ventes_count || 0,
            originalPrice: product.prix_achat ? Math.round(parseFloat(product.prix_achat) * 1.2) : undefined,
            discount: product.remise || undefined
          };
        });
        
        setProducts(transformedProducts);
        setTotalCount(response.count || transformedProducts.length);
        setHasNextPage(!!response.next);
      } else {
        setProducts([]);
        setTotalCount(0);
        setHasNextPage(false);
      }
    } catch (error: any) {
      setProducts([]);
      setTotalCount(0);
      setHasNextPage(false);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  // Filtrer et trier les produits de la page actuelle - optimisé avec useMemo et debounce
  const filtered = useMemo(() => {
    if (!products.length) return [];
    
    const q = debouncedQuery.trim().toLowerCase();
    if (!q && sort === 'popular') {
      // Si pas de recherche et tri par popularité, retourner directement les produits
      return products;
    }
    
    let arr = products;
    
    // Filtrer seulement si nécessaire
    if (q) {
      arr = products.filter((p: any) => {
        const nom = (p.nom || '').toLowerCase();
        const categorie = (p.categorie || '').toLowerCase();
        const description = (p.description_courte || '').toLowerCase();
        return nom.includes(q) || categorie.includes(q) || description.includes(q);
      });
    }
    
    // Trier seulement si nécessaire
    if (sort === 'popular' && q) {
      arr = arr.sort((a: any, b: any) => (b.popularite_score || 0) - (a.popularite_score || 0));
    } else if (sort === 'price_asc') {
      arr = arr.sort((a: any, b: any) => (a.prix_vente || 0) - (b.prix_vente || 0));
    } else if (sort === 'price_desc') {
      arr = arr.sort((a: any, b: any) => (b.prix_vente || 0) - (a.prix_vente || 0));
    }
    
    return arr;
  }, [products, debouncedQuery, sort]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const current = filtered;

  const formatXof = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(n);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold gradient-text">Catalogue</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Découvrez une sélection de produits en vitrine.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/')} className="btn-secondary inline-flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" /> Accueil
          </button>
          <Link to="/auth/login" className="btn-primary">Se connecter</Link>
        </div>
      </div>

      {/* Barre outils */}
      <div className="mb-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un produit..."
          className="w-full md:w-1/2 px-4 py-3 rounded-xl bg-white/60 dark:bg-dark-800 border border-gray-200 dark:border-gray-700 focus:outline-none"
        />
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600 dark:text-gray-300">Trier par</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="px-3 py-2 rounded-lg bg-white/60 dark:bg-dark-800 border border-gray-200 dark:border-gray-700"
          >
            <option value="popular">Popularité</option>
            <option value="price_asc">Prix: croissant</option>
            <option value="price_desc">Prix: décroissant</option>
          </select>
        </div>
      </div>

      {/* État de chargement */}
      {loading ? (
        <div className="text-center py-20">
          <RefreshCw className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Chargement des produits...</p>
        </div>
      ) : current.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
            Aucun produit trouvé
          </h3>
          <p className="text-gray-500">
            {query ? 'Aucun produit ne correspond à votre recherche.' : 'Aucun produit disponible pour le moment.'}
          </p>
        </div>
      ) : (
        <>
          {/* Grille style Jumia */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {current.map((p: any, index: number) => {
          const hasDiscount = p.originalPrice || p.discount;
          const original = p.originalPrice || (hasDiscount ? Math.round(p.prix_vente * 1.12) : undefined);
          const discount = original ? Math.max(0, Math.round(100 - (p.prix_vente / original) * 100)) : undefined;
          const rating = Math.max(3, Math.min(5, Math.round((p.popularite_score || 70) / 20)));
          const reviews = p.nombre_ventes || Math.floor(Math.random() * 200) + 10;
          return (
          <motion.div
            key={`${p.id}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.15, delay: Math.min(index * 0.01, 0.2) }}
            className="relative overflow-hidden rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition group"
          >
            <button className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 dark:bg-dark-900/60 border border-white/40 text-gray-600 dark:text-gray-200 hover:text-red-500">
              <Heart className="h-4 w-4" />
            </button>
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={p.image}
                alt={p.nom}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  const t = e.currentTarget as HTMLImageElement;
                  t.src = 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1200&auto=format&fit=crop';
                }}
              />
              {discount && (
                <div className="absolute left-3 top-3 px-2 py-1 rounded-md bg-red-500 text-white text-xs font-semibold">-{discount}%</div>
              )}
            </div>
            <div className="p-4">
              <div className="line-clamp-2 font-medium text-gray-800 dark:text-gray-100 min-h-[3.2rem]">{p.nom}</div>
              <div className="mt-2 flex items-end gap-2">
                <div className="text-lg font-bold text-[#f68b1e]">{formatXof(p.prix_vente)}</div>
                {original && (
                  <div className="text-sm line-through text-gray-400">{formatXof(original)}</div>
                )}
              </div>
              <div className="mt-2 flex items-center gap-1 text-[#f68b1e]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < rating ? '' : 'opacity-30'}`} fill="currentColor" />
                ))}
                <span className="ml-2 text-xs text-gray-500">({reviews})</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Livraison rapide</span>
                <Link to="/auth/login" className="text-sm text-primary-600 dark:text-cyan-400 hover:underline">Voir détails</Link>
              </div>
            </div>
          </motion.div>
        );})}
          </div>

          {/* Pagination */}
      <div className="mt-8 flex items-center justify-center gap-2">
        <button 
          disabled={page === 1 || loading} 
          onClick={() => setPage((p) => Math.max(1, p - 1))} 
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Précédent
        </button>
        <div className="px-3 py-2 rounded-lg bg-white/60 dark:bg-dark-800 border border-gray-200 dark:border-gray-700 text-sm">
          Page {page} / {totalPages}
        </div>
        <button 
          disabled={!hasNextPage || loading} 
          onClick={() => setPage((p) => p + 1)} 
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Suivant
        </button>
      </div>
        </>
      )}
      
      {/* Compteur de produits */}
      {!loading && totalCount > 0 && (
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          {filtered.length} produit(s) affiché(s) sur {totalCount} total
        </div>
      )}
    </div>
  );
};

export default PublicCatalogPage;


