import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Headphones, 
  Plus, 
  Search, 
  MessageSquare, 
  Phone,
  Mail,
  Video,
  Send,
  Paperclip,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Bot,
  Star,
  ThumbsUp,
  ThumbsDown,
  X,
  FileText,
  HelpCircle,
  Zap,
  Package,
  RefreshCw,
  CreditCard,
  Shield,
  Eye
} from 'lucide-react';
import Button from '../../components/ui/Button';
import apiService from '../../services/api/realApi';
import openaiService from '../../services/api/openaiService';

const SupportPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('chat');
  const [newMessage, setNewMessage] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showAIConfigMessage, setShowAIConfigMessage] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: '1',
      sender: 'bot',
      message: 'Bonjour ! 👋 Je suis votre assistant virtuel intelligent. Je peux vous aider avec vos commandes, livraisons, paiements et bien plus encore. Que puis-je faire pour vous aujourd\'hui ?',
      timestamp: '2024-01-15T10:00:00Z',
      type: 'text',
      actions: [
        { label: 'Suivre ma commande', action: 'track_order' },
        { label: 'Problème de livraison', action: 'delivery_issue' },
        { label: 'Question sur un produit', action: 'product_question' },
        { label: 'Autre question', action: 'other_question' }
      ]
    },
    {
      id: '2',
      sender: 'user',
      message: 'Bonjour, j\'ai un problème avec ma dernière commande. Elle n\'est pas encore arrivée.',
      timestamp: '2024-01-15T10:01:00Z',
      type: 'text',
    },
    {
      id: '3',
      sender: 'bot',
      message: 'Je comprends votre préoccupation. Pouvez-vous me donner le numéro de votre commande pour que je puisse vérifier son statut ?',
      timestamp: '2024-01-15T10:01:30Z',
      type: 'text',
    },
    {
      id: '4',
      sender: 'user',
      message: 'C\'est la commande CMD-002',
      timestamp: '2024-01-15T10:02:00Z',
      type: 'text',
    },
    {
      id: '5',
      sender: 'bot',
      message: 'Parfait ! J\'ai trouvé votre commande CMD-002. Elle a été expédiée hier et devrait arriver demain. Voici le numéro de suivi : TRK987654321',
      timestamp: '2024-01-15T10:02:30Z',
      type: 'text',
      actions: [
        { label: 'Suivre le Colis', action: 'track_package' },
        { label: 'Contacter le Transporteur', action: 'contact_carrier' },
      ],
    },
  ]);

  const myTickets = [
    {
      id: 'TIC-001',
      subject: 'Problème de livraison',
      description: 'Ma commande n\'est pas arrivée dans les délais prévus',
      status: 'open',
      priority: 'medium',
      category: 'livraison',
      createdAt: '2024-01-15T09:30:00Z',
      lastUpdate: '2024-01-15T10:15:00Z',
      assignedTo: 'Support Livraison',
      messages: 3,
    },
    {
      id: 'TIC-002',
      subject: 'Question sur produit',
      description: 'Compatibilité accessoires iPhone 15 Pro',
      status: 'resolved',
      priority: 'low',
      category: 'produit',
      createdAt: '2024-01-12T14:20:00Z',
      lastUpdate: '2024-01-13T09:45:00Z',
      assignedTo: 'Support Technique',
      messages: 5,
      satisfaction: 5,
    },
  ];

  const faqItems = [
    {
      id: '1',
      question: 'Comment suivre ma commande ?',
      answer: 'Vous pouvez suivre votre commande dans la section "Mes Commandes" ou en utilisant le numéro de suivi fourni par email.',
      category: 'Commandes',
      helpful: 89,
      views: 245,
    },
    {
      id: '2',
      question: 'Comment utiliser mes points de fidélité ?',
      answer: 'Allez dans la section "Fidélité" de votre profil pour échanger vos points contre des récompenses.',
      category: 'Fidélité',
      helpful: 156,
      views: 189,
    },
    {
      id: '3',
      question: 'Puis-je modifier ma commande ?',
      answer: 'Vous pouvez modifier votre commande dans les 2 heures suivant la confirmation, avant qu\'elle ne soit préparée.',
      category: 'Commandes',
      helpful: 134,
      views: 167,
    },
  ];

  const quickActions = [
    {
      title: 'Suivre une Commande',
      description: 'Vérifiez le statut de votre livraison',
      icon: Package,
      color: 'from-blue-500 to-cyan-500',
      action: 'track_order',
    },
    {
      title: 'Retourner un Produit',
      description: 'Initiez un retour ou échange',
      icon: RefreshCw,
      color: 'from-orange-500 to-red-500',
      action: 'return_product',
    },
    {
      title: 'Problème de Paiement',
      description: 'Assistance pour les paiements',
      icon: CreditCard,
      color: 'from-green-500 to-emerald-500',
      action: 'payment_issue',
    },
    {
      title: 'Compte & Sécurité',
      description: 'Gérez votre compte en sécurité',
      icon: Shield,
      color: 'from-purple-500 to-pink-500',
      action: 'account_security',
    },
  ];

  const tabs = [
    { id: 'chat', label: 'Chat en Direct', icon: MessageSquare },
    { id: 'tickets', label: 'Mes Tickets', icon: FileText },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'contact', label: 'Nous Contacter', icon: Phone },
  ];

  const generateBotResponse = async (userMessage: string) => {
    if (!isAIEnabled) {
      // Mode de réponses prédéfinies (fallback)
      return generateFallbackResponse(userMessage);
    }

    try {
      setIsLoadingAI(true);
      
      // Construire le contexte de la conversation
      const conversationContext = chatMessages
        .slice(-6) // Prendre les 6 derniers messages pour le contexte
        .map(msg => `${msg.sender === 'user' ? 'Client' : 'Assistant'}: ${msg.message}`)
        .join('\n');

      // Appeler l'IA OpenAI
      const aiResponse = await openaiService.generateSupportResponse(userMessage, conversationContext);
      
      // Analyser la réponse pour déterminer les actions appropriées
      const actions = extractActionsFromResponse(aiResponse);
      
      return {
        message: aiResponse,
        actions: actions
      };
    } catch (error) {
      console.error('Erreur avec l\'IA OpenAI:', error);
      
      // Désactiver automatiquement l'IA si la clé API n'est pas configurée
      if (error instanceof Error && error.message.includes('Clé API OpenAI non configurée')) {
        setIsAIEnabled(false);
        setShowAIConfigMessage(true);
        console.log('IA désactivée automatiquement - Clé API non configurée');
      }
      
      // Fallback vers les réponses prédéfinies en cas d'erreur
      return generateFallbackResponse(userMessage);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const generateFallbackResponse = (userMessage: string) => {
    const message = userMessage.toLowerCase();
    
    // Réponses intelligentes basées sur le contenu du message
    if (message.includes('commande') || message.includes('order')) {
      return {
        message: 'Je comprends que vous avez une question sur votre commande. Pouvez-vous me donner le numéro de commande pour que je puisse vérifier son statut ?',
        actions: [
          { label: 'Voir mes commandes', action: 'view_orders' },
          { label: 'Suivre une commande', action: 'track_order' }
        ]
      };
    }
    
    if (message.includes('livraison') || message.includes('delivery') || message.includes('arrivé') || message.includes('expédié')) {
      return {
        message: 'Pour les questions de livraison, je peux vous aider à suivre votre colis. Avez-vous reçu un numéro de suivi par email ?',
        actions: [
          { label: 'Suivre mon colis', action: 'track_package' },
          { label: 'Contacter le transporteur', action: 'contact_carrier' }
        ]
      };
    }
    
    if (message.includes('paiement') || message.includes('payment') || message.includes('facture') || message.includes('billing')) {
      return {
        message: 'Je peux vous aider avec les questions de paiement. Quel type de problème rencontrez-vous exactement ?',
        actions: [
          { label: 'Problème de facturation', action: 'billing_issue' },
          { label: 'Remboursement', action: 'refund_request' }
        ]
      };
    }
    
    if (message.includes('retour') || message.includes('return') || message.includes('échange') || message.includes('exchange')) {
      return {
        message: 'Pour un retour ou échange, je vais vous guider dans le processus. Quel est le numéro de commande concernée ?',
        actions: [
          { label: 'Initier un retour', action: 'start_return' },
          { label: 'Politique de retour', action: 'return_policy' }
        ]
      };
    }
    
    if (message.includes('compte') || message.includes('account') || message.includes('profil') || message.includes('profile')) {
      return {
        message: 'Je peux vous aider avec votre compte. Que souhaitez-vous modifier ou vérifier ?',
        actions: [
          { label: 'Modifier mes informations', action: 'edit_profile' },
          { label: 'Changer mon mot de passe', action: 'change_password' }
        ]
      };
    }
    
    if (message.includes('produit') || message.includes('product') || message.includes('article')) {
      return {
        message: 'Pour toute question sur nos produits, je peux vous orienter vers les bonnes informations. Quel produit vous intéresse ?',
        actions: [
          { label: 'Catalogue produits', action: 'view_catalog' },
          { label: 'Guide d\'utilisation', action: 'user_guide' }
        ]
      };
    }
    
    if (message.includes('urgent') || message.includes('urgent') || message.includes('immédiat')) {
      return {
        message: 'Je comprends que votre demande est urgente. Je vais immédiatement transférer votre demande à un agent spécialisé.',
        actions: [
          { label: 'Parler à un agent', action: 'speak_agent' },
          { label: 'Appeler le support', action: 'call_support' }
        ]
      };
    }
    
    // Réponse par défaut plus engageante
    const defaultResponses = [
      'Merci pour votre message ! Je vais faire de mon mieux pour vous aider. Pouvez-vous me donner plus de détails sur votre demande ?',
      'Je suis là pour vous aider ! Pourriez-vous me préciser un peu plus votre question afin que je puisse vous donner la meilleure réponse ?',
      'Parfait ! Je vais analyser votre demande et vous proposer les meilleures solutions. Avez-vous des informations supplémentaires à partager ?',
      'Excellente question ! Laissez-moi vous orienter vers les bonnes ressources. Que souhaitez-vous savoir en priorité ?'
    ];
    
    return {
      message: defaultResponses[Math.floor(Math.random() * defaultResponses.length)],
      actions: [
        { label: 'Voir la FAQ', action: 'view_faq' },
        { label: 'Créer un ticket', action: 'create_ticket' },
        { label: 'Parler à un agent', action: 'speak_agent' }
      ]
    };
  };

  const extractActionsFromResponse = (response: string) => {
    const actions = [];
    const lowerResponse = response.toLowerCase();
    
    // Détecter les actions basées sur le contenu de la réponse
    if (lowerResponse.includes('commande') || lowerResponse.includes('suivre')) {
      actions.push({ label: 'Suivre ma commande', action: 'track_order' });
    }
    
    if (lowerResponse.includes('livraison') || lowerResponse.includes('colis')) {
      actions.push({ label: 'Suivre mon colis', action: 'track_package' });
    }
    
    if (lowerResponse.includes('paiement') || lowerResponse.includes('facture')) {
      actions.push({ label: 'Problème de paiement', action: 'billing_issue' });
    }
    
    if (lowerResponse.includes('retour') || lowerResponse.includes('échange')) {
      actions.push({ label: 'Initier un retour', action: 'start_return' });
    }
    
    // Actions par défaut si aucune action spécifique n'est détectée
    if (actions.length === 0) {
      actions.push(
        { label: 'Créer un ticket', action: 'create_ticket' },
        { label: 'Parler à un agent', action: 'speak_agent' }
      );
    }
    
    return actions;
  };

  const handleBotAction = (action: string) => {
    let responseMessage = '';
    let responseActions: any[] = [];
    
    switch (action) {
      case 'track_order':
        responseMessage = 'Parfait ! Pour suivre votre commande, j\'ai besoin du numéro de commande. Vous pouvez le trouver dans votre email de confirmation ou dans la section "Mes Commandes".';
        responseActions = [
          { label: 'Voir mes commandes', action: 'view_orders' },
          { label: 'J\'ai le numéro', action: 'provide_order_number' }
        ];
        break;
        
      case 'delivery_issue':
        responseMessage = 'Je comprends votre préoccupation concernant la livraison. Pouvez-vous me dire depuis combien de temps vous attendez et si vous avez reçu un email de confirmation d\'expédition ?';
        responseActions = [
          { label: 'Oui, j\'ai l\'email', action: 'has_shipping_email' },
          { label: 'Non, pas d\'email', action: 'no_shipping_email' }
        ];
        break;
        
      case 'product_question':
        responseMessage = 'Excellente question ! Je peux vous aider avec les informations sur nos produits. Quel produit vous intéresse ou quelle est votre question spécifique ?';
        responseActions = [
          { label: 'Catalogue produits', action: 'view_catalog' },
          { label: 'Guide d\'utilisation', action: 'user_guide' }
        ];
        break;
        
      case 'other_question':
        responseMessage = 'Bien sûr ! Je suis là pour vous aider avec toutes vos questions. Décrivez-moi votre problème ou votre question et je ferai de mon mieux pour vous orienter.';
        responseActions = [
          { label: 'Créer un ticket', action: 'create_ticket' },
          { label: 'Parler à un agent', action: 'speak_agent' }
        ];
        break;
        
      default:
        responseMessage = 'Merci pour votre sélection ! Comment puis-je vous aider davantage ?';
    }
    
    // Add bot response
    const botResponse = {
      id: Date.now().toString(),
      sender: 'bot',
      message: responseMessage,
      timestamp: new Date().toISOString(),
      type: 'text',
      actions: responseActions
    };
    
    setChatMessages(prev => [...prev, botResponse]);
  };

  const sendMessage = async () => {
    if (newMessage.trim()) {
      const userMessage = {
        id: Date.now().toString(),
        sender: 'user',
        message: newMessage,
        timestamp: new Date().toISOString(),
        type: 'text',
      };
      
      setChatMessages(prev => [...prev, userMessage]);
      const currentMessage = newMessage;
      setNewMessage('');
      
      // Generate intelligent bot response (IA ou fallback)
      try {
        const botResponseData = await generateBotResponse(currentMessage);
        const botResponse = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          message: botResponseData.message,
          timestamp: new Date().toISOString(),
          type: 'text',
          actions: botResponseData.actions
        };
        setChatMessages(prev => [...prev, botResponse]);
      } catch (error) {
        console.error('Erreur lors de la génération de la réponse:', error);
        
        // Réponse d'erreur de fallback
        const errorResponse = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          message: 'Désolé, je rencontre un problème technique. Un agent va vous contacter dans les plus brefs délais.',
          timestamp: new Date().toISOString(),
          type: 'text',
          actions: [
            { label: 'Parler à un agent', action: 'speak_agent' },
            { label: 'Créer un ticket', action: 'create_ticket' }
          ]
        };
        setChatMessages(prev => [...prev, errorResponse]);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'closed':
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Centre d'Aide</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Nous sommes là pour vous aider 24h/24 et 7j/7
          </p>
        </div>
        
        <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
          Nouveau Ticket
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <motion.button
              key={action.action}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={async () => {
                try {
                  switch(action.action) {
                    case 'track_order':
                      // TODO: Implémenter le suivi de commande
                      console.log('Suivi de commande...');
                      alert('Fonctionnalité de suivi de commande en cours de développement');
                      break;
                    case 'return_product':
                      // TODO: Implémenter le retour de produit
                      console.log('Retour de produit...');
                      alert('Fonctionnalité de retour de produit en cours de développement');
                      break;
                    case 'payment_issue':
                      // Créer un ticket pour problème de paiement
                      const paymentTicket = {
                        sujet: 'Problème de paiement',
                        description: 'Ticket créé depuis les actions rapides - Problème de paiement',
                        priorite: 'haute',
                        categorie: 'paiement'
                      };
                      await apiService.createTicket(paymentTicket);
                      alert('Ticket créé pour votre problème de paiement !');
                      break;
                    case 'account_security':
                      // Créer un ticket pour sécurité du compte
                      const securityTicket = {
                        sujet: 'Sécurité du compte',
                        description: 'Ticket créé depuis les actions rapides - Sécurité du compte',
                        priorite: 'haute',
                        categorie: 'securite'
                      };
                      await apiService.createTicket(securityTicket);
                      alert('Ticket créé pour votre problème de sécurité !');
                      break;
                    default:
                      console.log('Action:', action.action);
                  }
                } catch (error) {
                  console.error('Erreur lors de l\'action:', error);
                  alert('Erreur lors de l\'exécution de l\'action');
                }
              }}
              className={`p-6 bg-gradient-to-r ${action.color} text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              <IconComponent className="w-8 h-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">{action.title}</h3>
              <p className="text-sm opacity-90">{action.description}</p>
            </motion.button>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="card-premium">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
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
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {selectedTab === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Chat Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-electric-500 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Assistant IA</h3>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm text-green-600">En ligne</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant={isAIEnabled ? "primary" : "secondary"} 
                      size="sm" 
                      icon={<Bot className="w-4 h-4" />}
                      onClick={() => setIsAIEnabled(!isAIEnabled)}
                    >
                      {isAIEnabled ? 'IA Activée' : 'IA Désactivée'}
                    </Button>
                    <Button variant="secondary" size="sm" icon={<Phone className="w-4 h-4" />}>
                      Appeler
                    </Button>
                    <Button variant="secondary" size="sm" icon={<Video className="w-4 h-4" />}>
                      Visio
                    </Button>
                  </div>
                </div>

                {/* Message de configuration IA */}
                {showAIConfigMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl"
                  >
                    <div className="flex items-start space-x-3">
                      <Bot className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          Configuration IA requise
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                          Pour activer l'IA intelligente, ajoutez votre clé API OpenAI dans le fichier .env :
                        </p>
                        <code className="block bg-blue-100 dark:bg-blue-800 p-2 rounded text-xs mb-3">
                          VITE_OPENAI_API_KEY=sk-your-api-key-here
                        </code>
                        <div className="flex space-x-2">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => setShowAIConfigMessage(false)}
                          >
                            Fermer
                          </Button>
                          <Button 
                            variant="primary" 
                            size="sm" 
                            onClick={() => {
                              setShowAIConfigMessage(false);
                              setIsAIEnabled(true);
                            }}
                          >
                            Réessayer
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Chat Messages */}
                <div className="h-96 overflow-y-auto bg-gray-50 dark:bg-gray-700 rounded-xl p-4 space-y-4">
                  {chatMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                        message.sender === 'user' 
                          ? 'bg-primary-500 text-white'
                          : 'bg-white dark:bg-dark-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                      }`}>
                        <div className="flex items-center space-x-2 mb-1">
                          {message.sender === 'bot' && (
                            <Bot className="w-4 h-4 text-primary-500" />
                          )}
                          <span className="text-sm font-medium">
                            {message.sender === 'user' ? 'Vous' : 'Assistant IA'}
                          </span>
                          <span className="text-xs opacity-70">
                            {new Date(message.timestamp).toLocaleTimeString('fr-FR')}
                          </span>
                        </div>
                        <p className="text-sm">{message.message}</p>
                        
                        {message.actions && (
                          <div className="mt-3 space-y-2">
                            {message.actions.map((action: any, index: number) => (
                              <button
                                key={index}
                                onClick={() => handleBotAction(action.action)}
                                className="block w-full text-left px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Indicateur de chargement IA */}
                  {isLoadingAI && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-white dark:bg-dark-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center space-x-2 mb-1">
                          <Bot className="w-4 h-4 text-primary-500" />
                          <span className="text-sm font-medium">Assistant IA</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                          <span className="text-sm text-gray-500">L'IA réfléchit...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Message Input */}
                <div className="flex items-end space-x-3">
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Tapez votre message..."
                      className="input-premium resize-none"
                      rows={2}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button variant="secondary" size="sm" icon={<Paperclip className="w-4 h-4" />}>
                      Fichier
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      icon={<Send className="w-4 h-4" />}
                      onClick={sendMessage}
                    >
                      Envoyer
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {selectedTab === 'tickets' && (
              <motion.div
                key="tickets"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Mes Tickets de Support
                  </h3>
                  <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
                    Nouveau Ticket
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {myTickets.map((ticket, index) => (
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
                            <span className="font-mono text-sm text-primary-600">#{ticket.id}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(ticket.status)}`}>
                              {ticket.status === 'open' ? 'Ouvert' : 
                               ticket.status === 'resolved' ? 'Résolu' : 'Fermé'}
                            </span>
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                              {ticket.category}
                            </span>
                          </div>
                          
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {ticket.subject}
                          </h4>
                          
                          <p className="text-gray-600 dark:text-gray-300 mb-4">
                            {ticket.description}
                          </p>
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>{ticket.assignedTo}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageSquare className="w-4 h-4" />
                              <span>{ticket.messages} messages</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{new Date(ticket.lastUpdate).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(ticket.status)}
                          {ticket.satisfaction && (
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-medium">{ticket.satisfaction}</span>
                            </div>
                          )}
                        </div>
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
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Questions Fréquemment Posées
                  </h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher dans la FAQ..."
                      className="input-premium pl-10 w-64"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  {faqItems.map((faq, index) => (
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
                            <ThumbsUp className="w-4 h-4" />
                            <span>{faq.helpful} utiles</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-green-500">
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-red-500">
                            <ThumbsDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {selectedTab === 'contact' && (
              <motion.div
                key="contact"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Nous Contacter
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <Phone className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Téléphone</h4>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Appelez-nous directement pour une assistance immédiate
                    </p>
                    <p className="font-medium text-blue-600 mb-4">+221 33 123 45 67</p>
                    <p className="text-sm text-gray-500">Lun-Ven: 8h-20h | Sam: 9h-17h</p>
                  </div>
                  
                  <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                      <Mail className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Email</h4>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Envoyez-nous un email, nous répondons sous 2h
                    </p>
                    <p className="font-medium text-green-600 mb-4">support@platform.com</p>
                    <p className="text-sm text-gray-500">Réponse sous 2h en moyenne</p>
                  </div>
                  
                  <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <div className="w-16 h-16 mx-auto mb-4 bg-purple-500 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Chat en Direct</h4>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Discutez avec notre équipe en temps réel
                    </p>
                    <p className="font-medium text-purple-600 mb-4">Disponible 24h/24</p>
                    <p className="text-sm text-gray-500">Réponse immédiate</p>
                  </div>
                </div>

                {/* Contact Form */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Formulaire de Contact
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sujet
                      </label>
                      <select className="input-premium w-full">
                        <option value="">Sélectionnez un sujet</option>
                        <option value="order">Problème de commande</option>
                        <option value="payment">Problème de paiement</option>
                        <option value="product">Question produit</option>
                        <option value="account">Compte utilisateur</option>
                        <option value="other">Autre</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Priorité
                      </label>
                      <select className="input-premium w-full">
                        <option value="low">Basse</option>
                        <option value="medium">Moyenne</option>
                        <option value="high">Haute</option>
                        <option value="urgent">Urgente</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message
                    </label>
                    <textarea
                      className="input-premium w-full"
                      rows={4}
                      placeholder="Décrivez votre problème ou question en détail..."
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button variant="primary" icon={<Send className="w-4 h-4" />}>
                      Envoyer le Message
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;