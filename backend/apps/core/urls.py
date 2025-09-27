"""
URLs pour les fonctionnalités core.
"""
from django.urls import path
from . import views

urlpatterns = [
    path('upload/', views.upload_file, name='upload_file'),
    path('health/', views.health_check, name='health_check'),
    path('stats/', views.system_stats, name='system_stats'),
]