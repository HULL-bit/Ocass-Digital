import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Upload, X, Plus, Minus } from 'lucide-react';
import Button from '../ui/Button';
import * as yup from 'yup';
import apiService from '../../services/api/realApi';

interface ProductFormData {
  nom: string;
  description_courte: string;
  description_longue: string;
  prix_achat: number;
  prix_vente: number;
  stock_minimum: number;
  stock_maximum: number;
  stock_initial: number;
  categorie: string;
  marque: string;
  code_barre: string;
  sku: string;
  tva_taux: number;
  date_peremption: string;
  duree_conservation: number;
  couleur: string;
  materiau: string;
  images: File[];
  localImages: string[]; // Images locales depuis /Res
  tags: string[];
}

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  initialData?: Partial<ProductFormData>;
  loading?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {},
  loading = false
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    nom: '',
    description_courte: '',
    description_longue: '',
    prix_achat: 0,
    prix_vente: 0,
    stock_minimum: 0,
    stock_maximum: 1000,
    stock_initial: 0,
    categorie: '',
    marque: '',
    code_barre: '',
    sku: '',
    tva_taux: 18.0,
    date_peremption: '',
    duree_conservation: 0,
    couleur: '',
    materiau: '',
    images: [],
    localImages: [],
    tags: [],
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState('');
  const [categories, setCategories] = useState<Array<{ id: string; nom: string }>>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Charger les catégories depuis l'API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await apiService.getCategories();
        console.log('Catégories chargées:', response);
        
        // Gérer différents formats de réponse
        let categoriesData = [];
        if (response && Array.isArray(response)) {
          categoriesData = response;
        } else if (response && response.results && Array.isArray(response.results)) {
          categoriesData = response.results;
        } else if (response && response.data && Array.isArray(response.data)) {
          categoriesData = response.data;
        } else {
          console.warn('Format de réponse des catégories non reconnu:', response);
          // Ne pas utiliser de catégories par défaut avec des IDs invalides
          // L'utilisateur devra attendre que les catégories se chargent depuis l'API
          categoriesData = [];
        }
        
        // Vérifier que toutes les catégories ont des UUIDs valides
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const validCategories = categoriesData.filter((cat: any) => 
          cat.id && uuidRegex.test(cat.id)
        );
        
        if (validCategories.length === 0 && categoriesData.length > 0) {
          console.warn('⚠️ Aucune catégorie avec UUID valide trouvée, les catégories seront récupérées depuis l\'API');
          categoriesData = [];
        }
        
        const finalCategories = validCategories.length > 0 ? validCategories : categoriesData;
        console.log(`✅ ${finalCategories.length} catégorie(s) chargée(s) avec UUID valide`);
        
        if (finalCategories.length === 0) {
          console.warn('⚠️ AUCUNE CATÉGORIE DISPONIBLE !');
          console.warn('💡 Pour créer des catégories, exécutez: python manage.py create_default_categories');
        }
        
        setCategories(finalCategories);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des catégories:', error);
        // En cas d'erreur, ne pas utiliser de catégories par défaut avec des IDs invalides
        setCategories([]);
        console.error('💡 Pour créer des catégories, exécutez: python manage.py create_default_categories');
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // Images locales disponibles dans /Res
  const localImages = [
    '/Res/boutique.jpg',
    '/Res/boutiqueMarie%20Diallo.jpg',
    '/Res/boutque.jpg',
    '/Res/couture.jpg',
    '/Res/iwaria-inc-JnOFLg09yRE-unsplash.jpg',
    '/Res/iwaria-inc-tvTFMDwH-cQ-unsplash.jpg',
    '/Res/mak-K8vfT-8xxEQ-unsplash.jpg',
    '/Res/mathieu-gauzy-qLT3rBVwiLY-unsplash.jpg',
    '/Res/monody-le-mZ_7CuqsRV0-unsplash.jpg',
    '/Res/rutendo-petros-Tzp_yd6W8LM-unsplash.jpg',
    '/Res/shivansh-sharma-l2cFxUEEY7I-unsplash.jpg',
    '/Res/stefan-buhler-qQY44BbC2mw-unsplash.jpg',
    '/Res/SuperMarche.jpg',
    '/Res/tr-n-thanh-h-i-g7pcs7FYx0Y-unsplash.jpg',
  ];

  const handleLocalImageSelect = (imagePath: string) => {
    if (formData.localImages.includes(imagePath)) {
      setFormData(prev => ({
        ...prev,
        localImages: prev.localImages.filter(img => img !== imagePath)
      }));
    } else {
      if (formData.localImages.length + formData.images.length < 5) {
        setFormData(prev => ({
          ...prev,
          localImages: [...prev.localImages, imagePath]
        }));
      } else {
        alert('Maximum 5 images au total (upload + locales)');
      }
    }
  };

  const removeLocalImage = (imagePath: string) => {
    setFormData(prev => ({
      ...prev,
      localImages: prev.localImages.filter(img => img !== imagePath)
    }));
  };

  const validationSchema = yup.object().shape({
    nom: yup.string().required('Le nom est requis'),
    description_courte: yup.string().required('La description courte est requise'),
    prix_achat: yup.number().positive('Le prix d\'achat doit être positif').required('Le prix d\'achat est requis'),
    prix_vente: yup.number().positive('Le prix de vente doit être positif').required('Le prix de vente est requis'),
    stock_minimum: yup.number().min(0, 'Le stock minimum ne peut pas être négatif').required('Le stock minimum est requis'),
    stock_maximum: yup.number().min(0, 'Le stock maximum ne peut pas être négatif').test(
      'is-greater-than-min',
      'Le stock maximum doit être supérieur ou égal au stock minimum',
      function(value) {
        const { stock_minimum } = this.parent;
        return !value || value >= stock_minimum;
      }
    ),
    stock_initial: yup.number().min(0, 'Le stock initial ne peut pas être négatif').required('Le stock initial est requis'),
    categorie: yup.string().required('La catégorie est requise'),
    marque: yup.string().required('La marque est requise'),
    sku: yup.string().required('Le SKU est requis'),
  });

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validation des fichiers
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`Le fichier ${file.name} n'est pas une image valide.`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        alert(`L'image ${file.name} est trop volumineuse (max 5MB).`);
        return false;
      }
      return true;
    });
    
    // Limiter à 5 images maximum au total (upload + locales)
    const totalImages = formData.images.length + formData.localImages.length;
    const remainingSlots = 5 - totalImages;
    if (remainingSlots <= 0) {
      alert('Maximum 5 images au total (upload + locales)');
      return;
    }
    const newImages = [...formData.images, ...validFiles].slice(0, remainingSlots);
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
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
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold gradient-text">Ajouter un Produit</h2>
            <p className="text-gray-600 dark:text-gray-300">Remplissez les informations du produit</p>
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
              Nom du produit *
            </label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => handleInputChange('nom', e.target.value)}
              className={`input-premium w-full ${errors.nom ? 'border-red-500' : ''}`}
              placeholder="Ex: Smartphone Samsung Galaxy"
            />
            {errors.nom && <p className="text-red-500 text-sm mt-1">{errors.nom}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Marque *
            </label>
            <input
              type="text"
              value={formData.marque}
              onChange={(e) => handleInputChange('marque', e.target.value)}
              className={`input-premium w-full ${errors.marque ? 'border-red-500' : ''}`}
              placeholder="Ex: Samsung"
            />
            {errors.marque && <p className="text-red-500 text-sm mt-1">{errors.marque}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description Courte *
          </label>
          <textarea
            value={formData.description_courte}
            onChange={(e) => handleInputChange('description_courte', e.target.value)}
            className={`input-premium w-full h-24 resize-none ${errors.description_courte ? 'border-red-500' : ''}`}
            placeholder="Description courte du produit..."
          />
          {errors.description_courte && <p className="text-red-500 text-sm mt-1">{errors.description_courte}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description Longue
          </label>
          <textarea
            value={formData.description_longue}
            onChange={(e) => handleInputChange('description_longue', e.target.value)}
            className="input-premium w-full h-24 resize-none"
            placeholder="Description détaillée du produit..."
          />
        </div>

        {/* Prix et stock */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prix d'Achat (XOF) *
            </label>
            <input
              type="number"
              value={formData.prix_achat}
              onChange={(e) => handleInputChange('prix_achat', parseFloat(e.target.value) || 0)}
              className={`input-premium w-full ${errors.prix_achat ? 'border-red-500' : ''}`}
              placeholder="0"
              min="0"
              step="0.01"
            />
            {errors.prix_achat && <p className="text-red-500 text-sm mt-1">{errors.prix_achat}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prix de Vente (XOF) *
            </label>
            <input
              type="number"
              value={formData.prix_vente}
              onChange={(e) => handleInputChange('prix_vente', parseFloat(e.target.value) || 0)}
              className={`input-premium w-full ${errors.prix_vente ? 'border-red-500' : ''}`}
              placeholder="0"
              min="0"
              step="0.01"
            />
            {errors.prix_vente && <p className="text-red-500 text-sm mt-1">{errors.prix_vente}</p>}
          </div>
        </div>

        {/* Stock */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Stock Minimum *
            </label>
            <input
              type="number"
              value={formData.stock_minimum}
              onChange={(e) => handleInputChange('stock_minimum', parseInt(e.target.value) || 0)}
              className={`input-premium w-full ${errors.stock_minimum ? 'border-red-500' : ''}`}
              placeholder="0"
              min="0"
            />
            {errors.stock_minimum && <p className="text-red-500 text-sm mt-1">{errors.stock_minimum}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Stock Maximum
            </label>
            <input
              type="number"
              value={formData.stock_maximum}
              onChange={(e) => handleInputChange('stock_maximum', parseInt(e.target.value) || 0)}
              className="input-premium w-full"
              placeholder="0"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Stock Initial *
            </label>
            <input
              type="number"
              value={formData.stock_initial}
              onChange={(e) => handleInputChange('stock_initial', parseInt(e.target.value) || 0)}
              className={`input-premium w-full ${errors.stock_initial ? 'border-red-500' : ''}`}
              placeholder="0"
              min="0"
            />
            {errors.stock_initial && <p className="text-red-500 text-sm mt-1">{errors.stock_initial}</p>}
          </div>
        </div>

        {/* Catégorie et SKU */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Catégorie *
            </label>
            <select
              value={formData.categorie}
              onChange={(e) => handleInputChange('categorie', e.target.value)}
              className={`input-premium w-full ${errors.categorie ? 'border-red-500' : ''}`}
              disabled={loadingCategories}
            >
              <option value="">
                {loadingCategories 
                  ? 'Chargement des catégories...' 
                  : categories.length === 0 
                    ? 'Aucune catégorie disponible' 
                    : 'Sélectionner une catégorie'}
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nom}
                </option>
              ))}
            </select>
            {errors.categorie && <p className="text-red-500 text-sm mt-1">{errors.categorie}</p>}
            {!loadingCategories && categories.length === 0 && (
              <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-1">
                ⚠️ Aucune catégorie disponible. Veuillez exécuter: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">python manage.py create_default_categories</code>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              SKU *
            </label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => handleInputChange('sku', e.target.value)}
              className={`input-premium w-full ${errors.sku ? 'border-red-500' : ''}`}
              placeholder="Ex: PROD-001"
            />
            {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku}</p>}
          </div>
        </div>

        {/* Code-barres et TVA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Code-barres
            </label>
            <input
              type="text"
              value={formData.code_barre}
              onChange={(e) => handleInputChange('code_barre', e.target.value)}
              className="input-premium w-full"
              placeholder="Ex: 1234567890123"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Taux TVA (%)
            </label>
            <input
              type="number"
              value={formData.tva_taux}
              onChange={(e) => handleInputChange('tva_taux', parseFloat(e.target.value) || 0)}
              className="input-premium w-full"
              placeholder="18"
              min="0"
              max="100"
              step="0.01"
            />
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Images du produit ({formData.images.length + formData.localImages.length}/5)
          </label>
          
          {/* Upload d'images */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center mb-4">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              Glissez-déposez vos images ou cliquez pour sélectionner
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="btn-secondary cursor-pointer inline-flex items-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              Télécharger des images
            </label>
          </div>

          {/* Sélection d'images locales */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ou choisir depuis les images locales :
            </p>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              {localImages.map((imagePath) => {
                const isSelected = formData.localImages.includes(imagePath);
                return (
                  <button
                    key={imagePath}
                    type="button"
                    onClick={() => handleLocalImageSelect(imagePath)}
                    className={`relative aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                      isSelected
                        ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                    }`}
                  >
                    <img
                      src={imagePath}
                      alt={imagePath.split('/').pop()}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/150';
                      }}
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary-500/20 flex items-center justify-center">
                        <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                          <X className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Aperçu des images sélectionnées */}
          {(formData.images.length > 0 || formData.localImages.length > 0) && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Images sélectionnées :
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Images uploadées */}
                {formData.images.map((image, index) => (
                  <div key={`upload-${index}`} className="relative group">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/150';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}
                {/* Images locales */}
                {formData.localImages.map((imagePath, index) => (
                  <div key={`local-${index}`} className="relative group">
                    <img
                      src={imagePath}
                      alt={`Local ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/150';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeLocalImage(imagePath)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                      {formData.images.length + index + 1}
                    </div>
                    <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1 rounded">
                      Local
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="input-premium flex-1"
              placeholder="Ajouter un tag"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={addTag}
              icon={<Plus className="w-4 h-4" />}
            >
              Ajouter
            </Button>
          </div>
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
            icon={<Package className="w-4 h-4" />}
          >
            {initialData.nom ? 'Modifier le produit' : 'Ajouter le produit'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default ProductForm;
