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
from .models import Vente, LigneVente, Devis, LigneDevis
from .serializers import VenteSerializer, DevisSerializer
from apps.core.permissions import IsEntrepreneurOrAdmin


class VenteViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des ventes."""
    queryset = Vente.objects.all()
    serializer_class = VenteSerializer
    permission_classes = [IsAuthenticated, IsEntrepreneurOrAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['statut', 'statut_paiement', 'mode_paiement']
    search_fields = ['numero_facture', 'client__nom', 'client__email']
    ordering_fields = ['date_creation', 'total_ttc']
    
    def get_queryset(self):
        user = self.request.user
        if user.type_utilisateur == 'admin':
            return Vente.objects.all()
        elif user.type_utilisateur == 'entrepreneur':
            return Vente.objects.filter(entrepreneur=user)
        else:
            return Vente.objects.filter(client__email=user.email)
    
    def perform_create(self, serializer):
        """Créer une vente avec entrepreneur automatique."""
        serializer.save(
            entrepreneur=self.request.user,
            vendeur=self.request.user
        )
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirmer une vente."""
        vente = self.get_object()
        vente.statut = 'confirmee'
        vente.save()
        
        # Mettre à jour les stocks
        for ligne in vente.lignes.all():
            # Décrémenter le stock
            stocks = ligne.produit.stocks.all()
            for stock in stocks:
                if stock.quantite_disponible >= ligne.quantite:
                    stock.quantite_physique -= ligne.quantite
                    stock.save()
                    break
        
        return Response({'message': 'Vente confirmée'})
    
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
        """Générer et imprimer la facture."""
        vente = self.get_object()
        
        # Ici on générerait le PDF de la facture
        # Pour la démo, on retourne juste une URL
        pdf_url = f"/media/invoices/facture_{vente.numero_facture}.pdf"
        
        return Response({
            'pdf_url': pdf_url,
            'message': 'Facture générée'
        })


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