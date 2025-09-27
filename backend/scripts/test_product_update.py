#!/usr/bin/env python3
"""
Script pour tester la modification d'un produit
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
from apps.users.models import UtilisateurPersonnalise
from apps.companies.models import Entreprise

def test_product_update():
    """Teste la modification d'un produit"""
    print("🔍 Test de modification de produit...")
    
    # Récupérer le produit "Robe Élégante Africaine"
    try:
        produit = Produit.objects.get(nom="Robe Élégante Africaine")
        print(f"📦 Produit trouvé: {produit.nom}")
        print(f"  ID: {produit.id}")
        print(f"  Prix d'achat actuel: {produit.prix_achat} XOF")
        print(f"  Prix de vente actuel: {produit.prix_vente} XOF")
        print(f"  Stock minimum: {produit.stock_minimum}")
        print(f"  Entreprise: {produit.entreprise}")
        
        # Vérifier les permissions
        print(f"\n🔐 Vérification des permissions:")
        print(f"  Produit appartient à l'entreprise: {produit.entreprise}")
        
        # Tenter une modification
        ancien_prix_achat = produit.prix_achat
        nouveau_prix_achat = 18000
        
        print(f"\n✏️  Tentative de modification:")
        print(f"  Ancien prix d'achat: {ancien_prix_achat} XOF")
        print(f"  Nouveau prix d'achat: {nouveau_prix_achat} XOF")
        
        produit.prix_achat = nouveau_prix_achat
        produit.save()
        
        print(f"  ✅ Modification réussie!")
        
        # Vérifier la modification
        produit.refresh_from_db()
        print(f"  Prix d'achat après modification: {produit.prix_achat} XOF")
        
        # Restaurer l'ancien prix
        produit.prix_achat = ancien_prix_achat
        produit.save()
        print(f"  🔄 Prix restauré: {produit.prix_achat} XOF")
        
    except Produit.DoesNotExist:
        print("❌ Produit 'Robe Élégante Africaine' non trouvé")
        
        # Lister tous les produits
        print("\n📋 Produits disponibles:")
        for p in Produit.objects.all():
            print(f"  - {p.nom} (ID: {p.id})")
    
    except Exception as e:
        print(f"❌ Erreur lors de la modification: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    try:
        test_product_update()
    except Exception as e:
        print(f"❌ Erreur: {e}")
        sys.exit(1)
