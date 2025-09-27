"""
Vues pour la gestion des utilisateurs.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Role, Permission
from .serializers import UtilisateurSerializer, UtilisateurCreateSerializer, RoleSerializer, PermissionSerializer

User = get_user_model()


class UtilisateurViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des utilisateurs."""
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UtilisateurCreateSerializer
        return UtilisateurSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.type_utilisateur == 'admin':
            return User.objects.all()
        elif user.type_utilisateur == 'entrepreneur':
            return User.objects.filter(entreprise=user.entreprise)
        else:
            return User.objects.filter(id=user.id)
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activer un utilisateur."""
        user = self.get_object()
        user.is_active = True
        user.statut = 'actif'
        user.save()
        return Response({'message': 'Utilisateur activé'})
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Désactiver un utilisateur."""
        user = self.get_object()
        user.is_active = False
        user.statut = 'inactif'
        user.save()
        return Response({'message': 'Utilisateur désactivé'})
    
    @action(detail=True, methods=['post'])
    def add_points(self, request, pk=None):
        """Ajouter des points d'expérience."""
        user = self.get_object()
        points = request.data.get('points', 0)
        user.ajouter_points_experience(points)
        return Response({
            'message': f'{points} points ajoutés',
            'total_points': user.points_experience,
            'niveau': user.niveau
        })


class RoleViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des rôles."""
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]


class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour la consultation des permissions."""
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAuthenticated]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_mfa_qr(request):
    """Générer le QR code pour MFA."""
    user = request.user
    qr_url = user.generer_qr_code_mfa()
    return Response({'qr_url': qr_url})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_mfa_code(request):
    """Vérifier un code MFA."""
    code = request.data.get('code')
    user = request.user
    
    if user.verifier_code_mfa(code):
        return Response({'valid': True})
    else:
        return Response({'valid': False}, status=status.HTTP_400_BAD_REQUEST)