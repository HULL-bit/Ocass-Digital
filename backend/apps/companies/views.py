"""
Vues pour la gestion des entreprises.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Entreprise, PlanAbonnement
from .serializers import EntrepriseSerializer, EntrepriseCreateSerializer, PlanAbonnementSerializer
from apps.core.permissions import IsAdminOnly


class EntreprisePagination(PageNumberPagination):
    """Pagination personnalisée pour les entreprises."""
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 100


class EntrepriseViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des entreprises."""
    queryset = Entreprise.objects.all()
    serializer_class = EntrepriseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['secteur_activite', 'statut', 'plan_abonnement']
    search_fields = ['nom', 'email', 'ville', 'region']
    ordering_fields = ['nom', 'date_creation', 'chiffre_affaires_annuel']
    pagination_class = EntreprisePagination
    
    def get_serializer_class(self):
        if self.action == 'create':
            return EntrepriseCreateSerializer
        return EntrepriseSerializer
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'list' or self.action == 'retrieve':
            # Permettre l'accès en lecture seule pour tous les utilisateurs
            permission_classes = [AllowAny]
        else:
            # Authentification requise pour les autres actions
            permission_classes = [IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        user = self.request.user
        
        # Si l'utilisateur n'est pas authentifié, retourner les entreprises actives
        if not user.is_authenticated:
            return Entreprise.objects.filter(statut='actif')
        
        if user.type_utilisateur == 'admin':
            return Entreprise.objects.all()
        elif user.type_utilisateur == 'entrepreneur':
            return Entreprise.objects.filter(id=user.entreprise.id) if user.entreprise else Entreprise.objects.none()
        else:
            return Entreprise.objects.filter(statut='actif')
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activer une entreprise."""
        entreprise = self.get_object()
        entreprise.statut = 'actif'
        entreprise.save()
        return Response({'message': 'Entreprise activée'})
    
    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        """Suspendre une entreprise."""
        entreprise = self.get_object()
        entreprise.statut = 'suspendu'
        entreprise.save()
        return Response({'message': 'Entreprise suspendue'})
    
    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Statistiques de l'entreprise."""
        entreprise = self.get_object()
        
        from apps.sales.models import Vente
        from apps.products.models import Produit
        from apps.customers.models import Client
        
        stats = {
            'ventes_totales': Vente.objects.filter(
                entrepreneur__entreprise=entreprise
            ).count(),
            'revenus_totaux': sum(
                vente.total_ttc for vente in Vente.objects.filter(
                    entrepreneur__entreprise=entreprise,
                    statut_paiement='completed'
                )
            ),
            'produits_actifs': Produit.objects.filter(
                entreprise=entreprise,
                statut='actif'
            ).count(),
            'clients_totaux': Client.objects.filter(
                entrepreneur__entreprise=entreprise
            ).count(),
        }
        
        return Response(stats)


class PlanAbonnementViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour les plans d'abonnement."""
    queryset = PlanAbonnement.objects.filter(supprime=False)
    serializer_class = PlanAbonnementSerializer
    permission_classes = [IsAuthenticated]
    ordering = ['ordre_affichage', 'prix_mensuel']