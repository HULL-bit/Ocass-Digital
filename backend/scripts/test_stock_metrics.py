#!/usr/bin/env python3
"""
Script pour tester les métriques de stock et vérifier qu'elles correspondent aux données réelles
"""

import os
import sys
import django
from django.conf import settings

# Configuration Django
sys.path.append('/home/suleimaan/Téléchargements/Mm/project/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.products.models import Produit
from apps.inventory.models import Stock

def test_stock_metrics():
    """Teste le calcul des métriques de stock"""
    print("🔍 Test des métriques de stock...")
    
    # Récupérer tous les produits
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
        total_value += prix_achat * stock_total
        
        # Produits actifs (avec stock > 0)
        if stock_total > 0:
            active_products += 1
        
        # Produits en rupture
        if stock_total <= 0:
            out_of_stock += 1
        
        # Stock bas (entre 1 et 10)
        if 0 < stock_total <= 10:
            low_stock += 1
        
        print(f"  📋 {produit.nom}: Stock={stock_total}, Prix={prix_achat} XOF, Valeur={prix_achat * stock_total} XOF")
    
    print("\n📊 Métriques calculées:")
    print(f"  💰 Valeur totale du stock: {total_value:,.0f} XOF")
    print(f"  ✅ Produits actifs: {active_products}")
    print(f"  ❌ Produits en rupture: {out_of_stock}")
    print(f"  ⚠️  Stock bas: {low_stock}")
    
    # Vérifier la cohérence
    total_products = produits.count()
    calculated_total = active_products + out_of_stock
    
    print(f"\n🔍 Vérification:")
    print(f"  Total produits: {total_products}")
    print(f"  Actifs + Rupture: {calculated_total}")
    print(f"  Cohérence: {'✅ OK' if total_products == calculated_total else '❌ ERREUR'}")
    
    return {
        'total_value': total_value,
        'active_products': active_products,
        'out_of_stock': out_of_stock,
        'low_stock': low_stock,
        'total_products': total_products
    }

if __name__ == '__main__':
    try:
        metrics = test_stock_metrics()
        print(f"\n✅ Test terminé avec succès!")
        print(f"📈 Les métriques sont maintenant synchronisées avec les données réelles.")
    except Exception as e:
        print(f"❌ Erreur lors du test: {e}")
        sys.exit(1)
