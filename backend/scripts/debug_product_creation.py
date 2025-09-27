#!/usr/bin/env python
"""
Script pour diagnostiquer les problèmes de création de produits.
"""
import os
import sys
import django

# Configuration Django
sys.path.append('/home/suleimaan/Téléchargements/Mm/project/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.products.models import Produit, Categorie
from apps.users.models import UtilisateurPersonnalise
from apps.companies.models import Entreprise

def debug_product_creation():
    """Diagnostiquer les problèmes de création de produits."""
    print("🔍 DIAGNOSTIC DE CRÉATION DE PRODUITS")
    print("=" * 50)
    
    # 1. Vérifier les catégories
    print("\n1️⃣ VÉRIFICATION DES CATÉGORIES")
    categories = Categorie.objects.all()[:3]
    for cat in categories:
        print(f"✅ Catégorie: {cat.nom} (ID: {cat.id})")
    
    # 2. Vérifier les entrepreneurs
    print("\n2️⃣ VÉRIFICATION DES ENTREPRENEURS")
    entrepreneurs = UtilisateurPersonnalise.objects.filter(type_utilisateur='entrepreneur')[:3]
    for ent in entrepreneurs:
        print(f"✅ Entrepreneur: {ent.get_full_name()} (ID: {ent.id})")
        print(f"   📧 Email: {ent.email}")
        print(f"   🏢 Entreprise ID: {ent.entreprise_id}")
        
        # Vérifier si l'entreprise existe
        if ent.entreprise_id:
            try:
                entreprise = Entreprise.objects.get(id=ent.entreprise_id)
                print(f"   🏢 Entreprise: {entreprise.nom}")
            except Entreprise.DoesNotExist:
                print(f"   ❌ ERREUR: Entreprise {ent.entreprise_id} n'existe pas!")
        else:
            print(f"   ⚠️ Aucune entreprise associée")
    
    # 3. Tester la création d'un produit
    print("\n3️⃣ TEST DE CRÉATION DE PRODUIT")
    try:
        # Prendre le premier entrepreneur avec une entreprise
        entrepreneur = UtilisateurPersonnalise.objects.filter(
            type_utilisateur='entrepreneur',
            entreprise_id__isnull=False
        ).first()
        
        if not entrepreneur:
            print("❌ Aucun entrepreneur avec entreprise trouvé")
            return
        
        print(f"🧪 Test avec entrepreneur: {entrepreneur.get_full_name()}")
        
        # Prendre la première catégorie
        categorie = Categorie.objects.first()
        if not categorie:
            print("❌ Aucune catégorie trouvée")
            return
        
        print(f"🧪 Test avec catégorie: {categorie.nom}")
        
        # Créer un produit de test
        produit = Produit.objects.create(
            nom='Produit Test Debug',
            slug='produit-test-debug',
            description_courte='Description test',
            categorie=categorie,
            entreprise_id=entrepreneur.entreprise_id,
            sku='DEBUG-TEST-001',
            prix_achat=1000,
            prix_vente=1500,
            statut='actif'
        )
        
        print(f"✅ Produit créé avec succès: {produit.nom} (ID: {produit.id})")
        
        # Nettoyer
        produit.delete()
        print("🧹 Produit de test supprimé")
        
    except Exception as e:
        print(f"❌ Erreur lors de la création: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    debug_product_creation()