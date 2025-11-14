"""
Production settings for commercial_platform project.
Configuration pour déploiement sur Render.
"""
import os
import sys
import dj_database_url

# Debug: Afficher quel module de settings est chargé
print("=" * 70)
print("[PRODUCTION] Loading production.py settings module")
print(f"[PRODUCTION] DJANGO_SETTINGS_MODULE: {os.environ.get('DJANGO_SETTINGS_MODULE', 'NOT SET')}")
print("=" * 70)

# Importer base.py mais on va override DATABASES
from .base import *

# FORCER l'override de DATABASES IMMÉDIATEMENT après l'import
# Cela garantit que notre configuration est utilisée

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env('DEBUG', default=False)

# Allowed hosts - Render fournit automatiquement le domaine
# FORCER l'ajout du domaine même si ALLOWED_HOSTS est défini dans l'environnement
default_hosts = [
    'localhost',
    '127.0.0.1',
    'ocass-digital.onrender.com',
    '.render.com',
    '*',
]

# Récupérer depuis l'environnement si défini, sinon utiliser les defaults
env_hosts = os.environ.get('ALLOWED_HOSTS', '')
if env_hosts:
    # Combiner les hosts de l'environnement avec les defaults
    env_hosts_list = [h.strip() for h in env_hosts.split(',') if h.strip()]
    ALLOWED_HOSTS = list(set(default_hosts + env_hosts_list))
else:
    ALLOWED_HOSTS = default_hosts

# S'assurer que ocass-digital.onrender.com est toujours présent
if 'ocass-digital.onrender.com' not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append('ocass-digital.onrender.com')

print(f"[PRODUCTION] ALLOWED_HOSTS: {ALLOWED_HOSTS}")

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
# FORCER l'override COMPLET de la configuration de base.py
# Supprimer complètement l'ancienne config et créer une nouvelle
print("[PRODUCTION] Overriding DATABASES configuration...")

# Configuration par défaut (fallback)
default_db_config = {
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

# Essayer d'utiliser DATABASE_URL si disponible
if DATABASE_URL and 'localhost' not in DATABASE_URL and '127.0.0.1' not in DATABASE_URL:
    try:
        parsed_db = dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
            engine='django.contrib.gis.db.backends.postgis',
        )
        # S'assurer que sslmode est défini
        if 'OPTIONS' not in parsed_db:
            parsed_db['OPTIONS'] = {}
        if 'sslmode' not in parsed_db['OPTIONS']:
            parsed_db['OPTIONS']['sslmode'] = 'require'
        DATABASES = {'default': parsed_db}
        print(f"[PRODUCTION] ✓ Using DATABASE_URL from environment")
        print(f"[PRODUCTION] Database host: {parsed_db.get('HOST', 'N/A')}")
    except Exception as e:
        print(f"[PRODUCTION] ✗ Error parsing DATABASE_URL: {e}")
        print(f"[PRODUCTION] → Using hardcoded fallback configuration")
        DATABASES = {'default': default_db_config}
        print(f"[PRODUCTION] Database host: {default_db_config['HOST']}")
else:
    print(f"[PRODUCTION] DATABASE_URL not set or contains localhost")
    print(f"[PRODUCTION] → Using hardcoded fallback configuration")
    DATABASES = {'default': default_db_config}
    print(f"[PRODUCTION] Database host: {default_db_config['HOST']}")

# Vérification finale
if DATABASES['default'].get('HOST') == 'localhost' or DATABASES['default'].get('HOST') == '127.0.0.1':
    print("[PRODUCTION] ⚠️ WARNING: Still using localhost! Forcing correct host...")
    DATABASES['default']['HOST'] = 'dpg-d4big5umcj7s73fh8nq0-a.oregon-postgres.render.com'
    DATABASES['default']['NAME'] = 'commercial_platform_pro'
    DATABASES['default']['USER'] = 'commercial_platform_pro_user'
    DATABASES['default']['PASSWORD'] = 'cPS9UdVWB53U5ffKCkXXkeWCGp2Y9FWE'
    DATABASES['default']['PORT'] = '5432'
    if 'OPTIONS' not in DATABASES['default']:
        DATABASES['default']['OPTIONS'] = {}
    DATABASES['default']['OPTIONS']['sslmode'] = 'require'

print(f"[PRODUCTION] Final database config - HOST: {DATABASES['default'].get('HOST')}")
print(f"[PRODUCTION] Final database config - NAME: {DATABASES['default'].get('NAME')}")

# Static files configuration pour Render
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATIC_URL = '/static/'

# Supprimer STATICFILES_DIRS de base.py - le répertoire static n'existe pas en production
# Override complet pour éviter le warning W004
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
# IMPORTANT: Le middleware CORS doit être en première position dans MIDDLEWARE
# (déjà fait dans base.py)

# Récupérer depuis l'environnement
env_cors_origins = env.list('CORS_ALLOWED_ORIGINS', default=[])

# Ajouter les origines par défaut pour Render
default_cors_origins = [
    'https://ocass-digital-j97l.onrender.com',
    'https://commercial-platform-frontend.onrender.com',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
]

# Combiner les origines de l'environnement avec les defaults
CORS_ALLOWED_ORIGINS = list(set(env_cors_origins + default_cors_origins))

# Permettre aussi tous les sous-domaines Render (pour flexibilité)
# Cette regex permet tous les domaines *.onrender.com
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.onrender\.com$",
]

CORS_ALLOW_CREDENTIALS = True

# Headers CORS supplémentaires - DOIT inclure tous les headers utilisés
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'access-control-request-method',
    'access-control-request-headers',
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# Exposer les headers CORS dans la réponse
CORS_EXPOSE_HEADERS = [
    'content-type',
    'authorization',
]

# Préflight cache (en secondes) - 24 heures
CORS_PREFLIGHT_MAX_AGE = 86400

# Debug: Afficher les origines CORS configurées
print("=" * 70)
print("[PRODUCTION] CORS Configuration:")
print(f"[PRODUCTION] CORS_ALLOWED_ORIGINS: {CORS_ALLOWED_ORIGINS}")
print(f"[PRODUCTION] CORS_ALLOWED_ORIGIN_REGEXES: {CORS_ALLOWED_ORIGIN_REGEXES}")
print(f"[PRODUCTION] CORS_ALLOW_CREDENTIALS: {CORS_ALLOW_CREDENTIALS}")
print(f"[PRODUCTION] CORS_ALLOW_METHODS: {CORS_ALLOW_METHODS}")
print("=" * 70)

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

