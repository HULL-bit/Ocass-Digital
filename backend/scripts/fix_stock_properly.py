#!/usr/bin/env python3
"""
Script pour corriger le stock des produits via le modèle Stock
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
from apps.inventory.models import Stock
from apps.companies.models import Entreprise

def fix_product_stock():
    """Corrige le stock des produits en créant des entrées Stock"""
    print("📦 Correction du stock des produits via le modèle Stock...")
    
    produits = Produit.objects.all()
    print(f"📦 Nombre de produits à traiter: {produits.count()}")
    
    # Récupérer une entreprise pour les stocks
    entreprise = Entreprise.objects.first()
    if not entreprise:
        print("❌ Aucune entreprise trouvée. Impossible de créer des stocks.")
        return
    
    updated_count = 0
    
    for produit in produits:
        try:
            # Supprimer les anciens stocks pour ce produit
            Stock.objects.filter(produit=produit).delete()
            
            # Générer un stock aléatoire entre 10 et 500
            nouveau_stock = random.randint(10, 500)
            
            # Créer une entrée Stock
            stock = Stock.objects.create(
                produit=produit,
                entreprise=entreprise,
                quantite_physique=nouveau_stock,
                quantite_reservee=0,
                emplacement="Entrepôt principal",
                statut="disponible"
            )
            
            # Mettre à jour le statut du produit selon le stock
            if nouveau_stock > produit.stock_minimum:
                produit.statut = 'actif'
            elif nouveau_stock > 0:
                produit.statut = 'stock_faible'
            else:
                produit.statut = 'rupture'
            
            produit.save()
            
            print(f"  ✅ Stock créé pour {produit.nom}: {nouveau_stock} unités")
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
