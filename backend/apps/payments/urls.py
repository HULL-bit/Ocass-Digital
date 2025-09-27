"""
URLs pour la gestion des paiements.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'paiements-mobiles', views.PaiementMobileViewSet)
router.register(r'liens-paiement', views.LienPaiementViewSet)
router.register(r'remboursements', views.RemboursementViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
