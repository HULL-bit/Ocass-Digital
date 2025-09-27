#!/usr/bin/env python3
"""
Script pour associer les produits aux entreprises
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
from apps.companies.models import Entreprise

def assign_products_to_companies():
    """Associe les produits aux entreprises de manière aléatoire"""
    print("🏢 Association des produits aux entreprises...")
    
    # Récupérer toutes les entreprises
    entreprises = Entreprise.objects.all()
    print(f"🏢 Nombre d'entreprises disponibles: {entreprises.count()}")
    
    if entreprises.count() == 0:
        print("❌ Aucune entreprise trouvée. Créez d'abord des entreprises.")
        return
    
    # Récupérer tous les produits
    produits = Produit.objects.all()
    print(f"📦 Nombre de produits à traiter: {produits.count()}")
    
    if produits.count() == 0:
        print("❌ Aucun produit trouvé.")
        return
    
    updated_count = 0
    
    for produit in produits:
        try:
            # Assigner une entreprise aléatoire
            entreprise = random.choice(entreprises)
            produit.entreprise = entreprise
            produit.save()
            updated_count += 1
            
            if updated_count % 100 == 0:
                print(f"✅ {updated_count} produits traités...")
                
        except Exception as e:
            print(f"❌ Erreur lors de l'association du produit {produit.nom}: {e}")
            continue
    
    print(f"✅ Association terminée ! {updated_count} produits associés aux entreprises.")
    
    # Vérifier la répartition
    print("\n📊 Répartition des produits par entreprise:")
    for entreprise in entreprises:
        count = Produit.objects.filter(entreprise=entreprise).count()
        print(f"  - {entreprise.nom}: {count} produits")

if __name__ == "__main__":
    assign_products_to_companies()
