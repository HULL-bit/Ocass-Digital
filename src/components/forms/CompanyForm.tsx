import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Upload, X, MapPin, Phone, Mail, Globe } from 'lucide-react';
import Button from '../ui/Button';
import * as yup from 'yup';

interface CompanyFormData {
  nom: string;
  nom_commercial: string;
  secteur_activite: string;
  description: string;
  telephone: string;
  email: string;
  site_web: string;
  adresse_complete: string;
  ville: string;
  region: string;
  pays: string;
  code_postal: string;
  siret: string;
  tva_intracommunautaire: string;
  forme_juridique: string;
  logo: File | null;
  couleur_primaire: string;
  couleur_secondaire: string;
  devise_principale: string;
  fuseau_horaire: string;
  nombre_employes: number;
  chiffre_affaires_annuel: number;
}

interface CompanyFormProps {
  onSubmit: (data: CompanyFormData) => void;
  onCancel: () => void;
  initialData?: Partial<CompanyFormData>;
  loading?: boolean;
}

const CompanyForm: React.FC<CompanyFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {},
  loading = false
}) => {
  const [formData, setFormData] = useState<CompanyFormData>({
    nom: '',
    nom_commercial: '',
    secteur_activite: '',
    description: '',
    telephone: '',
    email: '',
    site_web: '',
    adresse_complete: '',
    ville: '',
    region: '',
    pays: 'Sénégal',
    code_postal: '',
    siret: '',
    tva_intracommunautaire: '',
    forme_juridique: '',
    logo: null,
    couleur_primaire: '#3B82F6',
    couleur_secondaire: '#10B981',
    devise_principale: 'XOF',
    fuseau_horaire: 'Africa/Dakar',
    nombre_employes: 1,
    chiffre_affaires_annuel: 0,
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validationSchema = yup.object().shape({
    nom: yup.string().required('Le nom de l\'entreprise est requis'),
    secteur_activite: yup.string().required('Le secteur d\'activité est requis'),
    telephone: yup.string().required('Le téléphone est requis'),
    email: yup.string().email('Email invalide').required('L\'email est requis'),
    adresse_complete: yup.string().required('L\'adresse est requise'),
    ville: yup.string().required('La ville est requise'),
    region: yup.string().required('La région est requise'),
    nombre_employes: yup.number().min(1, 'Au moins 1 employé requis').required('Le nombre d\'employés est requis'),
  });

  const handleInputChange = (field: keyof CompanyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, logo: file }));
    }
  };

  const removeLogo = () => {
    setFormData(prev => ({ ...prev, logo: null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await validationSchema.validate(formData, { abortEarly: false });
      setErrors({});
      onSubmit(formData);
    } catch (err: any) {
      const newErrors: Record<string, string> = {};
      err.inner.forEach((error: any) => {
        newErrors[error.path] = error.message;
      });
      setErrors(newErrors);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-500 to-electric-500 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold gradient-text">Créer une Entreprise</h2>
            <p className="text-gray-600 dark:text-gray-300">Remplissez les informations de votre entreprise</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom de l'entreprise *
            </label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => handleInputChange('nom', e.target.value)}
              className={`input-premium w-full ${errors.nom ? 'border-red-500' : ''}`}
              placeholder="Ex: Mon Entreprise SARL"
            />
            {errors.nom && <p className="text-red-500 text-sm mt-1">{errors.nom}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom commercial
            </label>
            <input
              type="text"
              value={formData.nom_commercial}
              onChange={(e) => handleInputChange('nom_commercial', e.target.value)}
              className="input-premium w-full"
              placeholder="Ex: Mon Commerce"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Secteur d'activité *
            </label>
            <select
              value={formData.secteur_activite}
              onChange={(e) => handleInputChange('secteur_activite', e.target.value)}
              className={`input-premium w-full ${errors.secteur_activite ? 'border-red-500' : ''}`}
            >
              <option value="">Sélectionner un secteur</option>
              <option value="commerce_general">Commerce Général</option>
              <option value="commerce_alimentaire">Commerce Alimentaire</option>
              <option value="commerce_textile">Commerce Textile & Vêtements</option>
              <option value="commerce_electronique">Commerce Électronique & High-Tech</option>
              <option value="commerce_pharmaceutique">Commerce Pharmaceutique</option>
              <option value="commerce_automobile">Commerce Automobile</option>
              <option value="commerce_immobilier">Commerce Immobilier</option>
              <option value="commerce_artisanat">Commerce Artisanal</option>
              <option value="commerce_import_export">Commerce Import/Export</option>
              <option value="commerce_retail">Commerce de Détail</option>
              <option value="commerce_wholesale">Commerce de Gros</option>
              <option value="commerce_online">Commerce en Ligne</option>
              <option value="autre">Autre</option>
            </select>
            {errors.secteur_activite && <p className="text-red-500 text-sm mt-1">{errors.secteur_activite}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Forme juridique
            </label>
            <select
              value={formData.forme_juridique}
              onChange={(e) => handleInputChange('forme_juridique', e.target.value)}
              className="input-premium w-full"
            >
              <option value="">Sélectionner une forme</option>
              <option value="sarl">SARL</option>
              <option value="sa">SA</option>
              <option value="sas">SAS</option>
              <option value="eurl">EURL</option>
              <option value="ei">Entreprise Individuelle</option>
              <option value="auto_entrepreneur">Auto-entrepreneur</option>
              <option value="association">Association</option>
              <option value="autre">Autre</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="input-premium w-full h-24 resize-none"
            placeholder="Décrivez votre entreprise..."
          />
        </div>

        {/* Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Téléphone *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={formData.telephone}
                onChange={(e) => handleInputChange('telephone', e.target.value)}
                className={`input-premium w-full pl-10 ${errors.telephone ? 'border-red-500' : ''}`}
                placeholder="+221 XX XXX XX XX"
              />
            </div>
            {errors.telephone && <p className="text-red-500 text-sm mt-1">{errors.telephone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`input-premium w-full pl-10 ${errors.email ? 'border-red-500' : ''}`}
                placeholder="contact@entreprise.com"
              />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Site web
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="url"
              value={formData.site_web}
              onChange={(e) => handleInputChange('site_web', e.target.value)}
              className="input-premium w-full pl-10"
              placeholder="https://www.entreprise.com"
            />
          </div>
        </div>

        {/* Adresse */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Adresse complète *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={formData.adresse_complete}
              onChange={(e) => handleInputChange('adresse_complete', e.target.value)}
              className={`input-premium w-full pl-10 ${errors.adresse_complete ? 'border-red-500' : ''}`}
              placeholder="Rue, Avenue, etc."
            />
          </div>
          {errors.adresse_complete && <p className="text-red-500 text-sm mt-1">{errors.adresse_complete}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ville *
            </label>
            <input
              type="text"
              value={formData.ville}
              onChange={(e) => handleInputChange('ville', e.target.value)}
              className={`input-premium w-full ${errors.ville ? 'border-red-500' : ''}`}
              placeholder="Dakar"
            />
            {errors.ville && <p className="text-red-500 text-sm mt-1">{errors.ville}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Région *
            </label>
            <input
              type="text"
              value={formData.region}
              onChange={(e) => handleInputChange('region', e.target.value)}
              className={`input-premium w-full ${errors.region ? 'border-red-500' : ''}`}
              placeholder="Dakar"
            />
            {errors.region && <p className="text-red-500 text-sm mt-1">{errors.region}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Code postal
            </label>
            <input
              type="text"
              value={formData.code_postal}
              onChange={(e) => handleInputChange('code_postal', e.target.value)}
              className="input-premium w-full"
              placeholder="10000"
            />
          </div>
        </div>

        {/* Informations légales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              SIRET/NINEA
            </label>
            <input
              type="text"
              value={formData.siret}
              onChange={(e) => handleInputChange('siret', e.target.value)}
              className="input-premium w-full"
              placeholder="12345678901234"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              TVA intracommunautaire
            </label>
            <input
              type="text"
              value={formData.tva_intracommunautaire}
              onChange={(e) => handleInputChange('tva_intracommunautaire', e.target.value)}
              className="input-premium w-full"
              placeholder="SN123456789"
            />
          </div>
        </div>

        {/* Logo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Logo de l'entreprise
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            {formData.logo ? (
              <div className="space-y-4">
                <img
                  src={URL.createObjectURL(formData.logo)}
                  alt="Logo preview"
                  className="w-24 h-24 object-cover rounded-lg mx-auto"
                />
                <div className="flex justify-center space-x-2">
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="btn-secondary text-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Supprimer
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  Glissez-déposez votre logo ou cliquez pour sélectionner
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="btn-secondary cursor-pointer inline-flex items-center"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Sélectionner un logo
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Couleurs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Couleur primaire
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={formData.couleur_primaire}
                onChange={(e) => handleInputChange('couleur_primaire', e.target.value)}
                className="w-12 h-10 rounded border border-gray-300"
              />
              <input
                type="text"
                value={formData.couleur_primaire}
                onChange={(e) => handleInputChange('couleur_primaire', e.target.value)}
                className="input-premium flex-1"
                placeholder="#3B82F6"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Couleur secondaire
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={formData.couleur_secondaire}
                onChange={(e) => handleInputChange('couleur_secondaire', e.target.value)}
                className="w-12 h-10 rounded border border-gray-300"
              />
              <input
                type="text"
                value={formData.couleur_secondaire}
                onChange={(e) => handleInputChange('couleur_secondaire', e.target.value)}
                className="input-premium flex-1"
                placeholder="#10B981"
              />
            </div>
          </div>
        </div>

        {/* Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Devise principale
            </label>
            <select
              value={formData.devise_principale}
              onChange={(e) => handleInputChange('devise_principale', e.target.value)}
              className="input-premium w-full"
            >
              <option value="XOF">Franc CFA (XOF)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="USD">Dollar US (USD)</option>
              <option value="GBP">Livre Sterling (GBP)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fuseau horaire
            </label>
            <select
              value={formData.fuseau_horaire}
              onChange={(e) => handleInputChange('fuseau_horaire', e.target.value)}
              className="input-premium w-full"
            >
              <option value="Africa/Dakar">Dakar (GMT+0)</option>
              <option value="Africa/Casablanca">Casablanca (GMT+1)</option>
              <option value="Europe/Paris">Paris (GMT+1)</option>
              <option value="America/New_York">New York (GMT-5)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre d'employés *
            </label>
            <input
              type="number"
              value={formData.nombre_employes}
              onChange={(e) => handleInputChange('nombre_employes', parseInt(e.target.value) || 1)}
              className={`input-premium w-full ${errors.nombre_employes ? 'border-red-500' : ''}`}
              min="1"
            />
            {errors.nombre_employes && <p className="text-red-500 text-sm mt-1">{errors.nombre_employes}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Chiffre d'affaires annuel (XOF)
          </label>
          <input
            type="number"
            value={formData.chiffre_affaires_annuel}
            onChange={(e) => handleInputChange('chiffre_affaires_annuel', parseFloat(e.target.value) || 0)}
            className="input-premium w-full"
            min="0"
            step="0.01"
            placeholder="0"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            icon={<Building2 className="w-4 h-4" />}
          >
            {initialData.nom ? 'Modifier l\'entreprise' : 'Créer l\'entreprise'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default CompanyForm;

