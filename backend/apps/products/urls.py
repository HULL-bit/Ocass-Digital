"""
URLs pour la gestion des produits.
"""
from django.urls import path, include
from django.http import JsonResponse
from rest_framework.routers import DefaultRouter
from . import views

def block_fast_list(request):
    """Bloque les requêtes fast_list qui causent des boucles."""
    return JsonResponse({
        'status': 'blocked',
        'message': 'Endpoint temporairement désactivé pour éviter les boucles',
        'data': []
    }, status=200)

router = DefaultRouter()
router.register(r'products', views.ProduitViewSet)
router.register(r'categories', views.CategorieViewSet)
router.register(r'marques', views.MarqueViewSet)
router.register(r'fournisseurs', views.FournisseurViewSet)
router.register(r'bundles', views.BundleViewSet)
router.register(r'images', views.ImageProduitViewSet)

urlpatterns = [
    # Bloque l'endpoint fast_list qui cause les boucles
    path('products/fast_list/', block_fast_list, name='block_fast_list'),
    path('', include(router.urls)),
]