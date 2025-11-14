# Configuration Backend Django sur Render

## 📋 Configuration dans l'interface Render

### Paramètres de base
- **Name:** `commercial-platform-backend`
- **Language:** `Python 3`
- **Branch:** `main` (ou votre branche principale)
- **Region:** `Oregon (US West)` (ou la région de votre base de données)
- **Root Directory:** `backend`

### Build Command (Minimal et fonctionnel)
```bash
cd backend && pip install --upgrade pip setuptools wheel && pip install -r requirements/base.txt && pip install dj-database-url && python manage.py collectstatic --noinput && python manage.py migrate --noinput --fake-initial
```

**Notes importantes :**
- `setuptools wheel` : Nécessaire pour compiler certains packages (Pillow)
- `requirements/base.txt` uniquement : Pas besoin de `development.txt` en production
- `--fake-initial` : Ignore les migrations initiales si les tables existent déjà (après import de données)

**Note :** Ajout de `setuptools wheel` pour résoudre les problèmes de compilation de packages comme Pillow.

**Explication:**
- Met à jour pip
- Installe les dépendances depuis `requirements/base.txt`
- Installe `dj-database-url` pour parser l'URL de la base de données
- Collecte les fichiers statiques
- Exécute les migrations

### Start Command (Minimal et fonctionnel)
```bash
cd backend && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120
```

**Notes :**
- `cd backend` : Nécessaire si Root Directory n'est pas défini
- `workers 2` : Minimum pour production (augmentez selon votre plan Render)
- `timeout 120` : Timeout de 120 secondes pour les requêtes longues

**Explication:**
- `config.wsgi:application` - Point d'entrée WSGI (pas `your_application.wsgi`)
- `--bind 0.0.0.0:$PORT` - Écoute sur le port fourni par Render
- `--workers 4` - Nombre de workers (ajustez selon votre plan)
- `--timeout 120` - Timeout de 120 secondes

## 🔐 Variables d'Environnement

Ajoutez ces variables d'environnement dans l'interface Render :

### Obligatoires
```
PYTHON_VERSION=3.11.0
DJANGO_SETTINGS_MODULE=config.settings.production
DATABASE_URL=postgresql://commercial_platform_pro_user:cPS9UdVWB53U5ffKCkXXkeWCGp2Y9FWE@dpg-d4big5umcj7s73fh8nq0-a.oregon-postgres.render.com/commercial_platform_pro
SECRET_KEY=<généré automatiquement par Render ou défini manuellement>
DEBUG=False
```

**⚠️ CRITIQUE :** `PYTHON_VERSION=3.11.0` doit être la PREMIÈRE variable définie pour éviter que Render utilise Python 3.13 par défaut.

### Recommandées
```
PYTHON_VERSION=3.11.0
ALLOWED_HOSTS=commercial-platform-backend.onrender.com,localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=https://commercial-platform-frontend.onrender.com,http://localhost:5173
```

**⚠️ IMPORTANT :** Spécifiez `PYTHON_VERSION=3.11.0` dans les variables d'environnement pour éviter les problèmes de compatibilité avec Python 3.13.

### Optionnelles (selon vos besoins)
```
REDIS_URL=<url_redis_si_utilisé>
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=<votre_email>
EMAIL_HOST_PASSWORD=<votre_mot_de_passe>
AWS_ACCESS_KEY_ID=<si_utilisation_s3>
AWS_SECRET_ACCESS_KEY=<si_utilisation_s3>
AWS_STORAGE_BUCKET_NAME=<si_utilisation_s3>
```

## 📝 Étapes de Déploiement

1. **Créer le service Web**
   - Allez sur https://dashboard.render.com
   - Cliquez sur "New +" → "Web Service"
   - Connectez votre repository GitHub/GitLab

2. **Configurer les paramètres**
   - Utilisez les valeurs ci-dessus

3. **Ajouter les variables d'environnement**
   - Dans l'onglet "Environment"
   - Ajoutez toutes les variables listées ci-dessus

4. **Déployer**
   - Cliquez sur "Create Web Service"
   - Render va automatiquement :
     - Cloner votre repository
     - Exécuter le Build Command
     - Démarrer l'application avec le Start Command

## 🔍 Vérification

Une fois déployé, vérifiez :
- Health check : `https://votre-service.onrender.com/api/v1/core/health/`
- Admin Django : `https://votre-service.onrender.com/admin/`
- API Docs : `https://votre-service.onrender.com/api/docs/`

## ⚠️ Notes Importantes

1. **SECRET_KEY** : Si vous ne la générez pas automatiquement, créez-en une avec :
   ```python
   python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
   ```

2. **ALLOWED_HOSTS** : Remplacez `commercial-platform-backend.onrender.com` par l'URL réelle de votre service Render

3. **CORS_ALLOWED_ORIGINS** : Ajoutez l'URL de votre frontend une fois déployé

4. **Fichiers statiques** : Sont servis par WhiteNoise automatiquement

5. **Médias** : Pour les fichiers médias, vous devrez configurer S3 ou un autre service de stockage

## 🐛 Dépannage

### Erreur de build
- Vérifiez que `requirements/base.txt` existe
- Vérifiez les logs de build dans Render

### Erreur de connexion à la base de données
- Vérifiez que `DATABASE_URL` est correcte
- Vérifiez que la base de données Render est active

### Erreur 500
- Vérifiez les logs dans Render Dashboard
- Vérifiez que `SECRET_KEY` est défini
- Vérifiez que `DEBUG=False` en production

