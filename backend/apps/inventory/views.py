"""
Vues pour la gestion de l'inventaire.
"""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Stock, MouvementStock
from .serializers import StockSerializer, MouvementStockSerializer


class StockViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des stocks."""
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    permission_classes = [IsAuthenticated]


class MouvementStockViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des mouvements de stock."""
    queryset = MouvementStock.objects.all()
    serializer_class = MouvementStockSerializer
    permission_classes = [IsAuthenticated]
