"""
Sérialiseurs pour la gestion de l'IA.
"""
from rest_framework import serializers
from .models import ModeleIA


class ModeleIASerializer(serializers.ModelSerializer):
    class Meta:
        model = ModeleIA
        fields = '__all__'
