#!/usr/bin/env python3
"""
Script de test final pour la modification de produit
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

def test_final_product_update():
    """Test final de la modification de produit"""
    print("🔍 Test final de modification de produit...")
    
    # Récupérer le produit "Robe Élégante Africaine"
    try:
        produit = Produit.objects.get(nom="Robe Élégante Africaine")
        print(f"📦 Produit: {produit.nom}")
        print(f"  ID: {produit.id}")
        print(f"  Prix d'achat: {produit.prix_achat} XOF")
        print(f"  Prix de vente: {produit.prix_vente} XOF")
        print(f"  Stock minimum: {produit.stock_minimum}")
        print(f"  Stock maximum: {produit.stock_maximum}")
        print(f"  SKU: {produit.sku}")
        print(f"  Code-barres: {produit.code_barre}")
        print(f"  Catégorie: {produit.categorie}")
        print(f"  Marque: {produit.marque}")
        print(f"  Slug: {produit.slug}")
        
        # Vérifier que la modification précédente a bien été appliquée
        if produit.prix_achat == 18000:
            print(f"\n✅ La modification précédente a été appliquée avec succès!")
            print(f"   Le prix d'achat a été mis à jour de 15000 à 18000 XOF")
        else:
            print(f"\n⚠️  La modification précédente n'a pas été appliquée")
            print(f"   Prix d'achat actuel: {produit.prix_achat} XOF")
        
        print(f"\n🎯 Le produit est prêt pour les tests de modification dans l'interface!")
        
    except Produit.DoesNotExist:
        print("❌ Produit 'Robe Élégante Africaine' non trouvé")
        
        # Lister tous les produits
        print("\n📋 Produits disponibles:")
        for p in Produit.objects.all():
            print(f"  - {p.nom} (ID: {p.id})")

if __name__ == '__main__':
    try:
        test_final_product_update()
    except Exception as e:
        print(f"❌ Erreur: {e}")
        sys.exit(1)
