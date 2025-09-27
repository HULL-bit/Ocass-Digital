"""
URLs pour la gestion des entreprises.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'entreprises', views.EntrepriseViewSet)
router.register(r'plans', views.PlanAbonnementViewSet)

urlpatterns = [
    path('', include(router.urls)),
]