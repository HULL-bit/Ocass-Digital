"""
Vues pour la gestion du support.
"""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import TicketSupport
from .serializers import TicketSupportSerializer


class TicketSupportViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des tickets de support."""
    queryset = TicketSupport.objects.all()
    serializer_class = TicketSupportSerializer
    permission_classes = [IsAuthenticated]
