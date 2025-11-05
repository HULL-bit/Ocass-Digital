"""
Sérialiseurs pour la gestion des clients.
"""
from rest_framework import serializers
from .models import Client


class ClientSerializer(serializers.ModelSerializer):
    # Rendre ces champs en lecture seule - ils seront gérés par perform_create et save()
    code_client = serializers.CharField(required=False, allow_blank=True, max_length=20, read_only=True)
    entrepreneur = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = Client
        fields = '__all__'
        read_only_fields = ['code_client', 'entrepreneur']  # Ces champs sont gérés automatiquement
