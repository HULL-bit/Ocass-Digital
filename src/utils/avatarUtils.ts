/**
 * Utilitaires pour la gestion des avatars d'utilisateurs
 * Utilise des images d'Africains réels pour une meilleure représentation
 */

// Images d'Africains réels pour les avatars
const AFRICAN_AVATARS = [
  // Hommes
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  
  // Femmes
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&h=150&fit=crop&crop=face',
  
  // Images spécifiques d'Africains
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=150&h=150&fit=crop&crop=face',
];

/**
 * Génère un avatar aléatoire d'Africain basé sur l'email de l'utilisateur
 * @param email - Email de l'utilisateur pour générer un index cohérent
 * @returns URL de l'avatar
 */
export const getAfricanAvatar = (email: string): string => {
  if (!email) {
    return AFRICAN_AVATARS[0];
  }
  
  // Utiliser l'email pour générer un index cohérent
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir en entier 32-bit
  }
  
  const index = Math.abs(hash) % AFRICAN_AVATARS.length;
  return AFRICAN_AVATARS[index];
};

/**
 * Génère un avatar basé sur le nom de l'utilisateur
 * @param firstName - Prénom de l'utilisateur
 * @param lastName - Nom de famille de l'utilisateur
 * @returns URL de l'avatar
 */
export const getAvatarByName = (firstName: string, lastName: string): string => {
  const fullName = `${firstName}${lastName}`.toLowerCase();
  return getAfricanAvatar(fullName);
};

/**
 * Génère un avatar basé sur l'ID de l'utilisateur
 * @param userId - ID de l'utilisateur
 * @returns URL de l'avatar
 */
export const getAvatarById = (userId: string): string => {
  return getAfricanAvatar(userId);
};

/**
 * Obtient un avatar par défaut pour les nouveaux utilisateurs
 * @returns URL de l'avatar par défaut
 */
export const getDefaultAvatar = (): string => {
  return AFRICAN_AVATARS[0];
};

/**
 * Vérifie si une URL d'avatar est valide
 * @param avatarUrl - URL de l'avatar à vérifier
 * @returns true si l'URL est valide, false sinon
 */
export const isValidAvatar = (avatarUrl: string): boolean => {
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
 * @returns URL de l'avatar
 */
export const getAvatarWithFallback = (userAvatar: string | null, email: string): string => {
  if (userAvatar && isValidAvatar(userAvatar)) {
    return userAvatar;
  }
  return getAfricanAvatar(email);
};

export default {
  getAfricanAvatar,
  getAvatarByName,
  getAvatarById,
  getDefaultAvatar,
  isValidAvatar,
  getAvatarWithFallback
};
