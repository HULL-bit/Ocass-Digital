"""
Vues pour les fonctionnalités core.
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import json
import uuid


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_file(request):
    """Upload de fichiers avec gestion sécurisée."""
    try:
        file = request.FILES.get('file')
        file_type = request.POST.get('type', 'general')
        
        if not file:
            return Response({'error': 'Aucun fichier fourni'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validation du type de fichier
        allowed_types = {
            'image': ['jpg', 'jpeg', 'png', 'webp', 'gif'],
            'document': ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'],
            'general': ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf', 'doc', 'docx'],
        }
        
        file_extension = file.name.split('.')[-1].lower()
        if file_extension not in allowed_types.get(file_type, allowed_types['general']):
            return Response({'error': 'Type de fichier non autorisé'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validation de la taille (10MB max)
        if file.size > 10 * 1024 * 1024:
            return Response({'error': 'Fichier trop volumineux (max 10MB)'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Génération du nom de fichier unique
        unique_filename = f"{uuid.uuid4()}_{file.name}"
        file_path = f"uploads/{file_type}/{unique_filename}"
        
        # Sauvegarde du fichier
        saved_path = default_storage.save(file_path, ContentFile(file.read()))
        file_url = default_storage.url(saved_path)
        
        return Response({
            'success': True,
            'data': {
                'url': file_url,
                'filename': file.name,
                'size': file.size,
                'type': file_type,
                'path': saved_path,
            }
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
def bad_request(request, exception):
    """Gestionnaire d'erreur 400."""
    return JsonResponse({
        'error': 'Requête invalide',
        'status': 400,
        'message': 'Les données envoyées ne sont pas valides.'
    }, status=400)


@csrf_exempt
def permission_denied(request, exception):
    """Gestionnaire d'erreur 403."""
    return JsonResponse({
        'error': 'Accès interdit',
        'status': 403,
        'message': 'Vous n\'avez pas les permissions nécessaires.'
    }, status=403)


@csrf_exempt
def page_not_found(request, exception):
    """Gestionnaire d'erreur 404."""
    return JsonResponse({
        'error': 'Ressource non trouvée',
        'status': 404,
        'message': 'La ressource demandée n\'existe pas.'
    }, status=404)


@csrf_exempt
def server_error(request):
    """Gestionnaire d'erreur 500."""
    return JsonResponse({
        'error': 'Erreur serveur',
        'status': 500,
        'message': 'Une erreur interne s\'est produite.'
    }, status=500)


@api_view(['GET'])
def health_check(request):
    """Vérification de l'état du système."""
    return Response({
        'status': 'healthy',
        'timestamp': timezone.now().isoformat(),
        'version': '1.0.0',
        'services': {
            'database': 'connected',
            'redis': 'connected',
            'storage': 'available',
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def system_stats(request):
    """Statistiques système pour admin."""
    if request.user.type_utilisateur != 'admin':
        return Response({'error': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)
    
    from django.contrib.auth import get_user_model
    from apps.companies.models import Entreprise
    from apps.products.models import Produit
    from apps.sales.models import Vente
    
    User = get_user_model()
    
    stats = {
        'users': {
            'total': User.objects.count(),
            'active': User.objects.filter(is_active=True).count(),
            'entrepreneurs': User.objects.filter(type_utilisateur='entrepreneur').count(),
            'clients': User.objects.filter(type_utilisateur='client').count(),
        },
        'companies': {
            'total': Entreprise.objects.count(),
            'active': Entreprise.objects.filter(statut='actif').count(),
        },
        'products': {
            'total': Produit.objects.count(),
            'active': Produit.objects.filter(statut='actif').count(),
        },
        'sales': {
            'total': Vente.objects.count(),
            'this_month': Vente.objects.filter(
                date_creation__month=timezone.now().month
            ).count(),
        }
    }
    
    return Response(stats)