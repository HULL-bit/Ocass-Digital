"""
URL configuration for commercial_platform project.
Configuration ultra-avancée avec toutes les routes API.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

# API v1 URLs
api_v1_patterns = [
    # Core utilities (health check, stats, etc.)
    path('core/', include('apps.core.urls')),
    
    # Authentication & Users
    path('auth/', include('apps.authentication.urls')),
    path('users/', include('apps.users.urls')),
    
    # Core Business
    path('companies/', include('apps.companies.urls')),
    path('products/', include('apps.products.urls')),
    path('inventory/', include('apps.inventory.urls')),
    path('sales/', include('apps.sales.urls')),
    path('customers/', include('apps.customers.urls')),
    path('projects/', include('apps.projects.urls')),
    
    # Financial
    path('payments/', include('apps.payments.urls')),
    
    # Analytics & BI
    path('analytics/', include('apps.analytics.urls')),
    
    # Communication
    path('notifications/', include('apps.notifications.urls')),
    path('support/', include('apps.support.urls')),
    
    # Integrations
    path('integrations/', include('apps.integrations.urls')),
    
    # AI & Gamification
    path('ai/', include('apps.ai_engine.urls')),
    path('gamification/', include('apps.gamification.urls')),
]

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # API v1
    path('api/v1/', include(api_v1_patterns)),
    
    # OAuth2
    path('o/', include('oauth2_provider.urls', namespace='oauth2_provider')),
    
    # WebSocket endpoints are handled by ASGI routing
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    
    # Debug toolbar
    if 'debug_toolbar' in settings.INSTALLED_APPS:
        import debug_toolbar
        urlpatterns = [
            path('__debug__/', include(debug_toolbar.urls)),
        ] + urlpatterns

# Custom error handlers
handler400 = 'apps.core.views.bad_request'
handler403 = 'apps.core.views.permission_denied'
handler404 = 'apps.core.views.page_not_found'
handler500 = 'apps.core.views.server_error'