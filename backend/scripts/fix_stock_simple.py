#!/usr/bin/env python3
"""
Script simple pour corriger le stock des produits directement
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

def fix_product_stock_simple():
    """Corrige le stock des produits directement dans le modèle Produit"""
    print("📦 Correction simple du stock des produits...")
    
    produits = Produit.objects.all()
    print(f"📦 Nombre de produits à traiter: {produits.count()}")
    
    if produits.count() == 0:
        print("❌ Aucun produit trouvé. Créez d'abord des produits.")
        return
    
    updated_count = 0
    
    for produit in produits:
        try:
            # Générer un stock aléatoire entre 10 et 500
            nouveau_stock = random.randint(10, 500)
            
            # Mettre à jour le stock directement dans le modèle Produit
            produit.stock_actuel = nouveau_stock
            produit.stock_disponible = nouveau_stock
            produit.stock_minimum = max(5, nouveau_stock // 10)  # Stock minimum = 10% du stock actuel
            
            # Mettre à jour le statut selon le stock
            if nouveau_stock > produit.stock_minimum:
                produit.statut = 'actif'
            elif nouveau_stock > 0:
                produit.statut = 'stock_faible'
            else:
                produit.statut = 'rupture'
            
            # S'assurer que les produits sont visibles
            produit.visible_catalogue = True
            produit.vendable = True
            produit.achetable = True
            
            produit.save()
            
            print(f"  ✅ Stock mis à jour pour {produit.nom}: {nouveau_stock} unités")
            updated_count += 1
            
        except Exception as e:
            print(f"❌ Erreur lors de la mise à jour de {produit.nom}: {e}")
    
    print(f"✅ {updated_count} produits mis à jour avec du stock")

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
        # Utiliser le stock_actuel du produit
        stock_total = produit.stock_actuel or 0
        
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
    print("🚀 Début de la correction simple du stock...")
    
    try:
        # 1. Corriger les stocks
        fix_product_stock_simple()
        
        # 2. Vérifier l'état final
        check_stock_status()
        
        print("\n✅ Correction simple terminée avec succès!")
        print("🎯 Les produits devraient maintenant s'afficher correctement dans l'interface.")
        
    except Exception as e:
        print(f"❌ Erreur générale: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()

