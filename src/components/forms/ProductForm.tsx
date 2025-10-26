import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Upload, X, Plus, Minus } from 'lucide-react';
import Button from '../ui/Button';
import * as yup from 'yup';

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
  code_barre: string;
  sku: string;
  tva_taux: number;
  date_peremption: string;
  duree_conservation: number;
  couleur: string;
  materiau: string;
  images: File[];
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
    stock_maximum: 0,
    stock_initial: 0,
    categorie: '',
    code_barre: '',
    sku: '',
    tva_taux: 18.0,
    date_peremption: '',
    duree_conservation: 0,
    couleur: '',
    materiau: '',
    images: [],
    tags: [],
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState('');

  const validationSchema = yup.object().shape({
    nom: yup.string().required('Le nom est requis'),
    description_courte: yup.string().required('La description courte est requise'),
    prix_achat: yup.number().positive('Le prix d\'achat doit être positif').required('Le prix d\'achat est requis'),
    prix_vente: yup.number().positive('Le prix de vente doit être positif').required('Le prix de vente est requis'),
    stock_minimum: yup.number().min(0, 'Le stock minimum ne peut pas être négatif').required('Le stock minimum est requis'),
    stock_initial: yup.number().min(0, 'Le stock initial ne peut pas être négatif').required('Le stock initial est requis'),
    categorie: yup.string().required('La catégorie est requise'),
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
    
    // Limiter à 5 images maximum
    const newImages = [...formData.images, ...validFiles].slice(0, 5);
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
            >
              <option value="">Sélectionner une catégorie</option>
              <option value="electronique">Électronique</option>
              <option value="vetements">Vêtements</option>
              <option value="maison">Maison & Jardin</option>
              <option value="sport">Sport & Loisirs</option>
              <option value="beaute">Beauté & Santé</option>
              <option value="livres">Livres & Médias</option>
              <option value="automobile">Automobile</option>
              <option value="alimentation">Alimentation</option>
              <option value="autre">Autre</option>
            </select>
            {errors.categorie && <p className="text-red-500 text-sm mt-1">{errors.categorie}</p>}
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
            Images du produit
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
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
              Sélectionner des images
            </label>
          </div>
          
          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.pexels.com/photos/33239/wheat-field-wheat-yellow-grain.jpg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2';
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
