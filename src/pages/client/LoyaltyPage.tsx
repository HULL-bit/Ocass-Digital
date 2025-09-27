import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, 
  Star, 
  Award, 
  Trophy, 
  Crown,
  Zap,
  Target,
  Calendar,
  TrendingUp,
  ShoppingBag,
  Heart,
  Users,
  Sparkles,
  Plus,
  Check,
  Lock,
  Eye,
  ArrowRight
} from 'lucide-react';
import Button from '../../components/ui/Button';

const LoyaltyPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedReward, setSelectedReward] = useState<any>(null);

  const currentLevel = {
    name: 'Or',
    points: 1250,
    nextLevel: 'Platine',
    pointsToNext: 750,
    totalForNext: 2000,
    benefits: [
      'Livraison gratuite sur toutes les commandes',
      'Accès prioritaire aux ventes privées',
      '5% de cashback sur tous les achats',
      'Support client prioritaire',
      'Cadeaux d\'anniversaire exclusifs',
    ],
  };

  const levels = [
    {
      name: 'Bronze',
      minPoints: 0,
      color: 'from-amber-600 to-yellow-600',
      icon: '🥉',
      benefits: ['Points sur chaque achat', 'Offres spéciales membres'],
    },
    {
      name: 'Argent',
      minPoints: 500,
      color: 'from-gray-400 to-gray-600',
      icon: '🥈',
      benefits: ['Livraison gratuite dès 50K XOF', 'Accès ventes privées'],
    },
    {
      name: 'Or',
      minPoints: 1000,
      color: 'from-yellow-400 to-yellow-600',
      icon: '🥇',
      benefits: ['Livraison gratuite', '5% cashback', 'Support prioritaire'],
      current: true,
    },
    {
      name: 'Platine',
      minPoints: 2000,
      color: 'from-gray-300 to-gray-500',
      icon: '💎',
      benefits: ['10% cashback', 'Concierge personnel', 'Événements VIP'],
    },
    {
      name: 'Diamant',
      minPoints: 5000,
      color: 'from-blue-400 to-purple-600',
      icon: '💠',
      benefits: ['15% cashback', 'Produits exclusifs', 'Expériences premium'],
    },
  ];

  const availableRewards = [
    {
      id: '1',
      name: 'Réduction 10%',
      description: 'Réduction de 10% sur votre prochaine commande',
      points: 100,
      type: 'discount',
      value: 10,
      icon: '🎫',
      category: 'Réductions',
      expiryDays: 30,
      available: true,
    },
    {
      id: '2',
      name: 'Livraison Gratuite',
      description: 'Livraison gratuite sur une commande',
      points: 50,
      type: 'shipping',
      icon: '🚚',
      category: 'Livraison',
      expiryDays: 60,
      available: true,
    },
    {
      id: '3',
      name: 'Produit Gratuit',
      description: 'Accessoire gratuit avec votre commande',
      points: 200,
      type: 'product',
      icon: '🎁',
      category: 'Cadeaux',
      expiryDays: 90,
      available: true,
    },
    {
      id: '4',
      name: 'Consultation Gratuite',
      description: 'Consultation personnalisée avec un expert',
      points: 300,
      type: 'service',
      icon: '👨‍💼',
      category: 'Services',
      expiryDays: 120,
      available: true,
    },
    {
      id: '5',
      name: 'Accès VIP',
      description: 'Accès anticipé aux nouvelles collections',
      points: 500,
      type: 'access',
      icon: '⭐',
      category: 'Accès',
      expiryDays: 365,
      available: false,
      requiredLevel: 'Platine',
    },
    {
      id: '6',
      name: 'Événement Exclusif',
      description: 'Invitation à un événement exclusif',
      points: 1000,
      type: 'event',
      icon: '🎉',
      category: 'Événements',
      expiryDays: 30,
      available: false,
      requiredLevel: 'Diamant',
    },
  ];

  const pointsHistory = [
    {
      id: '1',
      type: 'earned',
      points: 125,
      description: 'Achat iPhone 15 Pro - 850,000 XOF',
      date: '2024-01-15T10:30:00Z',
      orderId: 'CMD-001',
    },
    {
      id: '2',
      type: 'redeemed',
      points: -100,
      description: 'Réduction 10% utilisée',
      date: '2024-01-12T14:20:00Z',
      rewardName: 'Réduction 10%',
    },
    {
      id: '3',
      type: 'earned',
      points: 35,
      description: 'Avis produit publié',
      date: '2024-01-10T16:45:00Z',
      productName: 'MacBook Air M3',
    },
    {
      id: '4',
      type: 'earned',
      points: 50,
      description: 'Parrainage ami - Inscription Khadija',
      date: '2024-01-08T09:15:00Z',
      referralName: 'Khadija Thiam',
    },
    {
      id: '5',
      type: 'bonus',
      points: 100,
      description: 'Bonus anniversaire',
      date: '2024-01-05T00:00:00Z',
    },
  ];

  const challenges = [
    {
      id: '1',
      name: 'Acheteur Régulier',
      description: 'Effectuez 5 achats ce mois',
      progress: 3,
      target: 5,
      reward: 150,
      icon: '🛍️',
      deadline: '2024-01-31',
      active: true,
    },
    {
      id: '2',
      name: 'Ambassadeur',
      description: 'Parrainez 3 nouveaux clients',
      progress: 1,
      target: 3,
      reward: 300,
      icon: '👥',
      deadline: '2024-02-15',
      active: true,
    },
    {
      id: '3',
      name: 'Critique Expert',
      description: 'Publiez 10 avis produits',
      progress: 7,
      target: 10,
      reward: 200,
      icon: '⭐',
      deadline: '2024-01-31',
      active: true,
    },
  ];

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', count: null },
    { id: 'rewards', label: 'Récompenses', count: availableRewards.filter(r => r.available).length },
    { id: 'challenges', label: 'Défis', count: challenges.filter(c => c.active).length },
    { id: 'history', label: 'Historique', count: pointsHistory.length },
  ];

  const redeemReward = async (reward: any) => {
    if (currentLevel.points >= reward.points && reward.available) {
      try {
        // TODO: Implémenter l'échange de récompense via l'API
        console.log('Échange de récompense:', reward.name);
        alert(`Récompense "${reward.name}" échangée avec succès !`);
        setSelectedReward(null);
      } catch (error) {
        console.error('Erreur lors de l\'échange de récompense:', error);
        alert('Erreur lors de l\'échange de récompense');
      }
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned':
        return <Plus className="w-4 h-4 text-green-500" />;
      case 'redeemed':
        return <Minus className="w-4 h-4 text-red-500" />;
      case 'bonus':
        return <Gift className="w-4 h-4 text-purple-500" />;
      default:
        return <Star className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Programme de Fidélité</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gagnez des points et débloquez des récompenses exclusives
          </p>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-gray-600 dark:text-gray-400">Mes Points</p>
          <p className="text-3xl font-bold text-gold-600">{currentLevel.points.toLocaleString()}</p>
        </div>
      </div>

      {/* Current Level Card */}
      <div className="card-premium p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Level Progress */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-gold-500 to-amber-500 flex items-center justify-center text-3xl">
                🥇
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Niveau {currentLevel.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {currentLevel.points} points • Plus que {currentLevel.pointsToNext} pour {currentLevel.nextLevel}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Progression vers {currentLevel.nextLevel}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {currentLevel.points} / {currentLevel.totalForNext}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentLevel.points / currentLevel.totalForNext) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="bg-gradient-to-r from-gold-500 to-amber-500 h-4 rounded-full flex items-center justify-end pr-2"
                >
                  <Sparkles className="w-3 h-3 text-white" />
                </motion.div>
              </div>
            </div>

            {/* Current Benefits */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Vos Avantages Actuels
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentLevel.benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                  >
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-primary-500 to-electric-500 rounded-xl p-6 text-white">
              <h3 className="font-semibold mb-4">Actions Rapides</h3>
              <div className="space-y-3">
                <Button 
                  variant="secondary" 
                  fullWidth 
                  size="sm" 
                  icon={<Gift className="w-4 h-4" />}
                  onClick={async () => {
                    try {
                      // Simuler l'ouverture d'une page de récompenses
                      const rewards = [
                        { name: 'Réduction 10%', points: 100, description: 'Sur votre prochain achat' },
                        { name: 'Produit gratuit', points: 200, description: 'Choisissez un produit jusqu\'à 5000 XOF' },
                        { name: 'Livraison gratuite', points: 50, description: 'Sur votre prochaine commande' }
                      ];
                      
                      const rewardsList = rewards.map(r => `• ${r.name} (${r.points} pts): ${r.description}`).join('\n');
                      alert(`Récompenses disponibles:\n\n${rewardsList}\n\nVous avez 1250 points disponibles !`);
                    } catch (error) {
                      console.error('Erreur lors du chargement des récompenses:', error);
                      alert('Erreur lors du chargement des récompenses');
                    }
                  }}
                >
                  Voir Récompenses
                </Button>
                <Button 
                  variant="secondary" 
                  fullWidth 
                  size="sm" 
                  icon={<Users className="w-4 h-4" />}
                  onClick={async () => {
                    try {
                      // Simuler l'ouverture du système de parrainage
                      const referralCode = 'REF' + Math.random().toString(36).substr(2, 6).toUpperCase();
                      const referralLink = `https://platform.com/register?ref=${referralCode}`;
                      
                      alert(`Système de parrainage activé !\n\nVotre code de parrainage: ${referralCode}\n\nLien de parrainage: ${referralLink}\n\nVous gagnez 100 points pour chaque ami parrainé !`);
                    } catch (error) {
                      console.error('Erreur lors du parrainage:', error);
                      alert('Erreur lors du parrainage');
                    }
                  }}
                >
                  Parrainer un Ami
                </Button>
                <Button 
                  variant="secondary" 
                  fullWidth 
                  size="sm" 
                  icon={<Target className="w-4 h-4" />}
                  onClick={async () => {
                    try {
                      // TODO: Implémenter la récupération des défis via l'API
                      console.log('Chargement des défis...');
                      alert('Chargement des défis...');
                    } catch (error) {
                      console.error('Erreur lors du chargement des défis:', error);
                      alert('Erreur lors du chargement des défis');
                    }
                  }}
                >
                  Mes Défis
                </Button>
              </div>
            </div>

            {/* Next Level Preview */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Niveau Suivant: {currentLevel.nextLevel}
              </h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">10% cashback</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Concierge personnel</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Événements VIP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card-premium">
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
                {tab.count && (
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {selectedTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Levels Overview */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Niveaux de Fidélité
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {levels.map((level, index) => (
                      <motion.div
                        key={level.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative p-4 rounded-xl border-2 transition-all ${
                          level.current
                            ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/20 shadow-lg'
                            : currentLevel.points >= level.minPoints
                              ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                              : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                        }`}
                      >
                        {level.current && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center">
                            <Crown className="w-3 h-3 text-white" />
                          </div>
                        )}
                        
                        <div className="text-center">
                          <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-r ${level.color} flex items-center justify-center text-xl`}>
                            {level.icon}
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {level.name}
                          </h4>
                          <p className="text-xs text-gray-500 mb-3">
                            {level.minPoints.toLocaleString()}+ points
                          </p>
                          
                          <div className="space-y-1">
                            {level.benefits.slice(0, 2).map((benefit, i) => (
                              <p key={i} className="text-xs text-gray-600 dark:text-gray-300">
                                {benefit}
                              </p>
                            ))}
                            {level.benefits.length > 2 && (
                              <p className="text-xs text-gray-500">
                                +{level.benefits.length - 2} autres
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Ways to Earn Points */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Comment Gagner des Points
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { action: 'Achat', points: '1 point / 1000 XOF', icon: ShoppingBag, color: 'text-blue-500' },
                      { action: 'Avis Produit', points: '+25 points', icon: Star, color: 'text-yellow-500' },
                      { action: 'Parrainage', points: '+50 points', icon: Users, color: 'text-green-500' },
                      { action: 'Anniversaire', points: '+100 points', icon: Gift, color: 'text-purple-500' },
                    ].map((way, index) => (
                      <motion.div
                        key={way.action}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                      >
                        <way.icon className={`w-8 h-8 mx-auto mb-2 ${way.color}`} />
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                          {way.action}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {way.points}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {selectedTab === 'rewards' && (
              <motion.div
                key="rewards"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Récompenses Disponibles
                  </h3>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Points Disponibles</p>
                    <p className="text-xl font-bold text-gold-600">{currentLevel.points}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableRewards.map((reward, index) => (
                    <motion.div
                      key={reward.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative p-6 rounded-xl border-2 transition-all cursor-pointer ${
                        reward.available && currentLevel.points >= reward.points
                          ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 hover:shadow-lg'
                          : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 opacity-75'
                      }`}
                      onClick={() => reward.available && setSelectedReward(reward)}
                    >
                      {!reward.available && (
                        <div className="absolute top-3 right-3">
                          <Lock className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                      
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-white dark:bg-dark-800 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                          {reward.icon}
                        </div>
                        
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {reward.name}
                        </h4>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                          {reward.description}
                        </p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-lg font-bold text-primary-600">
                            {reward.points} points
                          </span>
                          <span className="text-xs text-gray-500">
                            {reward.category}
                          </span>
                        </div>
                        
                        {reward.available ? (
                          currentLevel.points >= reward.points ? (
                            <Button
                              variant="success"
                              size="sm"
                              fullWidth
                              icon={<Gift className="w-4 h-4" />}
                            >
                              Échanger
                            </Button>
                          ) : (
                            <Button variant="secondary" size="sm" fullWidth disabled>
                              Points insuffisants
                            </Button>
                          )
                        ) : (
                          <div className="text-center">
                            <p className="text-xs text-gray-500 mb-1">
                              Requis: {reward.requiredLevel}
                            </p>
                            <Button variant="secondary" size="sm" fullWidth disabled>
                              Niveau insuffisant
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {selectedTab === 'challenges' && (
              <motion.div
                key="challenges"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Défis Actifs
                </h3>
                
                <div className="space-y-4">
                  {challenges.map((challenge, index) => (
                    <motion.div
                      key={challenge.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-6 bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center text-xl">
                            {challenge.icon}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {challenge.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {challenge.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary-600">
                            +{challenge.reward} points
                          </p>
                          <p className="text-xs text-gray-500">
                            Expire le {new Date(challenge.deadline).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600 dark:text-gray-400">Progression</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {challenge.progress} / {challenge.target}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="bg-gradient-to-r from-primary-500 to-electric-500 h-3 rounded-full"
                          />
                        </div>
                      </div>
                      
                      {challenge.progress >= challenge.target ? (
                        <Button
                          variant="success"
                          fullWidth
                          icon={<Trophy className="w-4 h-4" />}
                        >
                          Réclamer Récompense
                        </Button>
                      ) : (
                        <div className="text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Plus que {challenge.target - challenge.progress} pour terminer ce défi
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {selectedTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Historique des Points
                </h3>
                
                <div className="space-y-3">
                  {pointsHistory.map((transaction, index) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.type === 'earned' 
                            ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                            : transaction.type === 'redeemed'
                              ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                              : 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400'
                        }`}>
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <span className={`font-bold text-lg ${
                        transaction.type === 'earned' || transaction.type === 'bonus'
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {transaction.points > 0 ? '+' : ''}{transaction.points}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Reward Detail Modal */}
      <AnimatePresence>
        {selectedReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={() => setSelectedReward(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark-800 rounded-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto mb-4 bg-primary-100 dark:bg-primary-900 rounded-2xl flex items-center justify-center text-3xl">
                    {selectedReward.icon}
                  </div>
                  
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedReward.name}
                  </h2>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {selectedReward.description}
                  </p>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Coût</span>
                      <span className="text-xl font-bold text-primary-600">
                        {selectedReward.points} points
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-600 dark:text-gray-400">Vos points</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {currentLevel.points} points
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-600 dark:text-gray-400">Après échange</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {currentLevel.points - selectedReward.points} points
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-6">
                    Valide pendant {selectedReward.expiryDays} jours après échange
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => setSelectedReward(null)}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    icon={<Gift className="w-4 h-4" />}
                    onClick={() => redeemReward(selectedReward)}
                    disabled={currentLevel.points < selectedReward.points}
                  >
                    Échanger
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

export default LoyaltyPage;