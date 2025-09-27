import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, ArrowRight } from 'lucide-react';
import EntrepreneurForm from '../../components/forms/EntrepreneurForm';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import apiService from '../../services/api/realApi';
import * as yup from 'yup';

const RegisterPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'entrepreneur' | 'client'>('entrepreneur');
  const [showEntrepreneurForm, setShowEntrepreneurForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clientFormData, setClientFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  // Gestion sécurisée des contextes
  let login, addNotification;
  try {
    const authContext = useAuth();
    const notificationContext = useNotifications();
    login = authContext.login;
    addNotification = notificationContext.addNotification;
  } catch (error) {
    console.error('Auth/Notification context not available:', error);
    // Fonctions de fallback
    login = async () => false;
    addNotification = () => {};
  }
  const navigate = useNavigate();

  // Schémas de validation Yup
  const clientValidationSchema = yup.object({
    firstName: yup
      .string()
      .required('Le prénom est requis')
      .min(2, 'Le prénom doit contenir au moins 2 caractères')
      .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
      .matches(/^[a-zA-ZàâäéèêëïîôöùûüÿçñÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇÑ\s-']+$/, 'Le prénom ne peut contenir que des lettres'),
    lastName: yup
      .string()
      .required('Le nom est requis')
      .min(2, 'Le nom doit contenir au moins 2 caractères')
      .max(50, 'Le nom ne peut pas dépasser 50 caractères')
      .matches(/^[a-zA-ZàâäéèêëïîôöùûüÿçñÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇÑ\s-']+$/, 'Le nom ne peut contenir que des lettres'),
    email: yup
      .string()
      .required('L\'email est requis')
      .email('Format d\'email invalide')
      .max(100, 'L\'email ne peut pas dépasser 100 caractères')
      .test('email-unique', 'Cet email est déjà utilisé', async function(value) {
        if (!value) return true;
        // Vérification d'unicité (simulation)
        return true;
      }),
    phone: yup
      .string()
      .required('Le téléphone est requis')
      .matches(/^[0-9+\-\s()]+$/, 'Format de téléphone invalide')
      .min(8, 'Le téléphone doit contenir au moins 8 caractères')
      .max(20, 'Le téléphone ne peut pas dépasser 20 caractères')
      .test('phone-unique', 'Ce téléphone est déjà utilisé', async function(value) {
        if (!value) return true;
        // Vérification d'unicité (simulation)
        return true;
      }),
    password: yup
      .string()
      .required('Le mot de passe est requis')
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .max(128, 'Le mot de passe ne peut pas dépasser 128 caractères')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
    confirmPassword: yup
      .string()
      .required('La confirmation du mot de passe est requise')
      .oneOf([yup.ref('password')], 'Les mots de passe ne correspondent pas')
  });

  // Fonction de validation des types de données
  const validateDataTypes = (data: any) => {
    const errors: string[] = [];
    
    if (data.firstName && typeof data.firstName !== 'string') {
      errors.push('Le prénom doit être une chaîne de caractères');
    }
    if (data.lastName && typeof data.lastName !== 'string') {
      errors.push('Le nom doit être une chaîne de caractères');
    }
    if (data.email && typeof data.email !== 'string') {
      errors.push('L\'email doit être une chaîne de caractères');
    }
    if (data.phone && typeof data.phone !== 'string') {
      errors.push('Le téléphone doit être une chaîne de caractères');
    }
    if (data.password && typeof data.password !== 'string') {
      errors.push('Le mot de passe doit être une chaîne de caractères');
    }
    
    return errors;
  };

  const entrepreneurValidationSchema = yup.object({
    // Données utilisateur
    firstName: yup
      .string()
      .required('Le prénom est requis')
      .min(2, 'Le prénom doit contenir au moins 2 caractères')
      .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
      .matches(/^[a-zA-ZàâäéèêëïîôöùûüÿçñÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇÑ\s-']+$/, 'Le prénom ne peut contenir que des lettres'),
    lastName: yup
      .string()
      .required('Le nom est requis')
      .min(2, 'Le nom doit contenir au moins 2 caractères')
      .max(50, 'Le nom ne peut pas dépasser 50 caractères')
      .matches(/^[a-zA-ZàâäéèêëïîôöùûüÿçñÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇÑ\s-']+$/, 'Le nom ne peut contenir que des lettres'),
    email: yup
      .string()
      .required('L\'email est requis')
      .email('Format d\'email invalide')
      .max(100, 'L\'email ne peut pas dépasser 100 caractères'),
    phone: yup
      .string()
      .required('Le téléphone est requis')
      .matches(/^[0-9+\-\s()]+$/, 'Format de téléphone invalide')
      .min(8, 'Le téléphone doit contenir au moins 8 caractères')
      .max(20, 'Le téléphone ne peut pas dépasser 20 caractères'),
    password: yup
      .string()
      .required('Le mot de passe est requis')
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .max(128, 'Le mot de passe ne peut pas dépasser 128 caractères')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
    confirmPassword: yup
      .string()
      .required('La confirmation du mot de passe est requise')
      .oneOf([yup.ref('password')], 'Les mots de passe ne correspondent pas'),
    
    // Données entreprise
    companyName: yup
      .string()
      .required('Le nom de l\'entreprise est requis')
      .min(2, 'Le nom de l\'entreprise doit contenir au moins 2 caractères')
      .max(100, 'Le nom de l\'entreprise ne peut pas dépasser 100 caractères'),
    companyDescription: yup
      .string()
      .required('La description de l\'entreprise est requise')
      .min(10, 'La description doit contenir au moins 10 caractères')
      .max(500, 'La description ne peut pas dépasser 500 caractères'),
    sector: yup
      .string()
      .required('Le secteur d\'activité est requis')
      .oneOf(['agriculture', 'commerce', 'services', 'industrie', 'technologie', 'autre'], 'Secteur d\'activité invalide'),
    legalForm: yup
      .string()
      .required('La forme juridique est requise')
      .oneOf(['SARL', 'SA', 'SAS', 'EURL', 'SNC', 'autre'], 'Forme juridique invalide'),
    siret: yup
      .string()
      .matches(/^[0-9]{14}$/, 'Le SIRET doit contenir exactement 14 chiffres'),
    companyAddress: yup
      .string()
      .required('L\'adresse de l\'entreprise est requise')
      .min(10, 'L\'adresse doit contenir au moins 10 caractères')
      .max(200, 'L\'adresse ne peut pas dépasser 200 caractères'),
    companyPhone: yup
      .string()
      .required('Le téléphone de l\'entreprise est requis')
      .matches(/^[0-9+\-\s()]+$/, 'Format de téléphone invalide')
      .min(8, 'Le téléphone doit contenir au moins 8 caractères')
      .max(20, 'Le téléphone ne peut pas dépasser 20 caractères'),
    companyEmail: yup
      .string()
      .required('L\'email de l\'entreprise est requis')
      .email('Format d\'email invalide')
      .max(100, 'L\'email ne peut pas dépasser 100 caractères'),
    website: yup
      .string()
      .url('Format d\'URL invalide')
      .max(200, 'L\'URL ne peut pas dépasser 200 caractères')
  });

  const handleEntrepreneurSubmit = async (data: any) => {
    setLoading(true);
    
    try {
      // Validation avec Yup
      await entrepreneurValidationSchema.validate(data, { abortEarly: false });
      
      // Validation des types de données
      const typeErrors = validateDataTypes(data);
      if (typeErrors.length > 0) {
        addNotification({
          type: 'error',
          title: 'Erreurs de validation',
          message: typeErrors.join('\n'),
        });
        return;
      }
      
      // Validation des champs obligatoires
      if (!data.email || !data.firstName || !data.lastName || !data.phone || !data.password) {
        addNotification({
          type: 'error',
          title: 'Champs manquants',
          message: 'Veuillez remplir tous les champs obligatoires',
        });
        return;
      }
      
      if (data.password !== data.confirmPassword) {
        addNotification({
          type: 'error',
          title: 'Mots de passe différents',
          message: 'Les mots de passe ne correspondent pas',
        });
        return;
      }
      
      if (data.password.length < 8) {
        addNotification({
          type: 'error',
          title: 'Mot de passe trop court',
          message: 'Le mot de passe doit contenir au moins 8 caractères',
        });
        return;
      }
      
      const entrepreneurData = {
        // Données utilisateur
        email: data.email.trim(),
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone: data.phone.trim(),
        type_utilisateur: 'entrepreneur',
        password: data.password,
        confirmPassword: data.confirmPassword,
        
        // Données entreprise
        entreprise: {
          nom: data.companyName?.trim() || 'Entreprise',
          description: data.companyDescription?.trim() || 'Description de l\'entreprise',
          secteur_activite: data.sector || 'Commerce',
          forme_juridique: data.legalForm || 'SARL',
          siret: data.siret?.trim() || null,
          adresse_complete: data.companyAddress?.trim() || 'Adresse non renseignée',
          telephone: data.companyPhone?.trim() || data.phone,
          email: data.companyEmail?.trim() || data.email,
          site_web: data.website?.trim() || null,
          couleur_primaire: data.primaryColor || '#3B82F6',
          couleur_secondaire: data.secondaryColor || '#1E40AF',
          devise_principale: data.currency || 'XOF',
          fuseau_horaire: data.timezone || 'Africa/Dakar',
          nombre_employes: data.employeeCount || 1,
          chiffre_affaires_annuel: data.annualRevenue || 0,
        },
        
        // Préférences
        langue: data.language || 'fr',
        theme_interface: 'light',
        preferences_notifications: data.notifications || true,
      };
      
      console.log('Données d\'inscription entrepreneur:', entrepreneurData);
      
      const response = await apiService.register(entrepreneurData);
      console.log('Réponse d\'inscription:', response);
      
      addNotification({
        type: 'success',
        title: 'Compte créé avec succès !',
        message: 'Bienvenue sur la plateforme commerciale OCASS DIGITAL',
      });
      
      // Auto-login après inscription
      await login(data.email, data.password, 'entrepreneur');
      navigate('/entrepreneur');
      
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription entrepreneur:', error);
      
      // Gestion des erreurs de validation Yup
      if (error.name === 'ValidationError') {
        const validationErrors = error.inner.map((err: any) => err.message).join('\n');
        addNotification({
          type: 'error',
          title: 'Erreurs de validation',
          message: validationErrors,
        });
        return;
      }
      
      let errorMessage = 'Erreur lors de la création du compte';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        console.log('Données d\'erreur:', errorData);
        
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors.join(', ');
        } else {
          // Afficher les erreurs de validation par champ
          const fieldErrors = Object.entries(errorData)
            .map(([field, messages]: [string, any]) => {
              const fieldName = field === 'first_name' ? 'prénom' : 
                               field === 'last_name' ? 'nom' :
                               field === 'telephone' ? 'téléphone' :
                               field === 'confirm_password' ? 'confirmation du mot de passe' : field;
              
              if (Array.isArray(messages)) {
                return `${fieldName}: ${messages.join(', ')}`;
              }
              return `${fieldName}: ${messages}`;
            })
            .join('\n');
          
          if (fieldErrors) {
            errorMessage = `Erreurs de validation:\n${fieldErrors}`;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      addNotification({
        type: 'error',
        title: 'Erreur lors de la création',
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validation avec Yup
      await clientValidationSchema.validate(clientFormData, { abortEarly: false });
      
      // Validation des types de données
      const typeErrors = validateDataTypes(clientFormData);
      if (typeErrors.length > 0) {
        addNotification({
          type: 'error',
          title: 'Erreurs de validation',
          message: typeErrors.join('\n'),
        });
        return;
      }
      
      // Validation des champs obligatoires
      if (!clientFormData.email || !clientFormData.firstName || !clientFormData.lastName || !clientFormData.phone || !clientFormData.password) {
        addNotification({
          type: 'error',
          title: 'Champs manquants',
          message: 'Veuillez remplir tous les champs obligatoires',
        });
        return;
      }
      
      if (clientFormData.password !== clientFormData.confirmPassword) {
        addNotification({
          type: 'error',
          title: 'Mots de passe différents',
          message: 'Les mots de passe ne correspondent pas',
        });
        return;
      }
      
      if (clientFormData.password.length < 8) {
        addNotification({
          type: 'error',
          title: 'Mot de passe trop court',
          message: 'Le mot de passe doit contenir au moins 8 caractères',
        });
        return;
      }
      
      const clientData = {
        email: clientFormData.email.trim(),
        firstName: clientFormData.firstName.trim(),
        lastName: clientFormData.lastName.trim(),
        phone: clientFormData.phone.trim(),
        type_utilisateur: 'client',
        password: clientFormData.password,
        confirmPassword: clientFormData.confirmPassword,
      };
      
      console.log('Données d\'inscription client:', clientData);
      
      const response = await apiService.register(clientData);
      console.log('Réponse d\'inscription client:', response);
      
      addNotification({
        type: 'success',
        title: 'Compte créé avec succès !',
        message: 'Bienvenue sur notre marketplace',
      });
      
      // Auto-login après inscription
      await login(clientFormData.email, clientFormData.password, 'client');
      navigate('/client');
      
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription client:', error);
      
      // Gestion des erreurs de validation Yup
      if (error.name === 'ValidationError') {
        const validationErrors = error.inner.map((err: any) => err.message).join('\n');
        addNotification({
          type: 'error',
          title: 'Erreurs de validation',
          message: validationErrors,
        });
        return;
      }
      
      let errorMessage = 'Erreur lors de la création du compte';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        console.log('Données d\'erreur:', errorData);
        
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors.join(', ');
        } else {
          // Afficher les erreurs de validation par champ
          const fieldErrors = Object.entries(errorData)
            .map(([field, messages]: [string, any]) => {
              const fieldName = field === 'first_name' ? 'prénom' : 
                               field === 'last_name' ? 'nom' :
                               field === 'telephone' ? 'téléphone' :
                               field === 'confirm_password' ? 'confirmation du mot de passe' : field;
              
              if (Array.isArray(messages)) {
                return `${fieldName}: ${messages.join(', ')}`;
              }
              return `${fieldName}: ${messages}`;
            })
            .join('\n');
          
          if (fieldErrors) {
            errorMessage = `Erreurs de validation:\n${fieldErrors}`;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      addNotification({
        type: 'error',
        title: 'Erreur lors de la création',
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  if (showEntrepreneurForm) {
    return (
      <EntrepreneurForm
        onSubmit={handleEntrepreneurSubmit}
        onCancel={() => setShowEntrepreneurForm(false)}
        loading={loading}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-0">
      <div className="w-full max-w-none" style={{ width: '90vw', maxWidth: 'none', minWidth: '90vw' }}>
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="glass-morphism rounded-3xl p-4 shadow-2xl w-full"
        >
          <div className="flex w-full h-full" style={{ gap: '8px', width: '100%' }}>
            {/* Section Vidéo - 2/3 du bloc */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="hidden lg:flex relative overflow-hidden"
              style={{ width: 'calc(75% - 2px)' }}
            >
              <div className="w-full h-full rounded-3xl overflow-hidden">
                {/* Vidéo illustrative */}
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover rounded-3xl"
                >
                  <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
                  <source src="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4" type="video/mp4" />
                </video>
                {/* Image de fallback si la vidéo ne charge pas */}
                <img 
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                  alt="OCASS DIGITAL Business" 
                  className="w-full h-full object-cover absolute inset-0"
                />
                
                {/* Overlay avec contenu */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60 flex flex-col justify-center items-center text-white p-8">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    className="w-24 h-24 mb-8 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl"
                  >
                    <img 
                      src="/logo.svg" 
                      alt="OCASS DIGITAL Logo" 
                      className="w-16 h-16"
                    />
                  </motion.div>
                  
                  <motion.h1
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-5xl font-bold mb-6 text-center"
                  >
                    REJOIGNEZ-NOUS
                  </motion.h1>
                  
                  <motion.p
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-xl text-center mb-8 max-w-md"
                  >
                    Créez votre compte et démarrez votre aventure commerciale avec OCASS DIGITAL
                  </motion.p>
                  
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="grid grid-cols-2 gap-6 text-center"
                  >
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                      <div className="text-3xl mb-2">💼</div>
                      <h3 className="font-semibold mb-2">Entrepreneur</h3>
                      <p className="text-sm opacity-90">Gérez votre business</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                      <div className="text-3xl mb-2">🛍️</div>
                      <h3 className="font-semibold mb-2">Client</h3>
                      <p className="text-sm opacity-90">Découvrez et achetez</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Section Formulaire - 1/3 du bloc */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full"
              style={{ width: 'calc(25% - 2px)' }}
            >
              <div className="glass-morphism rounded-3xl p-4 shadow-2xl h-full flex flex-col justify-center min-h-[800px] overflow-y-auto">
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-primary-500 to-electric-500 flex items-center justify-center shadow-lg"
        >
          <img 
            src="/logo.svg" 
            alt="OCASS DIGITAL Logo" 
            className="w-12 h-12"
          />
        </motion.div>
        
        <h1 className="text-3xl font-bold gradient-text mb-2">
          Créer un compte
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
                Rejoignez notre plateforme
        </p>
      </div>

      {/* Role Selection */}
      <div className="space-y-4 w-full">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
            Choisissez votre type de compte
          </h3>
          
          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowEntrepreneurForm(true)}
              className="w-full p-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-3xl">
                  
                </div>
                <div className="text-left">
                  <h4 className="text-xl font-bold mb-1">Entrepreneur</h4>
                  <p className="text-sm opacity-90">
                    Gérez votre entreprise, vendez vos produits et développez votre activité
                  </p>
                 
                </div>
                <ArrowRight className="w-6 h-6 ml-auto" />
              </div>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedRole('client')}
              className="w-full p-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-3xl">
                  
                </div>
                <div className="text-left">
                  <h4 className="text-xl font-bold mb-1">Client</h4>
                  <p className="text-sm opacity-90">
                    Découvrez et achetez des produits authentiques du Sénégal
                  </p>
                 
                </div>
                <ArrowRight className="w-6 h-6 ml-auto" />
              </div>
            </motion.button>
          </div>
        </div>

        {/* Client Quick Form */}
        {selectedRole === 'client' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h4 className="font-semibold text-gray-900 dark:text-white text-center">
              Inscription Client Rapide
            </h4>
            
            <form onSubmit={handleClientSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Prénom"
                  value={clientFormData.firstName}
                  onChange={(e) => setClientFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="input-premium w-full"
                  required
                />
                <input
                  type="text"
                  placeholder="Nom"
                  value={clientFormData.lastName}
                  onChange={(e) => setClientFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="input-premium w-full"
                  required
                />
              </div>
              
              <input
                type="email"
                placeholder="Email"
                value={clientFormData.email}
                onChange={(e) => setClientFormData(prev => ({ ...prev, email: e.target.value }))}
                className="input-premium w-full"
                required
              />
              
              <input
                type="tel"
                placeholder="Téléphone (+221 77 123 45 67)"
                value={clientFormData.phone}
                onChange={(e) => setClientFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="input-premium w-full"
                required
              />
              
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="password"
                  placeholder="Mot de passe"
                  value={clientFormData.password}
                  onChange={(e) => setClientFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="input-premium w-full"
                  required
                />
                <input
                  type="password"
                  placeholder="Confirmer"
                  value={clientFormData.confirmPassword}
                  onChange={(e) => setClientFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="input-premium w-full"
                  required
                />
              </div>
              
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  required
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  J'accepte les conditions d'utilisation et la politique de confidentialité
                </span>
              </label>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                icon={<User className="w-4 h-4" />}
              >
                {loading ? 'Création...' : 'Créer mon Compte Client'}
              </Button>
            </form>
          </motion.div>
        )}
      </div>

      {/* Login Link */}
      <div className="text-center mt-6">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Déjà un compte ?{' '}
        </span>
        <Link
          to="/auth/login"
          className="text-sm text-primary-600 hover:text-primary-500 font-medium transition-colors"
        >
          Se connecter
        </Link>
      </div>
              </div>
            </motion.div>
      </div>
    </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;