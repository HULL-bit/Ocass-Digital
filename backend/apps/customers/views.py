"""
Vues pour la gestion des clients.
"""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Client
from .serializers import ClientSerializer


class ClientViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des clients."""
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]
