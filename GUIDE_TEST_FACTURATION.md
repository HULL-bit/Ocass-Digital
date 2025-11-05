# Guide de Test - Système de Facturation

## 🎯 Objectif
Tester le système complet de gestion des ventes et facturation intégré au POS.

## 📋 Prérequis
- Serveur Django démarré (`python manage.py runserver 8000`)
- Frontend démarré (`npm run dev`)
- Utilisateur entrepreneur connecté

## 🧪 Tests à Effectuer

### 1. Test de Création de Vente depuis le POS

#### Étapes :
1. **Accéder au POS**
   - URL: `http://localhost:5174/entrepreneur/pos`
   - Se connecter avec un compte entrepreneur

2. **Ajouter des produits au panier**
   - Rechercher des produits existants
   - Cliquer sur "+" pour ajouter au panier
   - Vérifier que les produits apparaissent dans le panier

3. **Sélectionner un client (optionnel)**
   - Cliquer sur "Sélectionner Client"
   - Créer un nouveau client ou sélectionner un existant

4. **Choisir le mode de paiement**
   - Espèces, Wave Money, Orange Money, etc.

5. **Finaliser la vente**
   - Cliquer sur "Finaliser la Vente"
   - Vérifier que la vente est créée avec succès
   - Noter le numéro de facture généré

#### Résultats Attendus :
- ✅ Vente créée avec numéro de facture unique
- ✅ Stock des produits décrémenté
- ✅ Message de succès avec numéro de facture
- ✅ Panier vidé après la vente

### 2. Test de Consultation des Factures

#### Étapes :
1. **Accéder à la page Facturation**
   - URL: `http://localhost:5174/entrepreneur/billing`
   - Ou cliquer sur "Facturation" dans le menu

2. **Vérifier l'affichage des métriques**
   - CA ce Mois
   - Factures Émises
   - En Attente Paiement
   - Taux de Recouvrement

3. **Consulter la liste des factures**
   - Vérifier que la vente créée apparaît dans la liste
   - Tester la recherche par numéro de facture
   - Tester le filtre par statut

#### Résultats Attendus :
- ✅ Métriques calculées correctement
- ✅ Factures affichées avec toutes les informations
- ✅ Recherche et filtres fonctionnels

### 3. Test de Téléchargement de Facture PDF

#### Étapes :
1. **Cliquer sur le bouton "PDF" d'une facture**
   - Dans la liste des factures
   - Ou dans le modal de détail

2. **Vérifier le téléchargement**
   - Le PDF doit se télécharger automatiquement
   - Ouvrir le PDF pour vérifier le contenu

#### Résultats Attendus :
- ✅ PDF généré et téléchargé
- ✅ Contenu correct : numéro facture, client, articles, totaux
- ✅ Mise en page professionnelle

### 4. Test de Gestion des Statuts

#### Étapes :
1. **Confirmer une vente en attente**
   - Cliquer sur "Confirmer" si statut = pending
   - Vérifier le changement de statut

2. **Annuler une vente**
   - Cliquer sur "Annuler"
   - Saisir une raison d'annulation
   - Vérifier le changement de statut

#### Résultats Attendus :
- ✅ Changement de statut réussi
- ✅ Messages de confirmation appropriés
- ✅ Liste mise à jour automatiquement

### 5. Test de Détail de Facture

#### Étapes :
1. **Cliquer sur une facture dans la liste**
   - Le modal de détail doit s'ouvrir

2. **Vérifier les informations affichées**
   - Informations client
   - Liste des articles
   - Calculs des totaux
   - Informations de paiement

#### Résultats Attendus :
- ✅ Modal s'ouvre correctement
- ✅ Toutes les informations sont affichées
- ✅ Calculs corrects

## 🔧 Tests Techniques Backend

### Test API Direct

```bash
# 1. Lister les ventes
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:8000/api/v1/sales/ventes/"

# 2. Créer une vente de test
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "client": 1,
       "lignes": [
         {
           "produit": 1,
           "quantite": 2,
           "prix_unitaire": 10000,
           "remise_pourcentage": 0
         }
       ],
       "sous_total": 20000,
       "taxe_montant": 3600,
       "total_ttc": 23600,
       "mode_paiement": "cash",
       "statut_paiement": "paid",
       "source_vente": "pos"
     }' \
     "http://localhost:8000/api/v1/sales/ventes/"

# 3. Générer PDF d'une facture
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:8000/api/v1/sales/ventes/1/print_invoice/"
```

## 🐛 Problèmes Potentiels et Solutions

### Problème : Erreur lors de la création de vente
**Solution :**
- Vérifier que les produits existent
- Vérifier les permissions utilisateur
- Consulter les logs Django

### Problème : PDF ne se génère pas
**Solution :**
- Vérifier que reportlab est installé
- Vérifier les permissions de fichier
- Consulter les logs d'erreur

### Problème : Stock non mis à jour
**Solution :**
- Vérifier la méthode `updateProductStock` dans l'API
- Vérifier les permissions de modification des produits

## 📊 Métriques de Succès

- ✅ 100% des ventes créées depuis le POS apparaissent dans la facturation
- ✅ PDF généré pour chaque facture en < 2 secondes
- ✅ Recherche et filtres fonctionnels
- ✅ Gestion des statuts opérationnelle
- ✅ Interface utilisateur intuitive et responsive

## 🎉 Validation Finale

Le système de facturation est validé si :
1. **Création de vente** : Fonctionne depuis le POS
2. **Consultation** : Factures visibles avec métriques correctes
3. **Téléchargement** : PDF généré et téléchargeable
4. **Gestion** : Statuts modifiables (confirmer/annuler)
5. **Interface** : Recherche, filtres et détails fonctionnels

---

**Note :** En cas de problème, consulter les logs du navigateur (F12) et les logs Django pour diagnostiquer les erreurs.
