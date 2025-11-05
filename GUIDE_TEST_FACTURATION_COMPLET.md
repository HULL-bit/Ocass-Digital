# Guide de Test du Système de Facturation

## 🎯 Objectif
Tester le système de facturation complet : création de ventes, affichage des métriques, et génération de PDF.

## 🚀 Étapes de Test

### 1. Créer des Ventes via le POS
1. Connectez-vous en tant qu'entrepreneur (ex: `fatou@pharmaciemoderne.sn` / `password`)
2. Allez dans **POS (Point de Vente)**
3. Ajoutez des produits au panier
4. Effectuez plusieurs ventes avec différents modes de paiement :
   - Espèces
   - Carte
   - Mobile Money
   - Virement

### 2. Vérifier les Métriques de Facturation
1. Allez dans **Facturation**
2. Vérifiez que les métriques s'affichent correctement :
   - CA ce Mois
   - Factures Émises
   - En Attente Paiement
   - Taux de Recouvrement

### 3. Tester la Génération de PDF
1. Dans la liste des factures, cliquez sur **PDF** pour une facture
2. Vérifiez que le PDF se télécharge correctement
3. Ouvrez le PDF et vérifiez le contenu :
   - Informations de l'entreprise
   - Informations du client
   - Détails des articles
   - Totaux et TVA
   - Informations de paiement

### 4. Tester les Actions sur les Factures
1. **Confirmer** une vente en attente
2. **Annuler** une vente (avec raison)
3. Vérifier que les statuts se mettent à jour

## 🔧 Scripts de Test Disponibles

### Créer des Ventes de Test (si nécessaire)
```bash
# Depuis le répertoire racine du projet
python create_simple_sales.py
```

### Script Backend (si le terminal fonctionne)
```bash
cd backend
python create_test_sales.py
```

## 🐛 Debug et Logs

### Console du Navigateur
Ouvrez la console (F12) et vérifiez les logs :
- `Chargement des ventes...`
- `Ventes chargées:` (avec les données)
- `🧮 Calcul des métriques avec X ventes`
- `💰 Métriques calculées:` (avec les valeurs)

### Logs Backend
Dans le terminal Django, vérifiez :
- Les requêtes API vers `/sales/ventes/`
- Les erreurs éventuelles

## ✅ Résultats Attendus

### Métriques Dynamiques
- Les métriques doivent se mettre à jour automatiquement
- Le CA doit correspondre aux ventes du mois
- Le nombre de factures doit correspondre aux ventes créées

### Liste des Factures
- Affichage de toutes les ventes créées
- Filtrage par statut fonctionnel
- Recherche par numéro de facture ou client

### Génération PDF
- Téléchargement automatique du PDF
- Contenu complet et formaté
- Informations correctes

## 🚨 Problèmes Courants

### Pas de Ventes Affichées
1. Vérifiez que vous êtes connecté avec le bon entrepreneur
2. Créez des ventes via le POS
3. Actualisez la page de facturation

### Métriques à Zéro
1. Vérifiez que les ventes sont du mois en cours
2. Vérifiez les logs de calcul des métriques
3. Créez des ventes récentes

### Erreur PDF
1. Vérifiez que `reportlab` est installé
2. Vérifiez les logs backend
3. Testez avec une vente simple

## 📊 Données de Test Recommandées

### Ventes à Créer
- 2-3 ventes payées (espèces/carte)
- 1-2 ventes en attente (virement)
- Différents montants (1000-5000 XOF)
- Différents clients

### Vérifications
- Total des ventes = somme des métriques
- Statuts cohérents
- PDFs téléchargeables
- Actions fonctionnelles

## 🎉 Succès
Le système est fonctionnel quand :
- ✅ Les métriques s'affichent correctement
- ✅ Les factures sont listées
- ✅ Les PDFs se génèrent
- ✅ Les actions fonctionnent
- ✅ Les données sont cohérentes
