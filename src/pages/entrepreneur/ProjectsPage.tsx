import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  BarChart3,
  FileText,
  MessageSquare,
  Paperclip,
  X,
  User,
  TrendingUp
} from 'lucide-react';
import Button from '../../components/ui/Button';
import MetricCard from '../../components/ui/MetricCard';
import AnimatedForm from '../../components/forms/AnimatedForm';
import apiService from '../../services/api/realApi';
import * as yup from 'yup';

const ProjectsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  const mockProjects = [
    {
      id: '1',
      nom: 'Site E-commerce Boutique Marie',
      description: 'Développement d\'un site e-commerce moderne avec catalogue produits, panier et paiements mobiles',
      code_projet: 'PROJ-001',
      client: {
        id: '1',
        nom: 'Aminata Diop',
        email: 'aminata@salonbeaute.sn',
        entreprise: 'Salon de Beauté Aminata',
      },
      responsable: {
        id: '1',
        nom: 'Amadou Ba',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      },
      equipe: [
        { id: '1', nom: 'Fatou Sow', role: 'Designer', avatar: 'https://images.pexels.com/photos/3992656/pexels-photo-3992656.png?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2' },
        { id: '2', nom: 'Ousmane Diallo', role: 'Développeur', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2' },
      ],
      date_debut: '2024-01-01',
      date_fin_prevue: '2024-03-15',
      date_fin_reelle: null,
      statut: 'en_cours',
      priorite: 'high',
      budget_prevu: 2500000,
      budget_consomme: 850000,
      marge_prevue: 750000,
      marge_reelle: 0,
      pourcentage_completion: 45,
      tags: ['e-commerce', 'mobile', 'paiements'],
      taches: [
        { id: '1', nom: 'Analyse des besoins', statut: 'terminee', assignee: 'Amadou Ba' },
        { id: '2', nom: 'Design UI/UX', statut: 'en_cours', assignee: 'Fatou Sow' },
        { id: '3', nom: 'Développement Frontend', statut: 'a_faire', assignee: 'Ousmane Diallo' },
        { id: '4', nom: 'Intégration Paiements', statut: 'a_faire', assignee: 'Amadou Ba' },
      ],
      risques: [
        { description: 'Retard livraison design', probabilite: 30, impact: 60, score: 18 },
        { description: 'Complexité intégration Wave', probabilite: 20, impact: 80, score: 16 },
      ],
    },
    {
      id: '2',
      nom: 'Système Gestion Pharmacie',
      description: 'Implémentation d\'un système de gestion complet pour pharmacie avec gestion stock médicaments',
      code_projet: 'PROJ-002',
      client: {
        id: '2',
        nom: 'Dr. Fatou Sow',
        email: 'fatou@pharmaciemoderne.sn',
        entreprise: 'Pharmacie Moderne',
      },
      responsable: {
        id: '1',
        nom: 'Amadou Ba',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      },
      equipe: [
        { id: '3', nom: 'Khadija Fall', role: 'Analyste', avatar: 'https://images.pexels.com/photos/3992656/pexels-photo-3992656.png?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2' },
      ],
      date_debut: '2023-12-01',
      date_fin_prevue: '2024-02-29',
      date_fin_reelle: null,
      statut: 'en_cours',
      priorite: 'urgent',
      budget_prevu: 1800000,
      budget_consomme: 1200000,
      marge_prevue: 500000,
      marge_reelle: 0,
      pourcentage_completion: 75,
      tags: ['pharmacie', 'santé', 'gestion'],
      taches: [
        { id: '1', nom: 'Audit système existant', statut: 'terminee', assignee: 'Khadija Fall' },
        { id: '2', nom: 'Développement modules', statut: 'en_cours', assignee: 'Amadou Ba' },
        { id: '3', nom: 'Tests et validation', statut: 'a_faire', assignee: 'Khadija Fall' },
        { id: '4', nom: 'Formation utilisateurs', statut: 'a_faire', assignee: 'Amadou Ba' },
      ],
      risques: [
        { description: 'Résistance au changement', probabilite: 40, impact: 70, score: 28 },
      ],
    },
    {
      id: '3',
      nom: 'App Mobile Restaurant',
      description: 'Application mobile pour commandes en ligne et livraison restaurant',
      code_projet: 'PROJ-003',
      client: {
        id: '3',
        nom: 'Moussa Ndiaye',
        email: 'moussa@restaurant-baobab.sn',
        entreprise: 'Restaurant Le Baobab',
      },
      responsable: {
        id: '1',
        nom: 'Amadou Ba',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      },
      equipe: [
        { id: '4', nom: 'Ibrahima Sarr', role: 'Dev Mobile', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2' },
        { id: '5', nom: 'Mariama Thiam', role: 'UX Designer', avatar: 'https://images.pexels.com/photos/3992656/pexels-photo-3992656.png?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2' },
      ],
      date_debut: '2024-01-15',
      date_fin_prevue: '2024-04-30',
      date_fin_reelle: null,
      statut: 'planifie',
      priorite: 'medium',
      budget_prevu: 3200000,
      budget_consomme: 0,
      marge_prevue: 1200000,
      marge_reelle: 0,
      pourcentage_completion: 5,
      tags: ['mobile', 'restaurant', 'livraison'],
      taches: [
        { id: '1', nom: 'Cahier des charges', statut: 'en_cours', assignee: 'Mariama Thiam' },
        { id: '2', nom: 'Maquettes UI', statut: 'a_faire', assignee: 'Mariama Thiam' },
        { id: '3', nom: 'Développement iOS', statut: 'a_faire', assignee: 'Ibrahima Sarr' },
        { id: '4', nom: 'Développement Android', statut: 'a_faire', assignee: 'Ibrahima Sarr' },
      ],
      risques: [
        { description: 'Délai serré pour livraison', probabilite: 60, impact: 50, score: 30 },
      ],
    },
  ];

  const projectStatuses = [
    { id: 'all', name: 'Tous', count: mockProjects.length },
    { id: 'planifie', name: 'Planifiés', count: 1 },
    { id: 'en_cours', name: 'En Cours', count: 2 },
    { id: 'termine', name: 'Terminés', count: 0 },
    { id: 'suspendu', name: 'Suspendus', count: 0 },
  ];

  const projectValidationSchema = yup.object({
    nom: yup.string().required('Le nom du projet est requis').min(5, 'Minimum 5 caractères'),
    description: yup.string().required('La description est requise').min(20, 'Minimum 20 caractères'),
    client_id: yup.string().required('Le client est requis'),
    date_debut: yup.date().required('La date de début est requise'),
    date_fin_prevue: yup.date().required('La date de fin est requise').min(yup.ref('date_debut'), 'La date de fin doit être après le début'),
    budget_prevu: yup.number().required('Le budget est requis').min(0, 'Le budget doit être positif'),
    priorite: yup.string().required('La priorité est requise'),
  });

  const projectFormFields = [
    {
      name: 'nom',
      label: 'Nom du Projet',
      type: 'text' as const,
      placeholder: 'Ex: Site E-commerce Boutique',
      icon: <Target className="w-4 h-4" />,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea' as const,
      placeholder: 'Description détaillée du projet...',
      rows: 4,
    },
    {
      name: 'client_id',
      label: 'Client',
      type: 'select' as const,
      options: [
        { label: 'Aminata Diop - Salon de Beauté', value: '1' },
        { label: 'Dr. Fatou Sow - Pharmacie Moderne', value: '2' },
        { label: 'Moussa Ndiaye - Restaurant Baobab', value: '3' },
      ],
      icon: <Users className="w-4 h-4" />,
    },
    {
      name: 'date_debut',
      label: 'Date de Début',
      type: 'date' as const,
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      name: 'date_fin_prevue',
      label: 'Date de Fin Prévue',
      type: 'date' as const,
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      name: 'budget_prevu',
      label: 'Budget Prévu (XOF)',
      type: 'number' as const,
      placeholder: '0',
      icon: <DollarSign className="w-4 h-4" />,
    },
    {
      name: 'priorite',
      label: 'Priorité',
      type: 'select' as const,
      options: [
        { label: 'Basse', value: 'low' },
        { label: 'Moyenne', value: 'medium' },
        { label: 'Haute', value: 'high' },
        { label: 'Urgente', value: 'urgent' },
      ],
      icon: <AlertTriangle className="w-4 h-4" />,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planifie':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'en_cours':
        return <Play className="w-4 h-4 text-green-500" />;
      case 'termine':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'suspendu':
        return <Pause className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planifie':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'en_cours':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'termine':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'suspendu':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleProjectSubmit = async (data: any) => {
    try {
      console.log('Création du projet:', data);
      
      // Préparer les données pour l'API
      const projectData = {
        nom: data.nom,
        description: data.description || '',
        client_id: data.client_id || null,
        date_debut: data.date_debut || new Date().toISOString(),
        date_fin_prevue: data.date_fin_prevue || null,
        budget: parseFloat(data.budget) || 0,
        statut: data.statut || 'planifie',
        priorite: data.priorite || 'moyenne',
        tags: data.tags || [],
        notes: data.notes || ''
      };

      // Appel API réel
      const response = await apiService.createProject(projectData);
      console.log('Projet créé avec succès:', response);
      
      // Fermer le formulaire
      setShowProjectForm(false);
      
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
    }
  };

  const ProjectCard = ({ project }: { project: any }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
      className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden group cursor-pointer"
      onClick={() => setSelectedProject(project)}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {project.nom}
            </h3>
            <p className="text-sm text-gray-500">{project.code_projet}</p>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(project.statut)}
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.statut)}`}>
              {project.statut === 'planifie' ? 'Planifié' :
               project.statut === 'en_cours' ? 'En cours' :
               project.statut === 'termine' ? 'Terminé' : 'Suspendu'}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
          {project.description}
        </p>

        {/* Client */}
        <div className="flex items-center space-x-2 mb-3">
          <User className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {project.client.nom} - {project.client.entreprise}
          </span>
        </div>

        {/* Priority */}
        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(project.priorite)}`}>
            {project.priorite === 'urgent' ? 'Urgente' :
             project.priorite === 'high' ? 'Haute' :
             project.priorite === 'medium' ? 'Moyenne' : 'Basse'}
          </span>
          <div className="flex -space-x-2">
            {project.equipe.slice(0, 3).map((member: any, i: number) => (
              <img
                key={member.id}
                src={member.avatar}
                alt={member.nom}
                className="w-6 h-6 rounded-full border-2 border-white dark:border-dark-800"
                style={{ zIndex: 10 - i }}
                title={member.nom}
              />
            ))}
            {project.equipe.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-600 border-2 border-white dark:border-dark-800 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  +{project.equipe.length - 3}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Progression</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {project.pourcentage_completion}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
          <motion.div
            className="bg-primary-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${project.pourcentage_completion}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>

        {/* Budget */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <p className="text-xs text-gray-500">Budget</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {(project.budget_prevu / 1000000).toFixed(1)}M XOF
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Consommé</p>
            <p className="font-semibold text-orange-600">
              {(project.budget_consomme / 1000000).toFixed(1)}M XOF
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Début: {new Date(project.date_debut).toLocaleDateString('fr-FR')}</span>
          <span>Fin: {new Date(project.date_fin_prevue).toLocaleDateString('fr-FR')}</span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Gestion des Projets</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Pilotez vos projets avec méthodologie agile
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="secondary" icon={<BarChart3 className="w-4 h-4" />}>
            Gantt
          </Button>
          <Button variant="secondary" icon={<FileText className="w-4 h-4" />}>
            Rapports
          </Button>
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setShowProjectForm(true)}>
            Nouveau Projet
          </Button>
        </div>
      </div>

      {/* Project Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Projets Actifs"
          value={2}
          previousValue={1}
          format="number"
          icon={<Target className="w-6 h-6" />}
          color="primary"
        />
        <MetricCard
          title="Budget Total"
          value={7500000}
          previousValue={6200000}
          format="currency"
          icon={<DollarSign className="w-6 h-6" />}
          color="success"
        />
        <MetricCard
          title="Progression Moyenne"
          value={41.7}
          previousValue={35.2}
          format="percentage"
          icon={<TrendingUp className="w-6 h-6" />}
          color="info"
        />
        <MetricCard
          title="Tâches Terminées"
          value={8}
          previousValue={5}
          format="number"
          icon={<CheckCircle className="w-6 h-6" />}
          color="warning"
        />
      </div>

      {/* Projects Display */}
      <div className="card-premium">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {projectStatuses.map((status) => (
              <button
                key={status.id}
                onClick={() => setSelectedTab(status.id)}
                className={`
                  flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors
                  ${selectedTab === status.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }
                `}
              >
                <span>{status.name}</span>
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                  {status.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un projet..."
                  className="input-premium pl-10 w-64"
                />
              </div>
              <Button variant="secondary" size="sm" icon={<Filter className="w-4 h-4" />}>
                Filtres
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'kanban' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('kanban')}
              >
                Kanban
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                Liste
              </Button>
            </div>
          </div>
        </div>

        {/* Projects */}
        <div className="p-6">
          {viewMode === 'kanban' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {mockProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      Projet
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      Client
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      Progression
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      Budget
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {mockProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{project.nom}</p>
                          <p className="text-sm text-gray-500">{project.code_projet}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{project.client.nom}</p>
                          <p className="text-xs text-gray-500">{project.client.entreprise}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(project.statut)}
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.statut)}`}>
                            {project.statut === 'planifie' ? 'Planifié' :
                             project.statut === 'en_cours' ? 'En cours' : 'Terminé'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-primary-500 h-2 rounded-full"
                              style={{ width: `${project.pourcentage_completion}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {project.pourcentage_completion}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {(project.budget_prevu / 1000000).toFixed(1)}M XOF
                          </p>
                          <p className="text-xs text-gray-500">
                            {(project.budget_consomme / 1000000).toFixed(1)}M consommé
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="secondary" size="sm" icon={<Eye className="w-3 h-3" />}>
                            Voir
                          </Button>
                          <Button variant="secondary" size="sm" icon={<Edit className="w-3 h-3" />}>
                            Modifier
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Project Form Modal */}
      <AnimatePresence>
        {showProjectForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={() => setShowProjectForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatedForm
                title="Nouveau Projet"
                description="Créez un nouveau projet pour votre client"
                fields={projectFormFields}
                validationSchema={projectValidationSchema}
                onSubmit={handleProjectSubmit}
                columns={2}
                submitLabel="Créer le Projet"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={() => setSelectedProject(null)}
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
                    {selectedProject.nom}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">{selectedProject.code_projet}</p>
                </div>
                
                <button
                  onClick={() => setSelectedProject(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                      <p className="text-gray-600 dark:text-gray-300">{selectedProject.description}</p>
                    </div>

                    {/* Tasks */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Tâches</h3>
                      <div className="space-y-3">
                        {selectedProject.taches.map((tache: any) => (
                          <div key={tache.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${
                                tache.statut === 'terminee' ? 'bg-green-500' :
                                tache.statut === 'en_cours' ? 'bg-blue-500' : 'bg-gray-300'
                              }`} />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white text-sm">{tache.nom}</p>
                                <p className="text-xs text-gray-500">Assigné à {tache.assignee}</p>
                              </div>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              tache.statut === 'terminee' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              tache.statut === 'en_cours' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                            }`}>
                              {tache.statut === 'terminee' ? 'Terminée' :
                               tache.statut === 'en_cours' ? 'En cours' : 'À faire'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Risks */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Risques Identifiés</h3>
                      <div className="space-y-3">
                        {selectedProject.risques.map((risque: any, index: number) => (
                          <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{risque.description}</p>
                              <span className="text-xs bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full">
                                Score: {risque.score}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
                              <span>Probabilité: {risque.probabilite}%</span>
                              <span>Impact: {risque.impact}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Project Info */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Informations</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Client</p>
                          <p className="font-medium text-gray-900 dark:text-white">{selectedProject.client.nom}</p>
                          <p className="text-xs text-gray-500">{selectedProject.client.entreprise}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Responsable</p>
                          <p className="font-medium text-gray-900 dark:text-white">{selectedProject.responsable.nom}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Dates</p>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {new Date(selectedProject.date_debut).toLocaleDateString('fr-FR')} → {new Date(selectedProject.date_fin_prevue).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Budget */}
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white">
                      <h4 className="font-semibold mb-4">Budget</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Prévu</span>
                          <span className="font-bold">
                            {(selectedProject.budget_prevu / 1000000).toFixed(1)}M XOF
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Consommé</span>
                          <span className="font-bold">
                            {(selectedProject.budget_consomme / 1000000).toFixed(1)}M XOF
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Restant</span>
                          <span className="font-bold">
                            {((selectedProject.budget_prevu - selectedProject.budget_consomme) / 1000000).toFixed(1)}M XOF
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Team */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Équipe</h4>
                      <div className="space-y-2">
                        {selectedProject.equipe.map((member: any) => (
                          <div key={member.id} className="flex items-center space-x-3">
                            <img
                              src={member.avatar}
                              alt={member.nom}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{member.nom}</p>
                              <p className="text-xs text-gray-500">{member.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <Button
                        variant="primary"
                        fullWidth
                        icon={<Edit className="w-4 h-4" />}
                      >
                        Modifier Projet
                      </Button>
                      <Button
                        variant="secondary"
                        fullWidth
                        icon={<MessageSquare className="w-4 h-4" />}
                      >
                        Contacter Client
                      </Button>
                      <Button
                        variant="secondary"
                        fullWidth
                        icon={<FileText className="w-4 h-4" />}
                      >
                        Générer Rapport
                      </Button>
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

export default ProjectsPage;