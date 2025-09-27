"""
Vues pour l'authentification avancée.
"""
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.utils import timezone
from .serializers import LoginSerializer, UserProfileSerializer, RegisterSerializer, SessionUtilisateurSerializer
from .models import SessionUtilisateur, TokenAPI
from apps.users.models import UtilisateurPersonnalise

User = get_user_model()


def get_client_ip(request):
    """Récupère l'IP réelle du client."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Connexion avec JWT et tracking de session."""
    serializer = LoginSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Générer tokens JWT
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        # Créer session tracking
        SessionUtilisateur.objects.create(
            utilisateur_id=user.id,
            session_key=request.session.session_key or '',
            adresse_ip=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        # Mettre à jour dernière connexion
        user.date_derniere_connexion = timezone.now()
        user.nombre_connexions += 1
        user.adresse_ip_derniere = get_client_ip(request)
        user.save(update_fields=['date_derniere_connexion', 'nombre_connexions', 'adresse_ip_derniere'])
        
        return Response({
            'access': str(access_token),
            'refresh': str(refresh),
            'user': UserProfileSerializer(user).data,
            'permissions': user.get_all_permissions() if hasattr(user, 'get_all_permissions') else [],
            'message': 'Connexion réussie'
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """Inscription avec validation avancée."""
    data = request.data.copy()
    
    # Gestion des données entreprise pour entrepreneurs (simplifiée)
    if data.get('type_utilisateur') == 'entrepreneur':
        # Pour l'instant, on ne crée pas d'entreprise automatiquement
        # L'entrepreneur pourra créer son entreprise plus tard
        if 'entreprise' in data:
            data.pop('entreprise')  # Supprimer les données entreprise
        data['entreprise_id'] = None  # Pas d'entreprise pour l'instant
    
    serializer = RegisterSerializer(data=data)
    
    if serializer.is_valid():
        user = serializer.save()
        
        # Générer tokens JWT
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        return Response({
            'access': str(access_token),
            'refresh': str(refresh),
            'user': UserProfileSerializer(user).data,
            'message': 'Inscription réussie'
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])  # Permettre logout même sans token valide
def logout_view(request):
    """Déconnexion avec invalidation du token."""
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception as token_error:
                # Ignorer les erreurs de token (token déjà expiré/invalide)
                print(f"Token invalidation error (ignored): {token_error}")
        
        # Fermer la session si l'utilisateur est authentifié
        if hasattr(request, 'user') and request.user.is_authenticated:
            sessions = SessionUtilisateur.objects.filter(
                utilisateur_id=request.user.id,
                date_fin__isnull=True
            )
            sessions.update(date_fin=timezone.now())
        
        return Response({'message': 'Déconnexion réussie'})
    except Exception as e:
        # Retourner succès même en cas d'erreur pour éviter les problèmes frontend
        return Response({'message': 'Déconnexion réussie'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """Récupération du profil utilisateur."""
    serializer = UserProfileSerializer(request.user)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile_view(request):
    """Mise à jour du profil utilisateur."""
    serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enable_mfa_view(request):
    """Activation de l'authentification à deux facteurs."""
    user = request.user
    
    if not user.mfa_actif:
        qr_code_url = user.generer_qr_code_mfa()
        codes_recuperation = user.generer_codes_recuperation()
        
        return Response({
            'qr_code_url': qr_code_url,
            'codes_recuperation': codes_recuperation,
            'message': 'MFA configuré. Scannez le QR code avec votre app d\'authentification.'
        })
    
    return Response({'message': 'MFA déjà activé'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_mfa_view(request):
    """Vérification du code MFA."""
    code = request.data.get('code')
    user = request.user
    
    if user.verifier_code_mfa(code):
        user.mfa_actif = True
        user.save(update_fields=['mfa_actif'])
        return Response({'message': 'MFA activé avec succès'})
    
    return Response({'error': 'Code invalide'}, status=status.HTTP_400_BAD_REQUEST)


class SessionUtilisateurViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour les sessions utilisateur."""
    serializer_class = SessionUtilisateurSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return SessionUtilisateur.objects.filter(utilisateur_id=self.request.user.id)
    
    @action(detail=True, methods=['post'])
    def terminate_session(self, request, pk=None):
        """Terminer une session spécifique."""
        session = self.get_object()
        session.date_fin = timezone.now()
        session.save()
        return Response({'message': 'Session terminée'})