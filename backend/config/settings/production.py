"""
Production settings for commercial_platform project.
Configuration pour déploiement sur Render.
"""
from .base import *
import dj_database_url
import os

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env('DEBUG', default=False)

# Allowed hosts - Render fournit automatiquement le domaine
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=[
    'localhost',
    '127.0.0.1',
    '.render.com',  # Tous les sous-domaines Render
])

# Parse database URL from environment variable
# Render fournit automatiquement DATABASE_URL, mais on a un fallback
DATABASE_URL = os.environ.get(
    'DATABASE_URL',
    'postgresql://commercial_platform_pro_user:cPS9UdVWB53U5ffKCkXXkeWCGp2Y9FWE@dpg-d4big5umcj7s73fh8nq0-a.oregon-postgres.render.com/commercial_platform_pro'
)

# Debug: Afficher l'URL de la base de données (sans le mot de passe)
if DATABASE_URL:
    db_url_display = DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'N/A'
    print(f"[PRODUCTION] Database URL: postgresql://***@{db_url_display}")
else:
    print("[PRODUCTION] WARNING: DATABASE_URL is not set!")

# Database Configuration pour Render
# IMPORTANT: Override la configuration de base.py
# Utiliser dj_database_url.parse() qui gère automatiquement l'URL
if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
            engine='django.contrib.gis.db.backends.postgis',
        )
    }
    # Ajouter sslmode si nécessaire
    if 'sslmode' not in DATABASES['default'].get('OPTIONS', {}):
        DATABASES['default']['OPTIONS'] = DATABASES['default'].get('OPTIONS', {})
        DATABASES['default']['OPTIONS']['sslmode'] = 'require'
else:
    # Fallback si DATABASE_URL n'est pas défini
    DATABASES = {
        'default': {
            'ENGINE': 'django.contrib.gis.db.backends.postgis',
            'NAME': 'commercial_platform_pro',
            'USER': 'commercial_platform_pro_user',
            'PASSWORD': 'cPS9UdVWB53U5ffKCkXXkeWCGp2Y9FWE',
            'HOST': 'dpg-d4big5umcj7s73fh8nq0-a.oregon-postgres.render.com',
            'PORT': '5432',
            'CONN_MAX_AGE': 600,
            'CONN_HEALTH_CHECKS': True,
            'OPTIONS': {
                'sslmode': 'require',
            },
        }
    }

# Static files configuration pour Render
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATIC_URL = '/static/'

# Supprimer STATICFILES_DIRS de base.py - le répertoire static n'existe pas en production
# Override complet pour éviter le warning
if hasattr(globals(), 'STATICFILES_DIRS'):
    del STATICFILES_DIRS
STATICFILES_DIRS = []

# WhiteNoise pour servir les fichiers statiques
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files - utiliser S3 ou stockage local selon configuration
if env('USE_S3', default=False):
    # Configuration S3 pour les médias
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    AWS_STORAGE_BUCKET_NAME = env('AWS_STORAGE_BUCKET_NAME', default='')
    AWS_S3_REGION_NAME = env('AWS_S3_REGION_NAME', default='us-east-1')
else:
    # Stockage local pour les médias
    MEDIA_ROOT = BASE_DIR / 'media'
    MEDIA_URL = '/media/'

# Security settings pour production
SECURE_SSL_REDIRECT = env('SECURE_SSL_REDIRECT', default=True)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# CORS Configuration pour production
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=[])
CORS_ALLOW_CREDENTIALS = True

# Redis Configuration - utiliser l'URL fournie par Render si disponible
REDIS_URL = env('REDIS_URL', default='redis://localhost:6379/0')

# Email Configuration pour production
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = env('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = env('EMAIL_PORT', default=587)
EMAIL_USE_TLS = True
EMAIL_HOST_USER = env('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL', default='noreply@commercial-platform.com')

# Logging pour production
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'apps': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Celery settings pour production
CELERY_TASK_ALWAYS_EAGER = False
CELERY_TASK_EAGER_PROPAGATES = False

