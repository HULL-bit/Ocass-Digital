#!/usr/bin/env python3
"""
Script final pour corriger le stock des produits et résoudre les problèmes d'affichage
"""

import os
import sys
import django
import random

# Configuration Django
sys.path.append('/home/suleimaan/Téléchargements/Mm/project/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.products.models import Produit
from apps.inventory.models import Stock, Entrepot
from apps.companies.models import Entreprise
from apps.core.models import Adresse

def create_warehouse_if_needed(entreprise):
    """Crée un entrepôt pour l'entreprise si nécessaire"""
    entrepot, created = Entrepot.objects.get_or_create(
        entreprise=entreprise,
        code='PRINCIPAL',
        defaults={
            'nom': f'Entrepôt principal - {entreprise.nom}',
            'description': 'Entrepôt principal de l\'entreprise',
            'principal': True,
            'actif': True
        }
    )
    
    if created:
        print(f"  ✅ Entrepôt créé: {entrepot.nom}")
    else:
        print(f"  📦 Entrepôt existant: {entrepot.nom}")
    
    return entrepot

def fix_product_stock():
    """Corrige le stock des produits en créant des entrées Stock correctes"""
    print("📦 Correction du stock des produits via le modèle Stock...")
    
    produits = Produit.objects.all()
    print(f"📦 Nombre de produits à traiter: {produits.count()}")
    
    if produits.count() == 0:
        print("❌ Aucun produit trouvé. Créez d'abord des produits.")
        return
    
    updated_count = 0
    
    for produit in produits:
        try:
            # Supprimer les anciens stocks pour ce produit
            Stock.objects.filter(produit=produit).delete()
            
            # Récupérer ou créer un entrepôt pour l'entreprise du produit
            entreprise = produit.entreprise
            entrepot = create_warehouse_if_needed(entreprise)
            
            # Générer un stock aléatoire entre 10 et 500
            nouveau_stock = random.randint(10, 500)
            
            # Créer une entrée Stock avec les bons champs
            stock = Stock.objects.create(
                produit=produit,
                entrepot=entrepot,
                quantite_physique=nouveau_stock,
                quantite_reservee=0,
                quantite_en_commande=0,
                cout_unitaire_moyen=float(produit.prix_achat) if produit.prix_achat else 0,
                emplacement=f"A{random.randint(1,10)}-{random.randint(1,20)}",
                zone=random.choice(['A', 'B', 'C']),
                allee=str(random.randint(1, 10)),
                etagere=str(random.randint(1, 5))
            )
            
            # Mettre à jour le statut du produit selon le stock
            if nouveau_stock > (produit.stock_minimum or 5):
                produit.statut = 'actif'
            elif nouveau_stock > 0:
                produit.statut = 'stock_faible'
            else:
                produit.statut = 'rupture'
            
            # Mettre à jour les champs de stock du produit
            produit.stock_actuel = nouveau_stock
            produit.stock_disponible = nouveau_stock
            produit.save()
            
            print(f"  ✅ Stock créé pour {produit.nom}: {nouveau_stock} unités")
            updated_count += 1
            
        except Exception as e:
            print(f"❌ Erreur lors de la mise à jour de {produit.nom}: {e}")
    
    print(f"✅ {updated_count} produits mis à jour avec du stock")

def fix_product_visibility():
    """Corrige la visibilité des produits pour qu'ils s'affichent correctement"""
    print("👁️ Correction de la visibilité des produits...")
    
    produits = Produit.objects.all()
    updated_count = 0
    
    for produit in produits:
        try:
            # S'assurer que les produits sont visibles et vendables
            produit.visible_catalogue = True
            produit.vendable = True
            produit.achetable = True
            produit.statut = 'actif'
            produit.save()
            
            updated_count += 1
            
        except Exception as e:
            print(f"❌ Erreur lors de la mise à jour de {produit.nom}: {e}")
    
    print(f"✅ {updated_count} produits mis à jour pour la visibilité")

def check_stock_status():
    """Vérifie l'état final du stock"""
    print("🔍 Vérification de l'état final du stock...")
    
    produits = Produit.objects.all()
    print(f"📦 Nombre total de produits: {produits.count()}")
    
    # Calculer les métriques
    total_value = 0
    active_products = 0
    out_of_stock = 0
    low_stock = 0
    
    for produit in produits:
        # Calculer le stock total pour ce produit
        stocks = Stock.objects.filter(produit=produit)
        stock_total = sum(stock.quantite_physique for stock in stocks)
        
        # Valeur du stock (prix d'achat * quantité)
        prix_achat = float(produit.prix_achat) if produit.prix_achat else 0
        valeur_stock = prix_achat * stock_total
        total_value += valeur_stock
        
        # Déterminer le statut
        if stock_total <= 0:
            out_of_stock += 1
        elif stock_total <= (produit.stock_minimum or 5):
            low_stock += 1
        else:
            active_products += 1
    
    print(f"\n📊 Métriques finales:")
    print(f"  💰 Valeur totale du stock: {total_value:,.0f} XOF")
    print(f"  ✅ Produits actifs: {active_products}")
    print(f"  ❌ Produits en rupture: {out_of_stock}")
    print(f"  ⚠️  Stock bas: {low_stock}")

def main():
    """Fonction principale"""
    print("🚀 Début de la correction complète du stock...")
    
    try:
        # 1. Corriger les stocks
        fix_product_stock()
        
        # 2. Corriger la visibilité
        fix_product_visibility()
        
        # 3. Vérifier l'état final
        check_stock_status()
        
        print("\n✅ Correction complète terminée avec succès!")
        print("🎯 Les produits devraient maintenant s'afficher correctement dans l'interface.")
        
    except Exception as e:
        print(f"❌ Erreur générale: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()

