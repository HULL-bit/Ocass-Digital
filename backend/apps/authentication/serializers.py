"""
Serializers pour l'authentification.
"""
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from .models import SessionUtilisateur, TokenAPI
from apps.users.models import UtilisateurPersonnalise

User = get_user_model()


class LoginSerializer(serializers.Serializer):
    """Serializer pour la connexion."""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    type_utilisateur = serializers.CharField()
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        type_utilisateur = attrs.get('type_utilisateur')
        
        if email and password:
            user = authenticate(
                request=self.context.get('request'),
                username=email,
                password=password
            )
            
            if not user:
                raise serializers.ValidationError('Identifiants invalides.')
            
            if user.type_utilisateur != type_utilisateur:
                raise serializers.ValidationError('Type d\'utilisateur incorrect.')
            
            if not user.is_active:
                raise serializers.ValidationError('Compte désactivé.')
            
            attrs['user'] = user
            return attrs
        
        raise serializers.ValidationError('Email et mot de passe requis.')


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer pour le profil utilisateur."""
    entreprise_nom = serializers.SerializerMethodField()
    nom_complet = serializers.CharField(read_only=True)
    initiales = serializers.CharField(read_only=True)
    
    class Meta:
        model = UtilisateurPersonnalise
        fields = [
            'id', 'email', 'first_name', 'last_name', 'type_utilisateur',
            'telephone', 'avatar', 'entreprise_nom', 'theme_interface',
            'langue', 'mfa_actif', 'points_experience', 'niveau',
            'nom_complet', 'initiales', 'statut', 'badges'
        ]
        read_only_fields = ['id', 'type_utilisateur', 'points_experience', 'niveau']
    
    def get_entreprise_nom(self, obj):
        """Récupère le nom de l'entreprise si l'utilisateur en a une."""
        if obj.entreprise_id:
            try:
                from apps.companies.models import Entreprise
                entreprise = Entreprise.objects.get(id=obj.entreprise_id)
                return entreprise.nom
            except:
                return None
        return None


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer pour l'inscription."""
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = UtilisateurPersonnalise
        fields = [
            'email', 'first_name', 'last_name', 'type_utilisateur',
            'telephone', 'password', 'confirm_password'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas.")
        
        # Vérifier si l'email existe déjà
        email = attrs.get('email')
        if email and UtilisateurPersonnalise.objects.filter(email=email).exists():
            raise serializers.ValidationError("Un utilisateur avec cet email existe déjà.")
        
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        
        # Utiliser l'email comme username pour la compatibilité Django
        validated_data['username'] = validated_data['email']
        
        user = UtilisateurPersonnalise.objects.create_user(
            password=password,
            **validated_data
        )
        return user


class SessionUtilisateurSerializer(serializers.ModelSerializer):
    """Serializer pour les sessions utilisateur."""
    duree_session = serializers.SerializerMethodField()
    est_active = serializers.SerializerMethodField()
    
    class Meta:
        model = SessionUtilisateur
        fields = [
            'id', 'session_key', 'adresse_ip', 'user_agent',
            'pays', 'ville', 'date_debut', 'date_fin',
            'derniere_activite', 'appareil', 'navigateur',
            'duree_session', 'est_active'
        ]
    
    def get_duree_session(self, obj):
        return str(obj.duree_session) if hasattr(obj, 'duree_session') else None
    
    def get_est_active(self, obj):
        return obj.est_active if hasattr(obj, 'est_active') else False


class TokenAPISerializer(serializers.ModelSerializer):
    """Serializer pour les tokens API."""
    
    class Meta:
        model = TokenAPI
        fields = [
            'id', 'nom', 'token', 'permissions', 'actif',
            'date_expiration', 'derniere_utilisation', 'date_creation'
        ]
        read_only_fields = ['token', 'derniere_utilisation']
    
    def create(self, validated_data):
        import secrets
        validated_data['token'] = secrets.token_urlsafe(32)
        return super().create(validated_data)