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
        
        # Avatars pour administrateurs (Africains locaux) - Hommes
        admin_avatars = [
            '/Res/pexels-cenali-2733918.jpg',
            '/Res/pexels-bohlemedia-1884581.jpg',
            '/Res/tech.jpg',
            '/Res/entrepreneur.png',
            '/Res/ent2.png',
            '/Res/stefan-buhler-qQY44BbC2mw-unsplash.jpg',
            '/Res/shivansh-sharma-l2cFxUEEY7I-unsplash.jpg',
            '/Res/mathieu-gauzy-qLT3rBVwiLY-unsplash.jpg',
            '/Res/gerent.jpg',
        ]
        
        # Avatars pour entrepreneurs (hommes d'affaires africains)
        entrepreneur_male_avatars = [
            '/Res/pexels-cenali-2733918.jpg',
            '/Res/pexels-bohlemedia-1884581.jpg',
            '/Res/tech.jpg',
            '/Res/entrepreneur.png',
            '/Res/ent2.png',
            '/Res/stefan-buhler-qQY44BbC2mw-unsplash.jpg',
            '/Res/shivansh-sharma-l2cFxUEEY7I-unsplash.jpg',
            '/Res/mathieu-gauzy-qLT3rBVwiLY-unsplash.jpg',
            '/Res/gerent.jpg',
        ]
        
        # Avatars pour entrepreneures (femmes d'affaires africaines)
        entrepreneur_female_avatars = [
            '/Res/pexels-planeteelevene-2290243.jpg',
            '/Res/pexels-shattha-pilabut-38930-135620.jpg',
            '/Res/rutendo-petros-Tzp_yd6W8LM-unsplash.jpg',
            '/Res/couture.jpg',
            '/Res/monody-le-mZ_7CuqsRV0-unsplash.jpg',
            '/Res/boutiqueMarie%20Diallo.jpg',
            '/Res/boutque.jpg',
        ]
        
        # Avatars pour clients (Africains locaux) - Mixte
        client_avatars = [
            '/Res/pexels-cenali-2733918.jpg',
            '/Res/pexels-planeteelevene-2290243.jpg',
            '/Res/pexels-bohlemedia-1884581.jpg',
            '/Res/pexels-shattha-pilabut-38930-135620.jpg',
            '/Res/tech.jpg',
            '/Res/rutendo-petros-Tzp_yd6W8LM-unsplash.jpg',
            '/Res/couture.jpg',
            '/Res/entrepreneur.png',
            '/Res/ent2.png',
            '/Res/stefan-buhler-qQY44BbC2mw-unsplash.jpg',
            '/Res/boutiqueMarie%20Diallo.jpg',
            '/Res/boutque.jpg',
            '/Res/gerent.jpg',
        ]
        
        # Avatars pour employés (Africains locaux) - Mixte
        employee_avatars = [
            '/Res/pexels-cenali-2733918.jpg',
            '/Res/pexels-planeteelevene-2290243.jpg',
            '/Res/pexels-bohlemedia-1884581.jpg',
            '/Res/pexels-shattha-pilabut-38930-135620.jpg',
            '/Res/tech.jpg',
            '/Res/rutendo-petros-Tzp_yd6W8LM-unsplash.jpg',
            '/Res/entrepreneur.png',
            '/Res/ent2.png',
        ]
        
        # Avatars pour support (Africains locaux) - Mixte
        support_avatars = [
            '/Res/pexels-cenali-2733918.jpg',
            '/Res/pexels-planeteelevene-2290243.jpg',
            '/Res/tech.jpg',
            '/Res/entrepreneur.png',
            '/Res/ent2.png',
            '/Res/gerent.jpg',
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