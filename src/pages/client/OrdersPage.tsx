import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import apiService from '../../services/api/realApi';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
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
  X,
  Printer,
  FileText
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { getBackendBaseUrl } from '../../utils/constants';

const OrdersPage: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Afficher un message de succès si on vient d'une commande et recharger les commandes
  useEffect(() => {
    if (location.state?.message || location.state?.refresh || location.state?.newOrder) {
      console.log('📦 État de navigation reçu:', location.state);
      
      // Afficher une notification de succès si un message est fourni
      if (location.state?.message) {
        addNotification({
          type: 'success',
          title: 'Commande confirmée !',
          message: location.state.message,
        });
      }
      
      // Recharger immédiatement
      console.log('🔄 Rechargement immédiat des commandes...');
      loadOrders();
      
      // Attendre un peu pour que la commande soit bien enregistrée côté serveur
      const timer1 = setTimeout(() => {
        console.log('🔄 Premier rechargement des commandes (1.5s)...');
        loadOrders();
      }, 1500);
      
      // Recharger une deuxième fois après un délai plus long
      const timer2 = setTimeout(() => {
        console.log('🔄 Deuxième rechargement des commandes (3s)...');
        loadOrders();
      }, 3000);
      
      // Recharger une troisième fois après un délai encore plus long
      const timer3 = setTimeout(() => {
        console.log('🔄 Troisième rechargement des commandes (5s)...');
        loadOrders();
      }, 5000);
      
      // Nettoyer l'état pour éviter de réafficher le message
      window.history.replaceState({}, document.title);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // Charger les commandes depuis l'API
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      console.log('🔄 ========== CHARGEMENT DES COMMANDES ==========');
      console.log('👤 Utilisateur connecté:', {
        email: user?.email,
        id: user?.id,
        type: user?.type_utilisateur
      });
      
      if (!user?.email) {
        console.error('❌ ERREUR: Aucun email utilisateur trouvé!');
        setOrders([]);
        setLoading(false);
        return;
      }
      
      // Charger les commandes depuis l'API
      console.log('📞 Appel à apiService.getClientOrders...');
      let ordersData = await apiService.getClientOrders({ page_size: 100 });
      
      console.log('📦 Réponse API brute:', ordersData);
      console.log('📦 Type de réponse:', typeof ordersData);
      console.log('📦 Est un tableau?', Array.isArray(ordersData));
      console.log('📦 Nombre de commandes:', Array.isArray(ordersData) ? ordersData.length : 'Non-array');
      
      if (!Array.isArray(ordersData)) {
        console.error('❌ ERREUR: Les commandes ne sont pas un tableau!');
        console.error('❌ Type:', typeof ordersData);
        console.error('❌ Valeur:', ordersData);
        if (ordersData && typeof ordersData === 'object') {
          console.error('❌ Clés:', Object.keys(ordersData));
          console.error('❌ Structure complète:', JSON.stringify(ordersData, null, 2));
        }
        // Essayer de récupérer les résultats même si ce n'est pas un tableau
        if (ordersData && typeof ordersData === 'object' && 'results' in ordersData) {
          console.warn('⚠️ Tentative de récupération depuis response.results...');
          const extracted = (ordersData as any).results;
          if (Array.isArray(extracted)) {
            console.log('✅ Extraction réussie depuis results:', extracted.length);
            // Continuer avec extracted comme si c'était ordersData
            ordersData = extracted;
          }
        }
      }
      
      // S'assurer que ordersData est un tableau
      if (!Array.isArray(ordersData)) {
        console.error('❌ Impossible de convertir ordersData en tableau');
        console.error('❌ Valeur finale:', ordersData);
        setOrders([]);
        setLoading(false);
        return;
      }
      
      console.log(`✅ ${ordersData.length} commande(s) reçue(s) de l'API`);
      
      if (ordersData.length === 0) {
        console.warn('⚠️ AUCUNE COMMANDE TROUVÉE!');
        console.warn('⚠️ Vérifiez que:');
        console.warn('   1. Des commandes ont été créées avec succès');
        console.warn('   2. L\'email de l\'utilisateur correspond à celui utilisé lors de la création');
        console.warn('   3. Les logs du backend montrent des commandes trouvées');
        setOrders([]);
        setLoading(false);
        return;
      }
      
      // Transformer les données de l'API en format utilisable
      console.log('🔄 Transformation des commandes...');
      const transformedOrders = (ordersData || []).map((order: any, index: number) => {
        console.log(`📦 Commande ${index + 1}:`, {
          id: order.id,
          numero_facture: order.numero_facture,
          client_id: order.client,
          client_email: order.client_email || order.client?.email,
          statut: order.statut,
          total_ttc: order.total_ttc,
          lignes_count: order.lignes?.length || 0
        });
        // Mapper les statuts
        const statusMap: Record<string, string> = {
          'en_attente': 'processing',
          'confirmee': 'processing',
          'expediee': 'shipped',
          'livree': 'delivered',
          'terminee': 'delivered',
          'annulee': 'cancelled'
        };
        
        const mappedStatus = statusMap[order.statut] || order.statut || 'processing';
        
        // Transformer les lignes de vente en items
        const items = (order.lignes || []).map((ligne: any) => {
          // Récupérer l'image du produit - PRIORITÉ AUX IMAGES LOCALES
          let imageUrl: string | null = null;
          if (ligne.produit?.images && ligne.produit.images.length > 0) {
            const firstImage = ligne.produit.images[0];
            if (firstImage.image_url && typeof firstImage.image_url === 'string') {
              imageUrl = firstImage.image_url;
            } else if (firstImage.image && typeof firstImage.image === 'string') {
              if (firstImage.image.startsWith('http')) {
                imageUrl = firstImage.image;
              } else {
                const imagePath = firstImage.image.startsWith('/') ? firstImage.image : `/media/${firstImage.image}`;
                imageUrl = `${getBackendBaseUrl()}${imagePath}`;
              }
            }
          } else if (ligne.produit?.image && typeof ligne.produit.image === 'string') {
            if (ligne.produit.image.startsWith('http')) {
              imageUrl = ligne.produit.image;
            } else {
              const imagePath = ligne.produit.image.startsWith('/') ? ligne.produit.image : `/media/${ligne.produit.image}`;
              imageUrl = `${getBackendBaseUrl()}${imagePath}`;
            }
          }
          
          // SEULEMENT si aucune image locale n'a été trouvée, utiliser une image par défaut
          if (!imageUrl) {
            imageUrl = 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=200&auto=format&fit=crop';
          }
          
          // Calculer le prix unitaire et le total
          const quantite = ligne.quantite || 1;
          const prixUnitaire = parseFloat(ligne.prix_unitaire || 0);
          const totalLigne = parseFloat(ligne.total_ttc || (prixUnitaire * quantite) || 0);
          
          return {
            id: ligne.id || ligne.produit?.id,
            name: ligne.produit?.nom || 'Produit',
            quantity: quantite,
            price: totalLigne,
            prixUnitaire: prixUnitaire,
            image: imageUrl
          };
        });
        
        // Récupérer le logo de l'entreprise
        let sellerLogo = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=100&auto=format&fit=crop';
        if (order.entrepreneur_nom) {
          // Utiliser le logo de l'entreprise si disponible
          sellerLogo = sellerLogo;
        }
        
        return {
          id: order.id || order.numero_commande || order.numero_facture,
          numero_facture: order.numero_facture,
          date: order.date_creation,
          status: mappedStatus,
          total: parseFloat(order.total_ttc || 0),
          items: items,
          seller: {
            name: order.entrepreneur_nom || 'Entreprise',
            logo: sellerLogo
          },
          shipping: {
            method: order.transporteur || 'Livraison Standard',
            address: order.adresse_livraison || 'Adresse non spécifiée',
            trackingNumber: order.numero_suivi,
            estimatedDelivery: order.date_livraison_prevue,
            actualDelivery: order.date_livraison_reelle
          },
          payment: {
            method: order.mode_paiement || 'Non spécifié',
            reference: order.reference_paiement || '',
            status: order.statut_paiement === 'paid' ? 'paid' : 'pending'
          },
          canReview: mappedStatus === 'delivered',
          canReturn: mappedStatus === 'delivered' && new Date(order.date_livraison_reelle || order.date_creation) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          returnDeadline: order.date_livraison_reelle ? new Date(new Date(order.date_livraison_reelle).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
          // Données brutes pour les détails
          rawData: order
        };
      });
      
      // Trier par date de création (plus récentes en premier)
      const sortedOrders = transformedOrders.sort((a: any, b: any) => {
        const dateA = new Date(a.date || 0).getTime();
        const dateB = new Date(b.date || 0).getTime();
        return dateB - dateA;
      });
      
      setOrders(sortedOrders);
      console.log('✅ Commandes transformées et triées:', sortedOrders.length);
      if (sortedOrders.length > 0) {
        console.log('📋 Première commande:', {
          id: sortedOrders[0].id,
          numero_facture: sortedOrders[0].numero_facture,
          date: sortedOrders[0].date,
          total: sortedOrders[0].total
        });
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des commandes:', error);
      setOrders([]);
      addNotification({
        type: 'error',
        title: 'Erreur de chargement',
        message: 'Impossible de charger votre historique de commandes. Veuillez réessayer.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Télécharger une facture en PDF
  const handleDownloadInvoice = async (order: any) => {
    try {
      if (order.rawData?.id) {
        await apiService.downloadInvoicePDF(order.rawData.id, `facture-${order.numero_facture || order.id}.pdf`);
      } else {
        alert('Impossible de télécharger la facture : ID de commande manquant');
      }
    } catch (error: any) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement de la facture');
    }
  };
  
  // Imprimer une facture avec style ticket/reçu
  const handlePrintInvoice = async (order: any) => {
    try {
      // Toujours utiliser la version HTML pour l'impression (plus fiable)
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Veuillez autoriser les pop-ups pour imprimer la facture');
        return;
      }
      
      const invoiceData = order.rawData || order;
      
      // Essayer de récupérer les détails complets de la commande si nécessaire
      let fullOrderData = invoiceData;
      if (order.rawData?.id && (!invoiceData.lignes || invoiceData.lignes.length === 0)) {
        try {
          const orderDetails = await apiService.getSale(order.rawData.id);
          fullOrderData = orderDetails || invoiceData;
        } catch (error) {
          console.warn('Impossible de récupérer les détails complets, utilisation des données disponibles');
        }
      }
      
      // Utiliser fullOrderData pour les lignes, sinon invoiceData
      const dataToUse = (fullOrderData.lignes && fullOrderData.lignes.length > 0) ? fullOrderData : invoiceData;
      
      // Récupérer les informations de l'entreprise depuis la commande
      const companyInfo = {
        nom: invoiceData.entrepreneur_nom || order.seller?.name || 'Entreprise',
        adresse: invoiceData.entrepreneur?.entreprise?.adresse_complete || 
                order.shipping?.address?.split(',')[0] || 'Adresse non spécifiée',
        telephone: invoiceData.entrepreneur?.entreprise?.telephone || 
                   invoiceData.entrepreneur?.telephone || 
                   order.seller?.telephone || 
                   '+221 XX XXX XX XX',
        email: invoiceData.entrepreneur?.entreprise?.email || 
               invoiceData.entrepreneur?.email || 
               order.seller?.email || 
               'email@example.com'
      };
      
      // Récupérer les informations du client
      const clientInfo = {
              nom: invoiceData.client_nom || 
             invoiceData.client?.nom || 
             (invoiceData.client?.prenom && invoiceData.client?.nom ? 
              `${invoiceData.client.prenom} ${invoiceData.client.nom}` : 
              invoiceData.client?.prenom || invoiceData.client?.nom || user?.firstName || 'Client'),
        telephone: invoiceData.client?.telephone || 
                  invoiceData.client_telephone || 
                  (user as any)?.telephone || 
                  ''
      };
      
      // Préparer les lignes pour l'affichage
      const lignesToDisplay = dataToUse.lignes || order.items || [];
      
      printWindow.document.write(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>Facture ${order.numero_facture || order.id}</title>
                  <style>
                    @media print {
                      @page { margin: 0; size: auto; }
                      body { margin: 0; }
                    }
                    body { 
                      font-family: 'Courier New', monospace; 
                      padding: 20px; 
                      max-width: 400px; 
                      margin: 0 auto;
                      background: white;
                      color: black;
                    }
                    .invoice-container {
                      border: 2px solid #000;
                      padding: 20px;
                      background: white;
                    }
                    .header-line {
                      border-top: 2px solid #000;
                      border-bottom: 2px solid #000;
                      padding: 10px 0;
                      margin: 10px 0;
                    }
                    .company-name {
                      font-size: 16px;
                      font-weight: bold;
                      text-align: center;
                      text-transform: uppercase;
                      letter-spacing: 1px;
                    }
                    .company-info {
                      font-size: 11px;
                      text-align: center;
                      margin: 5px 0;
                    }
                    .invoice-title {
                      font-size: 18px;
                      font-weight: bold;
                      text-align: center;
                      margin: 15px 0;
                    }
                    .invoice-info {
                      font-size: 11px;
                      margin: 5px 0;
                    }
                    .items-header {
                      display: flex;
                      justify-content: space-between;
                      font-weight: bold;
                      font-size: 11px;
                      padding: 5px 0;
                      border-bottom: 1px solid #000;
                      margin: 10px 0 5px 0;
                    }
                    .item-row {
                      display: flex;
                      justify-content: space-between;
                      font-size: 11px;
                      padding: 3px 0;
                    }
                    .item-name { flex: 1; }
                    .item-qty { width: 40px; text-align: center; }
                    .item-price { width: 80px; text-align: right; }
                    .item-total { width: 90px; text-align: right; }
                    .dashed-line {
                      border-bottom: 1px dashed #666;
                      margin: 10px 0;
                    }
                    .totals {
                      font-size: 11px;
                      text-align: right;
                      margin: 10px 0;
                    }
                    .total-row {
                      display: flex;
                      justify-content: flex-end;
                      margin: 3px 0;
                    }
                    .total-label { margin-right: 10px; }
                    .total-value { width: 90px; text-align: right; }
                    .grand-total {
                      border-top: 2px solid #000;
                      padding-top: 5px;
                      margin-top: 10px;
                      font-weight: bold;
                      font-size: 14px;
                    }
                    .payment-info {
                      font-size: 11px;
                      margin: 15px 0;
                    }
                    .footer {
                      text-align: center;
                      font-size: 10px;
                      margin-top: 20px;
                      border-top: 2px solid #000;
                      border-bottom: 2px solid #000;
                      padding: 10px 0;
                    }
                  </style>
                </head>
                <body>
                  <div class="invoice-container">
                    <!-- En-tête entreprise -->
                    <div class="header-line">
                      <div class="company-name">${companyInfo.nom}</div>
                    </div>
                    <div class="company-info">${companyInfo.adresse}</div>
                    <div class="company-info">Tel: ${companyInfo.telephone}</div>
                    <div class="company-info">Email: ${companyInfo.email}</div>
                    <div class="header-line"></div>
                    
                    <!-- Titre FACTURE -->
                    <div class="invoice-title">FACTURE</div>
                    <div class="invoice-info">N° Facture: ${order.numero_facture || order.id || 'N/A'}</div>
                    <div class="invoice-info">
                      Date: ${new Date(order.date || invoiceData.date_creation || Date.now()).toLocaleDateString('fr-FR')} 
                      ${new Date(order.date || invoiceData.date_creation || Date.now()).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div class="invoice-info">Client: ${clientInfo.nom}</div>
                    ${clientInfo.telephone ? `<div class="invoice-info">Tel: ${clientInfo.telephone}</div>` : ''}
                    <div class="header-line"></div>
                    
                    <!-- Tableau des articles -->
                    <div class="items-header">
                      <span class="item-name">Designation</span>
                      <span class="item-qty">Qte</span>
                      <span class="item-price">P.U.</span>
                      <span class="item-total">Montant</span>
                    </div>
                    <div class="dashed-line"></div>
                    ${lignesToDisplay.map((ligne: any) => {
                      const produitNom = ligne.produit?.nom || ligne.name || 'Produit';
                      const quantite = ligne.quantite || ligne.quantity || 1;
                      const prixUnitaire = ligne.prix_unitaire || ligne.prixUnitaire || (ligne.price && ligne.quantity ? (ligne.price / ligne.quantity) : 0);
                      const montant = ligne.total_ttc || ligne.price || (prixUnitaire * quantite);
                      const nomAffiche = produitNom.length > 20 ? produitNom.substring(0, 17) + '...' : produitNom;
                      return `
                        <div class="item-row">
                          <span class="item-name">${nomAffiche}</span>
                          <span class="item-qty">${quantite}</span>
                          <span class="item-price">${prixUnitaire.toLocaleString('fr-FR')} F</span>
                          <span class="item-total">${montant.toLocaleString('fr-FR')} F</span>
                        </div>
                      `;
                    }).join('')}
                    <div class="dashed-line"></div>
                    
                    <!-- Totaux -->
                    <div class="totals">
                      <div class="total-row">
                        <span class="total-label">Sous-total:</span>
                        <span class="total-value">${(dataToUse.sous_total || invoiceData.sous_total || order.total || 0).toLocaleString('fr-FR')} F</span>
                      </div>
                      ${((dataToUse.taxe_montant || invoiceData.taxe_montant || 0) > 0) ? `
                        <div class="total-row">
                          <span class="total-label">TVA (${dataToUse.tva_taux || invoiceData.tva_taux || 18}%):</span>
                          <span class="total-value">${(dataToUse.taxe_montant || invoiceData.taxe_montant || 0).toLocaleString('fr-FR')} F</span>
                        </div>
                      ` : ''}
                      ${((dataToUse.remise_montant || invoiceData.remise_montant || 0) > 0) ? `
                        <div class="total-row">
                          <span class="total-label">Remise:</span>
                          <span class="total-value">- ${(dataToUse.remise_montant || invoiceData.remise_montant || 0).toLocaleString('fr-FR')} F</span>
                        </div>
                      ` : ''}
                      <div class="total-row grand-total">
                        <span class="total-label">TOTAL À PAYER:</span>
                        <span class="total-value">${(dataToUse.total_ttc || invoiceData.total_ttc || order.total || 0).toLocaleString('fr-FR')} F</span>
                      </div>
                    </div>
                    <div class="header-line"></div>
                    
                    <!-- Mode de paiement -->
                    <div class="payment-info">
                      <div>Mode de paiement: ${invoiceData.mode_paiement || order.payment?.method || 'Non spécifié'}</div>
                    </div>
                    <div class="header-line"></div>
                    
                    <!-- Message de remerciement -->
                    <div class="footer">
                      <div>Merci de votre confiance !</div>
                      <div>Votre satisfaction est notre priorité</div>
                    </div>
                  </div>
                </body>
              </html>
            `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    } catch (error: any) {
      console.error('Erreur lors de l\'impression:', error);
      alert('Erreur lors de l\'impression de la facture');
    }
  };

  const orderStatuses = [
    { id: 'all', label: 'Toutes', count: orders.length },
    { id: 'processing', label: 'En préparation', count: orders.filter(o => o.status === 'processing').length },
    { id: 'shipped', label: 'Expédiées', count: orders.filter(o => o.status === 'shipped').length },
    { id: 'delivered', label: 'Livrées', count: orders.filter(o => o.status === 'delivered').length },
    { id: 'cancelled', label: 'Annulées', count: orders.filter(o => o.status === 'cancelled').length },
  ];
  
  // Filtrer les commandes selon l'onglet sélectionné
  const filteredOrders = orders.filter(order => {
    if (selectedTab === 'all') return true;
    return order.status === selectedTab;
  }).filter(order => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      order.id?.toLowerCase().includes(search) ||
      order.numero_facture?.toLowerCase().includes(search) ||
      order.items.some((item: any) => item.name.toLowerCase().includes(search)) ||
      order.seller.name.toLowerCase().includes(search)
    );
  });

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
          <Button 
            variant="secondary" 
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={() => {
              console.log('🔄 Rechargement manuel des commandes...');
              loadOrders();
            }}
          >
            Actualiser
          </Button>
          <Button 
            variant="secondary" 
            icon={<FileText className="w-4 h-4" />}
            onClick={async () => {
              console.log('🧪 TEST DIRECT DE L\'API...');
              try {
                const testResponse = await apiService.getClientOrders({ page_size: 100 });
                console.log('🧪 Réponse du test:', testResponse);
                console.log('🧪 Type:', typeof testResponse);
                console.log('🧪 Est un tableau?', Array.isArray(testResponse));
                if (Array.isArray(testResponse)) {
                  console.log(`🧪 Nombre de commandes: ${testResponse.length}`);
                  if (testResponse.length > 0) {
                    console.log('🧪 Première commande:', testResponse[0]);
                  }
                } else if (testResponse && typeof testResponse === 'object') {
                  console.log('🧪 Clés de l\'objet:', Object.keys(testResponse));
                  if (testResponse.results) {
                    console.log(`🧪 Nombre dans results: ${testResponse.results.length}`);
                  }
                }
                alert(`Test terminé. Vérifiez la console pour les détails.\nCommandes trouvées: ${Array.isArray(testResponse) ? testResponse.length : testResponse?.results?.length || 0}`);
              } catch (error) {
                console.error('🧪 Erreur lors du test:', error);
                alert('Erreur lors du test. Vérifiez la console.');
              }
            }}
          >
            Test API
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
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Chargement des commandes...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                Aucune commande trouvée
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedTab !== 'all'
                  ? 'Aucune commande ne correspond à vos critères.'
                  : 'Vous n\'avez pas encore passé de commande.'}
              </p>
              {!searchTerm && selectedTab === 'all' && (
                <div className="mt-4 space-y-3">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-left max-w-md mx-auto">
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                      <strong>💡 Pour déboguer :</strong>
                    </p>
                    <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                      <li>Ouvrez la console du navigateur (F12)</li>
                      <li>Cliquez sur "Test API" pour voir la réponse</li>
                      <li>Vérifiez les logs du backend Django</li>
                      <li>Assurez-vous que l'email correspond à celui utilisé lors de la commande</li>
                    </ul>
                  </div>
                  <div className="flex justify-center space-x-3">
                    <Button 
                      variant="secondary" 
                      icon={<RefreshCw className="w-4 h-4" />}
                      onClick={loadOrders}
                    >
                      Actualiser
                    </Button>
                    <Button 
                      variant="secondary" 
                      icon={<FileText className="w-4 h-4" />}
                      onClick={async () => {
                        console.log('🧪 TEST DIRECT DE L\'API...');
                        try {
                          const testResponse = await apiService.getClientOrders({ page_size: 100 });
                          console.log('🧪 Réponse du test:', testResponse);
                          console.log('🧪 Type:', typeof testResponse);
                          console.log('🧪 Est un tableau?', Array.isArray(testResponse));
                          if (Array.isArray(testResponse)) {
                            console.log(`🧪 Nombre de commandes: ${testResponse.length}`);
                            if (testResponse.length > 0) {
                              console.log('🧪 Première commande:', testResponse[0]);
                            }
                          } else if (testResponse && typeof testResponse === 'object') {
                            console.log('🧪 Clés de l\'objet:', Object.keys(testResponse));
                            if (testResponse.results) {
                              console.log(`🧪 Nombre dans results: ${testResponse.results.length}`);
                            }
                          }
                          alert(`Test terminé. Vérifiez la console pour les détails.\nCommandes trouvées: ${Array.isArray(testResponse) ? testResponse.length : testResponse?.results?.length || 0}`);
                        } catch (error) {
                          console.error('🧪 Erreur lors du test:', error);
                          alert('Erreur lors du test. Vérifiez la console.');
                        }
                      }}
                    >
                      Test API
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredOrders.map((order, index) => (
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
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              const currentSrc = target.src;
                              // Essayer d'abord avec l'URL de base du backend si ce n'est pas déjà le cas
                              if (!currentSrc.includes(getBackendBaseUrl()) && !currentSrc.includes('unsplash') && !currentSrc.includes('pexels')) {
                                const imagePath = currentSrc.replace(/^https?:\/\/[^/]+/, '');
                                target.src = `${getBackendBaseUrl()}${imagePath}`;
                              } else {
                                target.src = 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=200&auto=format&fit=crop';
                              }
                            }}
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
                        <button 
                          className="btn-secondary text-sm px-3 py-1.5 inline-flex items-center gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrintInvoice(order);
                          }}
                        >
                          <Printer className="w-3 h-3" />
                          Imprimer
                        </button>
                        <button 
                          className="btn-secondary text-sm px-3 py-1.5 inline-flex items-center gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadInvoice(order);
                          }}
                        >
                          <Download className="w-3 h-3" />
                          PDF
                        </button>
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
          )}
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
                        {selectedOrder.items && selectedOrder.items.length > 0 ? (
                          selectedOrder.items.map((item: any) => (
                            <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 rounded-lg object-cover"
                                onError={(e) => {
                                  const target = e.currentTarget as HTMLImageElement;
                                  const currentSrc = target.src;
                                  // Essayer d'abord avec l'URL de base du backend si ce n'est pas déjà le cas
                                  if (!currentSrc.includes(getBackendBaseUrl()) && !currentSrc.includes('unsplash') && !currentSrc.includes('pexels')) {
                                    const imagePath = currentSrc.replace(/^https?:\/\/[^/]+/, '');
                                    target.src = `${getBackendBaseUrl()}${imagePath}`;
                                  } else {
                                    target.src = 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=200&auto=format&fit=crop';
                                  }
                                }}
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
                          ))
                        ) : (
                          <p className="text-gray-500 text-center py-4">Aucun article dans cette commande</p>
                        )}
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
                        onClick={() => handleDownloadInvoice(selectedOrder)}
                      >
                        Télécharger Facture PDF
                      </Button>
                      
                      <Button
                        variant="secondary"
                        fullWidth
                        icon={<Printer className="w-4 h-4" />}
                        onClick={() => handlePrintInvoice(selectedOrder)}
                      >
                        Imprimer Facture
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