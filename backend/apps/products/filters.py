"""
Filtres personnalisés pour les produits.
"""
import django_filters
from django.db.models import Q
from .models import Produit, Categorie


class ProduitFilter(django_filters.FilterSet):
    """Filtre personnalisé pour les produits avec filtrage par prix."""
    
    # Filtrage par catégorie
    categorie = django_filters.ModelChoiceFilter(
        queryset=Categorie.objects.filter(visible=True),
        field_name='categorie'
    )
    
    # Filtrage par fourchette de prix
    prix_min = django_filters.NumberFilter(
        field_name='prix_vente',
        lookup_expr='gte',
        help_text="Prix minimum"
    )
    prix_max = django_filters.NumberFilter(
        field_name='prix_vente',
        lookup_expr='lte',
        help_text="Prix maximum"
    )
    
    # Filtrage par statut
    statut = django_filters.ChoiceFilter(
        choices=[
            ('actif', 'Actif'),
            ('inactif', 'Inactif'),
            ('rupture', 'Rupture de stock'),
            ('discontinue', 'Discontinué'),
        ]
    )
    
    # Filtrage par marque
    marque = django_filters.CharFilter(
        field_name='marque__nom',
        lookup_expr='icontains'
    )
    
    # Filtrage par disponibilité
    en_stock = django_filters.BooleanFilter(
        method='filter_en_stock',
        help_text="Produits en stock uniquement"
    )
    
    # Filtrage par promotion
    en_promotion = django_filters.BooleanFilter(
        field_name='en_promotion'
    )
    
    # Recherche textuelle
    search = django_filters.CharFilter(
        method='filter_search',
        help_text="Recherche dans le nom, description et SKU"
    )
    
    class Meta:
        model = Produit
        fields = ['categorie', 'prix_min', 'prix_max', 'statut', 'marque', 'en_stock', 'en_promotion', 'search']
    
    def filter_en_stock(self, queryset, name, value):
        """Filtre les produits en stock."""
        if value:
            return queryset.filter(stock_disponible__gt=0)
        return queryset
    
    def filter_search(self, queryset, name, value):
        """Recherche textuelle dans les produits."""
        if value:
            return queryset.filter(
                Q(nom__icontains=value) |
                Q(description_courte__icontains=value) |
                Q(description_longue__icontains=value) |
                Q(sku__icontains=value)
            )
        return queryset

