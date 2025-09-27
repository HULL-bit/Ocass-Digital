import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Upload, X, Plus, Minus } from 'lucide-react';
import Button from '../ui/Button';
import * as yup from 'yup';

interface ProductFormData {
  nom: string;
  description: string;
  prix: number;
  prix_promotion: number;
  stock: number;
  stock_minimum: number;
  categorie: string;
  marque: string;
  code_barre: string;
  poids: number;
  dimensions: string;
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
    description: '',
    prix: 0,
    prix_promotion: 0,
    stock: 0,
    stock_minimum: 5,
    categorie: '',
    marque: '',
    code_barre: '',
    poids: 0,
    dimensions: '',
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
    description: yup.string().required('La description est requise'),
    prix: yup.number().positive('Le prix doit être positif').required('Le prix est requis'),
    stock: yup.number().min(0, 'Le stock ne peut pas être négatif').required('Le stock est requis'),
    stock_minimum: yup.number().min(0, 'Le stock minimum ne peut pas être négatif'),
    categorie: yup.string().required('La catégorie est requise'),
    marque: yup.string().required('La marque est requise'),
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
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
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
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className={`input-premium w-full h-24 resize-none ${errors.description ? 'border-red-500' : ''}`}
            placeholder="Décrivez le produit en détail..."
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        {/* Prix et stock */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prix (XOF) *
            </label>
            <input
              type="number"
              value={formData.prix}
              onChange={(e) => handleInputChange('prix', parseFloat(e.target.value) || 0)}
              className={`input-premium w-full ${errors.prix ? 'border-red-500' : ''}`}
              placeholder="0"
              min="0"
              step="0.01"
            />
            {errors.prix && <p className="text-red-500 text-sm mt-1">{errors.prix}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prix promotion (XOF)
            </label>
            <input
              type="number"
              value={formData.prix_promotion}
              onChange={(e) => handleInputChange('prix_promotion', parseFloat(e.target.value) || 0)}
              className="input-premium w-full"
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Stock *
            </label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
              className={`input-premium w-full ${errors.stock ? 'border-red-500' : ''}`}
              placeholder="0"
              min="0"
            />
            {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
          </div>
        </div>

        {/* Catégorie et code barre */}
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
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
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
