"""
URLs pour les fonctionnalités core.
"""
from django.urls import path
from django.http import JsonResponse
from . import views

def root_view(request):
    """Vue pour la route racine"""
    return JsonResponse({
        'message': 'Commercial Platform API',
        'version': '1.0.0',
        'endpoints': {
            'health': '/api/v1/core/health/',
            'api_docs': '/api/docs/',
            'admin': '/admin/',
        }
    })

urlpatterns = [
    path('', root_view, name='root'),
    path('upload/', views.upload_file, name='upload_file'),
    path('health/', views.health_check, name='health_check'),
    path('stats/', views.system_stats, name='system_stats'),
]