import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Star,
  Gift,
  TrendingUp,
  ShoppingCart,
  Heart,
  MessageSquare,
  Send,
  UserPlus,
  Download,
  Target,
  Award,
  Crown,
  DollarSign,
  X
} from 'lucide-react';
import Button from '../../components/ui/Button';
import MetricCard from '../../components/ui/MetricCard';
import DataTable from '../../components/ui/DataTable';
import AnimatedForm from '../../components/forms/AnimatedForm';
import apiService from '../../services/api/realApi';
import { getAvatarWithFallback } from '../../utils/avatarUtils';
import * as yup from 'yup';

const CustomersPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalCustomers: 0,
    newThisMonth: 0,
    lifetimeValue: 0,
    retentionRate: 0
  });

  // Charger les clients depuis l'API
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCustomers();
      console.log('Clients chargés:', response);
      
      // Transformer les données pour correspondre au format attendu
      const transformedCustomers = response.results?.map((customer: any) => ({
        ...customer,
        // Utiliser les données réelles de l'API
        code_client: customer.code_client,
        nom: customer.nom,
        prenom: customer.prenom,
        email: customer.email,
        telephone: customer.telephone,
        adresse_facturation: customer.adresse_facturation,
        type_client: customer.type_client,
        segment: customer.segment || 'nouveau',
        score_fidelite: customer.score_fidelite || 0,
        points_fidelite: customer.points_fidelite || 0,
        niveau_fidelite: customer.niveau_fidelite || 'bronze',
        total_achats: customer.total_achats || 0,
        nombre_commandes: customer.nombre_commandes || 0,
        panier_moyen: customer.panier_moyen || 0,
        date_creation: customer.date_creation,
        date_derniere_commande: customer.date_derniere_commande,
        source_acquisition: customer.source_acquisition || 'direct',
        statut: customer.statut || 'actif',
        avatar: getAvatarWithFallback(customer.avatar, customer.email, customer.nom?.split(' ')[0] || customer.prenom),
        preferences: customer.preferences || {
          communication: ['email'],
          categories_preferees: ['Général'],
          budget_moyen: 25000,
        },
        derniere_interaction: {
          type: 'achat',
          date: customer.date_derniere_commande || customer.date_creation,
          description: `Dernière commande - ${customer.total_achats ? customer.total_achats.toLocaleString() : 0} XOF`,
        },
      })) || [];
      
      setCustomers(transformedCustomers);
      
      // Calculer les métriques
      const totalCustomers = transformedCustomers.length;
      const newThisMonth = transformedCustomers.filter((customer: any) => {
        const joinDate = new Date(customer.date_creation);
        const now = new Date();
        return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
      }).length;
      const lifetimeValue = transformedCustomers.reduce((sum: number, customer: any) => sum + customer.total_achats, 0) / totalCustomers;
      const retentionRate = totalCustomers > 0 ? (transformedCustomers.filter(c => c.statut === 'actif').length / totalCustomers) * 100 : 0;
      
      setMetrics({
        totalCustomers,
        newThisMonth,
        lifetimeValue,
        retentionRate
      });
      
    } catch (error: any) {
      console.error('Erreur lors du chargement des clients:', error);
      
      // Gestion des erreurs détaillée
      let errorMessage = 'Erreur lors du chargement des clients';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('Message d\'erreur:', errorMessage);
      // En cas d'erreur, utiliser les données en cache ou vides
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // Données réelles des clients (remplacées par l'API)
  const [mockCustomers, setMockCustomers] = useState([
    {
      id: '1',
      code_client: 'CLI-001',
      nom: 'Diop',
      prenom: 'Aminata',
      email: 'aminata.diop@email.sn',
      telephone: '+221 77 123 45 67',
      adresse_facturation: 'Plateau, Dakar',
      type_client: 'particulier',
      segment: 'vip',
      score_fidelite: 95,
      points_fidelite: 1250,
      niveau_fidelite: 'or',
      total_achats: 850000,
      nombre_commandes: 28,
      panier_moyen: 30357,
      date_creation: '2023-06-15T09:00:00Z',
      date_derniere_commande: '2024-01-15T10:30:00Z',
      source_acquisition: 'referencement',
      statut: 'actif',
      avatar: getAvatarWithFallback(null, 'client1@exemple.com', 'Aïcha'),
      preferences: {
        communication: ['email', 'sms'],
        categories_preferees: ['Mode', 'Beauté'],
        budget_moyen: 35000,
      },
      derniere_interaction: {
        type: 'achat',
        date: '2024-01-15T10:30:00Z',
        description: 'Achat Boubou Grand Boubou - 65,000 XOF',
      },
    },
    {
      id: '2',
      code_client: 'CLI-002',
      nom: 'Ndiaye',
      prenom: 'Ousmane',
      email: 'ousmane.ndiaye@email.sn',
      telephone: '+221 77 234 56 78',
      adresse_facturation: 'Médina, Dakar',
      type_client: 'professionnel',
      segment: 'regulier',
      score_fidelite: 78,
      points_fidelite: 650,
      niveau_fidelite: 'argent',
      total_achats: 520000,
      nombre_commandes: 18,
      panier_moyen: 28889,
      date_creation: '2023-08-20T14:30:00Z',
      date_derniere_commande: '2024-01-12T16:45:00Z',
      source_acquisition: 'bouche_a_oreille',
      statut: 'actif',
      avatar: getAvatarWithFallback(null, 'client2@exemple.com', 'Ousmane'),
      entreprise_nom: 'Garage Auto Ndiaye',
      preferences: {
        communication: ['email'],
        categories_preferees: ['Électronique', 'Outils'],
        budget_moyen: 45000,
      },
      derniere_interaction: {
        type: 'support',
        date: '2024-01-12T16:45:00Z',
        description: 'Question sur garantie produit',
      },
    },
    {
      id: '3',
      code_client: 'CLI-003',
      nom: 'Fall',
      prenom: 'Khadija',
      email: 'khadija.fall@email.sn',
      telephone: '+221 77 345 67 89',
      adresse_facturation: 'Fann, Dakar',
      type_client: 'particulier',
      segment: 'nouveau',
      score_fidelite: 45,
      points_fidelite: 125,
      niveau_fidelite: 'bronze',
      total_achats: 125000,
      nombre_commandes: 3,
      panier_moyen: 41667,
      date_creation: '2024-01-05T11:20:00Z',
      date_derniere_commande: '2024-01-10T14:15:00Z',
      source_acquisition: 'reseaux_sociaux',
      statut: 'actif',
      avatar: getAvatarWithFallback(null, 'client1@exemple.com', 'Aïcha'),
      preferences: {
        communication: ['email', 'push'],
        categories_preferees: ['Mode', 'Cosmétiques'],
        budget_moyen: 25000,
      },
      derniere_interaction: {
        type: 'achat',
        date: '2024-01-10T14:15:00Z',
        description: 'Premier achat - Robe Africaine',
      },
    },
  ]);

  const customerSegments = [
    { id: 'all', name: 'Tous', count: customers.length, color: 'gray' },
    { id: 'nouveau', name: 'Nouveaux', count: 1, color: 'blue' },
    { id: 'regulier', name: 'Réguliers', count: 1, color: 'green' },
    { id: 'vip', name: 'VIP', count: 1, color: 'gold' },
    { id: 'inactif', name: 'Inactifs', count: 0, color: 'red' },
  ];

  const customerValidationSchema = yup.object({
    prenom: yup.string().required('Le prénom est requis').min(2, 'Minimum 2 caractères'),
    nom: yup.string().required('Le nom est requis').min(2, 'Minimum 2 caractères'),
    email: yup.string().email('Email invalide').required('L\'email est requis'),
    telephone: yup.string().required('Le téléphone est requis').matches(/^\+?[1-9]\d{1,14}$/, 'Format téléphone invalide'),
    adresse_facturation: yup.string().required('L\'adresse de facturation est requise'),
    type_client: yup.string().required('Le type de client est requis'),
  });

  const customerFormFields = [
    {
      name: 'prenom',
      label: 'Prénom',
      type: 'text' as const,
      placeholder: 'Ex: Aminata',
      icon: <Users className="w-4 h-4" />,
    },
    {
      name: 'nom',
      label: 'Nom',
      type: 'text' as const,
      placeholder: 'Ex: Diop',
      icon: <Users className="w-4 h-4" />,
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email' as const,
      placeholder: 'aminata@email.sn',
      icon: <Mail className="w-4 h-4" />,
    },
    {
      name: 'telephone',
      label: 'Téléphone',
      type: 'text' as const,
      placeholder: '+221 77 123 45 67',
      icon: <Phone className="w-4 h-4" />,
    },
    {
      name: 'type_client',
      label: 'Type de Client',
      type: 'select' as const,
      options: [
        { label: 'Particulier', value: 'particulier' },
        { label: 'Professionnel', value: 'professionnel' },
        { label: 'Entreprise', value: 'entreprise' },
      ],
      icon: <Users className="w-4 h-4" />,
    },
    {
      name: 'entreprise_nom',
      label: 'Nom de l\'Entreprise',
      type: 'text' as const,
      placeholder: 'Ex: Salon de Beauté Aminata',
      description: 'Requis pour les clients professionnels et entreprises',
    },
    {
      name: 'adresse_facturation',
      label: 'Adresse de Facturation',
      type: 'textarea' as const,
      placeholder: 'Adresse complète...',
      rows: 3,
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      name: 'adresse_livraison',
      label: 'Adresse de Livraison',
      type: 'textarea' as const,
      placeholder: 'Si différente de l\'adresse de facturation...',
      rows: 3,
      description: 'Optionnel - Laissez vide si identique à l\'adresse de facturation',
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea' as const,
      placeholder: 'Notes sur le client...',
      rows: 3,
      description: 'Informations supplémentaires sur le client',
    },
  ];

  const handleCustomerSubmit = async (data: any) => {
    try {
      console.log('Création du client:', data);
      
      // Préparer les données pour l'API
      const customerData = {
        username: data.email, // Utiliser l'email comme username
        password: 'TempPassword123!', // Mot de passe temporaire
        email: data.email,
        first_name: data.prenom,
        last_name: data.nom,
        telephone: data.telephone,
        type_utilisateur: 'client',
        adresse: data.adresse_facturation || '',
        date_naissance: null,
        preferences: {
          notifications: true,
          newsletter: false
        }
      };

      // Appel API réel
      const response = await apiService.createCustomer(customerData);
      console.log('Client créé avec succès:', response);
      
      // Recharger la liste des clients
      await loadCustomers();
      
      // Fermer le formulaire
      setShowCustomerForm(false);
      
      alert('Client créé avec succès !');
      
    } catch (error: any) {
      console.error('Erreur lors de la création du client:', error);
      
      // Gestion des erreurs détaillée
      let errorMessage = 'Erreur lors de la création du client';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'object') {
          // Afficher les erreurs de validation
          const validationErrors = Object.entries(errorData)
            .map(([field, messages]: [string, any]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          errorMessage = `Erreurs de validation:\n${validationErrors}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Erreur: ${errorMessage}`);
    }
  };

  const handleExportCustomers = async () => {
    try {
      // Générer un fichier CSV des clients
      const csvContent = customers.map(customer => 
        `${customer.nom},${customer.prenom},${customer.email},${customer.telephone},${customer.total_achats}`
      ).join('\n');
      
      const csvHeader = 'Nom,Prénom,Email,Téléphone,Total Achats\n';
      const fullCsv = csvHeader + csvContent;
      
      const blob = new Blob([fullCsv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'clients.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      
      alert('Export des clients réussi !');
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export');
    }
  };

  const handleContactCustomer = async (customer: any, message: string) => {
    try {
      // Créer un ticket de support pour le contact client
      const contactData = {
        sujet: `Contact client - ${customer.nom} ${customer.prenom}`,
        description: `Message envoyé à ${customer.email}:\n\n${message}`,
        priorite: 'moyenne',
        categorie: 'contact_client',
        client_email: customer.email,
        client_nom: `${customer.nom} ${customer.prenom}`
      };
      
      await apiService.createTicket(contactData);
      alert(`Message envoyé à ${customer.nom} ${customer.prenom} (${customer.email})`);
      setShowContactModal(false);
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      alert('Erreur lors de l\'envoi du message');
    }
  };

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'vip':
        return 'bg-gold-100 text-gold-800 dark:bg-gold-900 dark:text-gold-200';
      case 'regulier':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'nouveau':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'inactif':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getLoyaltyIcon = (niveau: string) => {
    switch (niveau) {
      case 'diamant':
        return <Crown className="w-4 h-4 text-purple-500" />;
      case 'platine':
        return <Award className="w-4 h-4 text-gray-400" />;
      case 'or':
        return <Star className="w-4 h-4 text-yellow-500" />;
      case 'argent':
        return <Star className="w-4 h-4 text-gray-400" />;
      default:
        return <Star className="w-4 h-4 text-amber-600" />;
    }
  };

  const CustomerCard = ({ customer }: { customer: any }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
      className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden group cursor-pointer"
      onClick={() => setSelectedCustomer(customer)}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <img
            src={customer.avatar}
            alt={`${customer.prenom} ${customer.nom}`}
            className="w-16 h-16 rounded-full object-cover border-2 border-primary-500"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {customer.prenom || ''} {customer.nom || ''}
              </h3>
              {getLoyaltyIcon(customer.niveau_fidelite)}
            </div>
            <p className="text-sm text-gray-500">{customer.email || ''}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`text-xs px-2 py-1 rounded-full ${getSegmentColor(customer.segment)}`}>
                {(customer.segment || '').charAt(0).toUpperCase() + (customer.segment || '').slice(1)}
              </span>
              <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                {customer.type_client || ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-6">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-lg font-bold text-blue-600">{customer.nombre_commandes}</p>
            <p className="text-xs text-gray-500">Commandes</p>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-lg font-bold text-green-600">
              {(customer.total_achats / 1000).toFixed(0)}K
            </p>
            <p className="text-xs text-gray-500">Total XOF</p>
          </div>
          <div className="text-center p-3 bg-gold-50 dark:bg-gold-900/20 rounded-lg">
            <p className="text-lg font-bold text-gold-600">{customer.points_fidelite}</p>
            <p className="text-xs text-gray-500">Points</p>
          </div>
        </div>

        {/* Last Interaction */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">Dernière interaction</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {customer.derniere_interaction.description}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(customer.derniere_interaction.date).toLocaleDateString('fr-FR')}
          </p>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button
            variant="primary"
            size="sm"
            icon={<MessageSquare className="w-3 h-3" />}
            onClick={() => {
              setSelectedCustomer(customer);
              setShowContactModal(true);
            }}
          >
            Contacter
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Eye className="w-3 h-3" />}
            onClick={() => {
              setSelectedCustomer(customer);
            }}
          >
            Voir
          </Button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">CRM Clients</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez vos relations clients avec intelligence
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="secondary" icon={<Send className="w-4 h-4" />} onClick={() => setShowCampaignModal(true)}>
            Campagne
          </Button>
          <Button 
            variant="secondary" 
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportCustomers}
          >
            Exporter
          </Button>
          <Button variant="primary" icon={<UserPlus className="w-4 h-4" />} onClick={() => setShowCustomerForm(true)}>
            Nouveau Client
          </Button>
        </div>
      </div>

      {/* CRM Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Clients Totaux"
          value={metrics.totalCustomers}
          previousValue={Math.max(0, metrics.totalCustomers - 1)}
          format="number"
          icon={<Users className="w-6 h-6" />}
          color="primary"
        />
        <MetricCard
          title="Nouveaux ce Mois"
          value={metrics.newThisMonth}
          previousValue={Math.max(0, metrics.newThisMonth - 1)}
          format="number"
          icon={<UserPlus className="w-6 h-6" />}
          color="success"
        />
        <MetricCard
          title="Valeur Vie Client"
          value={metrics.lifetimeValue}
          previousValue={Math.floor(metrics.lifetimeValue * 0.9)}
          format="currency"
          icon={<TrendingUp className="w-6 h-6" />}
          color="info"
        />
        <MetricCard
          title="Taux de Rétention"
          value={metrics.retentionRate}
          previousValue={Math.max(0, metrics.retentionRate - 2)}
          format="percentage"
          icon={<Heart className="w-6 h-6" />}
          color="warning"
        />
      </div>

      {/* Segments */}
      <div className="card-premium p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Segments Clients
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'secondary'}
              size="sm"
              icon={<Users className="w-4 h-4" />}
              onClick={() => setViewMode('grid')}
            >
              Grille
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'secondary'}
              size="sm"
              icon={<Users className="w-4 h-4" />}
              onClick={() => setViewMode('list')}
            >
              Liste
            </Button>
          </div>
        </div>

        <div className="flex space-x-4 mb-6">
          {customerSegments.map((segment) => (
            <motion.button
              key={segment.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedTab(segment.id)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300
                ${selectedTab === segment.id
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
              `}
            >
              <span>{segment.name}</span>
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                {segment.count}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, email, téléphone..."
            className="input-premium pl-10 w-full"
          />
        </div>

        {/* Customers Display */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-2 text-gray-600">Chargement des clients...</span>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {customers
                .filter(customer => 
                  (customer.nom?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                  (customer.prenom?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                  (customer.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                  (customer.telephone || '').includes(searchTerm)
                )
                .map((customer) => (
                  <CustomerCard key={customer.id} customer={customer} />
                ))}
            </AnimatePresence>
          </div>
        ) : (
          <DataTable
            data={customers.filter(customer => 
              (customer.nom?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
              (customer.prenom?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
              (customer.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
              (customer.telephone || '').includes(searchTerm)
            )}
            columns={[
              {
                accessorKey: 'prenom',
                header: 'Client',
                cell: ({ row }) => (
                  <div className="flex items-center space-x-3">
                    <img
                      src={row.original.avatar}
                      alt={`${row.original.prenom} ${row.original.nom}`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {row.original.prenom || ''} {row.original.nom || ''}
                      </p>
                      <p className="text-sm text-gray-500">{row.original.email || ''}</p>
                    </div>
                  </div>
                ),
              },
              {
                accessorKey: 'segment',
                header: 'Segment',
                cell: ({ row }) => (
                  <span className={`text-xs px-2 py-1 rounded-full ${getSegmentColor(row.original.segment)}`}>
                    {(row.original.segment || '').charAt(0).toUpperCase() + (row.original.segment || '').slice(1)}
                  </span>
                ),
              },
              {
                accessorKey: 'total_achats',
                header: 'Total Achats',
                cell: ({ row }) => `${(row.original.total_achats / 1000).toFixed(0)}K XOF`,
              },
              {
                accessorKey: 'nombre_commandes',
                header: 'Commandes',
                cell: ({ row }) => row.original.nombre_commandes,
              },
              {
                accessorKey: 'points_fidelite',
                header: 'Points',
                cell: ({ row }) => (
                  <div className="flex items-center space-x-1">
                    {getLoyaltyIcon(row.original.niveau_fidelite)}
                    <span>{row.original.points_fidelite}</span>
                  </div>
                ),
              },
              {
                accessorKey: 'actions',
                header: 'Actions',
                cell: ({ row }) => (
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      icon={<Eye className="w-3 h-3" />}
                      onClick={() => {
                        setSelectedCustomer(row.original);
                      }}
                    >
                      Voir
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      icon={<Edit className="w-3 h-3" />}
                      onClick={() => {
                        setSelectedCustomer(row.original);
                        setShowCustomerForm(true);
                      }}
                    >
                      Modifier
                    </Button>
                  </div>
                ),
              },
            ]}
            searchable
            exportable
            onRowClick={(customer) => setSelectedCustomer(customer)}
          />
        )}
      </div>

      {/* Customer Form Modal */}
      <AnimatePresence>
        {showCustomerForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={() => setShowCustomerForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatedForm
                title="Nouveau Client"
                description="Ajoutez un nouveau client à votre base CRM"
                fields={customerFormFields}
                validationSchema={customerValidationSchema}
                onSubmit={handleCustomerSubmit}
                columns={2}
                submitLabel="Créer le Client"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Customer Detail Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={() => setSelectedCustomer(null)}
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
                <div className="flex items-center space-x-4">
                  <img
                    src={selectedCustomer.avatar}
                    alt={`${selectedCustomer.prenom} ${selectedCustomer.nom}`}
                    className="w-20 h-20 rounded-full object-cover border-4 border-primary-500"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedCustomer.prenom || ''} {selectedCustomer.nom || ''}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">{selectedCustomer.email || ''}</p>
                    <div className="flex items-center space-x-3 mt-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSegmentColor(selectedCustomer.segment)}`}>
                        {(selectedCustomer.segment || '').charAt(0).toUpperCase() + (selectedCustomer.segment || '').slice(1)}
                      </span>
                      <div className="flex items-center space-x-1">
                        {getLoyaltyIcon(selectedCustomer.niveau_fidelite)}
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Niveau {selectedCustomer.niveau_fidelite || ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Customer Stats */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Statistiques Client
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                          <ShoppingCart className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-blue-600">{selectedCustomer.nombre_commandes}</p>
                          <p className="text-sm text-gray-500">Commandes</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                          <DollarSign className="w-6 h-6 text-green-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-green-600">
                            {(selectedCustomer.total_achats / 1000).toFixed(0)}K
                          </p>
                          <p className="text-sm text-gray-500">Total Dépensé</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                          <Target className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-purple-600">
                            {(selectedCustomer.panier_moyen / 1000).toFixed(0)}K
                          </p>
                          <p className="text-sm text-gray-500">Panier Moyen</p>
                        </div>
                        <div className="text-center p-4 bg-gold-50 dark:bg-gold-900/20 rounded-xl">
                          <Gift className="w-6 h-6 text-gold-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-gold-600">{selectedCustomer.points_fidelite}</p>
                          <p className="text-sm text-gray-500">Points Fidélité</p>
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Informations de Contact</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{selectedCustomer.telephone || ''}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{selectedCustomer.email || ''}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{selectedCustomer.adresse_facturation || ''}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">
                            Client depuis {new Date(selectedCustomer.date_creation).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Preferences */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Préférences</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Communication</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {selectedCustomer.preferences.communication.map((method: string) => (
                              <span
                                key={method}
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                              >
                                {method}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Catégories Préférées</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {selectedCustomer.preferences.categories_preferees.map((category: string) => (
                              <span
                                key={category}
                                className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full"
                              >
                                {category}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Budget Moyen</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {selectedCustomer.preferences.budget_moyen.toLocaleString()} XOF
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Loyalty Status */}
                    <div className="bg-gradient-to-r from-gold-500 to-amber-500 rounded-xl p-6 text-white">
                      <h3 className="font-semibold mb-4">Programme Fidélité</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Niveau</span>
                          <span className="font-bold capitalize">{selectedCustomer.niveau_fidelite}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Points</span>
                          <span className="font-bold">{selectedCustomer.points_fidelite}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Score Fidélité</span>
                          <span className="font-bold">{selectedCustomer.score_fidelite}/100</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <Button
                        variant="primary"
                        fullWidth
                        icon={<MessageSquare className="w-4 h-4" />}
                      >
                        Envoyer Message
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
                        icon={<Gift className="w-4 h-4" />}
                      >
                        Ajouter Points
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
                            {new Date(selectedCustomer.date_derniere_commande).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="text-sm">
                          <p className="text-gray-900 dark:text-white">Source acquisition</p>
                          <p className="text-gray-500 capitalize">{selectedCustomer.source_acquisition}</p>
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

      {/* Campaign Modal */}
      <AnimatePresence>
        {showCampaignModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={() => setShowCampaignModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark-800 rounded-2xl max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Nouvelle Campagne Marketing
                  </h2>
                  <button
                    onClick={() => setShowCampaignModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nom de la Campagne
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Promotion Boubous Ramadan"
                      className="input-premium w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Segment Cible
                    </label>
                    <select className="input-premium w-full">
                      <option value="tous">Tous les clients</option>
                      <option value="vip">Clients VIP</option>
                      <option value="regulier">Clients Réguliers</option>
                      <option value="nouveau">Nouveaux Clients</option>
                      <option value="inactif">Clients Inactifs</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message
                    </label>
                    <textarea
                      placeholder="Votre message de campagne..."
                      className="input-premium w-full"
                      rows={4}
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button variant="secondary" fullWidth onClick={() => setShowCampaignModal(false)}>
                      Annuler
                    </Button>
                    <Button variant="primary" fullWidth icon={<Send className="w-4 h-4" />}>
                      Lancer Campagne
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Modal de Contact Client */}
        {showContactModal && selectedCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Contacter {selectedCustomer.nom || ''} {selectedCustomer.prenom || ''}
                </h3>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    id="contactMessage"
                    rows={4}
                    placeholder="Votre message..."
                    className="input-premium w-full"
                  />
                </div>

                <div className="flex space-x-3">
                  <Button 
                    variant="secondary" 
                    fullWidth 
                    onClick={() => setShowContactModal(false)}
                  >
                    Annuler
                  </Button>
                  <Button 
                    variant="primary" 
                    fullWidth 
                    icon={<Send className="w-4 h-4" />}
                    onClick={() => {
                      const message = (document.getElementById('contactMessage') as HTMLTextAreaElement)?.value;
                      if (message) {
                        handleContactCustomer(selectedCustomer, message);
                      } else {
                        alert('Veuillez saisir un message');
                      }
                    }}
                  >
                    Envoyer
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomersPage;