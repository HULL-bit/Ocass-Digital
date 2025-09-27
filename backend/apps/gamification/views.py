"""
Vues pour la gestion de la gamification.
"""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Badge, UtilisateurBadge, Defi
from .serializers import BadgeSerializer, UtilisateurBadgeSerializer, DefiSerializer


class BadgeViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des badges."""
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer
    permission_classes = [IsAuthenticated]


class UtilisateurBadgeViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des badges utilisateur."""
    queryset = UtilisateurBadge.objects.all()
    serializer_class = UtilisateurBadgeSerializer
    permission_classes = [IsAuthenticated]


class DefiViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des défis."""
    queryset = Defi.objects.all()
    serializer_class = DefiSerializer
    permission_classes = [IsAuthenticated]
