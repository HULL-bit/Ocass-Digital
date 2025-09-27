#!/usr/bin/env python3
"""
Script pour corriger le stock des produits
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

def fix_product_stock():
    """Corrige le stock des produits en ajoutant des quantités aléatoires"""
    print("📦 Correction du stock des produits...")
    
    produits = Produit.objects.all()
    print(f"📦 Nombre de produits à traiter: {produits.count()}")
    
    updated_count = 0
    
    for produit in produits:
        try:
            # Générer un stock aléatoire entre 10 et 500
            nouveau_stock = random.randint(10, 500)
            
            # Mettre à jour le stock
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
            
            produit.save()
            
            print(f"  ✅ Stock mis à jour pour {produit.nom}: {nouveau_stock} unités")
            updated_count += 1
            
        except Exception as e:
            print(f"❌ Erreur lors de la mise à jour de {produit.nom}: {e}")
    
    print(f"✅ {updated_count} produits mis à jour avec du stock")

def main():
    """Fonction principale"""
    print("🚀 Début de la correction du stock...")
    
    try:
        fix_product_stock()
        print("\n✅ Correction du stock terminée avec succès!")
        
    except Exception as e:
        print(f"❌ Erreur générale: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
