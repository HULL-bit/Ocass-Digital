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
    
    def get_queryset(self):
        """Filtrer les clients par entrepreneur."""
        user = self.request.user
        if user.type_utilisateur == 'admin':
            return Client.objects.all()
        elif user.type_utilisateur == 'entrepreneur':
            return Client.objects.filter(entrepreneur=user)
        else:
            return Client.objects.none()
    
    def perform_create(self, serializer):
        """Créer un client avec l'entrepreneur automatique."""
        if self.request.user.type_utilisateur == 'entrepreneur':
            serializer.save(entrepreneur=self.request.user)
        else:
            # Pour les admins, l'entrepreneur doit être fourni dans les données
            serializer.save()