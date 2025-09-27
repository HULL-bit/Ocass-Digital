"""
Sérialiseurs pour la gestion des intégrations.
"""
from rest_framework import serializers
from .models import IntegrationExterne


class IntegrationExterneSerializer(serializers.ModelSerializer):
    class Meta:
        model = IntegrationExterne
        fields = '__all__'
