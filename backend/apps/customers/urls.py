"""
URLs pour la gestion des clients.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
# Ajouter les ViewSets quand ils seront créés

urlpatterns = [
    path('', include(router.urls)),
]
