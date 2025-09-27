/**
 * Utilitaires de validation
 */
import { PATTERNS } from './constants';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Valide un email
 */
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('L\'email est requis');
  } else if (!PATTERNS.EMAIL.test(email)) {
    errors.push('Format d\'email invalide');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valide un mot de passe
 */
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Le mot de passe est requis');
  } else {
    if (password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une majuscule');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une minuscule');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valide un numéro de téléphone
 */
export const validatePhoneNumber = (phone: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!phone) {
    errors.push('Le numéro de téléphone est requis');
  } else if (!PATTERNS.PHONE.test(phone.replace(/\s/g, ''))) {
    errors.push('Format de numéro de téléphone invalide');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valide un SKU
 */
export const validateSKU = (sku: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!sku) {
    errors.push('Le SKU est requis');
  } else if (!PATTERNS.SKU.test(sku)) {
    errors.push('Le SKU doit contenir 3-20 caractères (lettres, chiffres, tirets)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valide un code-barres
 */
export const validateBarcode = (barcode: string): ValidationResult => {
  const errors: string[] = [];
  
  if (barcode && !PATTERNS.BARCODE.test(barcode)) {
    errors.push('Le code-barres doit contenir 8-13 chiffres');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valide un prix
 */
export const validatePrice = (price: number | string): ValidationResult => {
  const errors: string[] = [];
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) {
    errors.push('Le prix doit être un nombre valide');
  } else if (numPrice < 0) {
    errors.push('Le prix ne peut pas être négatif');
  } else if (numPrice > 999999999) {
    errors.push('Le prix est trop élevé');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valide une quantité
 */
export const validateQuantity = (quantity: number | string): ValidationResult => {
  const errors: string[] = [];
  const numQuantity = typeof quantity === 'string' ? parseInt(quantity) : quantity;
  
  if (isNaN(numQuantity)) {
    errors.push('La quantité doit être un nombre entier');
  } else if (numQuantity < 0) {
    errors.push('La quantité ne peut pas être négative');
  } else if (numQuantity > 999999) {
    errors.push('La quantité est trop élevée');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valide une date
 */
export const validateDate = (date: string | Date, required: boolean = true): ValidationResult => {
  const errors: string[] = [];
  
  if (!date && required) {
    errors.push('La date est requise');
  } else if (date) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      errors.push('Format de date invalide');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valide une URL
 */
export const validateUrl = (url: string, required: boolean = false): ValidationResult => {
  const errors: string[] = [];
  
  if (!url && required) {
    errors.push('L\'URL est requise');
  } else if (url) {
    try {
      new URL(url);
    } catch {
      errors.push('Format d\'URL invalide');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valide un formulaire produit
 */
export const validateProductForm = (data: any): ValidationResult => {
  const errors: string[] = [];
  
  // Nom requis
  if (!data.nom || data.nom.trim().length === 0) {
    errors.push('Le nom du produit est requis');
  } else if (data.nom.length > 200) {
    errors.push('Le nom du produit ne peut pas dépasser 200 caractères');
  }
  
  // Description courte
  if (!data.description_courte || data.description_courte.trim().length === 0) {
    errors.push('La description courte est requise');
  } else if (data.description_courte.length > 500) {
    errors.push('La description courte ne peut pas dépasser 500 caractères');
  }
  
  // SKU
  const skuValidation = validateSKU(data.sku);
  if (!skuValidation.isValid) {
    errors.push(...skuValidation.errors);
  }
  
  // Prix
  const prixAchatValidation = validatePrice(data.prix_achat);
  if (!prixAchatValidation.isValid) {
    errors.push(...prixAchatValidation.errors.map(e => `Prix d'achat: ${e}`));
  }
  
  const prixVenteValidation = validatePrice(data.prix_vente);
  if (!prixVenteValidation.isValid) {
    errors.push(...prixVenteValidation.errors.map(e => `Prix de vente: ${e}`));
  }
  
  // Vérifier que le prix de vente > prix d'achat
  if (data.prix_vente <= data.prix_achat) {
    errors.push('Le prix de vente doit être supérieur au prix d\'achat');
  }
  
  // Stock
  const stockMinValidation = validateQuantity(data.stock_minimum);
  if (!stockMinValidation.isValid) {
    errors.push(...stockMinValidation.errors.map(e => `Stock minimum: ${e}`));
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valide un formulaire client
 */
export const validateCustomerForm = (data: any): ValidationResult => {
  const errors: string[] = [];
  
  // Nom requis
  if (!data.nom || data.nom.trim().length === 0) {
    errors.push('Le nom est requis');
  }
  
  // Email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.push(...emailValidation.errors);
  }
  
  // Téléphone
  const phoneValidation = validatePhoneNumber(data.telephone);
  if (!phoneValidation.isValid) {
    errors.push(...phoneValidation.errors);
  }
  
  // Adresse de facturation
  if (!data.adresse_facturation || data.adresse_facturation.trim().length === 0) {
    errors.push('L\'adresse de facturation est requise');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valide un formulaire de vente
 */
export const validateSaleForm = (data: any): ValidationResult => {
  const errors: string[] = [];
  
  // Client requis
  if (!data.client) {
    errors.push('Le client est requis');
  }
  
  // Lignes de vente
  if (!data.lignes || data.lignes.length === 0) {
    errors.push('Au moins un produit est requis');
  } else {
    data.lignes.forEach((ligne: any, index: number) => {
      if (!ligne.produit) {
        errors.push(`Ligne ${index + 1}: Produit requis`);
      }
      
      const quantiteValidation = validateQuantity(ligne.quantite);
      if (!quantiteValidation.isValid) {
        errors.push(`Ligne ${index + 1}: ${quantiteValidation.errors[0]}`);
      }
      
      const prixValidation = validatePrice(ligne.prix_unitaire);
      if (!prixValidation.isValid) {
        errors.push(`Ligne ${index + 1}: ${prixValidation.errors[0]}`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valide un formulaire de projet
 */
export const validateProjectForm = (data: any): ValidationResult => {
  const errors: string[] = [];
  
  // Nom requis
  if (!data.nom || data.nom.trim().length === 0) {
    errors.push('Le nom du projet est requis');
  }
  
  // Client requis
  if (!data.client) {
    errors.push('Le client est requis');
  }
  
  // Dates
  const dateDebutValidation = validateDate(data.date_debut);
  if (!dateDebutValidation.isValid) {
    errors.push('Date de début invalide');
  }
  
  const dateFinValidation = validateDate(data.date_fin_prevue);
  if (!dateFinValidation.isValid) {
    errors.push('Date de fin prévue invalide');
  }
  
  // Vérifier que date fin > date début
  if (data.date_debut && data.date_fin_prevue) {
    const debut = new Date(data.date_debut);
    const fin = new Date(data.date_fin_prevue);
    if (fin <= debut) {
      errors.push('La date de fin doit être postérieure à la date de début');
    }
  }
  
  // Budget
  const budgetValidation = validatePrice(data.budget_prevu);
  if (!budgetValidation.isValid) {
    errors.push(...budgetValidation.errors.map(e => `Budget: ${e}`));
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitise une chaîne de caractères
 */
export const sanitizeString = (str: string): string => {
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Supprime les scripts
    .replace(/<[^>]*>/g, '') // Supprime les balises HTML
    .trim();
};

/**
 * Valide une image
 */
export const validateImage = (file: File): ValidationResult => {
  const errors: string[] = [];
  
  // Type de fichier
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('Type de fichier non supporté. Utilisez JPEG, PNG, WebP ou GIF');
  }
  
  // Taille du fichier (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push('La taille du fichier ne peut pas dépasser 10MB');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valide un document
 */
export const validateDocument = (file: File): ValidationResult => {
  const errors: string[] = [];
  
  // Type de fichier
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    errors.push('Type de fichier non supporté');
  }
  
  // Taille du fichier (max 50MB)
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push('La taille du fichier ne peut pas dépasser 50MB');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valide un formulaire complet
 */
export const validateForm = (data: any, rules: Record<string, any>): ValidationResult => {
  const errors: string[] = [];
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = data[field];
    
    // Requis
    if (rule.required && (!value || (typeof value === 'string' && value.trim().length === 0))) {
      errors.push(`${rule.label || field} est requis`);
      return;
    }
    
    // Type
    if (value && rule.type) {
      switch (rule.type) {
        case 'email':
          const emailValidation = validateEmail(value);
          if (!emailValidation.isValid) {
            errors.push(...emailValidation.errors);
          }
          break;
        case 'phone':
          const phoneValidation = validatePhoneNumber(value);
          if (!phoneValidation.isValid) {
            errors.push(...phoneValidation.errors);
          }
          break;
        case 'price':
          const priceValidation = validatePrice(value);
          if (!priceValidation.isValid) {
            errors.push(...priceValidation.errors);
          }
          break;
        case 'quantity':
          const quantityValidation = validateQuantity(value);
          if (!quantityValidation.isValid) {
            errors.push(...quantityValidation.errors);
          }
          break;
        case 'date':
          const dateValidation = validateDate(value);
          if (!dateValidation.isValid) {
            errors.push(...dateValidation.errors);
          }
          break;
        case 'url':
          const urlValidation = validateUrl(value);
          if (!urlValidation.isValid) {
            errors.push(...urlValidation.errors);
          }
          break;
      }
    }
    
    // Longueur minimum
    if (value && rule.minLength && value.length < rule.minLength) {
      errors.push(`${rule.label || field} doit contenir au moins ${rule.minLength} caractères`);
    }
    
    // Longueur maximum
    if (value && rule.maxLength && value.length > rule.maxLength) {
      errors.push(`${rule.label || field} ne peut pas dépasser ${rule.maxLength} caractères`);
    }
    
    // Valeur minimum
    if (value && rule.min && value < rule.min) {
      errors.push(`${rule.label || field} doit être supérieur ou égal à ${rule.min}`);
    }
    
    // Valeur maximum
    if (value && rule.max && value > rule.max) {
      errors.push(`${rule.label || field} doit être inférieur ou égal à ${rule.max}`);
    }
    
    // Pattern personnalisé
    if (value && rule.pattern && !rule.pattern.test(value)) {
      errors.push(rule.patternMessage || `${rule.label || field} a un format invalide`);
    }
    
    // Validation personnalisée
    if (value && rule.custom) {
      const customValidation = rule.custom(value, data);
      if (!customValidation.isValid) {
        errors.push(...customValidation.errors);
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Règles de validation pour les formulaires courants
 */
export const VALIDATION_RULES = {
  product: {
    nom: { required: true, maxLength: 200, label: 'Nom' },
    description_courte: { required: true, maxLength: 500, label: 'Description courte' },
    sku: { required: true, type: 'sku', label: 'SKU' },
    prix_achat: { required: true, type: 'price', min: 0, label: 'Prix d\'achat' },
    prix_vente: { required: true, type: 'price', min: 0, label: 'Prix de vente' },
    stock_minimum: { required: true, type: 'quantity', min: 0, label: 'Stock minimum' },
    categorie: { required: true, label: 'Catégorie' },
  },
  
  customer: {
    nom: { required: true, maxLength: 100, label: 'Nom' },
    email: { required: true, type: 'email', label: 'Email' },
    telephone: { required: true, type: 'phone', label: 'Téléphone' },
    adresse_facturation: { required: true, label: 'Adresse de facturation' },
  },
  
  project: {
    nom: { required: true, maxLength: 200, label: 'Nom du projet' },
    description: { required: true, label: 'Description' },
    client: { required: true, label: 'Client' },
    date_debut: { required: true, type: 'date', label: 'Date de début' },
    date_fin_prevue: { required: true, type: 'date', label: 'Date de fin prévue' },
    budget_prevu: { required: true, type: 'price', min: 0, label: 'Budget prévu' },
  },
  
  sale: {
    client: { required: true, label: 'Client' },
    lignes: { 
      required: true, 
      label: 'Produits',
      custom: (value: any[]) => ({
        isValid: value && value.length > 0,
        errors: value && value.length > 0 ? [] : ['Au moins un produit est requis']
      })
    },
  },
};