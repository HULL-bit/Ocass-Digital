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