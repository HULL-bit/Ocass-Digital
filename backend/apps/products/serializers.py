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
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ImageProduit
        fields = [
            'id', 'produit', 'image', 'image_url', 'alt_text', 'principale', 'ordre_affichage',
            'couleur', 'taille'
        ]
        read_only_fields = ['id']
    
    def get_image_url(self, obj):
        """Retourne l'URL complète de l'image."""
        if obj.image:
            request = self.context.get('request')
            
            # Obtenir le chemin de l'image depuis le champ ImageField
            try:
                # obj.image.url retourne déjà le chemin relatif depuis MEDIA_URL
                # Par exemple: /media/produits/filename.jpg
                image_path = obj.image.url
            except Exception as e:
                # Si .url échoue, utiliser le nom du fichier et construire le chemin
                image_name = obj.image.name if hasattr(obj.image, 'name') else str(obj.image)
                # Le nom est généralement "produits/filename.jpg", on doit ajouter /media/
                if image_name.startswith('produits/'):
                    image_path = f"/media/{image_name}"
                elif image_name.startswith('/media/'):
                    image_path = image_name
                else:
                    image_path = f"/media/produits/{image_name}"
            
            # S'assurer que le chemin commence bien par /media/
            if not image_path.startswith('/media/'):
                if image_path.startswith('/'):
                    # Si commence par / mais pas /media/, ajouter /media
                    image_path = f"/media{image_path}"
                else:
                    # Si ne commence pas par /, ajouter /media/
                    image_path = f"/media/{image_path}"
            
            if request:
                # Construire l'URL absolue avec le domaine
                try:
                    return request.build_absolute_uri(image_path)
                except:
                    # Si build_absolute_uri échoue, construire manuellement
                    return f"{request.scheme}://{request.get_host()}{image_path}"
            else:
                # Fallback si pas de requête dans le contexte
                from django.conf import settings
                base_url = getattr(settings, 'BASE_URL', 'http://localhost:8000')
                return f"{base_url}{image_path}"
        return None


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
            'prix_achat', 'prix_vente', 'prix_promotion', 'statut', 'popularite_score',
            'nombre_vues', 'nombre_ventes', 'slug', 'en_promotion',
            'vendable', 'visible_catalogue', 'stock', 'stock_actuel', 'stock_disponible',
            'en_rupture', 'stock_bas', 'images'
        ]
    
    def get_images(self, obj):
        """Retourne seulement la première image pour optimiser les performances."""
        first_image = obj.images.first()
        if first_image:
            serializer = ImageProduitSerializer(first_image, context=self.context)
            image_data = serializer.data
            # Log pour debug (seulement si pas d'image_url)
            if not image_data.get('image_url'):
                print(f"⚠️ Produit {obj.nom} (SKU: {obj.sku}) - image_url manquant:")
                print(f"   - image_data: {image_data}")
                print(f"   - image.name: {first_image.image.name if first_image.image else 'None'}")
                print(f"   - context.request: {self.context.get('request') is not None}")
            return [image_data]
        else:
            # Log seulement pour les premiers produits pour éviter trop de logs
            if obj.id and hash(str(obj.id)) % 10 == 0:  # Log 1 produit sur 10
                print(f"⚠️ Produit {obj.nom} (SKU: {obj.sku}) n'a pas d'image associée")
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
        
        # S'assurer que le stock est défini correctement
        if 'stock' not in validated_data or validated_data['stock'] is None:
            validated_data['stock'] = 0
        
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
        
        print(f"✅ Données validées pour création produit: {validated_data}")
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """Override pour gérer la mise à jour de produits."""
        # Retirer les images du validated_data car elles sont gérées séparément
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
        
        print(f"✅ Données validées pour mise à jour produit: {validated_data}")
        return super().update(instance, validated_data)


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