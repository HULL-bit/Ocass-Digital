/**
 * Utilitaires pour mapper les produits vers les images dans le dossier public/
 * Les images sont servies directement par Vite depuis /accessoires/, /alimentation/, etc.
 */

import { getBackendBaseUrl } from './constants';

// Cache pour les résultats de getPublicProductImage
const imageUrlCache = new Map<string, string | null>();

// Mapping des catégories vers les dossiers dans public/
const CATEGORY_TO_FOLDER: Record<string, string> = {
  'accessoires': 'accessoires',
  'alimentation': 'alimentation',
  'beaute': 'beaute',
  'beauté': 'beaute',
  'cosmetique': 'beaute',
  'cosmétique': 'beaute',
  'technologie': 'technologie',
  'tech': 'technologie',
  'electronique': 'technologie',
  'électronique': 'technologie',
  'sante': 'sante',
  'santé': 'sante',
  'pharmacie': 'sante',
  'maison': 'maison',
  'jouets': 'jouets',
  'sport': 'sport',
  'electromenager': 'electromenager',
  'électroménager': 'electromenager',
  'vetements': 'vetements',
  'vêtements': 'vetements',
  'mode': 'vetements',
  'textile': 'vetements'
};

// Mapping des noms de produits vers les fichiers d'images dans public/
// Basé sur les fichiers réels dans public/
const PRODUCT_NAME_TO_IMAGE: Record<string, string> = {
  // Accessoires
  'backpack': '/accessoires/backpack_1.jpg',
  'bag': '/accessoires/bag_1.jpg',
  'belt': '/accessoires/belt_1.jpg',
  'sunglasses': '/accessoires/sunglasses_1.jpg',
  'wallet': '/accessoires/wallet_1.jpg',
  'sneakers': '/accessoires/sneakers_1.jpg',
  'dress': '/vetements/dress_1.jpg',
  'tissu': '/vetements/dress_1.jpg',
  'sac': '/accessoires/bag_1.jpg',
  'portefeuille': '/accessoires/wallet_1.jpg',
  'ceinture': '/accessoires/belt_1.jpg',
  'lunettes': '/accessoires/sunglasses_1.jpg',
  
  // Alimentation
  'bread': '/alimentation/bread_1.jpg',
  'chocolate': '/alimentation/chocolate_1.jpg',
  'coffee': '/alimentation/coffee_beans_1.jpg',
  'fruits': '/alimentation/fruits_1.jpg',
  'vegetables': '/alimentation/vegetables_1.jpg',
  'riz': '/alimentation/bread_1.jpg',
  'thiakry': '/alimentation/fruits_1.jpg',
  'bissap': '/alimentation/fruits_1.jpg',
  'pain': '/alimentation/bread_1.jpg',
  'chocolat': '/alimentation/chocolate_1.jpg',
  'cafe': '/alimentation/coffee_beans_1.jpg',
  'legumes': '/alimentation/vegetables_1.jpg',
  
  // Technologie
  'keyboard': '/technologie/keyboard_1.jpg',
  'tablet': '/technologie/tablet_1.jpg',
  'smartwatch': '/technologie/smartwatch_1.jpg',
  'smartphone': '/technologie/smartphone_1.jpg',
  'mouse': '/technologie/mouse_1.jpg',
  'headphones': '/technologie/headphones_1.jpg',
  'laptop': '/technologie/laptop_1.jpg',
  'camera': '/technologie/camera_1.jpg',
  'telephone': '/technologie/smartphone_1.jpg',
  'ordinateur': '/technologie/laptop_1.jpg',
  'clavier': '/technologie/keyboard_1.jpg',
  'tablette': '/technologie/tablet_1.jpg',
  
  // Santé
  'stethoscope': '/sante/stethoscope_1.jpg',
  'medical': '/sante/medical_1.jpg',
  'pills': '/sante/pills_1.jpg',
  'fitness': '/sante/fitness_1.jpg',
  'supplement': '/sante/supplement_1.jpg',
  'thermometer': '/sante/thermometer_1.jpg',
  'medicament': '/sante/pills_1.jpg',
  'sante': '/sante/medical_1.jpg',
  
  // Électroménager
  'toaster': '/electromenager/toaster_1.jpg',
  'vacuum': '/electromenager/vacuum_1.jpg',
  'mixer': '/electromenager/mixer_1.jpg',
  'microwave': '/electromenager/microwave_1.jpg',
  'blender': '/electromenager/blender_1.jpg',
  'grille': '/electromenager/toaster_1.jpg',
  'mixeur': '/electromenager/mixer_1.jpg',
  'microonde': '/electromenager/microwave_1.jpg',
  
  // Vêtements
  'boubou': '/vetements/dress_1.jpg',
  'robe': '/vetements/dress_1.jpg',
  'chemise': '/vetements/shirt_1.jpg',
  'pantalon': '/vetements/jeans_1.jpg',
  'chaussures': '/vetements/shoes_1.jpg',
  'basket': '/vetements/sneakers_1.jpg',
  'chapeau': '/vetements/hat_1.jpg',
  'tshirt': '/vetements/tshirt_1.jpg',
  
  // Beauté
  'cream': '/beaute/cream_1.jpg',
  'lipstick': '/beaute/lipstick_1.jpg',
  'makeup': '/beaute/makeup_1.jpg',
  'perfume': '/beaute/perfume_1.jpg',
  'shampoo': '/beaute/shampoo_1.jpg',
  'creme': '/beaute/cream_1.jpg',
  'rouge': '/beaute/lipstick_1.jpg',
  'maquillage': '/beaute/makeup_1.jpg',
  'parfum': '/beaute/perfume_1.jpg',
  'shampoing': '/beaute/shampoo_1.jpg',
  
  // Sport
  'ball': '/sport/ball_1.jpg',
  'bike': '/sport/bike_1.jpg',
  'dumbbells': '/sport/dumbbells_1.jpg',
  'gym': '/sport/gym_equipment_1.jpg',
  'running': '/sport/running_shoes_1.jpg',
  'yoga': '/sport/yoga_mat_1.jpg',
  'velo': '/sport/bike_1.jpg',
  'balle': '/sport/ball_1.jpg',
  
  // Maison
  'candle': '/maison/candle_1.jpg',
  'clock': '/maison/clock_1.jpg',
  'cushion': '/maison/cushion_1.jpg',
  'lamp': '/maison/lamp_1.jpg',
  'mirror': '/maison/mirror_1.jpg',
  'vase': '/maison/vase_1.jpg',
  'bougie': '/maison/candle_1.jpg',
  'horloge': '/maison/clock_1.jpg',
  'lampe': '/maison/lamp_1.jpg',
  
  // Jouets
  'car': '/jouets/car_toy_1.jpg',
  'doll': '/jouets/doll_1.jpg',
  'lego': '/jouets/lego_1.jpg',
  'puzzle': '/jouets/puzzle_1.jpg',
  'toy': '/jouets/toy_1.jpg',
  'voiture': '/jouets/car_toy_1.jpg',
  'poupee': '/jouets/doll_1.jpg',
};

// Images disponibles par catégorie (basées sur les fichiers réels)
const CATEGORY_IMAGES: Record<string, string[]> = {
  'accessoires': ['/accessoires/backpack_1.jpg', '/accessoires/bag_1.jpg', '/accessoires/belt_1.jpg', '/accessoires/sunglasses_1.jpg', '/accessoires/wallet_1.jpg'],
  'alimentation': ['/alimentation/bread_1.jpg', '/alimentation/chocolate_1.jpg', '/alimentation/coffee_beans_1.jpg', '/alimentation/fruits_1.jpg', '/alimentation/vegetables_1.jpg'],
  'beaute': ['/beaute/cream_1.jpg', '/beaute/lipstick_1.jpg', '/beaute/makeup_1.jpg', '/beaute/perfume_1.jpg', '/beaute/shampoo_1.jpg'],
  'technologie': ['/technologie/keyboard_1.jpg', '/technologie/tablet_1.jpg', '/technologie/smartwatch_1.jpg', '/technologie/smartphone_1.jpg', '/technologie/mouse_1.jpg', '/technologie/headphones_1.jpg', '/technologie/laptop_1.jpg', '/technologie/camera_1.jpg'],
  'sante': ['/sante/stethoscope_1.jpg', '/sante/medical_1.jpg', '/sante/pills_1.jpg', '/sante/fitness_1.jpg', '/sante/supplement_1.jpg', '/sante/thermometer_1.jpg'],
  'electromenager': ['/electromenager/toaster_1.jpg', '/electromenager/vacuum_1.jpg', '/electromenager/mixer_1.jpg', '/electromenager/microwave_1.jpg', '/electromenager/blender_1.jpg', '/electromenager/coffee_1.jpg'],
  'vetements': ['/vetements/dress_1.jpg', '/vetements/shirt_1.jpg', '/vetements/jeans_1.jpg', '/vetements/shoes_1.jpg', '/vetements/sneakers_1.jpg', '/vetements/hat_1.jpg', '/vetements/tshirt_1.jpg'],
  'sport': ['/sport/ball_1.jpg', '/sport/bike_1.jpg', '/sport/dumbbells_1.jpg', '/sport/gym_equipment_1.jpg', '/sport/running_shoes_1.jpg', '/sport/yoga_mat_1.jpg'],
  'maison': ['/maison/candle_1.jpg', '/maison/clock_1.jpg', '/maison/cushion_1.jpg', '/maison/lamp_1.jpg', '/maison/mirror_1.jpg', '/maison/vase_1.jpg'],
  'jouets': ['/jouets/car_toy_1.jpg', '/jouets/doll_1.jpg', '/jouets/lego_1.jpg', '/jouets/puzzle_1.jpg', '/jouets/toy_1.jpg'],
};

/**
 * Normalise le nom d'un produit pour la correspondance
 */
function normalizeProductName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '')
    .replace(/\s+/g, '');
}

/**
 * Génère un hash simple à partir d'une chaîne pour la diversité
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Normalise le nom d'une catégorie pour la correspondance
 */
function normalizeCategoryName(category: string): string {
  return category
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '')
    .replace(/s$/, ''); // Supprimer le 's' final
}

/**
 * Trouve une image pour un produit basée sur son nom et sa catégorie
 * @param productName - Nom du produit
 * @param categoryName - Nom de la catégorie
 * @param productId - ID du produit pour la diversité (optionnel)
 * @returns URL de l'image dans public/ ou null si non trouvée
 */
export function getPublicProductImage(
  productName: string,
  categoryName?: string,
  productId?: string | number
): string | null {
  if (!productName) return null;
  
  // Vérifier le cache d'abord
  const cacheKey = `${productName}-${categoryName || ''}-${productId || ''}`;
  const cached = imageUrlCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }
  
  // 1. Essayer de trouver une correspondance exacte par nom de produit
  const normalizedName = normalizeProductName(productName);
  
  // Chercher une correspondance partielle dans PRODUCT_NAME_TO_IMAGE
  // Prioriser les correspondances exactes ou les plus longues
  let bestMatch: { key: string; imagePath: string; score: number } | null = null;
  
  for (const [key, imagePath] of Object.entries(PRODUCT_NAME_TO_IMAGE)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      // Calculer un score basé sur la longueur de la correspondance
      const score = Math.min(key.length, normalizedName.length);
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { key, imagePath, score };
      }
    }
  }
  
  if (bestMatch) {
    // Si plusieurs produits ont le même nom de base, utiliser l'ID pour varier
    if (productId && bestMatch.imagePath) {
      // Pour les produits avec le même nom, utiliser l'ID pour sélectionner une variante
      // Par exemple, si on a plusieurs "riz", on peut utiliser différentes images
      const basePath = bestMatch.imagePath;
      const folder = basePath.split('/')[1]; // Extraire le dossier
      if (CATEGORY_IMAGES[folder] && CATEGORY_IMAGES[folder].length > 1) {
        // Si plusieurs images dans la catégorie, utiliser l'ID pour varier
        const images = CATEGORY_IMAGES[folder];
        const hash = simpleHash(`${normalizedName}-${productId}`);
        const imageIndex = hash % images.length;
        return images[imageIndex];
      }
    }
    return bestMatch.imagePath;
  }
  
  // 2. Si pas de correspondance, essayer par catégorie avec les images réelles
  if (categoryName) {
    const normalizedCategory = normalizeCategoryName(categoryName);
    const folder = CATEGORY_TO_FOLDER[normalizedCategory];
    
    if (folder && CATEGORY_IMAGES[folder]) {
      // Utiliser une combinaison du nom du produit et de l'ID pour garantir la diversité
      const images = CATEGORY_IMAGES[folder];
      if (images.length > 0) {
        // Combiner le nom du produit et l'ID pour plus de diversité
        const combinedKey = `${productName}-${productId || ''}`;
        const hash = simpleHash(combinedKey);
        const imageIndex = hash % images.length;
        return images[imageIndex];
      }
    }
  }
  
  return null;
}

/**
 * Génère une URL d'image depuis le dossier public/ basée sur la catégorie
 * @param categoryName - Nom de la catégorie
 * @param productId - ID du produit pour la diversité
 * @returns URL de l'image
 */
export function getCategoryImage(categoryName: string, productId?: string | number, productName?: string): string | null {
  if (!categoryName) return null;
  
  const normalizedCategory = normalizeCategoryName(categoryName);
  const folder = CATEGORY_TO_FOLDER[normalizedCategory];
  
  if (folder && CATEGORY_IMAGES[folder]) {
    // Utiliser une combinaison du nom du produit et de l'ID pour garantir la diversité
    const images = CATEGORY_IMAGES[folder];
    if (images.length > 0) {
      // Combiner le nom du produit et l'ID pour plus de diversité
      const combinedKey = `${productName || ''}-${productId || ''}`;
      const hash = simpleHash(combinedKey);
      const imageIndex = hash % images.length;
      return images[imageIndex];
    }
  }
  
  return null;
}

/**
 * Fonction principale pour obtenir l'image d'un produit
 * MÊME LOGIQUE QUE POSPage.tsx mais avec support pour public/
 * @param product - Objet produit avec nom, categorie, images, etc.
 * @returns URL de l'image
 */
export function getProductImageFromPublic(product: {
  nom?: string;
  name?: string;
  categorie?: { nom?: string } | string;
  categorie_nom?: string;
  images?: Array<{ image_url?: string; image?: string }>;
  image?: string;
  image_url?: string;
  id?: string | number;
}): string {
  // Vérifier le cache d'abord
  const productId = product.id || '';
  const productName = product.nom || product.name || '';
  const cacheKey = `product-${productId}-${productName}`;
  const cached = imageUrlCache.get(cacheKey);
  if (cached !== undefined && cached !== null) {
    return cached;
  }
  
  const categoryName = 
    (typeof product.categorie === 'object' && product.categorie?.nom) ||
    (typeof product.categorie === 'string' ? product.categorie : null) ||
    product.categorie_nom ||
    '';
  
  let result = '';
  
  // 1. LOGIQUE EXACTE DE POSPage.tsx : Utiliser la première image disponible
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    const firstImage = product.images[0];
    // Essayer image_url d'abord
    if (firstImage.image_url && firstImage.image_url.trim() !== '') {
      if (firstImage.image_url.startsWith('http')) {
        result = firstImage.image_url;
      } else if (firstImage.image_url.startsWith('/')) {
        result = `${getBackendBaseUrl()}${firstImage.image_url}`;
      } else {
        result = `${getBackendBaseUrl()}/${firstImage.image_url}`;
      }
    }
    // Sinon essayer image
    else if (firstImage.image && firstImage.image.trim() !== '') {
      if (firstImage.image.startsWith('http')) {
        result = firstImage.image;
      } else if (firstImage.image.startsWith('/')) {
        result = `${getBackendBaseUrl()}${firstImage.image}`;
      } else {
        result = `${getBackendBaseUrl()}/${firstImage.image}`;
      }
    }
  }
  
  // 2. Essayer product.image_url direct (comme dans POSPage)
  if (!result && product.image_url && typeof product.image_url === 'string' && product.image_url.trim() !== '') {
    if (product.image_url.startsWith('http')) {
      result = product.image_url;
    } else if (product.image_url.startsWith('/')) {
      result = `${getBackendBaseUrl()}${product.image_url}`;
    } else {
      result = `${getBackendBaseUrl()}/${product.image_url}`;
    }
  }
  
  // 3. Essayer product.image direct
  if (!result && product.image && typeof product.image === 'string' && product.image.trim() !== '') {
    if (product.image.startsWith('http')) {
      result = product.image;
    } else if (product.image.startsWith('/')) {
      // Si commence par /, vérifier si c'est dans public/ (servi par Vite) ou media/ (servi par Django)
      if (product.image.startsWith('/media/')) {
        result = `${getBackendBaseUrl()}${product.image}`;
      } else {
        // Sinon, c'est probablement dans public/, retourner tel quel (Vite le sert)
        result = product.image;
      }
    } else {
      result = `${getBackendBaseUrl()}/${product.image}`;
    }
  }
  
  // 4. Si pas d'image de l'API, chercher dans public/ basé sur le nom du produit
  if (!result) {
    const publicImage = getPublicProductImage(productName, categoryName, product.id);
    if (publicImage) {
      // Les images dans public/ sont servies directement par Vite
      result = publicImage;
    }
  }
  
  // 5. Dernier recours : image par catégorie dans public/
  if (!result && categoryName) {
    const categoryImage = getCategoryImage(categoryName, product.id, productName);
    if (categoryImage) {
      result = categoryImage;
    }
  }
  
  // 6. Image par défaut (comme dans POSPage, mais depuis public/)
  if (!result) {
    result = '/accessoires/backpack_1.jpg';
  }
  
  // Mettre en cache le résultat
  imageUrlCache.set(cacheKey, result);
  return result;
}

