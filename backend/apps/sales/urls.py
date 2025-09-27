"""
URLs pour la gestion des ventes.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'ventes', views.VenteViewSet)
router.register(r'devis', views.DevisViewSet)

urlpatterns = [
    path('', include(router.urls)),
]