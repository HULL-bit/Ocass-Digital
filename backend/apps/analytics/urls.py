
from django.urls import path
from . import views

urlpatterns = [
    path('dashboard-summary/', views.dashboard_summary, name='dashboard_summary'),
    path('dashboard/', views.dashboard_analytics, name='dashboard_analytics'),
    path('entrepreneur-dashboard/', views.entrepreneur_dashboard, name='entrepreneur_dashboard'),
    path('client-dashboard/', views.client_dashboard, name='client_dashboard'),
]
