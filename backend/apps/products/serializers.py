"""
Serializers pour les produits.
"""
import json
from rest_framework import serializers
from .models import Produit, Categorie, Marque, Fournisseur, Bundle, ImageProduit, VarianteProduit


class CategorieSerializer(serializers.ModelSerializer):
    """Serializer pour les catégories."""
    niveau = serializers.ReadOnlyField()
    
    class Meta:
        model = Categorie
        fields = [
            'id', 'nom', 'description', 'slug', 'parent',
            'image', 'icone', 'couleur', 'ordre_affichage',
            'visible', 'niveau'
        ]


class MarqueSerializer(serializers.ModelSerializer):
    """Serializer pour les marques."""
    
    class Meta:
        model = Marque
        fields = [
            'id', 'nom', 'description', 'logo', 'site_web', 'pays_origine'
        ]


class ImageProduitSerializer(serializers.ModelSerializer):
    """Serializer pour les images de produits."""
    
    class Meta:
        model = ImageProduit
        fields = [
            'id', 'image', 'alt_text', 'principale', 'ordre_affichage',
            'couleur', 'taille'
        ]


class VarianteProduitSerializer(serializers.ModelSerializer):
    """Serializer pour les variantes de produits."""
    prix_final = serializers.ReadOnlyField()
    
    class Meta:
        model = VarianteProduit
        fields = [
            'id', 'couleur', 'taille', 'materiau', 'prix_supplement',
            'sku_variante', 'active', 'prix_final'
        ]


class ProduitListSerializer(serializers.ModelSerializer):
    """Serializer optimisé pour les listes de produits."""
    categorie_nom = serializers.CharField(source='categorie.nom', read_only=True)
    marque_nom = serializers.CharField(source='marque.nom', read_only=True)
    entreprise_nom = serializers.CharField(source='entreprise.nom', read_only=True)
    stock_actuel = serializers.ReadOnlyField()
    stock_disponible = serializers.ReadOnlyField()
    en_rupture = serializers.ReadOnlyField()
    stock_bas = serializers.ReadOnlyField()
    
    # Optimisation: seulement la première image pour les listes
    images = serializers.SerializerMethodField()
    
    class Meta:
        model = Produit
        fields = [
            'id', 'nom', 'description_courte', 'categorie', 'categorie_nom',
            'marque', 'marque_nom', 'entreprise', 'entreprise_nom', 'sku',
            'prix_vente', 'prix_promotion', 'statut', 'popularite_score',
            'nombre_vues', 'nombre_ventes', 'slug', 'en_promotion',
            'vendable', 'visible_catalogue', 'stock_actuel', 'stock_disponible',
            'en_rupture', 'stock_bas', 'images'
        ]
    
    def get_images(self, obj):
        """Retourne seulement la première image pour optimiser les performances."""
        first_image = obj.images.first()
        if first_image:
            return [ImageProduitSerializer(first_image).data]
        return []


class ProduitSerializer(serializers.ModelSerializer):
    """Serializer complet pour les produits."""
    marge_beneficiaire = serializers.ReadOnlyField()
    prix_ttc = serializers.ReadOnlyField()
    stock_actuel = serializers.ReadOnlyField()
    stock_disponible = serializers.ReadOnlyField()
    en_rupture = serializers.ReadOnlyField()
    stock_bas = serializers.ReadOnlyField()
    
    categorie_nom = serializers.CharField(source='categorie.nom', read_only=True)
    marque_nom = serializers.CharField(source='marque.nom', read_only=True)
    entreprise_nom = serializers.CharField(source='entreprise.nom', read_only=True)
    
    images = ImageProduitSerializer(many=True, read_only=True)
    variantes = VarianteProduitSerializer(many=True, read_only=True)
    
    class Meta:
        model = Produit
        fields = [
            'id', 'nom', 'description_courte', 'description_longue',
            'categorie', 'categorie_nom', 'sous_categorie', 'marque', 'marque_nom',
            'entreprise', 'entreprise_nom', 'sku', 'code_barre', 'qr_code', 'prix_achat', 'prix_vente',
            'prix_promotion', 'marge_beneficiaire', 'prix_ttc', 'tva_taux',
            'unite_mesure', 'couleurs_disponibles', 'tailles_disponibles', 'stock',
            'date_peremption', 'duree_conservation', 'statut', 'popularite_score', 
            'nombre_vues', 'nombre_ventes', 'slug', 'en_promotion', 'date_debut_promotion', 
            'date_fin_promotion', 'vendable', 'achetable', 'visible_catalogue', 
            'stock_actuel', 'stock_disponible', 'en_rupture', 'images', 'variantes'
        ]
        read_only_fields = [
            'qr_code', 'popularite_score', 'nombre_vues', 'nombre_ventes',
            'marge_beneficiaire', 'prix_ttc', 'stock_actuel', 'stock_disponible',
            'en_rupture'
        ]


class ProduitCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création de produits avec images."""
    images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )
    
    # Gérer les champs JSON
    dimensions = serializers.JSONField(required=False, allow_null=True)
    couleurs_disponibles = serializers.JSONField(required=False, allow_null=True)
    tailles_disponibles = serializers.JSONField(required=False, allow_null=True)
    
    class Meta:
        model = Produit
        fields = [
            'nom', 'description_courte', 'description_longue', 'categorie',
            'sous_categorie', 'marque', 'sku', 'code_barre', 'prix_achat',
            'prix_vente', 'prix_promotion', 'tva_taux', 'unite_mesure',
            'couleurs_disponibles', 'tailles_disponibles', 'stock',
            'date_peremption', 'duree_conservation', 'statut',
            'en_promotion', 'date_debut_promotion', 'date_fin_promotion',
            'vendable', 'achetable', 'visible_catalogue', 'images',
            'dimensions'  # Ajouter le champ dimensions
        ]
        # Champs supplémentaires pour la compatibilité avec le frontend
        extra_kwargs = {
            'stock_initial': {'write_only': True, 'required': False},
            'stock_minimum': {'write_only': True, 'required': False},
            'stock_maximum': {'write_only': True, 'required': False},
        }
    
    def create(self, validated_data):
        # Retirer les images du validated_data car elles sont gérées dans perform_create
        validated_data.pop('images', None)
        
        # Retirer les champs de stock qui n'existent plus dans le modèle
        validated_data.pop('stock_initial', None)
        validated_data.pop('stock_minimum', None)
        validated_data.pop('stock_maximum', None)
        
        # Retirer le champ dimensions qui n'existe plus dans le modèle
        validated_data.pop('dimensions', None)
        
        # Traiter les champs JSON
        if 'couleurs_disponibles' in validated_data and isinstance(validated_data['couleurs_disponibles'], str):
            try:
                validated_data['couleurs_disponibles'] = json.loads(validated_data['couleurs_disponibles'])
            except json.JSONDecodeError:
                validated_data['couleurs_disponibles'] = []
        
        if 'tailles_disponibles' in validated_data and isinstance(validated_data['tailles_disponibles'], str):
            try:
                validated_data['tailles_disponibles'] = json.loads(validated_data['tailles_disponibles'])
            except json.JSONDecodeError:
                validated_data['tailles_disponibles'] = []
        
        return super().create(validated_data)


class FournisseurSerializer(serializers.ModelSerializer):
    """Serializer pour les fournisseurs."""
    
    class Meta:
        model = Fournisseur
        fields = [
            'id', 'nom', 'contact_nom', 'contact_fonction', 'email',
            'telephone', 'telephone_secondaire', 'conditions_paiement',
            'delai_livraison', 'montant_minimum_commande', 'evaluation',
            'nombre_evaluations', 'statut', 'nombre_commandes',
            'montant_total_commandes'
        ]


class BundleSerializer(serializers.ModelSerializer):
    """Serializer pour les bundles."""
    prix_total_produits = serializers.ReadOnlyField()
    economie = serializers.ReadOnlyField()
    
    class Meta:
        model = Bundle
        fields = [
            'id', 'nom', 'description', 'prix_bundle', 'actif',
            'en_promotion', 'date_debut_promotion', 'date_fin_promotion',
            'prix_total_produits', 'economie'
        ]