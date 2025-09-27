import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../../services/api/realApi';
import { 
  Package, 
  Search, 
  Filter, 
  Eye, 
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  Star,
  Download,
  RefreshCw,
  MessageSquare,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  RotateCcw,
  X
} from 'lucide-react';
import Button from '../../components/ui/Button';

const OrdersPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les commandes depuis l'API
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      // Pour l'instant, on utilise les données mockées
      // TODO: Implémenter l'API des commandes quand elle sera disponible
      const mockOrders = [
    {
      id: 'CMD-001',
      date: '2024-01-15T10:30:00Z',
      status: 'delivered',
      total: 850000,
      items: [
        {
          id: '1',
          name: 'iPhone 15 Pro',
          quantity: 1,
          price: 850000,
          image: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
        },
      ],
      seller: {
        name: 'TechSolutions Sénégal',
        logo: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2',
      },
      shipping: {
        method: 'Livraison Express',
        address: '25 Rue de la Paix, Médina, Dakar',
        trackingNumber: 'TRK123456789',
        estimatedDelivery: '2024-01-16T18:00:00Z',
        actualDelivery: '2024-01-16T15:30:00Z',
      },
      payment: {
        method: 'Wave Money',
        reference: 'WV789123456',
        status: 'paid',
      },
      canReview: true,
      canReturn: true,
      returnDeadline: '2024-02-15T23:59:59Z',
    },
    {
      id: 'CMD-002',
      date: '2024-01-12T14:20:00Z',
      status: 'shipped',
      total: 180000,
      items: [
        {
          id: '2',
          name: 'Robe Élégante Africaine',
          quantity: 2,
          price: 70000,
          image: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
        },
        {
          id: '3',
          name: 'Savon Noir Africain',
          quantity: 4,
          price: 10000,
          image: 'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
        },
      ],
      seller: {
        name: 'Boutique Marie Diallo',
        logo: 'https://images.pexels.com/photos/4386476/pexels-photo-4386476.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2',
      },
      shipping: {
        method: 'Livraison Standard',
        address: '25 Rue de la Paix, Médina, Dakar',
        trackingNumber: 'TRK987654321',
        estimatedDelivery: '2024-01-17T18:00:00Z',
      },
      payment: {
        method: 'Orange Money',
        reference: 'OM456789123',
        status: 'paid',
      },
      canReview: false,
      canReturn: false,
    },
    {
      id: 'CMD-003',
      date: '2024-01-10T09:15:00Z',
      status: 'processing',
      total: 145000,
      items: [
        {
          id: '4',
          name: 'Air Jordan 1 Retro',
          quantity: 1,
          price: 145000,
          image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
        },
      ],
      seller: {
        name: 'Boutique Marie Diallo',
        logo: 'https://images.pexels.com/photos/4386476/pexels-photo-4386476.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2',
      },
      shipping: {
        method: 'Livraison Express',
        address: '25 Rue de la Paix, Médina, Dakar',
        estimatedDelivery: '2024-01-18T18:00:00Z',
      },
      payment: {
        method: 'Carte Bancaire',
        reference: 'CB123789456',
        status: 'paid',
      },
      canReview: false,
      canReturn: false,
    },
  ];
      
      setOrders(mockOrders);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const orderStatuses = [
    { id: 'all', label: 'Toutes', count: orders.length },
    { id: 'processing', label: 'En préparation', count: 1 },
    { id: 'shipped', label: 'Expédiées', count: 1 },
    { id: 'delivered', label: 'Livrées', count: 1 },
    { id: 'cancelled', label: 'Annulées', count: 0 },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'shipped':
        return <Truck className="w-4 h-4 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'processing':
        return 'En préparation';
      case 'shipped':
        return 'Expédiée';
      case 'delivered':
        return 'Livrée';
      case 'cancelled':
        return 'Annulée';
      default:
        return 'Inconnue';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Mes Commandes</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Suivez vos commandes et gérez vos achats
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="secondary" icon={<RefreshCw className="w-4 h-4" />}>
            Actualiser
          </Button>
          <Button variant="secondary" icon={<Download className="w-4 h-4" />}>
            Exporter
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="card-premium">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {orderStatuses.map((status) => (
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
                <span>{status.label}</span>
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                  {status.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par numéro de commande, produit..."
              className="input-premium pl-10 w-full"
            />
          </div>
        </div>

        {/* Orders List */}
        <div className="p-6">
          <div className="space-y-4">
            <AnimatePresence>
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="p-6">
                    {/* Order Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-sm text-primary-600">#{order.id}</span>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(order.status)}
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">
                          {order.total.toLocaleString()} XOF
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>

                    {/* Seller Info */}
                    <div className="flex items-center space-x-3 mb-4">
                      <img
                        src={order.seller.logo}
                        alt={order.seller.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {order.seller.name}
                      </span>
                    </div>

                    {/* Items Preview */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="flex -space-x-2">
                        {order.items.slice(0, 3).map((item, i) => (
                          <img
                            key={item.id}
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover border-2 border-white dark:border-dark-800"
                            style={{ zIndex: 10 - i }}
                          />
                        ))}
                        {order.items.length > 3 && (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-dark-800 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                              +{order.items.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.items[0].name}
                          {order.items.length > 1 && ` et ${order.items.length - 1} autre(s)`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)} article(s)
                        </p>
                      </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Truck className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {order.shipping.method}
                        </span>
                        {order.shipping.trackingNumber && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm font-mono text-gray-500">
                              {order.shipping.trackingNumber}
                            </span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {order.status === 'delivered' && order.canReview && (
                          <Button variant="secondary" size="sm" icon={<Star className="w-3 h-3" />}>
                            Noter
                          </Button>
                        )}
                        <Button variant="secondary" size="sm" icon={<Eye className="w-3 h-3" />}>
                          Détails
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={() => setSelectedOrder(null)}
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
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Commande #{selectedOrder.id}
                  </h2>
                  <div className="flex items-center space-x-3 mt-1">
                    {getStatusIcon(selectedOrder.status)}
                    <span className={`text-sm px-3 py-1 rounded-full ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusLabel(selectedOrder.status)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Passée le {new Date(selectedOrder.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Items */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Articles Commandés</h3>
                      <div className="space-y-3">
                        {selectedOrder.items.map((item: any) => (
                          <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                Quantité: {item.quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {item.price.toLocaleString()} XOF
                              </p>
                              <p className="text-sm text-gray-500">
                                {(item.price / item.quantity).toLocaleString()} XOF / unité
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Timeline */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Suivi de Livraison</h3>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Commande confirmée</p>
                            <p className="text-sm text-gray-500">
                              {new Date(selectedOrder.date).toLocaleString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            ['shipped', 'delivered'].includes(selectedOrder.status)
                              ? 'bg-green-500'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}>
                            <Package className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">En préparation</p>
                            <p className="text-sm text-gray-500">
                              {selectedOrder.status === 'processing' ? 'En cours...' : 'Terminé'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            ['shipped', 'delivered'].includes(selectedOrder.status)
                              ? 'bg-green-500'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}>
                            <Truck className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Expédiée</p>
                            <p className="text-sm text-gray-500">
                              {selectedOrder.status === 'shipped' ? 'En transit...' : 
                               selectedOrder.status === 'delivered' ? 'Livrée' : 'En attente'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            selectedOrder.status === 'delivered'
                              ? 'bg-green-500'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}>
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Livrée</p>
                            <p className="text-sm text-gray-500">
                              {selectedOrder.shipping.actualDelivery 
                                ? new Date(selectedOrder.shipping.actualDelivery).toLocaleString('fr-FR')
                                : `Prévue le ${new Date(selectedOrder.shipping.estimatedDelivery).toLocaleDateString('fr-FR')}`
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Résumé</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Sous-total</span>
                          <span>{selectedOrder.total.toLocaleString()} XOF</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Livraison</span>
                          <span>Gratuite</span>
                        </div>
                        <div className="border-t border-gray-300 dark:border-gray-600 pt-2">
                          <div className="flex justify-between font-bold">
                            <span>Total</span>
                            <span className="text-primary-600">
                              {selectedOrder.total.toLocaleString()} XOF
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Adresse de Livraison</h4>
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                        <div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {selectedOrder.shipping.address}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Paiement</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Méthode</span>
                          <span>{selectedOrder.payment.method}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Référence</span>
                          <span className="font-mono">{selectedOrder.payment.reference}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Statut</span>
                          <span className="text-green-600 font-medium">Payé</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      {selectedOrder.shipping.trackingNumber && (
                        <Button
                          variant="primary"
                          fullWidth
                          icon={<Truck className="w-4 h-4" />}
                        >
                          Suivre le Colis
                        </Button>
                      )}
                      
                      {selectedOrder.canReview && (
                        <Button
                          variant="secondary"
                          fullWidth
                          icon={<Star className="w-4 h-4" />}
                        >
                          Laisser un Avis
                        </Button>
                      )}
                      
                      <Button
                        variant="secondary"
                        fullWidth
                        icon={<MessageSquare className="w-4 h-4" />}
                      >
                        Contacter le Vendeur
                      </Button>
                      
                      {selectedOrder.canReturn && (
                        <Button
                          variant="secondary"
                          fullWidth
                          icon={<RotateCcw className="w-4 h-4" />}
                        >
                          Retourner
                        </Button>
                      )}
                      
                      <Button
                        variant="secondary"
                        fullWidth
                        icon={<Download className="w-4 h-4" />}
                      >
                        Télécharger Facture
                      </Button>
                    </div>

                    {/* Support */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Besoin d'Aide ?</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        Notre équipe est là pour vous aider
                      </p>
                      <div className="flex space-x-2">
                        <Button variant="secondary" size="sm" icon={<Phone className="w-3 h-3" />}>
                          Appeler
                        </Button>
                        <Button variant="secondary" size="sm" icon={<MessageSquare className="w-3 h-3" />}>
                          Chat
                        </Button>
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

export default OrdersPage;