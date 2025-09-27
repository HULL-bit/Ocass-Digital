"""
URLs pour la gestion des utilisateurs.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UtilisateurViewSet)
router.register(r'roles', views.RoleViewSet)
router.register(r'permissions', views.PermissionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('profile/mfa/qr/', views.generate_mfa_qr, name='mfa_qr'),
    path('profile/mfa/verify/', views.verify_mfa_code, name='verify_mfa'),
]