"""
URLs pour l'authentification.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'sessions', views.SessionUtilisateurViewSet, basename='session')

urlpatterns = [
    # Authentification
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profil
    path('profile/', views.profile_view, name='profile'),
    path('profile/update/', views.update_profile_view, name='update_profile'),
    
    # MFA
    path('mfa/enable/', views.enable_mfa_view, name='enable_mfa'),
    path('mfa/verify/', views.verify_mfa_view, name='verify_mfa'),
    
    # Sessions
    path('', include(router.urls)),
]