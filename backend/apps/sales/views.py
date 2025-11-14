"""
Vues pour la gestion des ventes.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from django.http import HttpResponse
from .models import Vente, LigneVente, Devis, LigneDevis
from .serializers import VenteSerializer, DevisSerializer
from apps.core.permissions import IsEntrepreneurOrAdmin, CanCreateSale
from apps.products.models import Produit
from apps.users.models import UtilisateurPersonnalise
from apps.customers.models import Client


class VenteViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des ventes."""
    queryset = Vente.objects.all()
    serializer_class = VenteSerializer
    permission_classes = [IsAuthenticated, CanCreateSale]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['statut', 'statut_paiement', 'mode_paiement']
    search_fields = ['numero_facture', 'client__nom', 'client__email']
    ordering_fields = ['date_creation', 'total_ttc']
    
    def create(self, request, *args, **kwargs):
        """Override create pour ajouter des logs de débogage."""
        import logging
        logger = logging.getLogger(__name__)
        logger.info('🚀 ========== CREATE VENTE ==========')
        logger.info(f'👤 Utilisateur: {request.user.email}')
        logger.info(f'📦 Données brutes reçues: {request.data}')
        logger.info(f'📦 Type de données: {type(request.data)}')
        logger.info(f'📦 Clés des données: {list(request.data.keys()) if isinstance(request.data, dict) else "N/A"}')
        
        # Logger lignes_data spécifiquement
        if 'lignes_data' in request.data:
            lignes_data_raw = request.data.get('lignes_data')
            logger.info(f'📦 lignes_data brut: type={type(lignes_data_raw)}, value={lignes_data_raw}')
            if isinstance(lignes_data_raw, list):
                logger.info(f'📦 lignes_data est une liste avec {len(lignes_data_raw)} éléments')
                for idx, ligne in enumerate(lignes_data_raw):
                    logger.info(f'📦 Ligne {idx + 1}: {ligne}')
        
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            logger.error(f'❌ ERREUR dans create(): {type(e).__name__}: {str(e)}')
            logger.error(f'❌ Traceback:', exc_info=True)
            raise
    
    def list(self, request, *args, **kwargs):
        """Override list pour ajouter des logs de débogage."""
        import logging
        logger = logging.getLogger(__name__)
        logger.info('📋 ========== LIST VENTES ==========')
        logger.info(f'👤 Utilisateur: {request.user.email}, type: {request.user.type_utilisateur}')
        
        # Appeler la méthode parente
        response = super().list(request, *args, **kwargs)
        
        # Logger la réponse
        if hasattr(response, 'data'):
            if isinstance(response.data, dict) and 'results' in response.data:
                logger.info(f'📦 Réponse paginée: {len(response.data["results"])} commande(s) dans results')
                logger.info(f'📊 Pagination: {response.data.get("pagination", {})}')
            elif isinstance(response.data, list):
                logger.info(f'📦 Réponse liste: {len(response.data)} commande(s)')
            else:
                logger.warn(f'⚠️ Format de réponse inattendu: {type(response.data)}')
                logger.warn(f'⚠️ Clés: {list(response.data.keys()) if isinstance(response.data, dict) else "N/A"}')
        
        return response
    
    def get_queryset(self):
        user = self.request.user
        if user.type_utilisateur == 'admin':
            return Vente.objects.all().order_by('-date_creation')
        elif user.type_utilisateur == 'entrepreneur':
            return Vente.objects.filter(entrepreneur=user).order_by('-date_creation')
        else:
            # Les clients voient leurs propres commandes
            # Normaliser l'email pour la recherche
            user_email = user.email.lower().strip() if user.email else ''
            
            # Log pour le débogage
            import logging
            logger = logging.getLogger(__name__)
            logger.info(f'🔍 Recherche de commandes pour client: {user_email}')
            logger.info(f'🔍 Email original de l\'utilisateur: {user.email}')
            
            # IMPORTANT: Récupérer TOUS les clients avec cet email (peu importe l'entrepreneur)
            # car un client peut avoir des commandes avec différents entrepreneurs
            # Le modèle Client a unique_together = ['entrepreneur', 'email']
            # donc un même email peut exister avec plusieurs entrepreneurs
            # Utiliser email__iexact pour la recherche insensible à la casse
            # et aussi chercher avec l'email normalisé (lowercase)
            client_ids = list(Client.objects.filter(
                email__iexact=user_email
            ).values_list('id', flat=True))
            logger.info(f'📋 IDs de clients trouvés pour email {user_email}: {client_ids}')
            
            # Si aucun client trouvé, essayer aussi avec l'email tel quel (au cas où)
            if not client_ids and user.email:
                client_ids = list(Client.objects.filter(
                    email__iexact=user.email
                ).values_list('id', flat=True))
                logger.info(f'📋 IDs de clients trouvés pour email original {user.email}: {client_ids}')
            
            # Afficher tous les clients pour débogage
            all_clients = Client.objects.all()[:10]
            logger.info(f'📋 Tous les clients (premiers 10): {[(c.id, c.email, c.entrepreneur.id) for c in all_clients]}')
            
            # Filtrer les commandes par IDs de clients trouvés
            if client_ids:
                queryset = Vente.objects.filter(client__id__in=client_ids)
                logger.info(f'📦 Commandes trouvées avec client_ids: {queryset.count()}')
            else:
                # Si aucun client trouvé, retourner un queryset vide
                queryset = Vente.objects.none()
                logger.warn(f'⚠️ Aucun client trouvé pour email: {user_email}')
                # Afficher toutes les ventes pour débogage
                all_ventes = Vente.objects.all()[:5]
                logger.warn(f'⚠️ Toutes les ventes (premiers 5): {[(v.id, v.client.email if v.client else "N/A", v.numero_facture) for v in all_ventes]}')
            
            queryset = queryset.distinct().order_by('-date_creation')
            logger.info(f'📦 Nombre total de commandes trouvées: {queryset.count()}')
            
            # Log des premières commandes pour débogage
            if queryset.count() > 0:
                first_orders = queryset[:5]
                for order in first_orders:
                    logger.info(f'📋 Commande: ID={order.id}, Facture={order.numero_facture}, Client={order.client.id}, Email={order.client.email}')
            
            return queryset
    
    def perform_create(self, serializer):
        """Créer une vente avec entrepreneur automatique."""
        import logging
        logger = logging.getLogger(__name__)
        logger.info('🔧 perform_create appelé')
        logger.info(f'👤 Utilisateur: {self.request.user.email}, type: {self.request.user.type_utilisateur}')
        logger.info(f'📦 Données reçues: {list(self.request.data.keys())}')
        
        user = self.request.user
        
        # Si c'est un client, récupérer l'entrepreneur depuis les produits
        if user.type_utilisateur == 'client':
            # Récupérer les lignes_data depuis la requête
            lignes_data = self.request.data.get('lignes_data', [])
            logger.info(f'📦 lignes_data dans perform_create: type={type(lignes_data)}, value={lignes_data}')
            
            # S'assurer que lignes_data est toujours un tableau
            if not isinstance(lignes_data, list):
                if lignes_data is None:
                    lignes_data = []
                elif isinstance(lignes_data, dict):
                    # Si c'est un dictionnaire, convertir en liste de valeurs
                    lignes_data = list(lignes_data.values()) if lignes_data else []
                else:
                    # Sinon, envelopper dans une liste
                    lignes_data = [lignes_data]
            
            if not lignes_data:
                from rest_framework.exceptions import ValidationError
                raise ValidationError({
                    'lignes_data': 'Au moins une ligne de vente est requise.'
                })
            
            # Récupérer le premier produit pour obtenir l'entreprise
            premier_produit_id = lignes_data[0].get('produit')
            if not premier_produit_id:
                from rest_framework.exceptions import ValidationError
                raise ValidationError({
                    'lignes_data': 'Chaque ligne doit contenir un produit.'
                })
            
            try:
                produit = Produit.objects.select_related('entreprise').get(id=premier_produit_id)
                entreprise = produit.entreprise
                
                # Récupérer l'entrepreneur de cette entreprise
                entrepreneur = UtilisateurPersonnalise.objects.filter(
                    entreprise=entreprise,
                    type_utilisateur='entrepreneur'
                ).first()
                
                if not entrepreneur:
                    from rest_framework.exceptions import ValidationError
                    raise ValidationError({
                        'non_field_errors': ['Aucun entrepreneur trouvé pour cette entreprise.']
                    })
                
                # Récupérer ou créer le client avec l'entrepreneur
                # Normaliser l'email pour éviter les problèmes de casse
                user_email = user.email.lower().strip() if user.email else ''
                
                # Log pour le débogage
                import logging
                logger = logging.getLogger(__name__)
                logger.info(f'📝 Création de commande pour client: {user_email}, entrepreneur: {entrepreneur.id}')
                
                # IMPORTANT: Utiliser get_or_create avec entrepreneur ET email
                # car unique_together = ['entrepreneur', 'email'] dans le modèle Client
                # Cela garantit qu'on utilise toujours le même client pour le même entrepreneur
                # L'email sera automatiquement normalisé (lowercase) par le modèle Client lors du save
                # Chercher d'abord avec l'email normalisé
                client = Client.objects.filter(
                    email__iexact=user_email,
                    entrepreneur=entrepreneur
                ).first()
                
                if not client:
                    # Créer un nouveau client
                    client = Client.objects.create(
                        email=user_email,  # Sera normalisé automatiquement par le save()
                        entrepreneur=entrepreneur,
                        nom=user.last_name or 'Client',
                        prenom=user.first_name or '',
                        telephone=user.telephone or '',
                        adresse_facturation=self.request.data.get('adresse_livraison', '') or 'Adresse non spécifiée',
                    )
                    created = True
                    logger.info(f'✅ Client créé: {client.id}, email: {client.email}, entrepreneur: {client.entrepreneur.id}')
                else:
                    created = False
                    logger.info(f'✅ Client récupéré: {client.id}, email: {client.email}, entrepreneur: {client.entrepreneur.id}')
                
                # Mettre à jour les infos du client si nécessaire
                update_fields = []
                if not client.nom and user.last_name:
                    client.nom = user.last_name
                    update_fields.append('nom')
                if not client.prenom and user.first_name:
                    client.prenom = user.first_name
                    update_fields.append('prenom')
                if not client.telephone and user.telephone:
                    client.telephone = user.telephone
                    update_fields.append('telephone')
                if update_fields:
                    client.save(update_fields=update_fields)
                    logger.info(f'✅ Client mis à jour: {update_fields}')
                
                logger.info(f'💾 Sauvegarde de la vente avec client: {client.id}, email: {client.email}, entrepreneur: {client.entrepreneur.id}')
                # Pour les commandes créées par les clients, mettre le statut à 'en_attente' 
                # pour qu'elles soient visibles et actionnables par l'entrepreneur
                vente = serializer.save(
                    client=client,
                    entrepreneur=entrepreneur,
                    vendeur=entrepreneur,
                    statut='en_attente'  # Statut initial pour les commandes clients
                )
                logger.info(f'✅ Vente créée avec succès: ID={vente.id}, Numéro={vente.numero_facture}, Client={vente.client.id}, Email={vente.client.email}, Statut={vente.statut}')
            except Produit.DoesNotExist:
                from rest_framework.exceptions import ValidationError
                raise ValidationError({
                    'lignes_data': ['Produit introuvable.']
                })
        else:
            # Pour les entrepreneurs et admins, utiliser l'utilisateur actuel
            serializer.save(
                entrepreneur=self.request.user,
                vendeur=self.request.user
            )
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirmer une vente."""
        vente = self.get_object()
        
        # Vérifier que la vente peut être confirmée
        if vente.statut == 'annulee':
            return Response(
                {'error': 'Impossible de confirmer une vente annulée'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if vente.statut == 'confirmee':
            return Response(
                {'error': 'Cette vente est déjà confirmée'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Vérifier que le statut permet la confirmation (brouillon ou en_attente)
        if vente.statut not in ['brouillon', 'en_attente']:
            return Response(
                {'error': f'Impossible de confirmer une vente avec le statut "{vente.statut}". Seules les ventes en brouillon ou en attente peuvent être confirmées.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mettre à jour le statut et le statut de paiement
        vente.statut = 'confirmee'
        vente.statut_paiement = 'paid'  # Marquer comme payée lors de la confirmation
        vente.date_paiement = timezone.now()  # Enregistrer la date de paiement
        vente.save()
        
        # Mettre à jour les stocks
        for ligne in vente.lignes.all():
            produit = ligne.produit
            quantite = ligne.quantite
            
            # Vérifier que le stock est suffisant
            if produit.stock < quantite:
                # Log l'erreur mais continuer (le stock peut être négatif si nécessaire)
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(
                    f'Stock insuffisant pour {produit.nom}: '
                    f'stock={produit.stock}, quantite={quantite}'
                )
            
            # Décrémenter le stock du produit directement
            produit.stock = max(0, produit.stock - quantite)
            produit.save(update_fields=['stock'])
            
            # Mettre à jour le statut si le stock atteint 0
            if produit.stock == 0:
                produit.statut = 'rupture'
                produit.save(update_fields=['statut'])
        
        serializer = self.get_serializer(vente)
        return Response({
            'message': 'Vente confirmée avec succès',
            'vente': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Annuler une vente."""
        vente = self.get_object()
        reason = request.data.get('reason', '')
        
        vente.statut = 'annulee'
        vente.notes = f"Annulée: {reason}"
        vente.save()
        
        return Response({'message': 'Vente annulée'})
    
    @action(detail=True, methods=['post'])
    def print_invoice(self, request, pk=None):
        """Générer et télécharger la facture PDF."""
        vente = self.get_object()
        
        try:
            from apps.core.pdf_utils import generate_invoice_pdf
            
            # Créer la réponse HTTP pour le PDF
            response = HttpResponse(content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="facture_{vente.numero_facture}.pdf"'
            
            # Générer le PDF
            generate_invoice_pdf(vente, response)
            
            return response
            
        except Exception as e:
            return Response(
                {'error': f'Erreur lors de la génération du PDF: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DevisViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des devis."""
    queryset = Devis.objects.all()
    serializer_class = DevisSerializer
    permission_classes = [IsAuthenticated, IsEntrepreneurOrAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['statut']
    search_fields = ['numero_devis', 'client__nom']
    ordering_fields = ['date_creation', 'total_ttc']
    
    def get_queryset(self):
        user = self.request.user
        if user.type_utilisateur == 'admin':
            return Devis.objects.all()
        else:
            return Devis.objects.filter(entrepreneur=user)
    
    def perform_create(self, serializer):
        """Créer un devis avec entrepreneur automatique."""
        serializer.save(entrepreneur=self.request.user)
    
    @action(detail=True, methods=['post'])
    def convert_to_sale(self, request, pk=None):
        """Convertir un devis en vente."""
        devis = self.get_object()
        
        if devis.statut != 'accepte':
            return Response(
                {'error': 'Le devis doit être accepté pour être converti'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Créer la vente
        vente = Vente.objects.create(
            client=devis.client,
            entrepreneur=devis.entrepreneur,
            vendeur=devis.entrepreneur,
            sous_total=devis.sous_total,
            taxe_montant=devis.taxe_montant,
            remise_montant=devis.remise_montant,
            total_ttc=devis.total_ttc,
            notes=f"Converti du devis {devis.numero_devis}",
        )
        
        # Copier les lignes
        for ligne_devis in devis.lignes.all():
            LigneVente.objects.create(
                vente=vente,
                produit=ligne_devis.produit,
                quantite=ligne_devis.quantite,
                prix_unitaire=ligne_devis.prix_unitaire,
                remise_pourcentage=ligne_devis.remise_pourcentage,
            )
        
        # Mettre à jour le devis
        devis.statut = 'converti'
        devis.vente_associee = vente
        devis.save()
        
        return Response({
            'message': 'Devis converti en vente',
            'vente_id': vente.id
        })