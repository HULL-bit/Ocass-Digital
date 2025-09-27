/**
 * Utilitaires pour générer des images de produits cohérentes et intelligentes
 */

/**
 * Normalise un texte pour la recherche de correspondance
 * @param text - Texte à normaliser
 * @returns Texte normalisé
 */
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9\s]/g, '') // Garder seulement lettres, chiffres et espaces
    .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un seul
    .trim();
};

/**
 * Trouve la meilleure correspondance dans un objet de mots-clés
 * @param text - Texte à analyser
 * @param keywords - Objet de mots-clés
 * @returns URL de l'image correspondante ou null
 */
const findBestMatch = (text: string, keywords: Record<string, string>): string | null => {
  const normalizedText = normalizeText(text);
  const words = normalizedText.split(' ');
  
  // Chercher une correspondance exacte d'abord
  for (const [keyword, imageUrl] of Object.entries(keywords)) {
    const normalizedKeyword = normalizeText(keyword);
    if (normalizedText.includes(normalizedKeyword)) {
      return imageUrl;
    }
  }
  
  // Chercher une correspondance partielle
  for (const [keyword, imageUrl] of Object.entries(keywords)) {
    const normalizedKeyword = normalizeText(keyword);
    for (const word of words) {
      if (word.includes(normalizedKeyword) || normalizedKeyword.includes(word)) {
        return imageUrl;
      }
    }
  }
  
  return null;
};

// Images spécifiques par type de produit
const PRODUCT_IMAGES_BY_TYPE = {
  // Équipements médicaux et santé
  'tensiomètre': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center',
  'thermomètre': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&crop=center',
  'masque': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=400&fit=crop&crop=center',
  'gel': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop&crop=center',
  'vitamines': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center',
  'betadine': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&crop=center',
  'médicament': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center',
  'pharmacie': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&crop=center',
  'santé': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=400&fit=crop&crop=center',
  'médical': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop&crop=center',
  'stéthoscope': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center',
  'pansement': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&crop=center',
  
  // Électronique
  'smartphone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&crop=center',
  'téléphone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&crop=center',
  'phone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&crop=center',
  'ordinateur': 'https://images.unsplash.com/photo-1593642702821-c8a6771f0686?w=400&h=400&fit=crop&crop=center',
  'laptop': 'https://images.unsplash.com/photo-1593642702821-c8a6771f0686?w=400&h=400&fit=crop&crop=center',
  'pc': 'https://images.unsplash.com/photo-1593642702821-c8a6771f0686?w=400&h=400&fit=crop&crop=center',
  'tablette': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center',
  'ipad': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center',
  'casque': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center',
  'écouteurs': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center',
  'headphone': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center',
  'camera': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center',
  'caméra': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center',
  'télévision': 'https://images.unsplash.com/photo-1593642702821-c8a6771f0686?w=400&h=400&fit=crop&crop=center',
  'tv': 'https://images.unsplash.com/photo-1593642702821-c8a6771f0686?w=400&h=400&fit=crop&crop=center',
  
  // Mode et beauté
  'robe': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&crop=center',
  'dress': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&crop=center',
  'chemise': 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop&crop=center',
  'shirt': 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop&crop=center',
  'chaussures': 'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=400&h=400&fit=crop&crop=center',
  'shoes': 'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=400&h=400&fit=crop&crop=center',
  'sneakers': 'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=400&h=400&fit=crop&crop=center',
  'sac': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop&crop=center',
  'bag': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop&crop=center',
  'parfum': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop&crop=center',
  'perfume': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop&crop=center',
  'maquillage': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop&crop=center',
  'makeup': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop&crop=center',
  'bijoux': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop&crop=center',
  'jewelry': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop&crop=center',
  
  // Alimentation
  'pain': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop&crop=center',
  'bread': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop&crop=center',
  'lait': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center',
  'milk': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center',
  'fruits': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop&crop=center',
  'fruit': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop&crop=center',
  'légumes': 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=400&fit=crop&crop=center',
  'vegetables': 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=400&fit=crop&crop=center',
  'viande': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop&crop=center',
  'meat': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop&crop=center',
  'poisson': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop&crop=center',
  'fish': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop&crop=center',
  'céréales': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop&crop=center',
  'cereal': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop&crop=center',
  'boisson': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center',
  'drink': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center',
  
  // Sport
  'ballon': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop&crop=center',
  'raquette': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop&crop=center',
  'maillot': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop&crop=center',
  
  // Maison
  'meuble': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center',
  'décoration': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center',
  'électroménager': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center',
  
  // Livres
  'livre': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop&crop=center',
  'cahier': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop&crop=center',
  'stylo': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop&crop=center',
  
  // Jouets
  'poupée': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center',
  'voiture': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center',
  'jeu': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center',
  
  // Automobile
  'pneu': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center',
  'huile': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center',
  'batterie': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center'
};

// Images par catégorie générale (fallback)
const PRODUCT_IMAGES_BY_CATEGORY = {
  'sante': [
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop&crop=center'
  ],
  'electronique': [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1593642702821-c8a6771f0686?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center'
  ],
  'mode': [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop&crop=center'
  ],
  'alimentation': [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=400&fit=crop&crop=center'
  ],
  'sport': [
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop&crop=center'
  ],
  'maison': [
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center'
  ],
  'livres': [
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop&crop=center'
  ],
  'jouets': [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center'
  ],
  'automobile': [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center'
  ]
};

// Images génériques par défaut
const DEFAULT_PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1593642702821-c8a6771f0686?w=400&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&crop=center'
];

/**
 * Génère une image de produit intelligente basée sur le nom et la catégorie
 * @param categoryName - Nom de la catégorie du produit
 * @param productName - Nom du produit
 * @param productId - ID du produit pour la diversité
 * @returns URL de l'image
 */
export const getProductImage = (categoryName: string, productName?: string, productId?: string | number): string => {
  // 1. D'abord, essayer de trouver une image spécifique basée sur le nom du produit
  if (productName) {
    const specificMatch = findBestMatch(productName, PRODUCT_IMAGES_BY_TYPE);
    if (specificMatch) {
      return specificMatch;
    }
  }
  
  // 2. Si pas de correspondance spécifique, utiliser la catégorie
  if (categoryName) {
    const normalizedCategory = categoryName.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/s$/, ''); // Supprimer le 's' final
    
    // Mapper les catégories vers nos clés
    const categoryMapping: Record<string, string> = {
      'sante': 'sante',
      'pharmacie': 'sante',
      'santé': 'sante',
      'electronique': 'electronique',
      'électronique': 'electronique',
      'technologie': 'electronique',
      'tech': 'electronique',
      'mode': 'mode',
      'beaute': 'mode',
      'beauté': 'mode',
      'cosmetique': 'mode',
      'cosmétique': 'mode',
      'textile': 'mode',
      'alimentation': 'alimentation',
      'nourriture': 'alimentation',
      'food': 'alimentation',
      'maison': 'maison',
      'déco': 'maison',
      'decoration': 'maison',
      'décoration': 'maison',
      'sport': 'sport',
      'fitness': 'sport',
      'livres': 'livres',
      'livre': 'livres',
      'papeterie': 'livres',
      'jouets': 'jouets',
      'jouet': 'jouets',
      'automobile': 'automobile',
      'auto': 'automobile',
      'voiture': 'automobile'
    };
    
    const categoryKey = categoryMapping[normalizedCategory] || normalizedCategory;
    const categoryImages = PRODUCT_IMAGES_BY_CATEGORY[categoryKey as keyof typeof PRODUCT_IMAGES_BY_CATEGORY];
    
    if (categoryImages && categoryImages.length > 0) {
      return getImageFromArray(categoryImages, productId);
    }
  }
  
  // 3. En dernier recours, utiliser une image par défaut
  return getRandomDefaultImage(productId);
};

/**
 * Génère une image aléatoire à partir d'un tableau
 * @param images - Tableau d'images
 * @param productId - ID du produit pour la diversité
 * @returns URL de l'image
 */
const getImageFromArray = (images: string[], productId?: string | number): string => {
  if (!productId) {
    return images[Math.floor(Math.random() * images.length)];
  }
  
  // Utiliser l'ID pour sélectionner une image de manière déterministe
  const idString = String(productId);
  let hash = 0;
  
  for (let i = 0; i < idString.length; i++) {
    const char = idString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const index = Math.abs(hash) % images.length;
  return images[index];
};

/**
 * Génère une image par défaut aléatoire
 * @param productId - ID du produit
 * @returns URL de l'image
 */
const getRandomDefaultImage = (productId?: string | number): string => {
  return getImageFromArray(DEFAULT_PRODUCT_IMAGES, productId);
};

/**
 * Génère plusieurs images pour un produit (galerie)
 * @param categoryName - Nom de la catégorie
 * @param productId - ID du produit
 * @param count - Nombre d'images à générer
 * @returns Tableau d'URLs d'images
 */
export const getProductImages = (categoryName: string, productId?: string | number, count: number = 3): string[] => {
  const images: string[] = [];
  const baseImage = getProductImage(categoryName, productId);
  images.push(baseImage);
  
  // Ajouter des variations de la même catégorie
  for (let i = 1; i < count; i++) {
    const variationId = `${productId}_${i}`;
    const variationImage = getProductImage(categoryName, variationId);
    if (!images.includes(variationImage)) {
      images.push(variationImage);
    } else {
      // Si l'image est déjà utilisée, prendre une image par défaut
      images.push(getRandomDefaultImage(variationId));
    }
  }
  
  return images;
};

