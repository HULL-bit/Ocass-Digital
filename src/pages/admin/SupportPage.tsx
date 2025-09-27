import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Headphones, 
  Plus, 
  Search, 
  Filter, 
  MessageSquare, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  User,
  Calendar,
  Tag,
  Star,
  Eye,
  Edit,
  X,
  Send,
  Paperclip,
  Phone,
  Mail,
  Video
} from 'lucide-react';
import Button from '../../components/ui/Button';
import MetricCard from '../../components/ui/MetricCard';

const SupportPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('tickets');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');

  const mockTickets = [
    {
      id: 'SUP001',
      title: 'Problème de synchronisation stock',
      description: 'Les quantités en stock ne se mettent pas à jour automatiquement après les ventes.',
      category: 'technique',
      priority: 'high',
      status: 'open',
      user: {
        name: 'Marie Diallo',
        email: 'marie@boutiquemarie.sn',
        company: 'Boutique Marie Diallo',
        avatar: 'https://images.pexels.com/photos/3992656/pexels-photo-3992656.png?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      },
      assignedTo: {
        name: 'Support Tech',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      },
      createdAt: '2024-01-15T09:30:00Z',
      updatedAt: '2024-01-15T10:15:00Z',
      responseTime: '45 minutes',
      satisfaction: null,
      tags: ['stock', 'synchronisation', 'urgent'],
      messages: [
        {
          id: '1',
          author: 'Marie Diallo',
          content: 'Bonjour, j\'ai un problème avec la synchronisation du stock. Quand je fais une vente, les quantités ne se mettent pas à jour automatiquement.',
          timestamp: '2024-01-15T09:30:00Z',
          type: 'user',
        },
        {
          id: '2',
          author: 'Support Tech',
          content: 'Bonjour Marie, merci pour votre message. Je vais vérifier la configuration de votre système de stock. Pouvez-vous me dire si cela arrive pour tous les produits ou seulement certains ?',
          timestamp: '2024-01-15T10:15:00Z',
          type: 'support',
        },
      ],
    },
    {
      id: 'SUP002',
      title: 'Question sur la facturation',
      description: 'Comment configurer la TVA pour les produits exonérés ?',
      category: 'facturation',
      priority: 'medium',
      status: 'in_progress',
      user: {
        name: 'Amadou Ba',
        email: 'amadou@techsolutions.sn',
        company: 'TechSolutions Sénégal',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      },
      assignedTo: {
        name: 'Support Billing',
        avatar: 'https://images.pexels.com/photos/3992656/pexels-photo-3992656.png?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      },
      createdAt: '2024-01-14T14:20:00Z',
      updatedAt: '2024-01-15T08:45:00Z',
      responseTime: '2 heures',
      satisfaction: null,
      tags: ['facturation', 'tva', 'configuration'],
      messages: [
        {
          id: '1',
          author: 'Amadou Ba',
          content: 'Bonjour, je vends des médicaments qui sont exonérés de TVA. Comment configurer cela dans le système ?',
          timestamp: '2024-01-14T14:20:00Z',
          type: 'user',
        },
        {
          id: '2',
          author: 'Support Billing',
          content: 'Bonjour Amadou, pour configurer l\'exonération de TVA, allez dans Paramètres > Taxes et créez une nouvelle règle de TVA à 0% pour la catégorie "Médicaments".',
          timestamp: '2024-01-15T08:45:00Z',
          type: 'support',
        },
      ],
    },
    {
      id: 'SUP003',
      title: 'Demande de formation',
      description: 'Souhait d\'une formation sur l\'utilisation des analytics avancés.',
      category: 'formation',
      priority: 'low',
      status: 'resolved',
      user: {
        name: 'Fatou Sow',
        email: 'fatou@pharmaciemoderne.sn',
        company: 'Pharmacie Moderne',
        avatar: 'https://images.pexels.com/photos/3992656/pexels-photo-3992656.png?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      },
      assignedTo: {
        name: 'Support Formation',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      },
      createdAt: '2024-01-12T11:00:00Z',
      updatedAt: '2024-01-14T16:30:00Z',
      responseTime: '1 heure',
      satisfaction: 5,
      tags: ['formation', 'analytics', 'demande'],
      messages: [
        {
          id: '1',
          author: 'Fatou Sow',
          content: 'Bonjour, j\'aimerais avoir une formation sur l\'utilisation des analytics avancés. Quand est-ce possible ?',
          timestamp: '2024-01-12T11:00:00Z',
          type: 'user',
        },
        {
          id: '2',
          author: 'Support Formation',
          content: 'Bonjour Fatou, nous organisons des sessions de formation chaque mardi à 14h. Je vous envoie le lien de réservation par email.',
          timestamp: '2024-01-12T12:00:00Z',
          type: 'support',
        },
        {
          id: '3',
          author: 'Fatou Sow',
          content: 'Parfait, merci beaucoup ! J\'ai réservé pour mardi prochain.',
          timestamp: '2024-01-14T16:30:00Z',
          type: 'user',
        },
      ],
    },
  ];

  const mockFAQ = [
    {
      id: '1',
      question: 'Comment ajouter un nouveau produit ?',
      answer: 'Allez dans Gestion Stock > Produits > Ajouter un produit. Remplissez les informations obligatoires et cliquez sur Enregistrer.',
      category: 'produits',
      views: 245,
      helpful: 89,
    },
    {
      id: '2',
      question: 'Comment configurer Wave Money ?',
      answer: 'Dans Paramètres > Intégrations > Paiements, ajoutez vos clés API Wave Money et activez l\'intégration.',
      category: 'paiements',
      views: 189,
      helpful: 156,
    },
    {
      id: '3',
      question: 'Comment générer un rapport de ventes ?',
      answer: 'Allez dans Analytics > Rapports > Nouveau rapport. Sélectionnez "Ventes" et configurez vos critères.',
      category: 'rapports',
      views: 167,
      helpful: 134,
    },
  ];

  const tabs = [
    { id: 'tickets', label: 'Tickets', count: mockTickets.length },
    { id: 'faq', label: 'FAQ', count: mockFAQ.length },
    { id: 'knowledge', label: 'Base de Connaissances', count: 45 },
    { id: 'feedback', label: 'Feedback', count: 23 },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'closed':
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Centre de Support</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez le support client et la base de connaissances
          </p>
        </div>
        
        <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
          Nouveau Ticket
        </Button>
      </div>

      {/* Support Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Tickets Ouverts"
          value={23}
          previousValue={18}
          format="number"
          icon={<Headphones className="w-6 h-6" />}
          color="warning"
        />
        <MetricCard
          title="Temps de Réponse Moyen"
          value={2.5}
          previousValue={3.2}
          format="number"
          icon={<Clock className="w-6 h-6" />}
          color="primary"
        />
        <MetricCard
          title="Taux de Résolution"
          value={94.5}
          previousValue={91.2}
          format="percentage"
          icon={<CheckCircle className="w-6 h-6" />}
          color="success"
        />
        <MetricCard
          title="Satisfaction Client"
          value={4.7}
          previousValue={4.5}
          format="number"
          icon={<Star className="w-6 h-6" />}
          color="info"
        />
      </div>

      {/* Main Content */}
      <div className="card-premium">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`
                  flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors
                  ${selectedTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }
                `}
              >
                <span>{tab.label}</span>
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {selectedTab === 'tickets' && (
              <motion.div
                key="tickets"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher un ticket..."
                        className="input-premium pl-10 w-full"
                      />
                    </div>
                  </div>
                  
                  <select className="input-premium w-48">
                    <option value="all">Tous les statuts</option>
                    <option value="open">Ouverts</option>
                    <option value="in_progress">En cours</option>
                    <option value="resolved">Résolus</option>
                    <option value="closed">Fermés</option>
                  </select>
                  
                  <select className="input-premium w-48">
                    <option value="all">Toutes les priorités</option>
                    <option value="high">Haute</option>
                    <option value="medium">Moyenne</option>
                    <option value="low">Basse</option>
                  </select>
                  
                  <Button variant="secondary" icon={<Filter className="w-4 h-4" />}>
                    Filtres
                  </Button>
                </div>

                {/* Tickets List */}
                <div className="space-y-4">
                  {mockTickets.map((ticket, index) => (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow cursor-pointer"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="font-mono text-sm text-primary-600 dark:text-primary-400">
                              #{ticket.id}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(ticket.status)}`}>
                              {ticket.status === 'open' ? 'Ouvert' :
                               ticket.status === 'in_progress' ? 'En cours' :
                               ticket.status === 'resolved' ? 'Résolu' : 'Fermé'}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority === 'high' ? 'Haute' :
                               ticket.priority === 'medium' ? 'Moyenne' : 'Basse'}
                            </span>
                          </div>
                          
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {ticket.title}
                          </h3>
                          
                          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                            {ticket.description}
                          </p>
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4" />
                              <span>{ticket.user.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(ticket.createdAt).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4" />
                              <span>Réponse: {ticket.responseTime}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <img
                            src={ticket.user.avatar}
                            alt={ticket.user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          {ticket.assignedTo && (
                            <img
                              src={ticket.assignedTo.avatar}
                              alt={ticket.assignedTo.name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-primary-500"
                            />
                          )}
                        </div>
                      </div>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {ticket.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {selectedTab === 'faq' && (
              <motion.div
                key="faq"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* FAQ Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Questions Fréquemment Posées
                  </h3>
                  <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
                    Nouvelle FAQ
                  </Button>
                </div>

                {/* FAQ List */}
                <div className="space-y-4">
                  {mockFAQ.map((faq, index) => (
                    <motion.div
                      key={faq.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {faq.question}
                        </h4>
                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                          {faq.category}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {faq.answer}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{faq.views} vues</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4" />
                            <span>{faq.helpful} utiles</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button variant="secondary" size="sm" icon={<Edit className="w-3 h-3" />}>
                            Modifier
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Ticket Detail Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={() => setSelectedTicket(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(selectedTicket.status)}
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Ticket #{selectedTicket.id}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedTicket.title}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button variant="secondary" size="sm" icon={<Phone className="w-4 h-4" />}>
                    Appeler
                  </Button>
                  <Button variant="secondary" size="sm" icon={<Video className="w-4 h-4" />}>
                    Visio
                  </Button>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Messages */}
                  <div className="lg:col-span-2">
                    <div className="space-y-4 mb-6">
                      {selectedTicket.messages.map((message: any, index: number) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`flex ${message.type === 'user' ? 'justify-start' : 'justify-end'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                            message.type === 'user' 
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                              : 'bg-primary-500 text-white'
                          }`}>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium">{message.author}</span>
                              <span className="text-xs opacity-70">
                                {new Date(message.timestamp).toLocaleTimeString('fr-FR')}
                              </span>
                            </div>
                            <p className="text-sm">{message.content}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Message Input */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div className="flex items-end space-x-3">
                        <div className="flex-1">
                          <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Tapez votre réponse..."
                            className="input-premium resize-none"
                            rows={3}
                          />
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Button variant="secondary" size="sm" icon={<Paperclip className="w-4 h-4" />}>
                            Fichier
                          </Button>
                          <Button variant="primary" size="sm" icon={<Send className="w-4 h-4" />}>
                            Envoyer
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Ticket Info */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Informations</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Statut</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(selectedTicket.status)}`}>
                            {selectedTicket.status === 'open' ? 'Ouvert' :
                             selectedTicket.status === 'in_progress' ? 'En cours' :
                             selectedTicket.status === 'resolved' ? 'Résolu' : 'Fermé'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Priorité</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(selectedTicket.priority)}`}>
                            {selectedTicket.priority === 'high' ? 'Haute' :
                             selectedTicket.priority === 'medium' ? 'Moyenne' : 'Basse'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Catégorie</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {selectedTicket.category}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Créé</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {new Date(selectedTicket.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Client</h4>
                      <div className="flex items-center space-x-3 mb-3">
                        <img
                          src={selectedTicket.user.avatar}
                          alt={selectedTicket.user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {selectedTicket.user.name}
                          </p>
                          <p className="text-sm text-gray-500">{selectedTicket.user.company}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{selectedTicket.user.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <Button
                        variant="primary"
                        fullWidth
                        icon={<CheckCircle className="w-4 h-4" />}
                      >
                        Marquer Résolu
                      </Button>
                      <Button
                        variant="secondary"
                        fullWidth
                        icon={<User className="w-4 h-4" />}
                      >
                        Réassigner
                      </Button>
                      <Button
                        variant="secondary"
                        fullWidth
                        icon={<Tag className="w-4 h-4" />}
                      >
                        Modifier Tags
                      </Button>
                    </div>

                    {/* Tags */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedTicket.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
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

export default SupportPage;