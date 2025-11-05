import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Download,
  Send,
  FileText,
  DollarSign,
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertTriangle,
  Printer,
  Mail,
  Phone,
  X,
  Receipt,
  Calculator,
  Percent,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import Button from '../../components/ui/Button';
import MetricCard from '../../components/ui/MetricCard';
import AnimatedForm from '../../components/forms/AnimatedForm';
import apiService from '../../services/api/realApi';
import * as yup from 'yup';

const BillingPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('invoices');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);

  // Charger les ventes depuis l'API
  useEffect(() => {
    loadSales();
  }, []);

  // Recharger les ventes quand la page redevient visible (après une vente depuis le POS)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page visible, rechargement des ventes...');
        loadSales();
      }
    };

    const handleFocus = () => {
      console.log('Page en focus, rechargement des ventes...');
      loadSales();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Timeout de 30 secondes pour éviter les attentes infinies
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: La requête prend trop de temps')), 30000)
      );
      
      const salesPromise = apiService.getSales({
        ordering: '-date_creation',
        page_size: 50
      });
      
      const response = await Promise.race([salesPromise, timeoutPromise]) as any;
      
      if (response && response.results) {
        setSales(response.results);
      } else if (Array.isArray(response)) {
        // Si la réponse est directement un tableau
        setSales(response);
      } else {
        setSales([]);
      }
      
    } catch (error: any) {
      console.error('Erreur lors du chargement des ventes:', error);
      
      // Gestion d'erreur plus détaillée
      let errorMessage = 'Erreur lors du chargement des ventes';
      
      if (error.message === 'Timeout: La requête prend trop de temps') {
        errorMessage = 'Le chargement prend trop de temps. Vérifiez votre connexion internet.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Vous n\'avez pas les permissions nécessaires.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setSales([]); // Réinitialiser les ventes en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  const refreshSales = async () => {
    setRefreshing(true);
    await loadSales();
    setRefreshing(false);
  };

  // Filtrer les ventes (optimisé avec useMemo)
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const matchesSearch = !searchTerm || 
        sale.numero_facture?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.client_nom?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'paid' && sale.statut_paiement === 'paid') ||
        (statusFilter === 'pending' && sale.statut_paiement === 'pending') ||
        (statusFilter === 'cancelled' && sale.statut === 'annulee');
      
      return matchesSearch && matchesStatus;
    });
  }, [sales, searchTerm, statusFilter]);

  // Calculer les métriques (optimisé avec useMemo)
  const metrics = useMemo(() => {
    if (!sales || sales.length === 0) {
      return {
        revenue: 0,
        invoices: 0,
        pending: 0,
        collectionRate: 0
      };
    }
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlySales = sales.filter(sale => {
      if (!sale.date_creation) return false;
      const saleDate = new Date(sale.date_creation);
      return saleDate >= startOfMonth;
    });
    
    const totalRevenue = monthlySales.reduce((sum, sale) => {
      const amount = parseFloat(sale.total_ttc || 0);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    const totalInvoices = monthlySales.length;
    const pendingPayments = sales.filter(sale => sale.statut_paiement === 'pending').length;
    const paidInvoices = sales.filter(sale => sale.statut_paiement === 'paid').length;
    const collectionRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;
    
    return {
      revenue: totalRevenue,
      invoices: totalInvoices,
      pending: pendingPayments,
      collectionRate: Math.round(collectionRate * 100) / 100 // Arrondir à 2 décimales
    };
  }, [sales]);

  // Télécharger une facture PDF
  const downloadInvoice = async (saleId: string, invoiceNumber: string) => {
    try {
      console.log('Génération du PDF pour la facture:', invoiceNumber);
      
      const response = await apiService.generateInvoicePDF(saleId);
      
      if (response.pdf_url) {
        // Ouvrir le PDF dans un nouvel onglet
        window.open(response.pdf_url, '_blank');
      } else {
        alert('Erreur lors de la génération du PDF');
      }
    } catch (error: any) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement de la facture');
    }
  };

  // Imprimer une facture
  const handlePrintInvoice = async (invoice: any) => {
    try {
      if (invoice.id) {
        const response = await apiService.generateInvoicePDF(invoice.id);
        if (response.pdf_url) {
          window.open(response.pdf_url, '_blank');
        } else {
          // Fallback: ouvrir dans un nouvel onglet pour impression
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.write(`
              <html>
                <head>
                  <title>Facture ${invoice.numero_facture || invoice.id}</title>
                  <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .info { margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .total { text-align: right; font-weight: bold; margin-top: 20px; }
                  </style>
                </head>
                <body>
                  <div class="header">
                    <h1>FACTURE</h1>
                    <p>${invoice.numero_facture || invoice.id}</p>
                  </div>
                  <div class="info">
                    <p><strong>Date:</strong> ${new Date(invoice.date_creation || Date.now()).toLocaleDateString('fr-FR')}</p>
                    <p><strong>Client:</strong> ${invoice.client_nom || invoice.client?.nom || 'Client anonyme'}</p>
                    ${invoice.adresse_livraison ? `<p><strong>Adresse:</strong> ${invoice.adresse_livraison}</p>` : ''}
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>Produit</th>
                        <th>Quantité</th>
                        <th>Prix Unitaire</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${(invoice.lignes || []).map((ligne: any) => `
                        <tr>
                          <td>${ligne.produit?.nom || 'Produit'}</td>
                          <td>${ligne.quantite || 1}</td>
                          <td>${(ligne.prix_unitaire || 0).toLocaleString()} XOF</td>
                          <td>${(ligne.total_ttc || ligne.prix_unitaire || 0).toLocaleString()} XOF</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                  <div class="total">
                    <p>Total: ${(invoice.total_ttc || 0).toLocaleString()} XOF</p>
                  </div>
                </body>
              </html>
            `);
            printWindow.document.close();
            printWindow.print();
          }
        }
      } else {
        alert('Impossible d\'imprimer la facture : ID de facture manquant');
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'impression:', error);
      alert('Erreur lors de l\'impression de la facture');
    }
  };

  // Confirmer une vente
  const confirmSale = async (saleId: string) => {
    try {
      await apiService.confirmSale(saleId);
      await refreshSales();
      alert('Vente confirmée avec succès');
    } catch (error: any) {
      console.error('Erreur lors de la confirmation:', error);
      alert('Erreur lors de la confirmation de la vente');
    }
  };

  // Annuler une vente
  const cancelSale = async (saleId: string) => {
    const reason = prompt('Raison de l\'annulation:');
    if (!reason) return;
    
    try {
      await apiService.cancelSale(saleId, reason);
      await refreshSales();
      alert('Vente annulée avec succès');
    } catch (error: any) {
      console.error('Erreur lors de l\'annulation:', error);
      alert('Erreur lors de l\'annulation de la vente');
    }
  };

  const tabs = [
    { id: 'invoices', label: 'Factures', count: sales.length },
    { id: 'quotes', label: 'Devis', count: 0 },
    { id: 'payments', label: 'Paiements', count: sales.filter(s => s.statut_paiement === 'paid').length },
    { id: 'reports', label: 'Rapports', count: 0 },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
      case 'en_attente':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'cancelled':
      case 'annulee':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
      case 'en_attente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled':
      case 'annulee':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return 'Payée';
      case 'pending':
      case 'en_attente':
        return 'En attente';
      case 'cancelled':
      case 'annulee':
        return 'Annulée';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Facturation</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez vos factures, devis et paiements
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="secondary" 
            icon={<RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
            onClick={refreshSales}
            disabled={refreshing}
          >
            Actualiser
          </Button>
          <Button variant="secondary" icon={<Receipt className="w-4 h-4" />}>
            Nouveau Devis
          </Button>
          <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
            Nouvelle Facture
          </Button>
        </div>
      </div>

      {/* Billing Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="CA ce Mois"
          value={metrics.revenue}
          previousValue={metrics.revenue * 0.9} // Estimation
          format="currency"
          icon={<DollarSign className="w-6 h-6" />}
          color="success"
        />
        <MetricCard
          title="Factures Émises"
          value={metrics.invoices}
          previousValue={Math.max(0, metrics.invoices - 7)} // Estimation
          format="number"
          icon={<FileText className="w-6 h-6" />}
          color="primary"
        />
        <MetricCard
          title="En Attente Paiement"
          value={metrics.pending}
          previousValue={Math.max(0, metrics.pending - 4)} // Estimation
          format="number"
          icon={<Clock className="w-6 h-6" />}
          color="warning"
        />
        <MetricCard
          title="Taux de Recouvrement"
          value={metrics.collectionRate}
          previousValue={Math.max(0, metrics.collectionRate - 3.3)} // Estimation
          format="percentage"
          icon={<CheckCircle className="w-6 h-6" />}
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

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {selectedTab === 'invoices' && (
              <motion.div
                key="invoices"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Filtres et recherche */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher par numéro de facture ou client..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="paid">Payées</option>
                    <option value="pending">En attente</option>
                    <option value="cancelled">Annulées</option>
                  </select>
                </div>

                {/* Liste des factures */}
                {error ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                      Erreur de chargement
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {error}
                    </p>
                    <Button
                      variant="primary"
                      icon={<RefreshCw className="w-4 h-4" />}
                      onClick={loadSales}
                    >
                      Réessayer
                    </Button>
                  </div>
                ) : loading ? (
                  <div className="text-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Chargement des factures...</p>
                  </div>
                ) : filteredSales.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                      Aucune facture trouvée
                    </h3>
                    <p className="text-gray-500">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'Aucune facture ne correspond à vos critères de recherche.'
                        : 'Commencez par créer votre première facture depuis le POS.'}
                    </p>
                  </div>
                ) : (
                  filteredSales.map((sale, index) => (
                    <motion.div
                      key={sale.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow cursor-pointer"
                      onClick={() => setSelectedInvoice(sale)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="font-mono text-sm text-primary-600">{sale.numero_facture}</span>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(sale.statut_paiement)}
                              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(sale.statut_paiement)}`}>
                                {getStatusText(sale.statut_paiement)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-6 mb-3">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {sale.client_nom || 'Client anonyme'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-500">
                                {new Date(sale.date_creation).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CreditCard className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-500 capitalize">
                                {sale.mode_paiement}
                              </span>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {sale.notes || `Vente ${sale.source_vente}`}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            {parseFloat(sale.total_ttc || 0).toLocaleString()} XOF
                          </p>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              className="btn-secondary text-sm px-3 py-1.5 inline-flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePrintInvoice(sale);
                              }}
                            >
                              <Printer className="w-3 h-3" />
                              Imprimer
                            </button>
                            <button
                              className="btn-secondary text-sm px-3 py-1.5 inline-flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadInvoice(sale.id, sale.numero_facture);
                              }}
                            >
                              <Download className="w-3 h-3" />
                              PDF
                            </button>
                            {sale.statut_paiement === 'pending' && (
                              <button
                                className="btn-primary text-sm px-3 py-1.5 inline-flex items-center gap-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmSale(sale.id);
                                }}
                              >
                                <CheckCircle className="w-3 h-3" />
                                Confirmer
                              </button>
                            )}
                            {sale.statut !== 'annulee' && (
                              <button
                                className="btn-secondary text-sm px-3 py-1.5 inline-flex items-center gap-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  cancelSale(sale.id);
                                }}
                              >
                                <X className="w-3 h-3" />
                                Annuler
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {selectedTab === 'quotes' && (
              <motion.div
                key="quotes"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center py-12"
              >
                <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  Gestion des Devis
                </h3>
                <p className="text-gray-500">
                  Créez et gérez vos devis clients
                </p>
              </motion.div>
            )}

            {selectedTab === 'payments' && (
              <motion.div
                key="payments"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center py-12"
              >
                <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  Historique des Paiements
                </h3>
                <p className="text-gray-500">
                  Consultez tous vos paiements reçus
                </p>
              </motion.div>
            )}

            {selectedTab === 'reports' && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center py-12"
              >
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  Rapports Financiers
                </h3>
                <p className="text-gray-500">
                  Générez des rapports détaillés
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Invoice Detail Modal */}
      <AnimatePresence>
        {selectedInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={() => setSelectedInvoice(null)}
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
                    Facture {selectedInvoice.numero_facture}
                  </h2>
                  <div className="flex items-center space-x-3 mt-1">
                    {getStatusIcon(selectedInvoice.statut)}
                    <span className={`text-sm px-3 py-1 rounded-full ${getStatusColor(selectedInvoice.statut)}`}>
                      {selectedInvoice.statut === 'payee' ? 'Payée' : 'En attente'}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Invoice Details */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Client Info */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Client</h3>
                      <div className="space-y-2">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedInvoice.client_nom || selectedInvoice.client?.nom || 'Client anonyme'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedInvoice.client_email || selectedInvoice.client?.email || 'Email non disponible'}
                        </p>
                        {selectedInvoice.client?.telephone && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{selectedInvoice.client.telephone}</p>
                        )}
                        {selectedInvoice.adresse_livraison && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{selectedInvoice.adresse_livraison}</p>
                        )}
                      </div>
                    </div>

                    {/* Invoice Lines */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Articles Vendus</h3>
                      <div className="space-y-3">
                        {selectedInvoice.lignes && selectedInvoice.lignes.length > 0 ? (
                          selectedInvoice.lignes.map((ligne: any) => {
                            // Récupérer l'image du produit
                            let productImage = 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=200&auto=format&fit=crop';
                            if (ligne.produit?.images && ligne.produit.images.length > 0) {
                              const firstImage = ligne.produit.images[0];
                              productImage = firstImage.image_url || firstImage.image || productImage;
                            } else if (ligne.produit?.image) {
                              productImage = ligne.produit.image;
                            }
                            
                            return (
                              <div key={ligne.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                <img
                                  src={productImage}
                                  alt={ligne.produit?.nom || 'Produit'}
                                  className="w-16 h-16 rounded-lg object-cover"
                                  onError={(e) => {
                                    const target = e.currentTarget as HTMLImageElement;
                                    target.src = 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=200&auto=format&fit=crop';
                                  }}
                                />
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {ligne.produit?.nom || 'Produit'}
                                  </p>
                                  <p className="text-sm text-gray-500">{ligne.produit?.sku || 'SKU non disponible'}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    Quantité: {ligne.quantite || 1}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-gray-900 dark:text-white">
                                    {(ligne.total_ttc || ligne.prix_unitaire || 0).toLocaleString()} XOF
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {ligne.quantite || 1} x {(ligne.prix_unitaire || 0).toLocaleString()} XOF
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-gray-500 text-center py-4">Aucun article dans cette facture</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Totals */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Récapitulatif</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Sous-total</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {(selectedInvoice.sous_total || selectedInvoice.total_ttc || 0).toLocaleString()} XOF
                          </span>
                        </div>
                        {(selectedInvoice.taxe_montant || selectedInvoice.tva_taux) && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              TVA ({selectedInvoice.tva_taux || 18}%)
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {(selectedInvoice.taxe_montant || 0).toLocaleString()} XOF
                            </span>
                          </div>
                        )}
                        <div className="border-t border-gray-300 dark:border-gray-600 pt-2">
                          <div className="flex justify-between">
                            <span className="font-bold text-gray-900 dark:text-white">Total TTC</span>
                            <span className="text-xl font-bold text-primary-600">
                              {(selectedInvoice.total_ttc || 0).toLocaleString()} XOF
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <Button
                        variant="primary"
                        fullWidth
                        icon={<Edit className="w-4 h-4" />}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="secondary"
                        fullWidth
                        icon={<Printer className="w-4 h-4" />}
                        onClick={() => {
                          // Imprimer la facture
                          handlePrintInvoice(selectedInvoice);
                        }}
                      >
                        Imprimer
                      </Button>
                      <Button
                        variant="secondary"
                        fullWidth
                        icon={<Send className="w-4 h-4" />}
                      >
                        Envoyer par Email
                      </Button>
                      <Button
                        variant="secondary"
                        fullWidth
                        icon={<Download className="w-4 h-4" />}
                        onClick={() => downloadInvoice(selectedInvoice.id, selectedInvoice.numero_facture)}
                      >
                        Télécharger PDF
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

export default BillingPage;