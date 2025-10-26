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
    ProduitSerializer, ProduitListSerializer, ProduitCreateSerializer, CategorieSerializer, MarqueSerializer,
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
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ProduitCreateSerializer
        elif self.action == 'list':
            return ProduitListSerializer  # Serializer optimisé pour les listes
        return ProduitSerializer
    
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
        
        # Optimisation ULTRA-AGRESSIVE avec only() pour limiter les champs
        base_queryset = Produit.objects.select_related(
            'categorie', 'marque', 'entreprise'
        ).prefetch_related(
            'images'
        ).only(
            'id', 'nom', 'description_courte', 'categorie', 'marque', 'entreprise',
            'sku', 'prix_vente', 'prix_promotion', 'statut', 'popularite_score',
            'nombre_vues', 'nombre_ventes', 'slug', 'en_promotion',
            'vendable', 'visible_catalogue', 'date_creation'
        )
        
        # Si l'utilisateur n'est pas authentifié, retourner les produits visibles
        if not user.is_authenticated:
            return base_queryset.filter(visible_catalogue=True, statut='actif')
        
        if user.type_utilisateur == 'admin':
            return base_queryset.all()
        elif user.type_utilisateur == 'entrepreneur' and user.entreprise:
            return base_queryset.filter(entreprise=user.entreprise)
        else:
            return base_queryset.filter(visible_catalogue=True, statut='actif')
    
    def perform_create(self, serializer):
        """Override pour gérer la création de produits."""
        user = self.request.user
        
        # Pour les admins sans entreprise, on ne peut pas créer de produits
        # car le champ entreprise est obligatoire
        if user.type_utilisateur == 'admin' and not user.entreprise:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Les administrateurs ne peuvent pas créer de produits sans entreprise associée.")
        
        # Pour les entrepreneurs sans entreprise, créer une entreprise par défaut
        if user.type_utilisateur == 'entrepreneur' and not user.entreprise:
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
            user.entreprise = entreprise
            user.save(update_fields=['entreprise'])
        
        # Utiliser l'entreprise de l'utilisateur
        if user.entreprise:
            produit = serializer.save(entreprise=user.entreprise)
        else:
            produit = serializer.save()
        
        # Mettre à jour le stock du produit
        stock_initial = self.request.data.get('stock_initial', self.request.data.get('stock', 0))
        if stock_initial:
            try:
                stock_value = int(stock_initial)
                if stock_value > 0:
                    produit.stock = stock_value
                    produit.save(update_fields=['stock'])
            except (ValueError, TypeError):
                # Si la valeur n'est pas un nombre valide, ignorer
                pass
        
        # Gérer les images uploadées depuis la requête
        if hasattr(self.request, 'FILES') and 'images' in self.request.FILES:
            images_files = self.request.FILES.getlist('images')
            for i, image_file in enumerate(images_files):
                try:
                    ImageProduit.objects.create(
                        produit=produit,
                        image=image_file,
                        alt_text=f'Image de {produit.nom}',
                        principale=(i == 0),
                        ordre_affichage=i
                    )
                    print(f"✅ Image {i+1} uploadée avec succès pour {produit.nom}")
                except Exception as e:
                    print(f"❌ Erreur lors de l'upload de l'image {i+1}: {e}")
        else:
            print("⚠️ Aucune image fournie pour le produit")
    
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
        """Produits populaires avec cache."""
        from django.core.cache import cache
        
        cache_key = 'popular_products'
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        # Requête optimisée pour les produits populaires
        produits = Produit.objects.select_related(
            'categorie', 'marque', 'entreprise'
        ).prefetch_related('images').filter(
            visible_catalogue=True, 
            statut='actif'
        ).order_by('-popularite_score')[:10]
        
        serializer = self.get_serializer(produits, many=True)
        data = serializer.data
        
        # Cache pour 10 minutes
        cache.set(cache_key, data, 600)
        
        return Response(data)
    
    @action(detail=False, methods=['get'])
    def fast_list(self, request):
        """Liste ultra-rapide des produits avec cache."""
        from django.core.cache import cache
        
        page = request.GET.get('page', 1)
        cache_key = f'fast_products_page_{page}'
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        # Requête ultra-optimisée
        queryset = Produit.objects.select_related(
            'categorie', 'marque', 'entreprise'
        ).filter(
            visible_catalogue=True, 
            statut='actif'
        ).only(
            'id', 'nom', 'prix_vente', 'categorie', 'marque', 'entreprise',
            'sku', 'popularite_score', 'images'
        )
        
        # Pagination manuelle pour éviter les requêtes lourdes
        page_size = 15
        start = (int(page) - 1) * page_size
        end = start + page_size
        
        produits = queryset[start:end]
        serializer = self.get_serializer(produits, many=True)
        
        data = {
            'results': serializer.data,
            'count': queryset.count(),
            'next': f'?page={int(page) + 1}' if end < queryset.count() else None,
            'previous': f'?page={int(page) - 1}' if int(page) > 1 else None
        }
        
        # Cache pour 5 minutes
        cache.set(cache_key, data, 300)
        
        return Response(data)


class CategorieViewSet(viewsets.ModelViewSet):
    """ViewSet pour les catégories avec cache."""
    queryset = Categorie.objects.all()
    serializer_class = CategorieSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['nom', 'description']
    ordering_fields = ['nom', 'ordre_affichage']
    
    def list(self, request, *args, **kwargs):
        """Liste des catégories avec cache."""
        from django.core.cache import cache
        
        cache_key = 'categories_list'
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        # Requête optimisée
        categories = Categorie.objects.select_related('parent').only(
            'id', 'nom', 'description', 'parent', 'slug', 'icone'
        ).filter(visible=True)
        
        serializer = self.get_serializer(categories, many=True)
        data = serializer.data
        
        # Cache pour 30 minutes
        cache.set(cache_key, data, 1800)
        
        return Response(data)


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
            return Fournisseur.objects.filter(entreprise=user.entreprise) if user.entreprise else Fournisseur.objects.none()


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
            return Bundle.objects.filter(entreprise=user.entreprise) if user.entreprise else Bundle.objects.none()


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
            return ImageProduit.objects.filter(produit__entreprise=user.entreprise) if user.entreprise else ImageProduit.objects.none()