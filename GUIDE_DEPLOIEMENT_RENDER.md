# Guide de Déploiement sur Render

Ce guide vous explique comment déployer votre projet Commercial Platform sur Render et migrer votre base de données locale vers la base de données Render.

## 📋 Prérequis

- Compte Render (https://render.com)
- PostgreSQL installé localement
- Accès à la base de données locale PostgreSQL
- Les outils `pg_dump` et `pg_restore` installés

## 🗄️ Étape 1: Exporter la Base de Données Locale

Vous avez trois options pour exporter votre base de données locale :

### Option A: Script Python (Recommandé)

```bash
python3 export_and_import_db.py
```

Ce script vous guidera à travers tout le processus d'export et d'import.

### Option B: Script Shell

```bash
./export_local_db.sh
```

Ce script créera deux fichiers :
- `commercial_platform_local_YYYYMMDD_HHMMSS.dump` (format custom, recommandé)
- `commercial_platform_local_YYYYMMDD_HHMMSS.sql` (format SQL)

### Option C: Commande Manuelle

```bash
# Export en format custom (recommandé)
pg_dump --host=localhost \
        --port=5432 \
        --username=postgres \
        --dbname=BaseMeoire \
        --format=custom \
        --no-owner \
        --no-privileges \
        --file=commercial_platform_local.dump

# Export en format SQL (alternative)
pg_dump --host=localhost \
        --port=5432 \
        --username=postgres \
        --dbname=BaseMeoire \
        --format=plain \
        --no-owner \
        --no-privileges \
        --file=commercial_platform_local.sql
```

## 📤 Étape 2: Importer dans Render

### Option A: Script Python

Si vous avez utilisé `export_and_import_db.py`, l'import se fera automatiquement.

### Option B: Script Shell

```bash
./import_to_render.sh commercial_platform_local_YYYYMMDD_HHMMSS.dump
```

### Option C: Commande Manuelle

```bash
# Pour un fichier .dump (format custom)
pg_restore --host=dpg-d4big5umcj7s73fh8nq0-a.oregon-postgres.render.com \
           --port=5432 \
           --username=commercial_platform_pro_user \
           --dbname=commercial_platform_pro \
           --clean \
           --if-exists \
           --no-owner \
           --no-privileges \
           --verbose \
           commercial_platform_local.dump

# Pour un fichier .sql (format SQL)
psql --host=dpg-d4big5umcj7s73fh8nq0-a.oregon-postgres.render.com \
     --port=5432 \
     --username=commercial_platform_pro_user \
     --dbname=commercial_platform_pro \
     --file=commercial_platform_local.sql
```

**Mot de passe Render:** `cPS9UdVWB53U5ffKCkXXkeWCGp2Y9FWE`

## 🚀 Étape 3: Déployer sur Render

### 3.1 Préparer le Repository

Assurez-vous que votre code est poussé sur GitHub/GitLab/Bitbucket.

### 3.2 Créer les Services sur Render

#### A. Service Backend Django

1. Allez sur https://dashboard.render.com
2. Cliquez sur "New +" → "Web Service"
3. Connectez votre repository
4. Configurez le service :
   - **Name:** `commercial-platform-backend`
   - **Environment:** `Python 3`
   - **Build Command:**
     ```bash
     cd backend && pip install --upgrade pip && pip install -r requirements/base.txt && pip install dj-database-url && python manage.py collectstatic --noinput && python manage.py migrate --noinput
     ```
   - **Start Command:**
     ```bash
     cd backend && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 4 --timeout 120
     ```
   - **Health Check Path:** `/api/v1/core/health/`

5. Ajoutez les variables d'environnement :
   ```
   DJANGO_SETTINGS_MODULE=config.settings.production
   DATABASE_URL=postgresql://commercial_platform_pro_user:cPS9UdVWB53U5ffKCkXXkeWCGp2Y9FWE@dpg-d4big5umcj7s73fh8nq0-a.oregon-postgres.render.com/commercial_platform_pro
   SECRET_KEY=<généré automatiquement ou défini manuellement>
   DEBUG=False
   ALLOWED_HOSTS=commercial-platform-backend.onrender.com,localhost,127.0.0.1
   CORS_ALLOWED_ORIGINS=https://commercial-platform-frontend.onrender.com,http://localhost:5173
   ```

#### B. Service Frontend React

1. Cliquez sur "New +" → "Static Site"
2. Connectez votre repository
3. Configurez le service :
   - **Name:** `commercial-platform-frontend`
   - **Build Command:**
     ```bash
     npm install && npm run build
     ```
   - **Publish Directory:** `dist`
   - **Environment Variables:**
     ```
     VITE_API_URL=https://commercial-platform-backend.onrender.com
     ```

#### C. Service Redis (Optionnel)

1. Cliquez sur "New +" → "Redis"
2. Configurez :
   - **Name:** `commercial-platform-redis`
   - **Plan:** Free (ou supérieur selon vos besoins)

### 3.3 Utiliser render.yaml (Alternative)

Vous pouvez aussi utiliser le fichier `render.yaml` fourni pour déployer automatiquement tous les services :

1. Dans votre repository, le fichier `render.yaml` est déjà configuré
2. Sur Render, créez un "Blueprint" et connectez votre repository
3. Render détectera automatiquement le fichier `render.yaml` et créera tous les services

## 🔧 Configuration Post-Déploiement

### Vérifier la Base de Données

Une fois déployé, vérifiez que les données sont bien présentes :

```bash
# Se connecter à la base Render
psql postgresql://commercial_platform_pro_user:cPS9UdVWB53U5ffKCkXXkeWCGp2Y9FWE@dpg-d4big5umcj7s73fh8nq0-a.oregon-postgres.render.com/commercial_platform_pro

# Vérifier les tables
\dt

# Compter les enregistrements
SELECT COUNT(*) FROM users_utilisateurpersonnalise;
SELECT COUNT(*) FROM products_produit;
```

### Créer un Superutilisateur

Si nécessaire, créez un superutilisateur Django :

```bash
# Via le shell Render
cd backend && python manage.py createsuperuser
```

Ou via le service Render :
1. Allez dans votre service backend
2. Cliquez sur "Shell"
3. Exécutez : `python manage.py createsuperuser`

## 🔐 Variables d'Environnement Importantes

### Backend

- `DJANGO_SETTINGS_MODULE`: `config.settings.production`
- `DATABASE_URL`: URL complète de la base de données Render
- `SECRET_KEY`: Clé secrète Django (générée automatiquement par Render)
- `DEBUG`: `False` en production
- `ALLOWED_HOSTS`: Domaines autorisés
- `CORS_ALLOWED_ORIGINS`: Origines autorisées pour CORS

### Frontend

- `VITE_API_URL`: URL de l'API backend

## 📝 Notes Importantes

1. **PostGIS**: La base de données Render doit avoir l'extension PostGIS activée. Si ce n'est pas le cas, contactez le support Render.

2. **Migrations**: Les migrations sont exécutées automatiquement lors du build grâce à la commande dans `render.yaml`.

3. **Fichiers Statiques**: Les fichiers statiques sont servis par WhiteNoise. Assurez-vous que `collectstatic` s'exécute correctement.

4. **Médias**: Pour les fichiers médias (images, etc.), vous devrez soit :
   - Utiliser un service de stockage cloud (AWS S3, Cloudinary, etc.)
   - Configurer un service de stockage sur Render

5. **Redis**: Si vous utilisez Redis, assurez-vous que l'URL Redis est correctement configurée dans les variables d'environnement.

## 🐛 Dépannage

### Erreur de connexion à la base de données

- Vérifiez que l'URL de la base de données est correcte
- Vérifiez que le mot de passe est correct
- Vérifiez que la base de données Render est active

### Erreur lors de l'import

- Vérifiez que le fichier dump est valide
- Vérifiez que vous avez les permissions nécessaires
- Essayez d'importer en plusieurs étapes (schéma d'abord, puis données)

### Erreur de build

- Vérifiez les logs de build sur Render
- Vérifiez que toutes les dépendances sont dans `requirements/base.txt`
- Vérifiez que les chemins dans les commandes sont corrects

## 📞 Support

Pour toute question ou problème :
1. Consultez les logs sur Render Dashboard
2. Vérifiez la documentation Render : https://render.com/docs
3. Contactez le support Render si nécessaire

## ✅ Checklist de Déploiement

- [ ] Base de données locale exportée
- [ ] Base de données Render créée et accessible
- [ ] Données importées dans Render
- [ ] Service backend créé et configuré
- [ ] Service frontend créé et configuré
- [ ] Variables d'environnement configurées
- [ ] Migrations exécutées
- [ ] Superutilisateur créé (si nécessaire)
- [ ] Health check fonctionne
- [ ] Application accessible publiquement

---

**Bon déploiement ! 🚀**

