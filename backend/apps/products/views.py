"""
Vues pour la gestion des produits.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Produit, Categorie, Marque, Fournisseur, Bundle, ImageProduit
from .serializers import (
    ProduitSerializer, CategorieSerializer, MarqueSerializer,
    FournisseurSerializer, BundleSerializer, ImageProduitSerializer
)
from .filters import ProduitFilter
from apps.core.permissions import IsEntrepreneurOrAdmin


class ProduitPagination(PageNumberPagination):
    """Pagination personnalisée pour les produits."""
    page_size = 15
    page_size_query_param = 'page_size'
    max_page_size = 100


class ProduitViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des produits."""
    queryset = Produit.objects.all()
    serializer_class = ProduitSerializer
    permission_classes = [IsAuthenticated, IsEntrepreneurOrAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProduitFilter
    search_fields = ['nom', 'description_courte', 'sku']
    ordering_fields = ['nom', 'prix_vente', 'date_creation', 'popularite_score']
    pagination_class = ProduitPagination
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'list' or self.action == 'retrieve':
            # Permettre l'accès en lecture seule pour tous les utilisateurs
            permission_classes = [AllowAny]
        else:
            # Authentification requise pour les autres actions
            permission_classes = [IsAuthenticated, IsEntrepreneurOrAdmin]
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        user = self.request.user
        
        # Si l'utilisateur n'est pas authentifié, retourner les produits visibles
        if not user.is_authenticated:
            return Produit.objects.filter(visible_catalogue=True, statut='actif')
        
        if user.type_utilisateur == 'admin':
            return Produit.objects.all()
        elif user.type_utilisateur == 'entrepreneur' and user.entreprise_id:
            return Produit.objects.filter(entreprise_id=user.entreprise_id)
        else:
            return Produit.objects.filter(visible_catalogue=True, statut='actif')
    
    def perform_create(self, serializer):
        """Override pour gérer la création de produits."""
        user = self.request.user
        
        # Pour les admins sans entreprise, on ne peut pas créer de produits
        # car le champ entreprise est obligatoire
        if user.type_utilisateur == 'admin' and not user.entreprise_id:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Les administrateurs ne peuvent pas créer de produits sans entreprise associée.")
        
        # Pour les entrepreneurs sans entreprise, créer une entreprise par défaut
        if user.type_utilisateur == 'entrepreneur' and not user.entreprise_id:
            from apps.companies.models import Entreprise, PlanAbonnement
            
            # Créer un plan d'abonnement par défaut s'il n'existe pas
            plan_default, created = PlanAbonnement.objects.get_or_create(
                nom='Plan Gratuit',
                defaults={
                    'description': 'Plan gratuit pour les nouveaux entrepreneurs',
                    'prix_mensuel': 0,
                    'prix_annuel': 0,
                    'devise': 'XOF',
                    'max_utilisateurs': 5,
                    'max_produits': 100,
                    'max_ventes_mensuelles': 1000,
                    'stockage_gb': 1,
                    'fonctionnalites': {'basic': True},
                    'populaire': False,
                    'ordre_affichage': 0
                }
            )
            
            entreprise = Entreprise.objects.create(
                nom=f"Entreprise de {user.get_full_name()}",
                description=f"Entreprise créée automatiquement pour {user.get_full_name()}",
                secteur_activite='commerce',
                telephone=user.telephone or '+221000000000',
                email=user.email,
                adresse_complete='Adresse à compléter',
                ville='Dakar',
                region='Dakar',
                pays='Sénégal',
                plan_abonnement=plan_default,
                statut='actif',
                siret=f"TEMP-{user.id}"  # SIRET temporaire unique
            )
            user.entreprise_id = entreprise.id
            user.save(update_fields=['entreprise_id'])
        
        # Utiliser l'entreprise de l'utilisateur
        if user.entreprise_id:
            serializer.save(entreprise_id=user.entreprise_id)
        else:
            serializer.save()
    
    @action(detail=True, methods=['post'])
    def increment_views(self, request, pk=None):
        """Incrémenter le nombre de vues."""
        produit = self.get_object()
        produit.incrementer_vues()
        return Response({'views': produit.nombre_vues})
    
    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Produits avec stock bas."""
        from django.db import models
        produits = self.get_queryset().filter(
            stocks__quantite_physique__lte=models.F('stock_minimum')
        ).distinct()
        serializer = self.get_serializer(produits, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Produits populaires."""
        produits = self.get_queryset().order_by('-popularite_score')[:10]
        serializer = self.get_serializer(produits, many=True)
        return Response(serializer.data)


class CategorieViewSet(viewsets.ModelViewSet):
    """ViewSet pour les catégories."""
    queryset = Categorie.objects.all()
    serializer_class = CategorieSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['nom', 'description']
    ordering_fields = ['nom', 'ordre_affichage']


class MarqueViewSet(viewsets.ModelViewSet):
    """ViewSet pour les marques."""
    queryset = Marque.objects.all()
    serializer_class = MarqueSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['nom', 'pays_origine']
    ordering_fields = ['nom']


class FournisseurViewSet(viewsets.ModelViewSet):
    """ViewSet pour les fournisseurs."""
    queryset = Fournisseur.objects.all()
    serializer_class = FournisseurSerializer
    permission_classes = [IsAuthenticated, IsEntrepreneurOrAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['statut']
    search_fields = ['nom', 'contact_nom', 'email']
    ordering_fields = ['nom', 'evaluation', 'date_creation']
    
    def get_queryset(self):
        user = self.request.user
        if user.type_utilisateur == 'admin':
            return Fournisseur.objects.all()
        else:
            return Fournisseur.objects.filter(entreprise_id=user.entreprise_id)


class BundleViewSet(viewsets.ModelViewSet):
    """ViewSet pour les bundles."""
    queryset = Bundle.objects.all()
    serializer_class = BundleSerializer
    permission_classes = [IsAuthenticated, IsEntrepreneurOrAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['actif', 'en_promotion']
    search_fields = ['nom', 'description']
    ordering_fields = ['nom', 'prix_bundle', 'date_creation']
    
    def get_queryset(self):
        user = self.request.user
        if user.type_utilisateur == 'admin':
            return Bundle.objects.all()
        else:
            return Bundle.objects.filter(entreprise_id=user.entreprise_id)


class ImageProduitViewSet(viewsets.ModelViewSet):
    """ViewSet pour les images de produits."""
    queryset = ImageProduit.objects.all()
    serializer_class = ImageProduitSerializer
    permission_classes = [IsAuthenticated, IsEntrepreneurOrAdmin]
    
    def get_queryset(self):
        user = self.request.user
        if user.type_utilisateur == 'admin':
            return ImageProduit.objects.all()
        else:
            return ImageProduit.objects.filter(produit__entreprise_id=user.entreprise_id)