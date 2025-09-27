"""
Vues pour la gestion de l'IA.
"""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import ModeleIA
from .serializers import ModeleIASerializer


class ModeleIAViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des modèles IA."""
    queryset = ModeleIA.objects.all()
    serializer_class = ModeleIASerializer
    permission_classes = [IsAuthenticated]
