/**
 * Utilitaires pour la gestion des avatars d'utilisateurs
 * Utilise des images d'Africains locaux pour une meilleure représentation
 */

// Images d'Africains locaux pour les avatars - Hommes
const AFRICAN_MALE_AVATARS = [
  '/Res/pexels-cenali-2733918.jpg',
  '/Res/pexels-bohlemedia-1884581.jpg',
  '/Res/tech.jpg',
  '/Res/entrepreneur.png',
  '/Res/ent2.png',
  '/Res/stefan-buhler-qQY44BbC2mw-unsplash.jpg',
  '/Res/shivansh-sharma-l2cFxUEEY7I-unsplash.jpg',
  '/Res/mathieu-gauzy-qLT3rBVwiLY-unsplash.jpg',
  '/Res/tr-n-thanh-h-i-g7pcs7FYx0Y-unsplash.jpg',
  '/Res/gerent.jpg',
];

// Images d'Africains locaux pour les avatars - Femmes
const AFRICAN_FEMALE_AVATARS = [
  '/Res/pexels-planeteelevene-2290243.jpg',
  '/Res/pexels-shattha-pilabut-38930-135620.jpg',
  '/Res/rutendo-petros-Tzp_yd6W8LM-unsplash.jpg',
  '/Res/couture.jpg',
  '/Res/monody-le-mZ_7CuqsRV0-unsplash.jpg',
  '/Res/boutiqueMarie%20Diallo.jpg',
  '/Res/boutque.jpg',
];

/**
 * Détermine le genre à partir du prénom
 * @param firstName - Prénom de l'utilisateur
 * @returns 'F' pour femme, 'M' pour homme
 */
export const determineGender = (firstName: string): 'F' | 'M' => {
  if (!firstName) {
    return 'M';
  }
  
  const firstNameLower = firstName.toLowerCase();
  const femaleNames = [
    'marie', 'fatou', 'aïcha', 'amina', 'khadija', 'aïssatou', 'mariama', 
    'sokhna', 'ndeye', 'coumba', 'aïda', 'sira', 'penda', 'aïssa', 'mame',
    'rosa', 'sarah', 'sophie', 'isabelle', 'claire', 'julie', 'nathalie',
    'catherine', 'marie-claire', 'marie-pierre', 'anne', 'marie-anne'
  ];
  
  const isFemale = femaleNames.some(name => firstNameLower.includes(name));
  return isFemale ? 'F' : 'M';
};

/**
 * Génère un hash à partir d'une chaîne
 * @param str - Chaîne à hasher
 * @returns Hash numérique
 */
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir en entier 32-bit
  }
  return Math.abs(hash);
};

/**
 * Génère un avatar africain basé sur l'email et le prénom de l'utilisateur
 * @param email - Email de l'utilisateur pour générer un index cohérent
 * @param firstName - Prénom de l'utilisateur pour déterminer le genre
 * @returns URL de l'avatar local
 */
export const getAfricanAvatar = (email: string, firstName?: string): string => {
  const gender = firstName ? determineGender(firstName) : 'M';
  const avatarList = gender === 'F' ? AFRICAN_FEMALE_AVATARS : AFRICAN_MALE_AVATARS;
  
  if (!email) {
    return avatarList[0];
  }
  
  const hash = hashString(email);
  const index = hash % avatarList.length;
  return avatarList[index];
};

/**
 * Génère un avatar basé sur le nom de l'utilisateur
 * @param firstName - Prénom de l'utilisateur
 * @param lastName - Nom de famille de l'utilisateur
 * @returns URL de l'avatar
 */
export const getAvatarByName = (firstName: string, lastName: string): string => {
  const fullName = `${firstName}${lastName}`.toLowerCase();
  return getAfricanAvatar(fullName, firstName);
};

/**
 * Génère un avatar basé sur l'ID de l'utilisateur
 * @param userId - ID de l'utilisateur
 * @param firstName - Prénom optionnel pour déterminer le genre
 * @returns URL de l'avatar
 */
export const getAvatarById = (userId: string, firstName?: string): string => {
  return getAfricanAvatar(userId, firstName);
};

/**
 * Obtient un avatar par défaut pour les nouveaux utilisateurs
 * @param gender - Genre optionnel ('F' ou 'M')
 * @returns URL de l'avatar par défaut
 */
export const getDefaultAvatar = (gender?: 'F' | 'M'): string => {
  const avatarList = gender === 'F' ? AFRICAN_FEMALE_AVATARS : AFRICAN_MALE_AVATARS;
  return avatarList[0];
};

/**
 * Vérifie si une URL d'avatar est valide (locale ou externe)
 * @param avatarUrl - URL de l'avatar à vérifier
 * @returns true si l'URL est valide, false sinon
 */
export const isValidAvatar = (avatarUrl: string): boolean => {
  if (!avatarUrl) return false;
  
  // Accepter les URLs locales (commençant par /)
  if (avatarUrl.startsWith('/')) {
    return true;
  }
  
  // Accepter les URLs externes
  try {
    new URL(avatarUrl);
    return true;
  } catch {
    return false;
  }
};

/**
 * Obtient un avatar avec fallback
 * @param userAvatar - Avatar existant de l'utilisateur
 * @param email - Email de l'utilisateur pour fallback
 * @param firstName - Prénom optionnel pour déterminer le genre
 * @returns URL de l'avatar
 */
export const getAvatarWithFallback = (
  userAvatar: string | null, 
  email: string, 
  firstName?: string
): string => {
  if (userAvatar && isValidAvatar(userAvatar)) {
    return userAvatar;
  }
  return getAfricanAvatar(email, firstName);
};

export default {
  getAfricanAvatar,
  getAvatarByName,
  getAvatarById,
  getDefaultAvatar,
  isValidAvatar,
  getAvatarWithFallback
};
