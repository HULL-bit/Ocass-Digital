"""
Serializers pour les utilisateurs.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Role, Permission

User = get_user_model()


class PermissionSerializer(serializers.ModelSerializer):
    """Serializer pour les permissions."""
    
    class Meta:
        model = Permission
        fields = ['id', 'nom', 'code', 'description', 'module']


class RoleSerializer(serializers.ModelSerializer):
    """Serializer pour les rôles."""
    permissions = PermissionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Role
        fields = ['id', 'nom', 'description', 'permissions', 'couleur']


class UtilisateurSerializer(serializers.ModelSerializer):
    """Serializer pour les utilisateurs."""
    nom_complet = serializers.CharField(read_only=True)
    initiales = serializers.CharField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'type_utilisateur', 'entreprise_id', 'telephone', 'avatar',
            'date_derniere_connexion', 'theme_interface', 'langue',
            'mfa_actif', 'points_experience', 'niveau', 'badges',
            'statut', 'nom_complet', 'initiales', 'is_active'
        ]
        read_only_fields = [
            'id', 'points_experience', 'niveau', 'badges',
            'date_derniere_connexion'
        ]


class UtilisateurCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création d'utilisateurs."""
    password = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name',
            'type_utilisateur', 'entreprise_id', 'telephone',
            'password'
        ]
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        return user