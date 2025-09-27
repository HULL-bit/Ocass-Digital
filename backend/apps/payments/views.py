"""
Vues pour la gestion des paiements.
"""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import PaiementMobile, LienPaiement, Remboursement
from .serializers import PaiementMobileSerializer, LienPaiementSerializer, RemboursementSerializer


class PaiementMobileViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des paiements mobiles."""
    queryset = PaiementMobile.objects.all()
    serializer_class = PaiementMobileSerializer
    permission_classes = [IsAuthenticated]


class LienPaiementViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des liens de paiement."""
    queryset = LienPaiement.objects.all()
    serializer_class = LienPaiementSerializer
    permission_classes = [IsAuthenticated]


class RemboursementViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des remboursements."""
    queryset = Remboursement.objects.all()
    serializer_class = RemboursementSerializer
    permission_classes = [IsAuthenticated]
