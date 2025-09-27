import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Globe,
  Camera,
  Upload,
  DollarSign,
  Users,
  Palette,
  FileText,
  Shield,
  Calendar,
  Briefcase,
  Target,
  CheckCircle,
  Lock
} from 'lucide-react';
import AnimatedForm from './AnimatedForm';
import Button from '../ui/Button';
import * as yup from 'yup';

interface EntrepreneurFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
  loading?: boolean;
}

const EntrepreneurForm: React.FC<EntrepreneurFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  loading = false,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Informations personnelles
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    password: initialData?.password || '',
    confirmPassword: initialData?.confirmPassword || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    address: initialData?.address || '',
    bio: initialData?.bio || '',
    avatar: initialData?.avatar || null,
    
    // Informations entreprise
    companyName: initialData?.companyName || '',
    companyDescription: initialData?.companyDescription || '',
    sector: initialData?.sector || '',
    legalForm: initialData?.legalForm || '',
    siret: initialData?.siret || '',
    companyAddress: initialData?.companyAddress || '',
    companyPhone: initialData?.companyPhone || '',
    companyEmail: initialData?.companyEmail || '',
    website: initialData?.website || '',
    logo: initialData?.logo || null,
    
    // Configuration
    primaryColor: initialData?.primaryColor || '#3B82F6',
    secondaryColor: initialData?.secondaryColor || '#10B981',
    currency: initialData?.currency || 'XOF',
    timezone: initialData?.timezone || 'Africa/Dakar',
    language: initialData?.language || 'fr',
    
    // Business
    employeeCount: initialData?.employeeCount || 1,
    annualRevenue: initialData?.annualRevenue || '',
    subscriptionPlan: initialData?.subscriptionPlan || 'professional',
    businessGoals: initialData?.businessGoals || [],
    
    // Préférences
    notifications: {
      email: true,
      sms: false,
      push: true,
      marketing: false,
      ...initialData?.notifications,
    },
  });

  const steps = [
    {
      id: 1,
      title: 'Informations Personnelles',
      description: 'Vos informations de base',
      icon: <User className="w-5 h-5" />,
    },
    {
      id: 2,
      title: 'Entreprise',
      description: 'Détails de votre entreprise',
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      id: 3,
      title: 'Configuration',
      description: 'Paramètres et préférences',
      icon: <Palette className="w-5 h-5" />,
    },
    {
      id: 4,
      title: 'Finalisation',
      description: 'Vérification et validation',
      icon: <CheckCircle className="w-5 h-5" />,
    },
  ];

  // Schémas de validation par étape
  const validationSchemas = {
    1: yup.object({
      firstName: yup.string().required('Le prénom est requis').min(2, 'Minimum 2 caractères'),
      lastName: yup.string().required('Le nom est requis').min(2, 'Minimum 2 caractères'),
      email: yup.string().email('Email invalide').required('L\'email est requis'),
      phone: yup.string().required('Le téléphone est requis').matches(/^\+?[1-9]\d{1,14}$/, 'Format téléphone invalide'),
      password: yup.string().required('Le mot de passe est requis').min(6, 'Minimum 6 caractères'),
      confirmPassword: yup.string()
        .required('La confirmation du mot de passe est requise')
        .oneOf([yup.ref('password')], 'Les mots de passe ne correspondent pas'),
      address: yup.string().required('L\'adresse est requise'),
    }),
    2: yup.object({
      companyName: yup.string().required('Le nom de l\'entreprise est requis').min(2, 'Minimum 2 caractères'),
      companyDescription: yup.string().required('La description est requise').min(10, 'Minimum 10 caractères'),
      sector: yup.string().required('Le secteur d\'activité est requis'),
      companyAddress: yup.string().required('L\'adresse de l\'entreprise est requise'),
      companyPhone: yup.string().required('Le téléphone de l\'entreprise est requis'),
      companyEmail: yup.string().email('Email invalide').required('L\'email de l\'entreprise est requis'),
    }),
    3: yup.object({
      currency: yup.string().required('La devise est requise'),
      timezone: yup.string().required('Le fuseau horaire est requis'),
      language: yup.string().required('La langue est requise'),
      subscriptionPlan: yup.string().required('Le plan d\'abonnement est requis'),
    }),
  };

  // Champs par étape
  const stepFields = {
    1: [
      {
        name: 'firstName',
        label: 'Prénom',
        type: 'text' as const,
        placeholder: 'Ex: Marie',
        icon: <User className="w-4 h-4" />,
      },
      {
        name: 'lastName',
        label: 'Nom',
        type: 'text' as const,
        placeholder: 'Ex: Diallo',
        icon: <User className="w-4 h-4" />,
      },
      {
        name: 'email',
        label: 'Email Personnel',
        type: 'email' as const,
        placeholder: 'marie@email.sn',
        icon: <Mail className="w-4 h-4" />,
      },
      {
        name: 'phone',
        label: 'Téléphone Personnel',
        type: 'text' as const,
        placeholder: '+221 77 123 45 67',
        icon: <Phone className="w-4 h-4" />,
      },
      {
        name: 'password',
        label: 'Mot de passe',
        type: 'password' as const,
        placeholder: 'Choisissez un mot de passe sécurisé',
        icon: <Lock className="w-4 h-4" />,
      },
      {
        name: 'confirmPassword',
        label: 'Confirmer le mot de passe',
        type: 'password' as const,
        placeholder: 'Répétez votre mot de passe',
        icon: <Lock className="w-4 h-4" />,
      },
      {
        name: 'dateOfBirth',
        label: 'Date de Naissance',
        type: 'date' as const,
        icon: <Calendar className="w-4 h-4" />,
      },
      {
        name: 'address',
        label: 'Adresse Personnelle',
        type: 'textarea' as const,
        placeholder: 'Adresse complète...',
        rows: 3,
        icon: <MapPin className="w-4 h-4" />,
      },
      {
        name: 'bio',
        label: 'Biographie',
        type: 'textarea' as const,
        placeholder: 'Parlez-nous de vous et de votre parcours...',
        rows: 4,
        description: 'Décrivez votre expérience et vos motivations entrepreneuriales',
      },
      {
        name: 'avatar',
        label: 'Photo de Profil',
        type: 'file' as const,
        placeholder: 'Sélectionnez votre photo',
        icon: <Camera className="w-4 h-4" />,
      },
    ],
    2: [
      {
        name: 'companyName',
        label: 'Nom de l\'Entreprise',
        type: 'text' as const,
        placeholder: 'Ex: Boutique Marie Diallo',
        icon: <Building2 className="w-4 h-4" />,
      },
      {
        name: 'companyDescription',
        label: 'Description de l\'Entreprise',
        type: 'textarea' as const,
        placeholder: 'Décrivez votre activité, vos produits et services...',
        rows: 4,
        description: 'Cette description apparaîtra sur votre profil public',
      },
      {
        name: 'sector',
        label: 'Secteur d\'Activité',
        type: 'select' as const,
        options: [
          { label: 'Commerce Général', value: 'commerce_general' },
          { label: 'Commerce Alimentaire', value: 'commerce_alimentaire' },
          { label: 'Commerce Textile & Vêtements', value: 'commerce_textile' },
          { label: 'Commerce Électronique & High-Tech', value: 'commerce_electronique' },
          { label: 'Commerce Pharmaceutique', value: 'commerce_pharmaceutique' },
          { label: 'Commerce Automobile', value: 'commerce_automobile' },
          { label: 'Commerce Immobilier', value: 'commerce_immobilier' },
          { label: 'Commerce Artisanal', value: 'commerce_artisanat' },
          { label: 'Commerce Import/Export', value: 'commerce_import_export' },
          { label: 'Commerce de Détail', value: 'commerce_retail' },
          { label: 'Commerce de Gros', value: 'commerce_wholesale' },
          { label: 'Commerce en Ligne', value: 'commerce_online' },
          { label: 'Autre', value: 'autre' },
        ],
        icon: <Briefcase className="w-4 h-4" />,
      },
      {
        name: 'legalForm',
        label: 'Forme Juridique',
        type: 'select' as const,
        options: [
          { label: 'SARL', value: 'sarl' },
          { label: 'SA', value: 'sa' },
          { label: 'SAS', value: 'sas' },
          { label: 'EURL', value: 'eurl' },
          { label: 'Entreprise Individuelle', value: 'ei' },
          { label: 'Auto-entrepreneur', value: 'auto_entrepreneur' },
          { label: 'Association', value: 'association' },
          { label: 'Autre', value: 'autre' },
        ],
        icon: <Shield className="w-4 h-4" />,
      },
      {
        name: 'siret',
        label: 'SIRET/NINEA',
        type: 'text' as const,
        placeholder: 'Ex: SN123456789',
        description: 'Numéro d\'identification de votre entreprise',
      },
      {
        name: 'companyAddress',
        label: 'Adresse de l\'Entreprise',
        type: 'textarea' as const,
        placeholder: 'Adresse complète de votre entreprise...',
        rows: 3,
        icon: <MapPin className="w-4 h-4" />,
      },
      {
        name: 'companyPhone',
        label: 'Téléphone Entreprise',
        type: 'text' as const,
        placeholder: '+221 33 123 45 67',
        icon: <Phone className="w-4 h-4" />,
      },
      {
        name: 'companyEmail',
        label: 'Email Entreprise',
        type: 'email' as const,
        placeholder: 'contact@monentreprise.sn',
        icon: <Mail className="w-4 h-4" />,
      },
      {
        name: 'website',
        label: 'Site Web',
        type: 'text' as const,
        placeholder: 'https://monentreprise.sn',
        icon: <Globe className="w-4 h-4" />,
        description: 'Optionnel - URL de votre site web',
      },
      {
        name: 'logo',
        label: 'Logo de l\'Entreprise',
        type: 'file' as const,
        placeholder: 'Sélectionnez votre logo',
        icon: <Upload className="w-4 h-4" />,
        description: 'Format recommandé: PNG/JPG, 200x200px minimum',
      },
    ],
    3: [
      {
        name: 'primaryColor',
        label: 'Couleur Primaire',
        type: 'color' as const,
        description: 'Couleur principale de votre marque',
      },
      {
        name: 'secondaryColor',
        label: 'Couleur Secondaire',
        type: 'color' as const,
        description: 'Couleur secondaire pour les accents',
      },
      {
        name: 'currency',
        label: 'Devise Principale',
        type: 'select' as const,
        options: [
          { label: 'Franc CFA (XOF)', value: 'XOF' },
          { label: 'Euro (EUR)', value: 'EUR' },
          { label: 'Dollar US (USD)', value: 'USD' },
          { label: 'Livre Sterling (GBP)', value: 'GBP' },
        ],
        icon: <DollarSign className="w-4 h-4" />,
      },
      {
        name: 'timezone',
        label: 'Fuseau Horaire',
        type: 'select' as const,
        options: [
          { label: 'Dakar (GMT+0)', value: 'Africa/Dakar' },
          { label: 'Casablanca (GMT+1)', value: 'Africa/Casablanca' },
          { label: 'Paris (GMT+1)', value: 'Europe/Paris' },
          { label: 'New York (GMT-5)', value: 'America/New_York' },
        ],
        icon: <Globe className="w-4 h-4" />,
      },
      {
        name: 'language',
        label: 'Langue par Défaut',
        type: 'select' as const,
        options: [
          { label: 'Français', value: 'fr' },
          { label: 'English', value: 'en' },
          { label: 'العربية', value: 'ar' },
          { label: 'Wolof', value: 'wo' },
        ],
        icon: <Globe className="w-4 h-4" />,
      },
      {
        name: 'employeeCount',
        label: 'Nombre d\'Employés',
        type: 'select' as const,
        options: [
          { label: '1 (Seul)', value: 1 },
          { label: '2-5 employés', value: 5 },
          { label: '6-10 employés', value: 10 },
          { label: '11-25 employés', value: 25 },
          { label: '26-50 employés', value: 50 },
          { label: '50+ employés', value: 100 },
        ],
        icon: <Users className="w-4 h-4" />,
      },
      {
        name: 'annualRevenue',
        label: 'Chiffre d\'Affaires Annuel Estimé',
        type: 'select' as const,
        options: [
          { label: 'Moins de 10M XOF', value: '10000000' },
          { label: '10M - 50M XOF', value: '50000000' },
          { label: '50M - 100M XOF', value: '100000000' },
          { label: '100M - 500M XOF', value: '500000000' },
          { label: 'Plus de 500M XOF', value: '1000000000' },
        ],
        icon: <DollarSign className="w-4 h-4" />,
      },
      {
        name: 'subscriptionPlan',
        label: 'Plan d\'Abonnement',
        type: 'select' as const,
        options: [
          { label: 'Starter - 15,000 XOF/mois', value: 'starter' },
          { label: 'Professional - 35,000 XOF/mois (Recommandé)', value: 'professional' },
          { label: 'Enterprise - 75,000 XOF/mois', value: 'enterprise' },
        ],
        icon: <Target className="w-4 h-4" />,
        description: 'Vous pourrez changer de plan à tout moment',
      },
      {
        name: 'domaine_expertise',
        label: 'Domaine d\'Expertise',
        type: 'textarea' as const,
        placeholder: 'Décrivez votre domaine d\'expertise et vos compétences...',
        rows: 3,
        description: 'Vos compétences et spécialisations principales',
      },
    ],
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepSubmit = (data: any) => {
    setFormData(prev => ({ ...prev, ...data }));
    
    if (currentStep === steps.length) {
      // Dernière étape - soumettre tout
      onSubmit({ ...formData, ...data });
    } else {
      nextStep();
    }
  };

  const renderStepContent = () => {
    const currentFields = stepFields[currentStep as keyof typeof stepFields];
    const currentSchema = validationSchemas[currentStep as keyof typeof validationSchemas];

    return (
      <AnimatedForm
        fields={currentFields}
        validationSchema={currentSchema}
        defaultValues={formData}
        onSubmit={handleStepSubmit}
        columns={currentStep === 3 ? 2 : 1}
        submitLabel={currentStep === steps.length ? 'Créer le Compte' : 'Continuer'}
        loading={loading && currentStep === steps.length}
      />
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-electric-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <img 
                  src="/logo.svg" 
                  alt="OCASS DIGITAL Logo" 
                  className="w-8 h-8"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Créer un Compte Entrepreneur</h1>
                <p className="opacity-90 mt-1">
                  Rejoignez notre plateforme commerciale révolutionnaire
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-75">Étape {currentStep} sur {steps.length}</p>
              <div className="w-24 h-2 bg-white/20 rounded-full mt-1">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Steps Navigation */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <motion.div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                    ${currentStep >= step.id
                      ? 'bg-primary-500 text-white shadow-lg'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-500'
                    }
                  `}
                  whileHover={{ scale: 1.1 }}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                </motion.div>
                
                <div className="ml-3 hidden md:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-gray-900 dark:text-white' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`
                    hidden md:block w-16 h-0.5 mx-4 transition-colors duration-300
                    ${currentStep > step.id ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-600'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 4 ? (
                // Étape de finalisation
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Vérifiez vos Informations
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Vérifiez que toutes les informations sont correctes avant de créer votre compte
                    </p>
                  </div>

                  {/* Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Info */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Informations Personnelles
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Nom</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formData.firstName} {formData.lastName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Email</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formData.email}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Téléphone</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formData.phone}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Company Info */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Entreprise
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Nom</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formData.companyName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Secteur</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formData.sector}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Plan</span>
                          <span className="text-sm font-medium text-primary-600">
                            {formData.subscriptionPlan}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between">
                    <Button variant="secondary" onClick={prevStep}>
                      Retour
                    </Button>
                    <Button 
                      variant="primary" 
                      loading={loading}
                      onClick={() => onSubmit(formData)}
                      icon={<CheckCircle className="w-4 h-4" />}
                    >
                      Créer mon Compte
                    </Button>
                  </div>
                </div>
              ) : (
                // Étapes de formulaire
                <div>
                  {renderStepContent()}
                  
                  {/* Navigation */}
                  <div className="flex justify-between mt-6">
                    <Button 
                      variant="secondary" 
                      onClick={currentStep === 1 ? onCancel : prevStep}
                    >
                      {currentStep === 1 ? 'Annuler' : 'Retour'}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default EntrepreneurForm;