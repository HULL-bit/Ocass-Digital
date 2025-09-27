"""
URLs pour la gestion de la gamification.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'badges', views.BadgeViewSet)
router.register(r'utilisateur-badges', views.UtilisateurBadgeViewSet)
router.register(r'defis', views.DefiViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
