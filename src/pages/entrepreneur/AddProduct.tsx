import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../../components/forms/ProductForm';
import Button from '../../components/ui/Button';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';

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

const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { post } = useApi();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: ProductFormData) => {
    setLoading(true);
    try {
      // Préparer les données pour l'API
      const formData = new FormData();
      
      // Ajouter les champs de base
      formData.append('nom', data.nom);
      formData.append('description_courte', data.description_courte);
      formData.append('description_longue', data.description_longue || data.description_courte);
      formData.append('prix_achat', data.prix_achat.toString());
      formData.append('prix_vente', data.prix_vente.toString());
      formData.append('tva_taux', data.tva_taux.toString());
      formData.append('unite_mesure', 'piece'); // Valeur par défaut
      formData.append('stock', data.stock_initial.toString());
      formData.append('statut', 'actif');
      formData.append('vendable', 'true');
      formData.append('achetable', 'true');
      formData.append('visible_catalogue', 'true');
      
      // Utiliser le SKU fourni ou générer un SKU unique
      const sku = data.sku || `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      formData.append('sku', sku);
      
      if (data.code_barre) {
        formData.append('code_barre', data.code_barre);
      }
      
      
      if (data.couleur) {
        formData.append('couleurs_disponibles', JSON.stringify([data.couleur]));
      }
      
      if (data.materiau) {
        formData.append('materiaux_disponibles', JSON.stringify([data.materiau]));
      }
      
      // Ajouter les images
      if (data.images && data.images.length > 0) {
        data.images.forEach((image, index) => {
          formData.append('images', image);
        });
      }
      
      // Gérer la catégorie
      if (data.categorie) {
        try {
          // Utiliser l'API service pour créer ou récupérer la catégorie
          const categoryData = {
            nom: data.categorie,
            description: `Catégorie ${data.categorie}`,
            slug: data.categorie.toLowerCase().replace(/\s+/g, '-'),
            active: true
          };
          
          const categoryResponse = await post('/api/v1/products/categories/', categoryData);
          formData.append('categorie', categoryResponse.id);
        } catch (error) {
          console.error('Erreur lors de la création de la catégorie:', error);
          // Utiliser une catégorie par défaut (Alimentation)
          formData.append('categorie', '7e825032-588c-49c5-84db-5677b4721800');
        }
      }
      
      // Utiliser une marque par défaut
      formData.append('marque', 'c2cab192-96d3-4279-afef-d1b80e86144e');
      
      // Envoyer la requête avec l'API service
      const product = await post('/api/v1/products/products/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Produit créé avec succès:', product);
      
      // Rediriger vers la page des produits
      navigate('/entrepreneur/stock');
    } catch (error: any) {
      console.error('Erreur lors de la création du produit:', error);
      
      let errorMessage = 'Erreur lors de la création du produit. Veuillez réessayer.';
      
      if (error.response?.data) {
        const errorData = error.response.data;
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
              const fieldName = field === 'nom' ? 'nom du produit' : 
                               field === 'prix_vente' ? 'prix de vente' :
                               field === 'categorie' ? 'catégorie' : field;
              
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
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/entrepreneur/stock');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="secondary"
                onClick={() => navigate('/entrepreneur/stock')}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Retour
              </Button>
              <div>
                <h1 className="text-3xl font-bold gradient-text">Ajouter un Produit</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Créez un nouveau produit pour votre catalogue
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Formulaire */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ProductForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default AddProduct;


