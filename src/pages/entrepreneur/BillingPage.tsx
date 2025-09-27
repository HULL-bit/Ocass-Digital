import React, { useState } from 'react';
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
  BarChart3
} from 'lucide-react';
import Button from '../../components/ui/Button';
import MetricCard from '../../components/ui/MetricCard';
import AnimatedForm from '../../components/forms/AnimatedForm';
import * as yup from 'yup';

const BillingPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('invoices');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  const mockInvoices = [
    {
      id: '1',
      numero_facture: 'FAC202401001',
      numero_commande: 'CMD-001',
      client: {
        id: '1',
        nom: 'Aminata Diop',
        email: 'aminata.diop@email.sn',
        telephone: '+221 77 123 45 67',
        adresse: 'Plateau, Dakar',
      },
      date_creation: '2024-01-15T10:30:00Z',
      date_echeance: '2024-02-14T23:59:59Z',
      statut: 'payee',
      statut_paiement: 'completed',
      sous_total: 850000,
      taxe_montant: 153000,
      remise_montant: 0,
      total_ttc: 1003000,
      mode_paiement: 'wave',
      date_paiement: '2024-01-15T11:45:00Z',
      reference_paiement: 'WV789123456',
      notes: 'Paiement immédiat - Client VIP',
      lignes: [
        {
          id: '1',
          produit: { nom: 'Boubou Grand Boubou', sku: 'BOUBOU-H-001' },
          quantite: 1,
          prix_unitaire: 65000,
          remise_pourcentage: 0,
          total_ttc: 76700,
        },
        {
          id: '2',
          produit: { nom: 'Djembé Artisanal', sku: 'DJEMBE-TRAD-001' },
          quantite: 1,
          prix_unitaire: 95000,
          remise_pourcentage: 5,
          total_ttc: 106065,
        },
      ],
    },
    {
      id: '2',
      numero_facture: 'FAC202401002',
      client: {
        id: '2',
        nom: 'Ousmane Ndiaye',
        email: 'ousmane@garage.sn',
        telephone: '+221 77 234 56 78',
        adresse: 'Médina, Dakar',
      },
      date_creation: '2024-01-12T14:20:00Z',
      date_echeance: '2024-02-11T23:59:59Z',
      statut: 'en_attente',
      statut_paiement: 'pending',
      sous_total: 125000,
      taxe_montant: 22500,
      remise_montant: 12500,
      total_ttc: 135000,
      mode_paiement: 'virement',
      notes: 'Facture professionnelle - Délai 30 jours',
      lignes: [
        {
          id: '1',
          produit: { nom: 'Riz Brisé Local', sku: 'RIZ-BRISE-25KG' },
          quantite: 10,
          prix_unitaire: 12000,
          remise_pourcentage: 10,
          total_ttc: 127200,
        },
      ],
    },
  ];

  const tabs = [
    { id: 'invoices', label: 'Factures', count: mockInvoices.length },
    { id: 'quotes', label: 'Devis', count: 5 },
    { id: 'payments', label: 'Paiements', count: 45 },
    { id: 'reports', label: 'Rapports', count: 12 },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'payee':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'en_attente':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'en_retard':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'payee':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'en_attente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'en_retard':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
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
          value={2350000}
          previousValue={2100000}
          format="currency"
          icon={<DollarSign className="w-6 h-6" />}
          color="success"
        />
        <MetricCard
          title="Factures Émises"
          value={45}
          previousValue={38}
          format="number"
          icon={<FileText className="w-6 h-6" />}
          color="primary"
        />
        <MetricCard
          title="En Attente Paiement"
          value={8}
          previousValue={12}
          format="number"
          icon={<Clock className="w-6 h-6" />}
          color="warning"
        />
        <MetricCard
          title="Taux de Recouvrement"
          value={94.5}
          previousValue={91.2}
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
                {mockInvoices.map((invoice, index) => (
                  <motion.div
                    key={invoice.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => setSelectedInvoice(invoice)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-mono text-sm text-primary-600">{invoice.numero_facture}</span>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(invoice.statut)}
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(invoice.statut)}`}>
                              {invoice.statut === 'payee' ? 'Payée' :
                               invoice.statut === 'en_attente' ? 'En attente' : 'En retard'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6 mb-3">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{invoice.client.nom}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-500">
                              {new Date(invoice.date_creation).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-300">{invoice.notes}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                          {invoice.total_ttc.toLocaleString()} XOF
                        </p>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={<Printer className="w-3 h-3" />}
                          >
                            Imprimer
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={<Send className="w-3 h-3" />}
                          >
                            Envoyer
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
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
                        <p className="font-medium text-gray-900 dark:text-white">{selectedInvoice.client.nom}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedInvoice.client.email}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedInvoice.client.telephone}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedInvoice.client.adresse}</p>
                      </div>
                    </div>

                    {/* Invoice Lines */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Articles</h3>
                      <div className="space-y-3">
                        {selectedInvoice.lignes.map((ligne: any) => (
                          <div key={ligne.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{ligne.produit.nom}</p>
                              <p className="text-sm text-gray-500">{ligne.produit.sku}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {ligne.total_ttc.toLocaleString()} XOF
                              </p>
                              <p className="text-sm text-gray-500">
                                {ligne.quantite} x {ligne.prix_unitaire.toLocaleString()} XOF
                              </p>
                            </div>
                          </div>
                        ))}
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
                            {selectedInvoice.sous_total.toLocaleString()} XOF
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">TVA (18%)</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {selectedInvoice.taxe_montant.toLocaleString()} XOF
                          </span>
                        </div>
                        <div className="border-t border-gray-300 dark:border-gray-600 pt-2">
                          <div className="flex justify-between">
                            <span className="font-bold text-gray-900 dark:text-white">Total TTC</span>
                            <span className="text-xl font-bold text-primary-600">
                              {selectedInvoice.total_ttc.toLocaleString()} XOF
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