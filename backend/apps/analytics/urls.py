"""
URLs pour les analytics.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'reports', views.RapportPersonnaliseViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', views.dashboard_metrics, name='dashboard_metrics'),
    path('sales/', views.sales_analytics, name='sales_analytics'),
    path('inventory/', views.inventory_analytics, name='inventory_analytics'),
    path('customers/', views.customer_analytics, name='customer_analytics'),
    path('financial/', views.financial_analytics, name='financial_analytics'),
]