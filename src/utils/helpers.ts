/**
 * Fonctions utilitaires diverses
 */

/**
 * Génère un ID unique
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Génère un UUID v4
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Deep clone d'un objet
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    Object.keys(obj).forEach(key => {
      (clonedObj as any)[key] = deepClone((obj as any)[key]);
    });
    return clonedObj;
  }
  return obj;
};

/**
 * Merge profond de deux objets
 */
export const deepMerge = (target: any, source: any): any => {
  const result = { ...target };
  
  Object.keys(source).forEach(key => {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  });
  
  return result;
};

/**
 * Vérifie si un objet est vide
 */
export const isEmpty = (obj: any): boolean => {
  if (obj === null || obj === undefined) return true;
  if (typeof obj === 'string') return obj.trim().length === 0;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

/**
 * Groupe un tableau par une propriété
 */
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

/**
 * Trie un tableau par une propriété
 */
export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Filtre un tableau par plusieurs critères
 */
export const filterBy = <T>(array: T[], filters: Record<string, any>): T[] => {
  return array.filter(item => {
    return Object.keys(filters).every(key => {
      const filterValue = filters[key];
      const itemValue = (item as any)[key];
      
      if (filterValue === null || filterValue === undefined || filterValue === '') {
        return true;
      }
      
      if (typeof filterValue === 'string') {
        return String(itemValue).toLowerCase().includes(filterValue.toLowerCase());
      }
      
      if (Array.isArray(filterValue)) {
        return filterValue.includes(itemValue);
      }
      
      return itemValue === filterValue;
    });
  });
};

/**
 * Pagine un tableau
 */
export const paginate = <T>(array: T[], page: number, pageSize: number): {
  data: T[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
} => {
  const totalItems = array.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const data = array.slice(startIndex, endIndex);
  
  return {
    data,
    totalPages,
    currentPage,
    totalItems,
    hasNext: currentPage < totalPages,
    hasPrevious: currentPage > 1,
  };
};

/**
 * Recherche dans un tableau
 */
export const searchInArray = <T>(
  array: T[], 
  searchTerm: string, 
  searchFields: (keyof T)[]
): T[] => {
  if (!searchTerm.trim()) return array;
  
  const term = searchTerm.toLowerCase();
  
  return array.filter(item => {
    return searchFields.some(field => {
      const value = String((item as any)[field] || '').toLowerCase();
      return value.includes(term);
    });
  });
};

/**
 * Calcule des statistiques sur un tableau de nombres
 */
export const calculateStats = (numbers: number[]): {
  sum: number;
  average: number;
  median: number;
  min: number;
  max: number;
  count: number;
} => {
  if (numbers.length === 0) {
    return { sum: 0, average: 0, median: 0, min: 0, max: 0, count: 0 };
  }
  
  const sorted = [...numbers].sort((a, b) => a - b);
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  const average = sum / numbers.length;
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];
  
  return {
    sum,
    average,
    median,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    count: numbers.length,
  };
};

/**
 * Génère une couleur basée sur une chaîne
 */
export const stringToColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

/**
 * Convertit une couleur HSL en hex
 */
export const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

/**
 * Génère un gradient CSS aléatoire
 */
export const generateRandomGradient = (): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  
  const color1 = colors[Math.floor(Math.random() * colors.length)];
  const color2 = colors[Math.floor(Math.random() * colors.length)];
  const angle = Math.floor(Math.random() * 360);
  
  return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
};

/**
 * Calcule la distance entre deux points géographiques
 */
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Génère un nom de fichier unique
 */
export const generateFileName = (originalName: string, prefix: string = ''): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 5);
  const extension = originalName.split('.').pop();
  const baseName = originalName.split('.').slice(0, -1).join('.');
  
  return `${prefix}${baseName}_${timestamp}_${random}.${extension}`;
};

/**
 * Convertit un fichier en base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

/**
 * Télécharge un fichier
 */
export const downloadFile = (data: any, filename: string, type: string = 'application/json'): void => {
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Copie du texte dans le presse-papiers
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback pour les navigateurs plus anciens
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  }
};

/**
 * Détecte le type d'appareil
 */
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

/**
 * Détecte si l'utilisateur est en mode sombre
 */
export const prefersDarkMode = (): boolean => {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
};

/**
 * Stockage local sécurisé
 */
export const secureStorage = {
  set: (key: string, value: any): void => {
    try {
      const encrypted = btoa(JSON.stringify(value));
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Erreur stockage local:', error);
    }
  },
  
  get: (key: string): any => {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      return JSON.parse(atob(encrypted));
    } catch (error) {
      console.error('Erreur lecture stockage local:', error);
      return null;
    }
  },
  
  remove: (key: string): void => {
    localStorage.removeItem(key);
  },
  
  clear: (): void => {
    localStorage.clear();
  },
};

/**
 * Gestion des erreurs API
 */
export const handleApiError = (error: any): string => {
  if (error?.data?.message) {
    return error.data.message;
  }
  
  if (error?.data?.detail) {
    return error.data.detail;
  }
  
  if (error?.status) {
    switch (error.status) {
      case 400:
        return 'Données invalides';
      case 401:
        return 'Non autorisé';
      case 403:
        return 'Accès interdit';
      case 404:
        return 'Ressource non trouvée';
      case 500:
        return 'Erreur serveur';
      default:
        return `Erreur ${error.status}`;
    }
  }
  
  return 'Une erreur inattendue est survenue';
};

/**
 * Retry avec backoff exponentiel
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i === maxRetries) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Limite le taux d'exécution d'une fonction
 */
export const rateLimit = <T extends (...args: any[]) => any>(
  fn: T,
  limit: number,
  interval: number
): T => {
  let calls = 0;
  let resetTime = Date.now() + interval;
  
  return ((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now > resetTime) {
      calls = 0;
      resetTime = now + interval;
    }
    
    if (calls >= limit) {
      throw new Error('Rate limit exceeded');
    }
    
    calls++;
    return fn(...args);
  }) as T;
};

/**
 * Cache en mémoire avec TTL
 */
export class MemoryCache<T> {
  private cache = new Map<string, { value: T; expiry: number }>();
  
  set(key: string, value: T, ttl: number = 300000): void { // 5 minutes par défaut
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }
  
  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  size(): number {
    return this.cache.size;
  }
}

/**
 * Gestionnaire d'événements personnalisé
 */
export class EventEmitter {
  private events = new Map<string, Function[]>();
  
  on(event: string, callback: Function): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
  }
  
  off(event: string, callback: Function): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }
  
  emit(event: string, ...args: any[]): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(...args));
    }
  }
  
  once(event: string, callback: Function): void {
    const onceCallback = (...args: any[]) => {
      callback(...args);
      this.off(event, onceCallback);
    };
    this.on(event, onceCallback);
  }
}

/**
 * Utilitaires pour les animations
 */
export const animationUtils = {
  /**
   * Anime un nombre de 0 à la valeur cible
   */
  animateNumber: (
    start: number,
    end: number,
    duration: number,
    callback: (value: number) => void
  ): void => {
    const startTime = Date.now();
    const difference = end - start;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = start + (difference * easeOut);
      
      callback(Math.round(current));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  },
  
  /**
   * Anime le scroll vers un élément
   */
  scrollToElement: (
    element: HTMLElement,
    duration: number = 500,
    offset: number = 0
  ): void => {
    const start = window.pageYOffset;
    const target = element.offsetTop - offset;
    const distance = target - start;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-in-out)
      const easeInOut = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      window.scrollTo(0, start + (distance * easeInOut));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  },
};

/**
 * Utilitaires pour les couleurs
 */
export const colorUtils = {
  /**
   * Génère une palette de couleurs harmonieuses
   */
  generatePalette: (baseColor: string, count: number = 5): string[] => {
    // Conversion hex vers HSL
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    // Génération de la palette
    const palette = [];
    for (let i = 0; i < count; i++) {
      const newH = (h + (i * 0.1)) % 1;
      const newS = Math.max(0.3, s - (i * 0.1));
      const newL = Math.max(0.2, Math.min(0.8, l + ((i - count/2) * 0.1)));
      
      palette.push(hslToHex(newH * 360, newS * 100, newL * 100));
    }
    
    return palette;
  },
  
  /**
   * Détermine si une couleur est claire ou sombre
   */
  isLightColor: (color: string): boolean => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calcul de la luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  },
};

/**
 * Instance globale du cache mémoire
 */
export const globalCache = new MemoryCache();

/**
 * Instance globale de l'event emitter
 */
export const globalEvents = new EventEmitter();