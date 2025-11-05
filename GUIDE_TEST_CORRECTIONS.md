# 🧪 Guide de Test des Corrections de Bugs

## ✅ Bugs Corrigés

### 1. **Stock à 0 lors de la création de produits**
- **Problème** : Même en remplissant les champs de stock, tous les produits avaient 0 stock
- **Solution** : Correction de la logique de mise à jour du stock dans `perform_create()`

### 2. **Images non affichées**
- **Problème** : Les images des produits ne s'affichaient pas
- **Solution** : Ajout d'URLs absolues dans le serializer des images

### 3. **Suppression ne fonctionne pas**
- **Problème** : Impossible de supprimer des produits
- **Solution** : Ajout de `perform_destroy()` avec gestion des permissions et images

### 4. **Modification ne fonctionne pas**
- **Problème** : Impossible de modifier des produits
- **Solution** : Ajout de `perform_update()` et correction du serializer

## 🚀 Comment Tester

### Prérequis
- ✅ Serveur Django démarré sur `http://localhost:8000`
- ✅ Serveur Frontend démarré sur `http://localhost:5173`

### Tests à Effectuer

#### 1. Test de Création de Produit avec Stock
1. Connectez-vous à l'application
2. Allez dans la section "Stock" ou "Produits"
3. Cliquez sur "Ajouter un produit"
4. Remplissez le formulaire avec :
   - Nom du produit
   - Prix d'achat et de vente
   - **Stock initial : 50** (important !)
   - Catégorie et autres champs
5. Ajoutez une image si possible
6. Cliquez sur "Créer"

**Résultat attendu** : Le produit doit être créé avec un stock de 50, pas 0.

#### 2. Test d'Affichage des Images
1. Après création du produit, vérifiez que l'image s'affiche
2. Dans la liste des produits, l'image doit être visible
3. Dans les détails du produit, l'image doit s'afficher correctement

**Résultat attendu** : Les images doivent s'afficher avec des URLs complètes.

#### 3. Test de Suppression
1. Trouvez le produit créé dans la liste
2. Cliquez sur l'icône de suppression (🗑️)
3. Confirmez la suppression

**Résultat attendu** : Le produit doit être supprimé sans erreur.

#### 4. Test de Modification
1. Trouvez un produit existant
2. Cliquez sur l'icône de modification (✏️)
3. Modifiez le nom et le stock
4. Sauvegardez les modifications

**Résultat attendu** : Les modifications doivent être sauvegardées.

## 🔍 Vérifications Techniques

### Dans la Console du Navigateur
Ouvrez les outils de développement (F12) et vérifiez :

1. **Pas d'erreurs de connexion** :
   ```
   ✅ Pas de "ERR_CONNECTION_REFUSED"
   ✅ Pas de "Failed to fetch"
   ```

2. **Requêtes API réussies** :
   ```
   ✅ POST /api/v1/products/products/ → 201 Created
   ✅ PUT /api/v1/products/products/{id}/ → 200 OK
   ✅ DELETE /api/v1/products/products/{id}/ → 204 No Content
   ```

### Dans les Logs du Serveur Django
Vérifiez dans le terminal où Django s'exécute :

1. **Création** :
   ```
   ✅ Stock mis à jour pour [Nom Produit]: 50
   ✅ Image 1 uploadée avec succès pour [Nom Produit]
   ```

2. **Modification** :
   ```
   ✅ Stock mis à jour pour [Nom Produit]: 75
   ✅ Produit mis à jour: [Nom Produit]
   ```

3. **Suppression** :
   ```
   ✅ Image supprimée: [chemin_image]
   ✅ Suppression du produit: [Nom Produit]
   ```

## 🐛 Si des Problèmes Persistent

### Problème : Stock toujours à 0
- Vérifiez que le champ "stock" est bien envoyé dans la requête
- Regardez les logs Django pour voir si le stock est reçu

### Problème : Images ne s'affichent pas
- Vérifiez que les URLs d'images sont complètes (commencent par http://)
- Vérifiez que le dossier `media/` est accessible

### Problème : Suppression/Modification échoue
- Vérifiez les permissions utilisateur
- Regardez les logs Django pour les erreurs de permissions

## 📞 Support

Si vous rencontrez encore des problèmes après ces tests, vérifiez :
1. Que les deux serveurs sont bien démarrés
2. Que vous êtes connecté avec un compte valide
3. Que les logs Django ne montrent pas d'erreurs

Les corrections sont maintenant en place et devraient résoudre tous les bugs mentionnés !
