"""
URLs pour la gestion des produits.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'products', views.ProduitViewSet)
router.register(r'categories', views.CategorieViewSet)
router.register(r'marques', views.MarqueViewSet)
router.register(r'fournisseurs', views.FournisseurViewSet)
router.register(r'bundles', views.BundleViewSet)
router.register(r'images', views.ImageProduitViewSet)

urlpatterns = [
    path('', include(router.urls)),
]