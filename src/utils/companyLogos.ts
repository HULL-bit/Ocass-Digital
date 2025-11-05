/**
 * Utilitaires pour générer des logos d'entreprises uniques
 */

// Collection d'images de logos d'entreprises locales africaines
const COMPANY_LOGOS = [
  // Logos d'entreprises tech
  '/Res/iwaria-inc-tvTFMDwH-cQ-unsplash.jpg',
  '/Res/tech.jpg',
  '/Res/entrepreneur.png',
  '/Res/ent2.png',
  
  // Logos d'entreprises de mode/beauté
  '/Res/boutque.jpg',
  '/Res/boutiqueMarie%20Diallo.jpg',
  '/Res/couture.jpg',
  '/Res/pexels-planeteelevene-2290243.jpg',
  
  // Logos d'entreprises de santé
  '/Res/SuperMarche.jpg',
  '/Res/pexels-shattha-pilabut-38930-135620.jpg',
  '/Res/rutendo-petros-Tzp_yd6W8LM-unsplash.jpg',
  
  // Logos d'entreprises alimentaires
  '/Res/boutique.jpg',
  '/Res/monody-le-mZ_7CuqsRV0-unsplash.jpg',
  '/Res/pexels-cenali-2733918.jpg',
  
  // Logos d'entreprises de maison/déco
  '/Res/pexels-bohlemedia-1884581.jpg',
  '/Res/stefan-buhler-qQY44BbC2mw-unsplash.jpg',
  '/Res/shivansh-sharma-l2cFxUEEY7I-unsplash.jpg',
  
  // Logos d'entreprises diverses
  '/Res/gerent.jpg',
  '/Res/mathieu-gauzy-qLT3rBVwiLY-unsplash.jpg',
  '/Res/tr-n-thanh-h-i-g7pcs7FYx0Y-unsplash.jpg'
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
    'commerce_electronique': '/Res/iwaria-inc-tvTFMDwH-cQ-unsplash.jpg',
    'technologie': '/Res/tech.jpg',
    'commerce_textile': '/Res/boutque.jpg',
    'commerce_de_detail': '/Res/boutiqueMarie%20Diallo.jpg',
    'commerce_pharmaceutique': '/Res/SuperMarche.jpg',
    'sante': '/Res/SuperMarche.jpg',
    'commerce_alimentaire': '/Res/boutique.jpg',
    'commerce_maison': '/Res/pexels-bohlemedia-1884581.jpg',
    'commerce_sport': '/Res/stefan-buhler-qQY44BbC2mw-unsplash.jpg',
    'commerce_sante': '/Res/SuperMarche.jpg',
    'commerce_livre': '/Res/shivansh-sharma-l2cFxUEEY7I-unsplash.jpg',
    'commerce_jouets': '/Res/mathieu-gauzy-qLT3rBVwiLY-unsplash.jpg',
    'commerce_automobile': '/Res/gerent.jpg',
    'commerce_general': '/Res/boutique.jpg'
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
