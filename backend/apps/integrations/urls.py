"""
URLs pour la gestion des intégrations.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'integrations-externes', views.IntegrationExterneViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
