"""
Vues pour la gestion des intégrations.
"""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import IntegrationExterne
from .serializers import IntegrationExterneSerializer


class IntegrationExterneViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des intégrations externes."""
    queryset = IntegrationExterne.objects.all()
    serializer_class = IntegrationExterneSerializer
    permission_classes = [IsAuthenticated]
