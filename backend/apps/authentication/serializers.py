"""
Serializers pour l'authentification.
"""
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from datetime import datetime
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
        if obj.entreprise:
            return obj.entreprise.nom
        return None


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer pour l'inscription."""
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    entreprise = serializers.DictField(required=False, write_only=True)
    
    class Meta:
        model = UtilisateurPersonnalise
        fields = [
            'email', 'first_name', 'last_name', 'type_utilisateur',
            'telephone', 'password', 'confirm_password', 'entreprise'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas.")
        
        # Vérifier si l'email existe déjà
        email = attrs.get('email')
        if email and UtilisateurPersonnalise.objects.filter(email=email).exists():
            raise serializers.ValidationError("Un utilisateur avec cet email existe déjà.")
        
        # Vérifier si le téléphone existe déjà
        telephone = attrs.get('telephone')
        if telephone and UtilisateurPersonnalise.objects.filter(telephone=telephone).exists():
            raise serializers.ValidationError("Un utilisateur avec ce téléphone existe déjà.")
        
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        entreprise_data = validated_data.pop('entreprise', None)
        
        # Utiliser l'email comme username pour la compatibilité Django
        validated_data['username'] = validated_data['email']
        
        # Assigner un avatar d'Africain noir basé sur le type d'utilisateur
        avatar_url = self.get_appropriate_avatar_url(
            user_type=validated_data.get('type_utilisateur'),
            gender=self.determine_gender(validated_data.get('first_name', '')),
            is_admin=False
        )
        validated_data['avatar'] = avatar_url
        
        # Si c'est un entrepreneur, créer une entreprise
        if validated_data.get('type_utilisateur') == 'entrepreneur':
            from apps.companies.models import Entreprise, PlanAbonnement
            
            # Créer un plan d'abonnement par défaut
            plan_default, created = PlanAbonnement.objects.get_or_create(
                nom='Plan Gratuit',
                defaults={
                    'description': 'Plan gratuit pour les nouveaux entrepreneurs',
                    'prix_mensuel': 0,
                    'prix_annuel': 0,
                    'devise': 'XOF',
                    'max_utilisateurs': 5,
                    'max_produits': 100,
                    'max_ventes_mensuelles': 1000,
                    'stockage_gb': 1,
                    'fonctionnalites': {'basic': True},
                    'populaire': False,
                    'ordre_affichage': 0
                }
            )
            
            # Créer l'entreprise avec les données fournies ou par défaut
            if entreprise_data:
                entreprise = Entreprise.objects.create(
                    nom=entreprise_data.get('nom', f"Entreprise {validated_data.get('first_name', '')} {validated_data.get('last_name', '')}".strip()[:50]),
                    description=entreprise_data.get('description', f"Entreprise créée automatiquement pour {validated_data.get('first_name', '')} {validated_data.get('last_name', '')}"),
                    secteur_activite=entreprise_data.get('secteur_activite', 'commerce_general'),
                    telephone=entreprise_data.get('telephone', validated_data.get('telephone', '+221000000000')),
                    email=entreprise_data.get('email', validated_data['email']),
                    adresse_complete=entreprise_data.get('adresse_complete', 'Adresse à compléter'),
                    ville=entreprise_data.get('ville', 'Dakar'),
                    region=entreprise_data.get('region', 'Dakar'),
                    pays=entreprise_data.get('pays', 'Sénégal'),
                    plan_abonnement=plan_default,
                    statut='actif',
                    siret=entreprise_data.get('siret') or f"TEMP-{validated_data['email'].replace('@', '-').replace('.', '-')}-{datetime.now().strftime('%Y%m%d%H%M%S')}",
                    forme_juridique=entreprise_data.get('forme_juridique', 'sarl'),
                    site_web=entreprise_data.get('site_web'),
                    couleur_primaire=entreprise_data.get('couleur_primaire', '#3B82F6'),
                    couleur_secondaire=entreprise_data.get('couleur_secondaire', '#1E40AF'),
                    devise_principale=entreprise_data.get('devise_principale', 'XOF'),
                    fuseau_horaire=entreprise_data.get('fuseau_horaire', 'Africa/Dakar'),
                    nombre_employes=entreprise_data.get('nombre_employes', 1),
                    chiffre_affaires_annuel=entreprise_data.get('chiffre_affaires_annuel', 0)
                )
            else:
                # Créer une entreprise par défaut
                entreprise = Entreprise.objects.create(
                    nom=f"Entreprise {validated_data.get('first_name', '')} {validated_data.get('last_name', '')}".strip()[:50],
                    description=f"Entreprise créée automatiquement pour {validated_data.get('first_name', '')} {validated_data.get('last_name', '')}",
                    secteur_activite='commerce_general',
                    telephone=validated_data.get('telephone', '+221000000000'),
                    email=validated_data['email'],
                    adresse_complete='Adresse à compléter',
                    ville='Dakar',
                    region='Dakar',
                    pays='Sénégal',
                    plan_abonnement=plan_default,
                    statut='actif',
                    siret=f"TEMP-{validated_data['email'].replace('@', '-').replace('.', '-')}-{datetime.now().strftime('%Y%m%d%H%M%S')}"
                )
            
            # Associer l'entreprise à l'utilisateur
            validated_data['entreprise'] = entreprise
        
        user = UtilisateurPersonnalise.objects.create_user(
            password=password,
            **validated_data
        )
        return user
    
    def determine_gender(self, first_name):
        """Détermine le genre basé sur le prénom."""
        if not first_name:
            return 'M'
        
        first_name_lower = first_name.lower()
        is_female = any(name in first_name_lower for name in [
            'marie', 'fatou', 'aïcha', 'amina', 'khadija', 'aïssatou', 'mariama', 'sokhna', 'ndeye', 'coumba',
            'aïda', 'sira', 'penda', 'aïssa', 'mame', 'sokhna', 'ndeye', 'coumba', 'aïda', 'sira'
        ])
        
        return 'F' if is_female else 'M'
    
    def get_appropriate_avatar_url(self, user_type, gender=None, is_admin=False):
        """Génère une URL d'avatar appropriée basée sur le type d'utilisateur."""
        import random
        
        # Avatars pour administrateurs (Africains noirs)
        admin_avatars = [
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face',
        ]
        
        # Avatars pour entrepreneurs (hommes d'affaires africains)
        entrepreneur_male_avatars = [
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=200&h=200&fit=crop&crop=face',
        ]
        
        # Avatars pour entrepreneures (femmes d'affaires africaines)
        entrepreneur_female_avatars = [
            'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1594736797933-d0c29c0b8b0a?w=200&h=200&fit=crop&crop=face',
        ]
        
        # Avatars pour clients (Africains noirs)
        client_avatars = [
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=200&h=200&fit=crop&crop=face',
        ]
        
        # Avatars pour employés (Africains noirs)
        employee_avatars = [
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=200&h=200&fit=crop&crop=face',
        ]
        
        # Avatars pour support (Africains noirs)
        support_avatars = [
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=200&h=200&fit=crop&crop=face',
        ]
        
        # Sélectionner l'avatar approprié
        if is_admin or user_type == 'admin':
            return random.choice(admin_avatars)
        elif user_type == 'entrepreneur':
            if gender == 'F':
                return random.choice(entrepreneur_female_avatars)
            else:
                return random.choice(entrepreneur_male_avatars)
        elif user_type == 'client':
            return random.choice(client_avatars)
        elif user_type == 'employe':
            return random.choice(employee_avatars)
        elif user_type == 'support':
            return random.choice(support_avatars)
        else:
            return random.choice(client_avatars)


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