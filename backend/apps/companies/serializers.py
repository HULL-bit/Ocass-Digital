"""
Serializers pour les entreprises.
"""
from rest_framework import serializers
from .models import Entreprise, PlanAbonnement


class PlanAbonnementSerializer(serializers.ModelSerializer):
    """Serializer pour les plans d'abonnement."""
    
    class Meta:
        model = PlanAbonnement
        fields = [
            'id', 'nom', 'description', 'prix_mensuel', 'prix_annuel',
            'devise', 'max_utilisateurs', 'max_produits', 'max_ventes_mensuelles',
            'stockage_gb', 'fonctionnalites', 'populaire'
        ]


class EntrepriseSerializer(serializers.ModelSerializer):
    """Serializer pour les entreprises."""
    plan_abonnement = PlanAbonnementSerializer(read_only=True)
    est_active = serializers.ReadOnlyField()
    abonnement_expire = serializers.ReadOnlyField()
    
    class Meta:
        model = Entreprise
        fields = [
            'id', 'nom', 'nom_commercial', 'secteur_activite', 'description',
            'telephone', 'email', 'site_web', 'adresse_complete', 'ville',
            'region', 'pays', 'code_postal', 'siret', 'tva_intracommunautaire',
            'forme_juridique', 'logo', 'couleur_primaire', 'couleur_secondaire',
            'devise_principale', 'fuseau_horaire',
            'plan_abonnement', 'date_debut_abonnement', 'date_fin_abonnement',
            'statut', 'nombre_employes', 'chiffre_affaires_annuel',
            'preferences', 'est_active', 'abonnement_expire'
        ]
        read_only_fields = [
            'date_debut_abonnement', 'est_active', 'abonnement_expire'
        ]