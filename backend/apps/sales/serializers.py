"""
Serializers pour les ventes.
"""
from rest_framework import serializers
from .models import Vente, LigneVente, Devis, LigneDevis


class LigneVenteSerializer(serializers.ModelSerializer):
    """Serializer pour les lignes de vente."""
    produit_nom = serializers.CharField(source='produit.nom', read_only=True)
    produit_sku = serializers.CharField(source='produit.sku', read_only=True)
    total_ht = serializers.ReadOnlyField()
    total_tva = serializers.ReadOnlyField()
    total_ttc = serializers.ReadOnlyField()
    
    class Meta:
        model = LigneVente
        fields = [
            'id', 'produit', 'produit_nom', 'produit_sku', 'variante',
            'quantite', 'prix_unitaire', 'remise_pourcentage', 'tva_taux',
            'total_ht', 'total_tva', 'total_ttc', 'notes'
        ]


class VenteSerializer(serializers.ModelSerializer):
    """Serializer pour les ventes."""
    client_nom = serializers.CharField(source='client.nom', read_only=True)
    client_email = serializers.CharField(source='client.email', read_only=True)
    entrepreneur_nom = serializers.CharField(source='entrepreneur.get_full_name', read_only=True)
    lignes = LigneVenteSerializer(many=True, read_only=True)
    
    class Meta:
        model = Vente
        fields = [
            'id', 'numero_facture', 'numero_commande', 'client', 'client_nom',
            'client_email', 'entrepreneur', 'entrepreneur_nom', 'vendeur',
            'date_creation', 'date_livraison_prevue', 'date_livraison_reelle',
            'statut', 'sous_total', 'taxe_montant', 'remise_montant',
            'frais_livraison', 'total_ttc', 'mode_paiement', 'statut_paiement',
            'date_paiement', 'reference_paiement', 'notes', 'signature_client',
            'adresse_livraison', 'transporteur', 'numero_suivi', 'source_vente',
            'lignes'
        ]
        read_only_fields = ['numero_facture', 'entrepreneur', 'vendeur']


class LigneDevisSerializer(serializers.ModelSerializer):
    """Serializer pour les lignes de devis."""
    produit_nom = serializers.CharField(source='produit.nom', read_only=True)
    total_ligne = serializers.ReadOnlyField()
    
    class Meta:
        model = LigneDevis
        fields = [
            'id', 'produit', 'produit_nom', 'quantite', 'prix_unitaire',
            'remise_pourcentage', 'total_ligne'
        ]


class DevisSerializer(serializers.ModelSerializer):
    """Serializer pour les devis."""
    client_nom = serializers.CharField(source='client.nom', read_only=True)
    entrepreneur_nom = serializers.CharField(source='entrepreneur.get_full_name', read_only=True)
    lignes = LigneDevisSerializer(many=True, read_only=True)
    
    class Meta:
        model = Devis
        fields = [
            'id', 'numero_devis', 'client', 'client_nom', 'entrepreneur',
            'entrepreneur_nom', 'date_creation', 'date_validite', 'date_acceptation',
            'statut', 'sous_total', 'taxe_montant', 'remise_montant', 'total_ttc',
            'vente_associee', 'notes', 'conditions_particulieres', 'lignes'
        ]
        read_only_fields = ['numero_devis', 'entrepreneur']