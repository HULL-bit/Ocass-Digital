#!/usr/bin/env python3
"""
Script pour vérifier l'état actuel du stock
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

def check_current_stock_status():
    """Vérifie l'état actuel du stock"""
    print("🔍 Vérification de l'état actuel du stock...")
    
    # Récupérer tous les produits
    produits = Produit.objects.all()
    print(f"📦 Nombre total de produits: {produits.count()}")
    
    # Calculer les métriques
    total_value = 0
    active_products = 0
    out_of_stock = 0
    low_stock = 0
    
    print(f"\n📋 Détail par produit:")
    for produit in produits:
        # Calculer le stock total pour ce produit
        stocks = Stock.objects.filter(produit=produit)
        stock_total = sum(stock.quantite_physique for stock in stocks)
        
        # Valeur du stock (prix d'achat * quantité)
        prix_achat = float(produit.prix_achat) if produit.prix_achat else 0
        valeur_stock = prix_achat * stock_total
        total_value += valeur_stock
        
        # Déterminer le statut
        status = ""
        if stock_total <= 0:
            out_of_stock += 1
            status = "❌ RUPTURE"
        elif stock_total <= (produit.stock_minimum or 5):
            low_stock += 1
            status = "⚠️  STOCK BAS"
        else:
            active_products += 1
            status = "✅ OK"
        
        print(f"  📦 {produit.nom}")
        print(f"     Stock: {stock_total} | Min: {produit.stock_minimum or 5} | Prix: {prix_achat} XOF | Valeur: {valeur_stock:,.0f} XOF | {status}")
    
    print(f"\n📊 Métriques calculées:")
    print(f"  💰 Valeur totale du stock: {total_value:,.0f} XOF")
    print(f"  ✅ Produits actifs: {active_products}")
    print(f"  ❌ Produits en rupture: {out_of_stock}")
    print(f"  ⚠️  Stock bas: {low_stock}")
    
    # Calculer des valeurs précédentes réalistes
    print(f"\n📈 Valeurs précédentes suggérées:")
    print(f"  💰 Valeur précédente: {total_value * 0.95:,.0f} XOF (-5%)")
    print(f"  ✅ Produits actifs précédents: {max(0, active_products - 1)}")
    print(f"  ❌ Produits en rupture précédents: {out_of_stock + 1 if out_of_stock > 0 else 0}")
    print(f"  ⚠️  Stock bas précédent: {low_stock + 2}")

if __name__ == '__main__':
    try:
        check_current_stock_status()
    except Exception as e:
        print(f"❌ Erreur: {e}")
        sys.exit(1)
