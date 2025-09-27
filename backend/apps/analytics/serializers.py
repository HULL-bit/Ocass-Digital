"""
Serializers pour les analytics.
"""
from rest_framework import serializers
from .models import MetriquePerformance, RapportPersonnalise, ExecutionRapport


class MetriquePerformanceSerializer(serializers.ModelSerializer):
    """Serializer pour les métriques de performance."""
    
    class Meta:
        model = MetriquePerformance
        fields = [
            'id', 'type_metrique', 'entrepreneur', 'entreprise',
            'valeur_numerique', 'valeur_pourcentage', 'valeur_json',
            'date_debut', 'date_fin', 'valeur_precedente',
            'evolution_pourcentage', 'date_creation'
        ]


class RapportPersonnaliseSerializer(serializers.ModelSerializer):
    """Serializer pour les rapports personnalisés."""
    
    class Meta:
        model = RapportPersonnalise
        fields = [
            'id', 'nom', 'description', 'type_rapport', 'configuration',
            'frequence', 'planification', 'derniere_execution',
            'prochaine_execution', 'actif', 'partage'
        ]


class ExecutionRapportSerializer(serializers.ModelSerializer):
    """Serializer pour les exécutions de rapport."""
    duree = serializers.SerializerMethodField()
    
    class Meta:
        model = ExecutionRapport
        fields = [
            'id', 'rapport', 'date_debut', 'date_fin', 'duree',
            'statut', 'nombre_lignes', 'taille_fichier',
            'chemin_fichier', 'message_erreur'
        ]
    
    def get_duree(self, obj):
        if obj.duree:
            return str(obj.duree)
        return None