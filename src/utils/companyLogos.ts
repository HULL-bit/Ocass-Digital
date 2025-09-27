/**
 * Utilitaires pour générer des logos d'entreprises uniques
 */

// Collection d'images de logos d'entreprises variées
const COMPANY_LOGOS = [
  // Logos d'entreprises tech
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&h=100&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1593642702821-c8a6771f0686?w=100&h=100&fit=crop&crop=center',
  
  // Logos d'entreprises de mode/beauté
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=100&h=100&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=100&h=100&fit=crop&crop=center',
  
  // Logos d'entreprises de santé
  'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=100&h=100&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1445205170230-053b83016050?w=100&h=100&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop&crop=center',
  
  // Logos d'entreprises alimentaires
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=100&h=100&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=100&h=100&fit=crop&crop=center',
  
  // Logos d'entreprises de maison/déco
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100&h=100&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100&h=100&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100&h=100&fit=crop&crop=center',
  
  // Logos d'entreprises sport
  'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=100&h=100&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=100&h=100&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=100&h=100&fit=crop&crop=center',
  
  // Logos d'entreprises électroniques
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop&crop=center'
];

/**
 * Génère un logo unique pour une entreprise basé sur son ID
 * @param companyId - ID de l'entreprise (peut être string ou number)
 * @returns URL du logo
 */
export const getCompanyLogo = (companyId: string | number): string => {
  if (!companyId) {
    return COMPANY_LOGOS[0]; // Logo par défaut
  }
  
  // Convertir l'ID en string et créer un hash simple
  const idString = String(companyId);
  let hash = 0;
  
  // Créer un hash simple basé sur les caractères de l'ID
  for (let i = 0; i < idString.length; i++) {
    const char = idString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir en entier 32-bit
  }
  
  // Utiliser la valeur absolue du hash pour éviter les indices négatifs
  const index = Math.abs(hash) % COMPANY_LOGOS.length;
  return COMPANY_LOGOS[index];
};

/**
 * Génère un logo basé sur le secteur d'activité
 * @param sector - Secteur d'activité de l'entreprise
 * @returns URL du logo
 */
export const getCompanyLogoBySector = (sector: string): string => {
  const sectorLogos: Record<string, string> = {
    'commerce_electronique': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center',
    'commerce_textile': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=100&h=100&fit=crop&crop=center',
    'commerce_pharmaceutique': 'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=100&h=100&fit=crop&crop=center',
    'commerce_alimentaire': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop&crop=center',
    'commerce_maison': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100&h=100&fit=crop&crop=center',
    'commerce_sport': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=100&h=100&fit=crop&crop=center',
    'commerce_sante': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=100&h=100&fit=crop&crop=center',
    'commerce_livre': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=100&h=100&fit=crop&crop=center',
    'commerce_jouets': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop&crop=center',
    'commerce_automobile': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop&crop=center',
    'commerce_general': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center'
  };
  
  return sectorLogos[sector] || COMPANY_LOGOS[0];
};

/**
 * Génère un logo pour un produit basé sur son ID
 * @param productId - ID du produit
 * @returns URL du logo
 */
export const getProductLogo = (productId: string | number): string => {
  return getCompanyLogo(productId);
};
