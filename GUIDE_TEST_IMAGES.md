# Guide de Test - Gestion des Images de Produits

## 🎯 Objectif
Tester la gestion des images lors de la création et modification des produits.

## 📋 Prérequis
- Serveur Django démarré (`python manage.py runserver 8000`)
- Frontend démarré (`npm run dev`)
- Utilisateur entrepreneur connecté
- Images de test disponibles (JPG, PNG)

## 🧪 Tests à Effectuer

### 1. Test de Création de Produit avec Images

#### Étapes :
1. **Accéder à la page Stock**
   - URL: `http://localhost:5174/entrepreneur/stock`
   - Se connecter avec un compte entrepreneur

2. **Créer un nouveau produit**
   - Cliquer sur "Ajouter un Produit"
   - Remplir les champs obligatoires :
     - Nom du produit
     - Description courte
     - Prix d'achat
     - Prix de vente
     - Stock initial
     - Catégorie
     - SKU

3. **Ajouter des images**
   - Dans la section "Images du produit"
   - Cliquer sur "Sélectionner des images"
   - Choisir 2-3 images (JPG/PNG)
   - Vérifier que les images s'affichent en aperçu

4. **Sauvegarder le produit**
   - Cliquer sur "Ajouter le produit"
   - Vérifier le message de succès

#### Résultats Attendus :
- ✅ Images affichées en aperçu dans le formulaire
- ✅ Produit créé avec succès
- ✅ Images visibles dans la liste des produits
- ✅ Images accessibles via l'URL complète

### 2. Test de Modification de Produit avec Nouvelles Images

#### Étapes :
1. **Modifier un produit existant**
   - Dans la liste des produits, cliquer sur "Modifier"
   - Vérifier que les images existantes s'affichent

2. **Ajouter de nouvelles images**
   - Dans la section images, ajouter 1-2 nouvelles images
   - Vérifier que les nouvelles images s'affichent en aperçu

3. **Sauvegarder les modifications**
   - Cliquer sur "Modifier le produit"
   - Vérifier le message de succès

#### Résultats Attendus :
- ✅ Images existantes conservées
- ✅ Nouvelles images ajoutées
- ✅ Toutes les images visibles dans la liste

### 3. Test de Validation des Images

#### Étapes :
1. **Tester les formats non supportés**
   - Essayer d'uploader un fichier PDF
   - Essayer d'uploader un fichier .txt
   - Vérifier les messages d'erreur

2. **Tester les fichiers trop volumineux**
   - Essayer d'uploader une image > 5MB
   - Vérifier le message d'erreur

3. **Tester la limite d'images**
   - Essayer d'ajouter plus de 5 images
   - Vérifier que seules les 5 premières sont acceptées

#### Résultats Attendus :
- ✅ Messages d'erreur appropriés pour les formats non supportés
- ✅ Limitation de taille respectée
- ✅ Limite de 5 images respectée

### 4. Test d'Affichage des Images

#### Étapes :
1. **Vérifier l'affichage dans la liste**
   - Les images doivent s'afficher dans les cartes produits
   - Images avec fallback si erreur de chargement

2. **Vérifier l'affichage dans le POS**
   - Aller sur `http://localhost:5174/entrepreneur/pos`
   - Vérifier que les images s'affichent correctement

3. **Vérifier les URLs des images**
   - Les URLs doivent être complètes (avec domaine)
   - Images accessibles directement

#### Résultats Attendus :
- ✅ Images affichées dans toutes les interfaces
- ✅ URLs complètes et fonctionnelles
- ✅ Fallback en cas d'erreur de chargement

## 🔧 Tests Techniques Backend

### Test API Direct

```bash
# 1. Créer un produit avec images
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "nom=Produit Test Images" \
     -F "description_courte=Test avec images" \
     -F "prix_achat=1000" \
     -F "prix_vente=1500" \
     -F "stock=10" \
     -F "sku=TEST-IMG-001" \
     -F "categorie=7e825032-588c-49c5-84db-5677b4721800" \
     -F "marque=c2cab192-96d3-4279-afef-d1b80e86144e" \
     -F "images=@/path/to/image1.jpg" \
     -F "images=@/path/to/image2.jpg" \
     "http://localhost:8000/api/v1/products/products/"

# 2. Modifier un produit avec nouvelles images
curl -X PUT \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "nom=Produit Test Images Modifié" \
     -F "images=@/path/to/new_image.jpg" \
     "http://localhost:8000/api/v1/products/products/PRODUCT_ID/"

# 3. Vérifier les images d'un produit
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:8000/api/v1/products/products/PRODUCT_ID/"
```

## 🐛 Problèmes Potentiels et Solutions

### Problème : Images ne s'affichent pas
**Solutions :**
- Vérifier que `MEDIA_URL` et `MEDIA_ROOT` sont correctement configurés
- Vérifier les permissions des fichiers
- Consulter les logs Django pour les erreurs

### Problème : Erreur lors de l'upload
**Solutions :**
- Vérifier la taille des fichiers (max 5MB)
- Vérifier les formats supportés (JPG, PNG)
- Vérifier les permissions utilisateur

### Problème : Images corrompues
**Solutions :**
- Vérifier l'intégrité des fichiers source
- Tester avec d'autres images
- Vérifier l'espace disque disponible

## 📊 Métriques de Succès

- ✅ 100% des images uploadées s'affichent correctement
- ✅ Validation des formats et tailles fonctionnelle
- ✅ Limite de 5 images respectée
- ✅ Images accessibles via URLs complètes
- ✅ Fallback en cas d'erreur de chargement

## 🎉 Validation Finale

Le système de gestion des images est validé si :
1. **Création** : Images uploadées et affichées lors de la création
2. **Modification** : Nouvelles images ajoutées sans perdre les existantes
3. **Validation** : Formats et tailles correctement validés
4. **Affichage** : Images visibles dans toutes les interfaces
5. **Performance** : Upload et affichage rapides

---

**Note :** En cas de problème, consulter les logs du navigateur (F12) et les logs Django pour diagnostiquer les erreurs.
