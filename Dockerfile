# Dockerfile pour le backend Django
FROM python:3.11-slim

# Variables d'environnement
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive

# Installer les dépendances système nécessaires pour PostGIS
RUN apt-get update && apt-get install -y \
    postgresql-client \
    libpq-dev \
    gcc \
    gdal-bin \
    libgdal-dev \
    python3-gdal \
    gettext \
    && rm -rf /var/lib/apt/lists/*

# Définir le répertoire de travail
WORKDIR /app

# Copier et installer les dépendances Python
COPY backend/requirements/ /app/requirements/
RUN pip install --upgrade pip && \
    pip install -r requirements/base.txt && \
    pip install dj-database-url gunicorn

# Copier le code de l'application
COPY backend/ /app/

# Créer les répertoires nécessaires
RUN mkdir -p /app/staticfiles /app/media

# Collecter les fichiers statiques
RUN python manage.py collectstatic --noinput || true

# Exposer le port
EXPOSE 8000

# Commande de démarrage
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4", "--timeout", "120"]

