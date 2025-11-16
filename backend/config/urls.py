"""
URL configuration for commercial_platform project.
Configuration ultra-avancée avec toutes les routes API.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from django.urls import re_path
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
    # Root - rediriger vers l'API docs ou health check
    path('', include('apps.core.urls')),
    
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

# Serve media files - toujours servir les médias même en production
# (Pour une vraie production, utilisez S3 ou un CDN)
if settings.DEBUG:
    # En développement, utiliser static()
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    # En production, utiliser une vue personnalisée pour servir les fichiers média
    # Note: Sur Render, les fichiers média sont éphémères (perdus à chaque redéploiement)
    # Pour une vraie production, utilisez S3 ou un CDN
    urlpatterns += [
        re_path(
            r'^media/(?P<path>.*)$',
            serve,
            {'document_root': settings.MEDIA_ROOT},
        ),
    ]

# Serve static files in development only (WhiteNoise gère les statics en production)
if settings.DEBUG:
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