import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../../components/forms/ProductForm';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
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
  localImages: string[];
  tags: string[];
}

const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
      
      // Ajouter les images uploadées
      if (data.images && data.images.length > 0) {
        data.images.forEach((image, index) => {
          formData.append('images', image);
        });
      }

      // Gérer les images locales : convertir les URLs en fichiers si possible
      if (data.localImages && data.localImages.length > 0) {
        try {
          for (const imageUrl of data.localImages) {
            // Télécharger l'image locale et la convertir en File
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const fileName = imageUrl.split('/').pop() || 'local-image.jpg';
            const file = new File([blob], fileName, { type: blob.type });
            formData.append('images', file);
          }
        } catch (error) {
          console.error('Erreur lors de la conversion des images locales:', error);
          // Si la conversion échoue, on peut quand même envoyer les URLs
          formData.append('local_images', JSON.stringify(data.localImages));
        }
      }
      
      // Gérer la marque : créer ou récupérer la marque
      if (data.marque && data.marque.trim()) {
        try {
          // Essayer d'abord de récupérer la marque par son nom
          const marquesResponse = await apiService.request('/products/marques/');
          const marques = Array.isArray(marquesResponse) ? marquesResponse : 
                         (marquesResponse.results || marquesResponse.data || []);
          
          let marqueId = null;
          const marqueExistant = marques.find((m: any) => 
            m.nom?.toLowerCase() === data.marque.trim().toLowerCase()
          );
          
          if (marqueExistant) {
            marqueId = marqueExistant.id;
            console.log('✅ Marque existante trouvée:', marqueId);
          } else {
            // Créer une nouvelle marque
            try {
              const nouvelleMarque = await apiService.request('/products/marques/', {
                method: 'POST',
                body: JSON.stringify({ nom: data.marque.trim() }),
              });
              marqueId = nouvelleMarque.id;
              console.log('✅ Nouvelle marque créée:', marqueId);
            } catch (createError: any) {
              console.error('Erreur lors de la création de la marque:', createError);
              // Si la création échoue, ne pas bloquer la création du produit
              console.warn('⚠️ Marque non créée, produit créé sans marque');
            }
          }
          
          if (marqueId) {
            formData.append('marque', marqueId);
          }
        } catch (error: any) {
          console.error('Erreur lors de la gestion de la marque:', error);
          // Ne pas bloquer la création du produit si la marque échoue
        }
      }
      
      // Gérer la catégorie : vérifier que c'est un UUID valide
      if (data.categorie) {
        // Vérifier que la catégorie est un UUID valide (format UUID v4)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        
        if (uuidRegex.test(data.categorie)) {
          formData.append('categorie', data.categorie);
          console.log('✅ Catégorie UUID valide:', data.categorie);
        } else {
          // Si ce n'est pas un UUID, essayer de trouver la catégorie par son ID ou son nom
          console.warn('⚠️ Catégorie n\'est pas un UUID valide:', data.categorie);
          try {
            const categoriesResponse = await apiService.getCategories();
            const categories = Array.isArray(categoriesResponse) ? categoriesResponse : 
                             (categoriesResponse.results || categoriesResponse.data || []);
            
            // Chercher par ID ou par nom si c'est un nombre
            let categoryFound = null;
            if (!isNaN(Number(data.categorie))) {
              // Si c'est un nombre, chercher par index ou nom
              const categoryIndex = parseInt(data.categorie) - 1;
              categoryFound = categories[categoryIndex];
            } else {
              // Chercher par nom
              categoryFound = categories.find((c: any) => 
                c.nom?.toLowerCase() === data.categorie.toLowerCase() ||
                c.id === data.categorie
              );
            }
            
            if (categoryFound && categoryFound.id && uuidRegex.test(categoryFound.id)) {
              formData.append('categorie', categoryFound.id);
              console.log('✅ Catégorie trouvée par nom/index:', categoryFound.id);
            } else {
              // Utiliser la première catégorie disponible comme fallback
              if (categories.length > 0 && categories[0].id && uuidRegex.test(categories[0].id)) {
                formData.append('categorie', categories[0].id);
                console.warn('⚠️ Utilisation de la première catégorie disponible:', categories[0].id);
              } else {
                throw new Error('Aucune catégorie valide trouvée');
              }
            }
          } catch (error: any) {
            console.error('Erreur lors de la recherche de catégorie:', error);
            alert('Erreur : Veuillez sélectionner une catégorie valide');
            setLoading(false);
            return;
          }
        }
      } else {
        // Si aucune catégorie, essayer de récupérer une catégorie par défaut
        try {
          const categoriesResponse = await apiService.getCategories();
          const categories = Array.isArray(categoriesResponse) ? categoriesResponse : 
                           (categoriesResponse.results || categoriesResponse.data || []);
          if (categories.length > 0 && categories[0].id) {
            formData.append('categorie', categories[0].id);
            console.warn('⚠️ Aucune catégorie sélectionnée, utilisation de la première:', categories[0].id);
          } else {
            throw new Error('Aucune catégorie disponible');
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des catégories:', error);
          alert('Erreur : Veuillez sélectionner une catégorie');
          setLoading(false);
          return;
        }
      }
      
      // Envoyer la requête avec l'API service
      console.log('📤 Envoi du produit à l\'API...');
      const product = await apiService.createProduct(formData);
      
      console.log('✅ Produit créé avec succès:', product);
      
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


