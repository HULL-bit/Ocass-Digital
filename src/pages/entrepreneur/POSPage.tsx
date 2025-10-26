import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Search, 
  User, 
  CreditCard,
  Smartphone,
  Trash2,
  QrCode,
  Camera,
  Percent,
  Save,
  Printer,
  Send,
  CheckCircle,
  X
} from 'lucide-react';
import Button from '../../components/ui/Button';
import AnimatedForm from '../../components/forms/AnimatedForm';
import apiService from '../../services/api/realApi';
import * as yup from 'yup';

const POSPage: React.FC = () => {
  const [cart, setCart] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [processing, setProcessing] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les produits depuis l'API
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProducts();
      
      // Transformer les données pour correspondre au format attendu
      const transformedProducts = response.results?.map((product: any) => ({
        ...product,
        // Utiliser la première image disponible ou une image par défaut
        image: product.images && product.images.length > 0 ? 
          (product.images[0].image.startsWith('http') ? product.images[0].image : `http://localhost:8000${product.images[0].image}`) :
          'https://images.pexels.com/photos/33239/wheat-field-wheat-yellow-grain.jpg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
        // Formater les prix
        prix_vente: parseFloat(product.prix_vente) || 0,
        // Calculer le stock actuel
        stock_actuel: product.stocks?.reduce((total: number, stock: any) => total + stock.quantite_physique, 0) || 0,
        // Utiliser le nom de la catégorie
        categorie: product.categorie_nom || 'Non classé'
      })) || [];
      
      setProducts(transformedProducts);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      // En cas d'erreur, utiliser les données en cache ou vides
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Données de test (utilisées en cas d'erreur API)
  const mockProducts = [
    {
      id: '1',
      nom: 'Riz Brisé Local',
      prix_vente: 12000,
      stock_actuel: 150,
      image: 'https://images.pexels.com/photos/33239/wheat-field-wheat-yellow-grain.jpg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
      sku: 'RIZ-BRISE-25KG',
      categorie: 'Alimentation',
      unite_mesure: 'kg',
    },
    {
      id: '2',
      nom: 'Boubou Grand Boubou',
      prix_vente: 65000,
      stock_actuel: 8,
      image: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
      sku: 'BOUBOU-H-001',
      categorie: 'Artisanat',
      unite_mesure: 'piece',
    },
    {
      id: '3',
      nom: 'Thiakry Traditionnel',
      prix_vente: 1500,
      stock_actuel: 0,
      image: 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
      sku: 'THIAKRY-500G',
      categorie: 'Alimentation',
      unite_mesure: 'piece',
    },
    {
      id: '4',
      nom: 'Bissap Rouge Kirène',
      prix_vente: 1200,
      stock_actuel: 45,
      image: 'https://images.pexels.com/photos/1346155/pexels-photo-1346155.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
      sku: 'BISSAP-1.5L',
      categorie: 'Alimentation',
      unite_mesure: 'piece',
    },
    {
      id: '5',
      nom: 'Djembé Artisanal',
      prix_vente: 95000,
      stock_actuel: 3,
      image: 'https://images.pexels.com/photos/164743/pexels-photo-164743.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
      sku: 'DJEMBE-TRAD-001',
      categorie: 'Artisanat',
      unite_mesure: 'piece',
    },
    {
      id: '6',
      nom: 'Savon Noir Africain',
      prix_vente: 2500,
      stock_actuel: 75,
      image: 'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
      sku: 'SAVON-NOIR-250G',
      categorie: 'Cosmétiques',
      unite_mesure: 'piece',
    },
    {
      id: '7',
      nom: 'Huile d\'Arachide Soboa',
      prix_vente: 6500,
      stock_actuel: 25,
      image: 'https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
      sku: 'HUILE-ARACH-5L',
      categorie: 'Alimentation',
      unite_mesure: 'l',
    },
    {
      id: '8',
      nom: 'Kaftan Femme Bazin',
      prix_vente: 85000,
      stock_actuel: 12,
      image: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
      sku: 'KAFTAN-F-001',
      categorie: 'Artisanat',
      unite_mesure: 'piece',
    },
  ];

  const mockCustomers = [
    {
      id: '1',
      nom: 'Aminata Diop',
      email: 'aminata.diop@email.sn',
      telephone: '+221 77 123 45 67',
      adresse: 'Plateau, Dakar',
      points_fidelite: 450,
      niveau_fidelite: 'or',
    },
    {
      id: '2',
      nom: 'Ousmane Ndiaye',
      email: 'ousmane.ndiaye@email.sn',
      telephone: '+221 77 234 56 78',
      adresse: 'Médina, Dakar',
      points_fidelite: 125,
      niveau_fidelite: 'bronze',
    },
    {
      id: '3',
      nom: 'Khadija Fall',
      email: 'khadija.fall@email.sn',
      telephone: '+221 77 345 67 89',
      adresse: 'Fann, Dakar',
      points_fidelite: 890,
      niveau_fidelite: 'platine',
    },
  ];

  const paymentMethods = [
    { id: 'cash', name: 'Espèces', icon: '💵', color: 'from-green-500 to-emerald-500' },
    { id: 'wave', name: 'Wave Money', icon: '📱', color: 'from-blue-500 to-cyan-500' },
    { id: 'orange_money', name: 'Orange Money', icon: '🟠', color: 'from-orange-500 to-red-500' },
    { id: 'card', name: 'Carte Bancaire', icon: '💳', color: 'from-purple-500 to-pink-500' },
  ];

  // Schéma de validation pour nouveau client
  const customerValidationSchema = yup.object({
    nom: yup.string().required('Le nom est requis'),
    email: yup.string().email('Email invalide').required('L\'email est requis'),
    telephone: yup.string().required('Le téléphone est requis'),
    adresse: yup.string().required('L\'adresse est requise'),
  });

  const customerFormFields = [
    {
      name: 'nom',
      label: 'Nom Complet',
      type: 'text' as const,
      placeholder: 'Ex: Aminata Diop',
      icon: <User className="w-4 h-4" />,
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email' as const,
      placeholder: 'aminata@email.sn',
      icon: <User className="w-4 h-4" />,
    },
    {
      name: 'telephone',
      label: 'Téléphone',
      type: 'text' as const,
      placeholder: '+221 77 123 45 67',
      icon: <Smartphone className="w-4 h-4" />,
    },
    {
      name: 'adresse',
      label: 'Adresse',
      type: 'textarea' as const,
      placeholder: 'Adresse complète...',
      rows: 3,
    },
  ];

  const addToCart = (product: any) => {
    if (product.stock_actuel <= 0) return;

    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      updateQuantity(product.id, existingItem.quantite + 1);
    } else {
      setCart(prev => [...prev, {
        ...product,
        quantite: 1,
        total: product.prix_vente,
      }]);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prev => prev.map(item => 
      item.id === productId 
        ? { ...item, quantite: newQuantity, total: item.prix_vente * newQuantity }
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setDiscount(0);
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateDiscount = () => {
    return (calculateSubtotal() * discount) / 100;
  };

  const calculateTax = () => {
    return (calculateSubtotal() - calculateDiscount()) * 0.18;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount() + calculateTax();
  };

  const handleCustomerSubmit = async (data: any) => {
    console.log('Nouveau client:', data);
    // Simulation d'appel API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newCustomer = {
      id: Date.now().toString(),
      ...data,
      points_fidelite: 0,
      niveau_fidelite: 'bronze',
    };
    
    setSelectedCustomer(newCustomer);
    setShowCustomerForm(false);
  };

  const processPayment = async () => {
    setProcessing(true);
    
    try {
      console.log('Traitement paiement:', {
        customer: selectedCustomer,
        cart,
        paymentMethod,
        total: calculateTotal(),
      });
      
      // Simulation de traitement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Réinitialiser après succès
      clearCart();
      setShowPaymentModal(false);
      
      // Notification de succès
      alert(`Vente terminée ! Total: ${calculateTotal().toLocaleString()} XOF`);
    } catch (error) {
      console.error('Erreur paiement:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-dark-900">
      {/* Products Panel */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-dark-800 shadow-lg border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text">Point de Vente</h1>
              <p className="text-gray-600 dark:text-gray-400">Interface de caisse tactile</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="secondary" icon={<QrCode className="w-4 h-4" />}>
                Scanner
              </Button>
              <Button variant="secondary" icon={<Camera className="w-4 h-4" />}>
                Caméra
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un produit par nom, SKU ou code-barres..."
                className="input-premium pl-10 w-full"
              />
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          >
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-2 text-gray-600">Chargement des produits...</span>
              </div>
            ) : (
              products
                .filter(product => 
                  product.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  product.sku.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((product, index) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addToCart(product)}
                    className={`
                      relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300
                      ${product.stock_actuel > 0
                        ? 'border-gray-200 dark:border-gray-600 hover:border-primary-500 bg-white dark:bg-dark-800 hover:shadow-lg'
                        : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 opacity-75 cursor-not-allowed'
                      }
                    `}
              >
                {/* Stock Status */}
                <div className="absolute top-2 right-2">
                  {product.stock_actuel <= 0 ? (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      Rupture
                    </span>
                  ) : product.stock_actuel <= 10 ? (
                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                      Stock Bas
                    </span>
                  ) : null}
                </div>

                {/* Product Image */}
                <div className="aspect-square mb-3 rounded-lg overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.nom}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Info */}
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2">
                    {product.nom}
                  </h3>
                  <p className="text-lg font-bold text-primary-600 mb-1">
                    {product.prix_vente.toLocaleString()} XOF
                  </p>
                  <p className="text-xs text-gray-500">
                    Stock: {product.stock_actuel} {product.unite_mesure}
                  </p>
                  <p className="text-xs font-mono text-gray-400 mt-1">
                    {product.sku}
                  </p>
                </div>

                {/* Add to Cart Animation */}
                <motion.div
                  className="absolute inset-0 bg-primary-500 opacity-0 rounded-xl flex items-center justify-center"
                  whileTap={{ opacity: 0.2 }}
                  transition={{ duration: 0.1 }}
                >
                  <Plus className="w-8 h-8 text-white" />
                </motion.div>
              </motion.div>
                ))
            )}
          </motion.div>
        </div>
      </div>

      {/* Cart Panel */}
      <div className="w-96 bg-white dark:bg-dark-800 shadow-2xl border-l border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Cart Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Panier ({cart.length})
            </h2>
            {cart.length > 0 && (
              <Button variant="secondary" size="sm" icon={<Trash2 className="w-4 h-4" />} onClick={clearCart}>
                Vider
              </Button>
            )}
          </div>

          {/* Customer Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Client</span>
              <Button 
                variant="secondary" 
                size="sm" 
                icon={<Plus className="w-3 h-3" />}
                onClick={() => setShowCustomerForm(true)}
              >
                Nouveau
              </Button>
            </div>
            
            {selectedCustomer ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedCustomer.nom}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedCustomer.telephone}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs bg-gold-100 text-gold-800 dark:bg-gold-900 dark:text-gold-200 px-2 py-1 rounded-full">
                        {selectedCustomer.niveau_fidelite}
                      </span>
                      <span className="text-xs text-gray-500">
                        {selectedCustomer.points_fidelite} points
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <select 
                className="input-premium w-full"
                onChange={(e) => {
                  const customer = mockCustomers.find(c => c.id === e.target.value);
                  setSelectedCustomer(customer);
                }}
              >
                <option value="">Sélectionner un client...</option>
                {mockCustomers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.nom} - {customer.telephone}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence>
            {cart.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Panier vide</p>
                <p className="text-sm text-gray-400">Ajoutez des produits pour commencer</p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {cart.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.image}
                        alt={item.nom}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">
                          {item.nom}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.prix_vente.toLocaleString()} XOF
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQuantity(item.id, item.quantite - 1)}
                          className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500"
                        >
                          <Minus className="w-4 h-4" />
                        </motion.button>
                        <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
                          {item.quantite}
                        </span>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQuantity(item.id, item.quantite + 1)}
                          className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500"
                        >
                          <Plus className="w-4 h-4" />
                        </motion.button>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">
                          {item.total.toLocaleString()} XOF
                        </p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            {/* Discount */}
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <Percent className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Remise (%)</span>
              </div>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                className="input-premium w-full"
                min="0"
                max="100"
                step="0.1"
              />
            </div>

            {/* Totals */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Sous-total</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {calculateSubtotal().toLocaleString()} XOF
                </span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Remise ({discount}%)</span>
                  <span className="font-medium text-red-600">
                    -{calculateDiscount().toLocaleString()} XOF
                  </span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">TVA (18%)</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {calculateTax().toLocaleString()} XOF
                </span>
              </div>
              
              <div className="border-t border-gray-300 dark:border-gray-600 pt-2">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                  <span className="text-xl font-bold text-primary-600">
                    {calculateTotal().toLocaleString()} XOF
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <Button
              variant="primary"
              fullWidth
              size="lg"
              icon={<CreditCard className="w-5 h-5" />}
              onClick={() => setShowPaymentModal(true)}
              disabled={cart.length === 0}
            >
              Procéder au Paiement
            </Button>
          </div>
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
              className="max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatedForm
                title="Nouveau Client"
                description="Ajoutez un nouveau client à votre base"
                fields={customerFormFields}
                validationSchema={customerValidationSchema}
                onSubmit={handleCustomerSubmit}
                submitLabel="Créer le Client"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={() => setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark-800 rounded-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Finaliser la Vente
                  </h2>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Résumé</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Articles ({cart.length})</span>
                      <span>{calculateSubtotal().toLocaleString()} XOF</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-red-600">
                        <span>Remise ({discount}%)</span>
                        <span>-{calculateDiscount().toLocaleString()} XOF</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>TVA (18%)</span>
                      <span>{calculateTax().toLocaleString()} XOF</span>
                    </div>
                    <div className="border-t border-gray-300 dark:border-gray-600 pt-2">
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span className="text-primary-600">
                          {calculateTotal().toLocaleString()} XOF
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Mode de Paiement</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {paymentMethods.map((method) => (
                      <motion.button
                        key={method.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`
                          p-4 rounded-xl border-2 transition-all duration-300 text-center
                          ${paymentMethod === method.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'
                          }
                        `}
                      >
                        <div className="text-2xl mb-2">{method.icon}</div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {method.name}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Customer Info */}
                {selectedCustomer && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Client</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{selectedCustomer.nom}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedCustomer.telephone}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs bg-gold-100 text-gold-800 dark:bg-gold-900 dark:text-gold-200 px-2 py-1 rounded-full">
                        Niveau {selectedCustomer.niveau_fidelite}
                      </span>
                      <span className="text-xs text-gray-500">
                        Gagnera {Math.floor(calculateTotal() / 1000)} points
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => setShowPaymentModal(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    loading={processing}
                    icon={processing ? undefined : <CheckCircle className="w-4 h-4" />}
                    onClick={processPayment}
                  >
                    {processing ? 'Traitement...' : 'Confirmer Vente'}
                  </Button>
                </div>

                {/* Additional Actions */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <Button variant="secondary" size="sm" icon={<Save className="w-3 h-3" />}>
                    Devis
                  </Button>
                  <Button variant="secondary" size="sm" icon={<Printer className="w-3 h-3" />}>
                    Imprimer
                  </Button>
                  <Button variant="secondary" size="sm" icon={<Send className="w-3 h-3" />}>
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

export default POSPage;