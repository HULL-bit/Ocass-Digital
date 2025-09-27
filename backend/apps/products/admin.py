"""
Configuration de l'interface d'administration pour les produits.
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import Produit, Categorie, Marque, ImageProduit, VarianteProduit, Bundle, BundleItem


class ImageProduitInline(admin.TabularInline):
    """Inline pour les images de produits."""
    model = ImageProduit
    extra = 1
    fields = ['image', 'alt_text', 'principale', 'ordre_affichage']


class VarianteProduitInline(admin.TabularInline):
    """Inline pour les variantes de produits."""
    model = VarianteProduit
    extra = 1
    fields = ['couleur', 'taille', 'materiau', 'prix_supplement', 'sku_variante', 'active']


@admin.register(Categorie)
class CategorieAdmin(admin.ModelAdmin):
    """Administration des catégories."""
    list_display = ['nom', 'slug', 'parent', 'visible', 'date_creation']
    list_filter = ['visible', 'date_creation']
    search_fields = ['nom', 'description']
    prepopulated_fields = {'slug': ('nom',)}
    ordering = ['nom']


@admin.register(Marque)
class MarqueAdmin(admin.ModelAdmin):
    """Administration des marques."""
    list_display = ['nom', 'pays_origine', 'date_creation']
    list_filter = ['pays_origine', 'date_creation']
    search_fields = ['nom', 'description']
    ordering = ['nom']


@admin.register(Produit)
class ProduitAdmin(admin.ModelAdmin):
    """Administration des produits."""
    list_display = [
        'nom', 'sku', 'categorie', 'marque', 'entreprise', 
        'prix_vente', 'stock_actuel', 'statut', 'date_creation'
    ]
    list_filter = [
        'categorie', 'marque', 'statut', 'date_creation', 
        'entreprise__nom'
    ]
    search_fields = [
        'nom', 'sku', 'code_barre', 'description_courte',
        'entreprise__nom'
    ]
    readonly_fields = [
        'id', 'date_creation', 'date_modification', 
        'stock_actuel'
    ]
    inlines = [ImageProduitInline, VarianteProduitInline]
    ordering = ['-date_creation']
    
    fieldsets = (
        ('Informations générales', {
            'fields': (
                'id', 'nom', 'description_courte', 'description_longue',
                'sku', 'code_barre', 'qr_code'
            )
        }),
        ('Classification', {
            'fields': ('categorie', 'marque', 'tags')
        }),
        ('Prix et coûts', {
            'fields': (
                'prix_achat', 'prix_vente', 'prix_promotionnel',
                'taux_marge', 'taux_tva'
            )
        }),
        ('Stock', {
            'fields': (
                'stock_actuel', 'stock_minimum', 'stock_maximum',
                'unite_mesure', 'poids', 'dimensions'
            )
        }),
        ('Entreprise', {
            'fields': ('entreprise',)
        }),
        ('Statut', {
            'fields': ('statut', 'visible_catalogue', 'est_populaire')
        }),
        ('Timestamps', {
            'fields': ('date_creation', 'date_modification'),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        """Optimise les requêtes pour l'admin."""
        return super().get_queryset(request).select_related(
            'categorie', 'marque', 'entreprise'
        )
    
    def colored_name(self, obj):
        """Affiche le nom avec une couleur selon le statut."""
        colors = {
            'actif': '#10B981',
            'inactif': '#EF4444',
            'en_attente': '#F59E0B',
        }
        color = colors.get(obj.statut, '#6B7280')
        return format_html(
            '<span style="color: {};">{}</span>',
            color,
            obj.nom
        )
    colored_name.short_description = 'Nom'
    colored_name.admin_order_field = 'nom'


@admin.register(ImageProduit)
class ImageProduitAdmin(admin.ModelAdmin):
    """Administration des images de produits."""
    list_display = ['produit', 'image_preview', 'alt_text', 'ordre_affichage', 'principale']
    list_filter = ['principale', 'date_creation']
    search_fields = ['produit__nom', 'alt_text']
    ordering = ['produit', 'ordre_affichage']
    
    def image_preview(self, obj):
        """Affiche un aperçu de l'image."""
        if obj.image:
            return format_html(
                '<img src="{}" width="50" height="50" style="object-fit: cover;" />',
                obj.image.url
            )
        return "Aucune image"
    image_preview.short_description = 'Aperçu'


@admin.register(VarianteProduit)
class VarianteProduitAdmin(admin.ModelAdmin):
    """Administration des variantes de produits."""
    list_display = [
        'produit', 'couleur', 'taille', 'materiau', 
        'prix_supplement', 'sku_variante', 'active'
    ]
    list_filter = ['active', 'couleur', 'taille']
    search_fields = ['produit__nom', 'sku_variante']
    ordering = ['produit', 'couleur', 'taille']


@admin.register(Bundle)
class BundleAdmin(admin.ModelAdmin):
    """Administration des bundles."""
    list_display = [
        'nom', 'entreprise', 'prix_bundle', 'actif', 
        'en_promotion', 'date_creation'
    ]
    list_filter = ['actif', 'en_promotion', 'date_creation']
    search_fields = ['nom', 'description', 'entreprise__nom']
    ordering = ['-date_creation']


@admin.register(BundleItem)
class BundleItemAdmin(admin.ModelAdmin):
    """Administration des items de bundle."""
    list_display = ['bundle', 'produit', 'quantite']
    list_filter = ['bundle__actif']
    search_fields = ['bundle__nom', 'produit__nom']
    ordering = ['bundle', 'produit']