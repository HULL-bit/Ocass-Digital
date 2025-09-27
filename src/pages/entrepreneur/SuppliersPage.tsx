import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Store, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Phone,
  Mail,
  MapPin,
  Star,
  TrendingUp,
  Package,
  DollarSign,
  Calendar,
  Truck,
  CheckCircle,
  AlertTriangle,
  Clock,
  X,
  Building2,
  User,
  FileText,
  ShoppingCart
} from 'lucide-react';
import Button from '../../components/ui/Button';
import MetricCard from '../../components/ui/MetricCard';
import AnimatedForm from '../../components/forms/AnimatedForm';
import apiService from '../../services/api/realApi';
import * as yup from 'yup';

const SuppliersPage: React.FC = () => {
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);

  const mockSuppliers = [
    {
      id: '1',
      nom: 'Distributeur Électronique Dakar',
      contact_nom: 'Ibrahima Sarr',
      contact_fonction: 'Directeur Commercial',
      email: 'contact@distributeur-elec.sn',
      telephone: '+221 33 123 45 67',
      telephone_secondaire: '+221 77 123 45 67',
      adresse: '25 Rue de la République, Plateau, Dakar',
      conditions_paiement: '30 jours fin de mois',
      delai_livraison: 3,
      montant_minimum_commande: 50000,
      evaluation: 4.5,
      nombre_evaluations: 25,
      statut: 'actif',
      nombre_commandes: 45,
      montant_total_commandes: 15750000,
      derniere_commande: '2024-01-12T10:30:00Z',
      produits_fournis: ['iPhone 15 Pro', 'MacBook Air M3', 'iPad Air'],
      specialites: ['Électronique', 'Informatique', 'Accessoires'],
      certifications: ['Distributeur Agréé Apple', 'Partenaire Samsung'],
      performance: {
        ponctualite: 92,
        qualite: 88,
        service: 95,
        prix: 85,
      },
    },
    {
      id: '2',
      nom: 'Grossiste Mode Afrique',
      contact_nom: 'Aminata Touré',
      contact_fonction: 'Responsable Ventes',
      email: 'ventes@grossiste-mode.com',
      telephone: '+221 77 234 56 78',
      adresse: '12 Avenue Pompidou, Médina, Dakar',
      conditions_paiement: '15 jours',
      delai_livraison: 7,
      montant_minimum_commande: 100000,
      evaluation: 4.2,
      nombre_evaluations: 18,
      statut: 'actif',
      nombre_commandes: 28,
      montant_total_commandes: 8950000,
      derniere_commande: '2024-01-08T14:20:00Z',
      produits_fournis: ['Robes Africaines', 'Boubous', 'Accessoires'],
      specialites: ['Mode Africaine', 'Textiles', 'Artisanat'],
      certifications: ['Commerce Équitable', 'Artisan Local'],
      performance: {
        ponctualite: 85,
        qualite: 95,
        service: 90,
        prix: 92,
      },
    },
    {
      id: '3',
      nom: 'Laboratoire Pharma Plus',
      contact_nom: 'Dr. Ousmane Diop',
      contact_fonction: 'Directeur Médical',
      email: 'commandes@pharmaplus.sn',
      telephone: '+221 33 345 67 89',
      adresse: '8 Rue Pasteur, Plateau, Dakar',
      conditions_paiement: '45 jours',
      delai_livraison: 2,
      montant_minimum_commande: 25000,
      evaluation: 4.8,
      nombre_evaluations: 42,
      statut: 'actif',
      nombre_commandes: 67,
      montant_total_commandes: 12450000,
      derniere_commande: '2024-01-14T09:15:00Z',
      produits_fournis: ['Médicaments', 'Parapharmacie', 'Matériel Médical'],
      specialites: ['Pharmacie', 'Santé', 'Médical'],
      certifications: ['Laboratoire Agréé', 'Norme ISO 9001'],
      performance: {
        ponctualite: 98,
        qualite: 96,
        service: 94,
        prix: 88,
      },
    },
  ];

  const supplierValidationSchema = yup.object({
    nom: yup.string().required('Le nom est requis').min(2, 'Minimum 2 caractères'),
    contact_nom: yup.string().required('Le nom du contact est requis'),
    email: yup.string().email('Email invalide').required('L\'email est requis'),
    telephone: yup.string().required('Le téléphone est requis'),
    adresse: yup.string().required('L\'adresse est requise'),
    conditions_paiement: yup.string().required('Les conditions de paiement sont requises'),
    delai_livraison: yup.number().required('Le délai de livraison est requis').min(1, 'Minimum 1 jour'),
    montant_minimum_commande: yup.number().required('Le montant minimum est requis').min(0, 'Doit être positif'),
  });

  const supplierFormFields = [
    {
      name: 'nom',
      label: 'Nom du Fournisseur',
      type: 'text' as const,
      placeholder: 'Ex: Distributeur Électronique Dakar',
      icon: <Store className="w-4 h-4" />,
    },
    {
      name: 'contact_nom',
      label: 'Nom du Contact',
      type: 'text' as const,
      placeholder: 'Ex: Ibrahima Sarr',
      icon: <User className="w-4 h-4" />,
    },
    {
      name: 'contact_fonction',
      label: 'Fonction du Contact',
      type: 'text' as const,
      placeholder: 'Ex: Directeur Commercial',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email' as const,
      placeholder: 'contact@fournisseur.sn',
      icon: <Mail className="w-4 h-4" />,
    },
    {
      name: 'telephone',
      label: 'Téléphone Principal',
      type: 'text' as const,
      placeholder: '+221 33 123 45 67',
      icon: <Phone className="w-4 h-4" />,
    },
    {
      name: 'telephone_secondaire',
      label: 'Téléphone Secondaire',
      type: 'text' as const,
      placeholder: '+221 77 123 45 67',
      description: 'Optionnel',
    },
    {
      name: 'adresse',
      label: 'Adresse Complète',
      type: 'textarea' as const,
      placeholder: 'Adresse complète du fournisseur...',
      rows: 3,
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      name: 'conditions_paiement',
      label: 'Conditions de Paiement',
      type: 'select' as const,
      options: [
        { label: 'Comptant', value: 'comptant' },
        { label: '15 jours', value: '15_jours' },
        { label: '30 jours', value: '30_jours' },
        { label: '45 jours', value: '45_jours' },
        { label: '60 jours', value: '60_jours' },
        { label: '30 jours fin de mois', value: '30_jours_fdm' },
      ],
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      name: 'delai_livraison',
      label: 'Délai de Livraison (jours)',
      type: 'number' as const,
      placeholder: '3',
      icon: <Truck className="w-4 h-4" />,
    },
    {
      name: 'montant_minimum_commande',
      label: 'Montant Minimum Commande (XOF)',
      type: 'number' as const,
      placeholder: '50000',
      icon: <DollarSign className="w-4 h-4" />,
    },
  ];

  const handleSupplierSubmit = async (data: any) => {
    try {
      console.log('Création du fournisseur:', data);
      
      // Préparer les données pour l'API
      const supplierData = {
        nom: data.nom,
        email: data.email,
        telephone: data.telephone,
        adresse: data.adresse || '',
        contact_principal: data.contact_principal || '',
        specialite: data.specialite || '',
        note_qualite: data.note_qualite || 5,
        conditions_paiement: data.conditions_paiement || '',
        delai_livraison: data.delai_livraison || '',
        actif: true
      };

      // Note: Il n'y a pas d'endpoint spécifique pour les fournisseurs dans l'API
      // On pourrait créer un endpoint ou utiliser un autre service
      console.log('Données du fournisseur préparées:', supplierData);
      
      // Simulation d'appel API (à remplacer par un vrai endpoint)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Fermer le formulaire
      setShowSupplierForm(false);
      
    } catch (error) {
      console.error('Erreur lors de la création du fournisseur:', error);
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Gestion des Fournisseurs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez vos relations fournisseurs et optimisez vos approvisionnements
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="secondary" icon={<FileText className="w-4 h-4" />}>
            Rapport Fournisseurs
          </Button>
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setShowSupplierForm(true)}>
            Nouveau Fournisseur
          </Button>
        </div>
      </div>

      {/* Supplier Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Fournisseurs Actifs"
          value={12}
          previousValue={10}
          format="number"
          icon={<Store className="w-6 h-6" />}
          color="primary"
        />
        <MetricCard
          title="Commandes ce Mois"
          value={28}
          previousValue={22}
          format="number"
          icon={<ShoppingCart className="w-6 h-6" />}
          color="success"
        />
        <MetricCard
          title="Délai Moyen Livraison"
          value={4.2}
          previousValue={5.1}
          format="number"
          icon={<Truck className="w-6 h-6" />}
          color="info"
        />
        <MetricCard
          title="Satisfaction Moyenne"
          value={4.5}
          previousValue={4.2}
          format="number"
          icon={<Star className="w-6 h-6" />}
          color="warning"
        />
      </div>

      {/* Suppliers List */}
      <div className="card-premium p-6">
        {/* Search */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un fournisseur..."
              className="input-premium pl-10 w-full"
            />
          </div>
          <Button variant="secondary" icon={<Filter className="w-4 h-4" />}>
            Filtres
          </Button>
        </div>

        {/* Suppliers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockSuppliers.map((supplier, index) => (
            <motion.div
              key={supplier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setSelectedSupplier(supplier)}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {supplier.nom}
                  </h3>
                  <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full">
                    Actif
                  </span>
                </div>

                {/* Contact */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {supplier.contact_nom} - {supplier.contact_fonction}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{supplier.telephone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{supplier.email}</span>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(supplier.evaluation)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {supplier.evaluation}
                  </span>
                  <span className="text-xs text-gray-500">({supplier.nombre_evaluations})</span>
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {supplier.specialites.slice(0, 3).map((specialite: string) => (
                    <span
                      key={specialite}
                      className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full"
                    >
                      {specialite}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{supplier.nombre_commandes}</p>
                    <p className="text-xs text-gray-500">Commandes</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {supplier.delai_livraison}j
                    </p>
                    <p className="text-xs text-gray-500">Délai</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total commandes</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {(supplier.montant_total_commandes / 1000000).toFixed(1)}M XOF
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Supplier Form Modal */}
      <AnimatePresence>
        {showSupplierForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={() => setShowSupplierForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatedForm
                title="Nouveau Fournisseur"
                description="Ajoutez un nouveau fournisseur à votre réseau"
                fields={supplierFormFields}
                validationSchema={supplierValidationSchema}
                onSubmit={handleSupplierSubmit}
                columns={2}
                submitLabel="Créer le Fournisseur"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Supplier Detail Modal */}
      <AnimatePresence>
        {selectedSupplier && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={() => setSelectedSupplier(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedSupplier.nom}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedSupplier.contact_nom} - {selectedSupplier.contact_fonction}
                  </p>
                </div>
                
                <button
                  onClick={() => setSelectedSupplier(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Contact Info */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Contact</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{selectedSupplier.telephone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{selectedSupplier.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{selectedSupplier.adresse}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{selectedSupplier.conditions_paiement}</span>
                        </div>
                      </div>
                    </div>

                    {/* Performance */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Performance</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(selectedSupplier.performance).map(([key, value]) => (
                          <div key={key} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                            <p className={`text-2xl font-bold ${getPerformanceColor(value as number)}`}>
                              {value}%
                            </p>
                            <p className="text-sm text-gray-500 capitalize">
                              {key === 'ponctualite' ? 'Ponctualité' :
                               key === 'qualite' ? 'Qualité' :
                               key === 'service' ? 'Service' : 'Prix'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Products */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Produits Fournis</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedSupplier.produits_fournis.map((produit: string) => (
                          <span
                            key={produit}
                            className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-sm rounded-full"
                          >
                            {produit}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Certifications */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Certifications</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedSupplier.certifications.map((cert: string) => (
                          <span
                            key={cert}
                            className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm rounded-full flex items-center"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Quick Stats */}
                    <div className="bg-gradient-to-r from-primary-500 to-electric-500 rounded-xl p-6 text-white">
                      <h3 className="font-semibold mb-4">Statistiques</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Commandes</span>
                          <span className="font-bold">{selectedSupplier.nombre_commandes}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total</span>
                          <span className="font-bold">
                            {(selectedSupplier.montant_total_commandes / 1000000).toFixed(1)}M XOF
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Délai</span>
                          <span className="font-bold">{selectedSupplier.delai_livraison} jours</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Min. commande</span>
                          <span className="font-bold">
                            {(selectedSupplier.montant_minimum_commande / 1000).toFixed(0)}K XOF
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <Button
                        variant="primary"
                        fullWidth
                        icon={<ShoppingCart className="w-4 h-4" />}
                        onClick={() => setShowOrderForm(true)}
                      >
                        Nouvelle Commande
                      </Button>
                      <Button
                        variant="secondary"
                        fullWidth
                        icon={<Phone className="w-4 h-4" />}
                      >
                        Appeler
                      </Button>
                      <Button
                        variant="secondary"
                        fullWidth
                        icon={<Mail className="w-4 h-4" />}
                      >
                        Envoyer Email
                      </Button>
                      <Button
                        variant="secondary"
                        fullWidth
                        icon={<Edit className="w-4 h-4" />}
                      >
                        Modifier
                      </Button>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Activité Récente</h4>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <p className="text-gray-900 dark:text-white">Dernière commande</p>
                          <p className="text-gray-500">
                            {new Date(selectedSupplier.derniere_commande).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="text-sm">
                          <p className="text-gray-900 dark:text-white">Évaluation</p>
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-gray-500">{selectedSupplier.evaluation}/5</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SuppliersPage;