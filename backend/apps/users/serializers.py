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
        
        # Assigner un avatar d'Africain noir basé sur le type d'utilisateur
        avatar_url = self.get_appropriate_avatar_url(
            user_type=validated_data.get('type_utilisateur'),
            gender=self.determine_gender(validated_data.get('first_name', '')),
            is_admin=False
        )
        validated_data['avatar'] = avatar_url
        
        user = User.objects.create_user(password=password, **validated_data)
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