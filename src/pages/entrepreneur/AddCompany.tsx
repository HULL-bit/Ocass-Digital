import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CompanyForm from '../../components/forms/CompanyForm';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

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

const AddCompany: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: CompanyFormData) => {
    setLoading(true);
    try {
      // Préparer les données pour l'API
      const formData = new FormData();
      
      // Ajouter les champs de base
      formData.append('nom', data.nom);
      if (data.nom_commercial) {
        formData.append('nom_commercial', data.nom_commercial);
      }
      formData.append('secteur_activite', data.secteur_activite);
      if (data.description) {
        formData.append('description', data.description);
      }
      formData.append('telephone', data.telephone);
      formData.append('email', data.email);
      if (data.site_web) {
        formData.append('site_web', data.site_web);
      }
      formData.append('adresse_complete', data.adresse_complete);
      formData.append('ville', data.ville);
      formData.append('region', data.region);
      formData.append('pays', data.pays);
      if (data.code_postal) {
        formData.append('code_postal', data.code_postal);
      }
      if (data.siret) {
        formData.append('siret', data.siret);
      }
      if (data.tva_intracommunautaire) {
        formData.append('tva_intracommunautaire', data.tva_intracommunautaire);
      }
      if (data.forme_juridique) {
        formData.append('forme_juridique', data.forme_juridique);
      }
      formData.append('couleur_primaire', data.couleur_primaire);
      formData.append('couleur_secondaire', data.couleur_secondaire);
      formData.append('devise_principale', data.devise_principale);
      formData.append('fuseau_horaire', data.fuseau_horaire);
      formData.append('nombre_employes', data.nombre_employes.toString());
      if (data.chiffre_affaires_annuel > 0) {
        formData.append('chiffre_affaires_annuel', data.chiffre_affaires_annuel.toString());
      }
      
      // Ajouter le logo si fourni
      if (data.logo) {
        formData.append('logo', data.logo);
      }
      
      // Envoyer la requête
      const response = await fetch('/api/entreprises/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: formData
      });
      
      if (response.ok) {
        const company = await response.json();
        console.log('Entreprise créée avec succès:', company);
        
        // Mettre à jour l'utilisateur avec l'entreprise
        const updateUserResponse = await fetch('/api/auth/profile/', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify({
            entreprise: company.id
          })
        });
        
        if (updateUserResponse.ok) {
          console.log('Utilisateur mis à jour avec l\'entreprise');
        }
        
        // Rediriger vers le dashboard
        navigate('/entrepreneur/dashboard');
      } else {
        const error = await response.json();
        console.error('Erreur lors de la création de l\'entreprise:', error);
        throw new Error(error.detail || 'Erreur lors de la création de l\'entreprise');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création de l\'entreprise. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/entrepreneur/dashboard');
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
                onClick={() => navigate('/entrepreneur/dashboard')}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Retour
              </Button>
              <div>
                <h1 className="text-3xl font-bold gradient-text">Créer une Entreprise</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Configurez votre entreprise pour commencer à vendre
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
          <CompanyForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default AddCompany;

