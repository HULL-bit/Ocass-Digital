# Guide de Test - Données de Facturation

## 🎯 Objectif
Vérifier que les métriques de facturation affichent les vraies données au lieu des valeurs statiques.

## 📋 Prérequis
- Serveur Django démarré (`python manage.py runserver 8000`)
- Frontend démarré (`npm run dev`)
- Utilisateur entrepreneur connecté
- Au moins une vente créée depuis le POS

## 🧪 Tests à Effectuer

### 1. Test de Chargement des Données

#### Étapes :
1. **Ouvrir la console du navigateur**
   - F12 → Console
   - Vider la console (Clear)

2. **Accéder à la page Facturation**
   - URL: `http://localhost:5174/entrepreneur/billing`
   - Observer les logs dans la console

3. **Vérifier les logs**
   - Chercher "Chargement des ventes..."
   - Chercher "Ventes chargées:"
   - Chercher "📋 Données des ventes:"
   - Chercher "📊 Calcul des métriques:"

#### Résultats Attendus :
- ✅ Logs de chargement visibles
- ✅ Données des ventes affichées
- ✅ Métriques calculées correctement

### 2. Test des Métriques

#### Étapes :
1. **Vérifier le CA ce Mois**
   - Doit correspondre à la somme des ventes du mois
   - Format : "X,XXX,XXX XOF"

2. **Vérifier les Factures Émises**
   - Doit correspondre au nombre de ventes du mois
   - Format : nombre entier

3. **Vérifier En Attente Paiement**
   - Doit correspondre aux ventes avec statut "pending"
   - Format : nombre entier

4. **Vérifier le Taux de Recouvrement**
   - Doit être calculé : (ventes payées / total ventes) * 100
   - Format : "XX.X%"

#### Résultats Attendus :
- ✅ Métriques cohérentes avec les données
- ✅ Formats corrects
- ✅ Calculs précis

### 3. Test de Création de Vente

#### Étapes :
1. **Créer une vente depuis le POS**
   - Aller sur `http://localhost:5174/entrepreneur/pos`
   - Ajouter des produits au panier
   - Finaliser la vente

2. **Retourner à la facturation**
   - Aller sur `http://localhost:5174/entrepreneur/billing`
   - Cliquer sur "Actualiser"

3. **Vérifier la mise à jour**
   - Les métriques doivent se mettre à jour
   - La nouvelle vente doit apparaître dans la liste

#### Résultats Attendus :
- ✅ Métriques mises à jour automatiquement
- ✅ Nouvelle vente visible dans la liste
- ✅ Calculs recalculés correctement

## 🔧 Tests Techniques

### Test API Direct

```bash
# 1. Vérifier les ventes
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:8000/api/v1/sales/ventes/"

# 2. Vérifier une vente spécifique
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:8000/api/v1/sales/ventes/1/"

# 3. Créer une vente de test
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "client": 1,
       "lignes": [
         {
           "produit": 1,
           "quantite": 1,
           "prix_unitaire": 10000,
           "remise_pourcentage": 0
         }
       ],
       "sous_total": 10000,
       "taxe_montant": 1800,
       "total_ttc": 11800,
       "mode_paiement": "cash",
       "statut_paiement": "paid",
       "source_vente": "pos"
     }' \
     "http://localhost:8000/api/v1/sales/ventes/"
```

## 🐛 Problèmes Potentiels et Solutions

### Problème : Métriques à 0
**Solutions :**
- Vérifier que des ventes existent dans la base
- Vérifier les permissions utilisateur
- Consulter les logs de l'API

### Problème : Données ne se chargent pas
**Solutions :**
- Vérifier la connexion à l'API
- Vérifier les tokens d'authentification
- Consulter les logs du navigateur

### Problème : Calculs incorrects
**Solutions :**
- Vérifier les formats de dates
- Vérifier les champs utilisés pour les calculs
- Consulter les logs de débogage

## 📊 Métriques de Succès

- ✅ Données chargées depuis l'API
- ✅ Métriques calculées correctement
- ✅ Formats d'affichage appropriés
- ✅ Mise à jour en temps réel
- ✅ Cohérence entre les données

## 🎉 Validation Finale

Le système de facturation est validé si :
1. **Chargement** : Données récupérées depuis l'API
2. **Calculs** : Métriques calculées correctement
3. **Affichage** : Formats appropriés (devise, pourcentage)
4. **Temps réel** : Mise à jour automatique
5. **Cohérence** : Données cohérentes entre les vues

---

**Note :** En cas de problème, consulter les logs du navigateur (F12) et les logs Django pour diagnostiquer les erreurs.
