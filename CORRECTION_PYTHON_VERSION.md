# ⚠️ CORRECTION URGENTE - Python Version

## Problème détecté

Render utilise **Python 3.13** par défaut, mais votre projet nécessite **Python 3.11**.

Les logs montrent :
```
/opt/render/project/src/.venv/lib/python3.13/
```

## Solution immédiate

### Dans l'interface Render :

1. Allez dans votre service backend
2. Cliquez sur l'onglet **"Environment"**
3. Ajoutez cette variable d'environnement :

```
PYTHON_VERSION=3.11.0
```

4. **Redéployez** le service

## Alternative : Mettre à jour Pillow

Si vous voulez utiliser Python 3.13, mettez à jour Pillow dans `requirements/base.txt` :

```txt
Pillow>=10.3.0
```

Mais **il est fortement recommandé d'utiliser Python 3.11.0** car :
- ✅ Toutes vos dépendances sont testées avec Python 3.11
- ✅ Django 4.2.7 supporte officiellement Python 3.11
- ✅ Plus stable pour la production

## Vérification

Après avoir ajouté `PYTHON_VERSION=3.11.0`, les logs devraient montrer :
```
/opt/render/project/src/.venv/lib/python3.11/
```

Au lieu de :
```
/opt/render/project/src/.venv/lib/python3.13/
```

