/**
 * Utilitaires de formatage
 */

/**
 * Formate un montant en devise
 */
export const formatCurrency = (
  amount: number, 
  currency: string = 'XOF', 
  locale: string = 'fr-FR'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formate un pourcentage
 */
export const formatPercentage = (
  value: number, 
  decimals: number = 1,
  locale: string = 'fr-FR'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
};

/**
 * Formate un nombre
 */
export const formatNumber = (
  value: number, 
  locale: string = 'fr-FR'
): string => {
  return new Intl.NumberFormat(locale).format(value);
};

/**
 * Formate une date
 */
export const formatDate = (
  date: string | Date, 
  format: 'short' | 'medium' | 'long' | 'full' = 'medium',
  locale: string = 'fr-FR'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    medium: { day: '2-digit', month: 'short', year: 'numeric' },
    long: { day: '2-digit', month: 'long', year: 'numeric' },
    full: { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' },
  }[format];
  
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};

/**
 * Formate une heure
 */
export const formatTime = (
  date: string | Date, 
  locale: string = 'fr-FR'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

/**
 * Formate une date et heure
 */
export const formatDateTime = (
  date: string | Date, 
  locale: string = 'fr-FR'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

/**
 * Formate une durée relative (il y a X temps)
 */
export const formatRelativeTime = (
  date: string | Date, 
  locale: string = 'fr-FR'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'À l\'instant';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  } else {
    return formatDate(dateObj, 'short', locale);
  }
};

/**
 * Formate une taille de fichier
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Formate un numéro de téléphone
 */
export const formatPhoneNumber = (phone: string): string => {
  // Supprime tous les caractères non numériques
  const cleaned = phone.replace(/\D/g, '');
  
  // Format sénégalais
  if (cleaned.startsWith('221') && cleaned.length === 12) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10)}`;
  }
  
  // Format français
  if (cleaned.startsWith('33') && cleaned.length === 11) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
  }
  
  // Format par défaut
  return phone;
};

/**
 * Formate un nom complet
 */
export const formatFullName = (firstName?: string, lastName?: string): string => {
  if (!firstName && !lastName) return '';
  if (!firstName) return lastName || '';
  if (!lastName) return firstName;
  return `${firstName} ${lastName}`;
};

/**
 * Génère des initiales
 */
export const generateInitials = (firstName?: string, lastName?: string): string => {
  if (!firstName && !lastName) return '??';
  
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  
  if (first && last) return `${first}${last}`;
  if (first) return `${first}${firstName.charAt(1)?.toUpperCase() || ''}`;
  if (last) return `${last}${lastName.charAt(1)?.toUpperCase() || ''}`;
  
  return '??';
};

/**
 * Formate un statut avec couleur
 */
export const formatStatus = (status: string): { label: string; color: string; bgColor: string } => {
  const statusMap: Record<string, { label: string; color: string; bgColor: string }> = {
    actif: { label: 'Actif', color: 'text-green-600', bgColor: 'bg-green-100' },
    inactif: { label: 'Inactif', color: 'text-gray-600', bgColor: 'bg-gray-100' },
    suspendu: { label: 'Suspendu', color: 'text-red-600', bgColor: 'bg-red-100' },
    archive: { label: 'Archivé', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    
    // Ventes
    brouillon: { label: 'Brouillon', color: 'text-gray-600', bgColor: 'bg-gray-100' },
    en_attente: { label: 'En attente', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    confirmee: { label: 'Confirmée', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    expediee: { label: 'Expédiée', color: 'text-purple-600', bgColor: 'bg-purple-100' },
    livree: { label: 'Livrée', color: 'text-green-600', bgColor: 'bg-green-100' },
    terminee: { label: 'Terminée', color: 'text-green-600', bgColor: 'bg-green-100' },
    annulee: { label: 'Annulée', color: 'text-red-600', bgColor: 'bg-red-100' },
    
    // Paiements
    pending: { label: 'En attente', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    processing: { label: 'En cours', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    completed: { label: 'Terminé', color: 'text-green-600', bgColor: 'bg-green-100' },
    failed: { label: 'Échoué', color: 'text-red-600', bgColor: 'bg-red-100' },
    cancelled: { label: 'Annulé', color: 'text-gray-600', bgColor: 'bg-gray-100' },
    refunded: { label: 'Remboursé', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  };
  
  return statusMap[status] || { label: status, color: 'text-gray-600', bgColor: 'bg-gray-100' };
};

/**
 * Formate une priorité avec couleur
 */
export const formatPriority = (priority: string): { label: string; color: string; bgColor: string } => {
  const priorityMap: Record<string, { label: string; color: string; bgColor: string }> = {
    low: { label: 'Basse', color: 'text-green-600', bgColor: 'bg-green-100' },
    medium: { label: 'Moyenne', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    high: { label: 'Haute', color: 'text-orange-600', bgColor: 'bg-orange-100' },
    urgent: { label: 'Urgente', color: 'text-red-600', bgColor: 'bg-red-100' },
  };
  
  return priorityMap[priority] || { label: priority, color: 'text-gray-600', bgColor: 'bg-gray-100' };
};

/**
 * Calcule et formate une évolution
 */
export const formatEvolution = (current: number, previous: number): {
  value: number;
  percentage: number;
  isPositive: boolean;
  formatted: string;
  color: string;
} => {
  const difference = current - previous;
  const percentage = previous !== 0 ? (difference / previous) * 100 : 0;
  const isPositive = difference >= 0;
  
  return {
    value: difference,
    percentage,
    isPositive,
    formatted: `${isPositive ? '+' : ''}${formatPercentage(percentage)}`,
    color: isPositive ? 'text-green-600' : 'text-red-600',
  };
};

/**
 * Tronque un texte
 */
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Capitalise la première lettre
 */
export const capitalize = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Formate un slug
 */
export const formatSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-z0-9\s-]/g, '') // Supprime les caractères spéciaux
    .replace(/\s+/g, '-') // Remplace les espaces par des tirets
    .replace(/-+/g, '-') // Supprime les tirets multiples
    .trim();
};

/**
 * Génère une couleur aléatoire
 */
export const generateRandomColor = (): string => {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4',
    '#8B5CF6', '#EC4899', '#6366F1', '#84CC16', '#F97316'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Convertit une couleur hex en rgba
 */
export const hexToRgba = (hex: string, alpha: number = 1): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Génère un gradient CSS
 */
export const generateGradient = (color1: string, color2: string, direction: string = '135deg'): string => {
  return `linear-gradient(${direction}, ${color1}, ${color2})`;
};

/**
 * Formate les données pour les graphiques
 */
export const formatChartData = (data: any[], xKey: string, yKey: string) => {
  return data.map(item => ({
    x: item[xKey],
    y: item[yKey],
    label: item.label || item[xKey],
    color: item.color || generateRandomColor(),
  }));
};

/**
 * Calcule la moyenne d'un tableau
 */
export const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
};

/**
 * Calcule la médiane d'un tableau
 */
export const calculateMedian = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  
  return sorted[middle];
};

/**
 * Génère des couleurs pour un graphique
 */
export const generateChartColors = (count: number): string[] => {
  const baseColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4',
    '#8B5CF6', '#EC4899', '#6366F1', '#84CC16', '#F97316'
  ];
  
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  
  return colors;
};

/**
 * Formate les données pour export
 */
export const formatDataForExport = (data: any[], format: 'csv' | 'excel' | 'json') => {
  switch (format) {
    case 'csv':
      return formatDataToCsv(data);
    case 'excel':
      return formatDataToExcel(data);
    case 'json':
      return JSON.stringify(data, null, 2);
    default:
      return data;
  }
};

/**
 * Formate les données en CSV
 */
export const formatDataToCsv = (data: any[]): string => {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value}"` : value;
      }).join(',')
    )
  ].join('\n');
  
  return csvContent;
};

/**
 * Formate les données pour Excel
 */
export const formatDataToExcel = (data: any[]) => {
  // Cette fonction nécessiterait une bibliothèque comme xlsx
  // Pour l'instant, on retourne les données formatées
  return data;
};

/**
 * Valide un email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valide un numéro de téléphone
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Génère un code aléatoire
 */
export const generateRandomCode = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Debounce une fonction
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle une fonction
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};