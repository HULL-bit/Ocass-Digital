"""
Vues pour la gestion des projets.
"""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Projet
from .serializers import ProjetSerializer


class ProjetViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des projets."""
    queryset = Projet.objects.all()
    serializer_class = ProjetSerializer
    permission_classes = [IsAuthenticated]
