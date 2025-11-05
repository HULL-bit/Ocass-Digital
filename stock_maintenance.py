#!/usr/bin/env python3
"""
Script de maintenance pour surveiller et corriger automatiquement les stocks.
"""
import os
import sys
import django
import requests
import json
from datetime import datetime

# Configuration Django
sys.path.append('/home/suleimaan/Téléchargements/Mm/project/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.products.models import Produit

def check_stock_health():
    """Vérifie la santé des stocks."""
    print(f"🔍 Vérification de la santé des stocks - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    
    total_products = Produit.objects.count()
    zero_stock = Produit.objects.filter(stock=0).count()
    low_stock = Produit.objects.filter(stock__gt=0, stock__lte=5).count()
    good_stock = Produit.objects.filter(stock__gt=5).count()
    
    print(f"📊 Statistiques actuelles :")
    print(f"   📦 Total produits : {total_products}")
    print(f"   🔴 Stock à 0 : {zero_stock}")
    print(f"   🟡 Stock faible (1-5) : {low_stock}")
    print(f"   🟢 Stock correct (>5) : {good_stock}")
    
    if total_products > 0:
        zero_percentage = (zero_stock / total_products) * 100
        print(f"   📈 Pourcentage stock à 0 : {zero_percentage:.1f}%")
    
    # Alertes
    alerts = []
    if zero_stock > 0:
        alerts.append(f"⚠️ {zero_stock} produits ont un stock à 0")
    if low_stock > 0:
        alerts.append(f"⚠️ {low_stock} produits ont un stock faible")
    if zero_percentage > 5:
        alerts.append(f"⚠️ {zero_percentage:.1f}% des produits ont un stock à 0")
    
    if alerts:
        print(f"\n🚨 Alertes :")
        for alert in alerts:
            print(f"   {alert}")
    else:
        print(f"\n✅ Aucune alerte - Stocks en bonne santé")
    
    return {
        'total': total_products,
        'zero_stock': zero_stock,
        'low_stock': low_stock,
        'good_stock': good_stock,
        'alerts': alerts
    }

def auto_fix_zero_stocks():
    """Corrige automatiquement les stocks à 0."""
    zero_stock_products = Produit.objects.filter(stock=0)
    count = zero_stock_products.count()
    
    if count == 0:
        print("✅ Aucun produit avec stock à 0 à corriger")
        return 0
    
    print(f"🔧 Correction automatique de {count} produits avec stock à 0...")
    
    updated_count = 0
    for product in zero_stock_products:
        try:
            # Mettre à jour le stock à 10 par défaut
            product.stock = 10
            product.save(update_fields=['stock'])
            updated_count += 1
            print(f"   ✅ {product.nom} - Stock: 0 → 10")
        except Exception as e:
            print(f"   ❌ Erreur pour {product.nom}: {e}")
    
    print(f"🎉 Correction terminée : {updated_count}/{count} produits corrigés")
    return updated_count

def generate_stock_report():
    """Génère un rapport détaillé des stocks."""
    print(f"\n📋 Rapport détaillé des stocks :")
    print("-" * 50)
    
    # Top 10 produits avec le plus gros stock
    top_stock = Produit.objects.order_by('-stock')[:10]
    print(f"🏆 Top 10 produits avec le plus gros stock :")
    for i, product in enumerate(top_stock, 1):
        print(f"   {i:2d}. {product.nom[:30]:<30} - Stock: {product.stock:>5}")
    
    # Produits avec stock faible
    low_stock_products = Produit.objects.filter(stock__gt=0, stock__lte=5)
    if low_stock_products.exists():
        print(f"\n⚠️ Produits avec stock faible (1-5) :")
        for product in low_stock_products[:10]:
            print(f"   • {product.nom[:40]:<40} - Stock: {product.stock}")
        if low_stock_products.count() > 10:
            print(f"   ... et {low_stock_products.count() - 10} autres")

def main():
    """Fonction principale de maintenance."""
    print("🔧 Script de maintenance des stocks")
    print("=" * 70)
    
    # Vérification de la santé des stocks
    stats = check_stock_health()
    
    # Correction automatique si nécessaire
    if stats['zero_stock'] > 0:
        print(f"\n{'='*70}")
        print("🔧 Correction automatique des stocks à 0...")
        fixed_count = auto_fix_zero_stocks()
        
        if fixed_count > 0:
            print(f"\n{'='*70}")
            print("🔍 Vérification après correction...")
            check_stock_health()
    
    # Génération du rapport
    print(f"\n{'='*70}")
    generate_stock_report()
    
    print(f"\n{'='*70}")
    print("✅ Maintenance terminée")

if __name__ == "__main__":
    main()
