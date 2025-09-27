#!/usr/bin/env python
"""
Script pour créer une entreprise pour l'admin et tester la création de produits.
"""
import os
import sys
import django

# Configuration Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from apps.companies.models import Entreprise, PlanAbonnement
from apps.products.models import Produit, Categorie, Marque
from decimal import Decimal

User = get_user_model()

def create_admin_company():
    """Créer une entreprise pour l'admin."""
    print("🏢 Création d'une entreprise pour l'admin...")
    
    # Récupérer ou créer un plan d'abonnement
    plan, created = PlanAbonnement.objects.get_or_create(
        nom='Plan Admin',
        defaults={
            'description': 'Plan spécial pour les administrateurs',
            'prix_mensuel': Decimal('0.00'),
            'prix_annuel': Decimal('0.00'),
            'max_utilisateurs': 1000,
            'max_produits': 10000,
            'max_ventes_mensuelles': 100000,
            'stockage_gb': 1000,
            'fonctionnalites': {'toutes': True},
            'populaire': False,
        }
    )
    if created:
        print(f"✅ Plan créé: {plan.nom}")
    
    # Créer l'entreprise
    entreprise, created = Entreprise.objects.get_or_create(
        nom='Administration Platform',
        defaults={
            'description': 'Entreprise administrative de la plateforme',
            'secteur_activite': 'technologie',
            'telephone': '+221 33 000 00 00',
            'email': 'admin@platform.com',
            'site_web': 'https://platform.com',
            'adresse_complete': 'Plateau, Dakar, Sénégal',
            'ville': 'Dakar',
            'region': 'Dakar',
            'pays': 'Sénégal',
            'siret': 'ADMIN001',
            'devise_principale': 'XOF',
            'fuseau_horaire': 'Africa/Dakar',
            'plan_abonnement': plan,
            'statut': 'actif',
        }
    )
    if created:
        print(f"✅ Entreprise créée: {entreprise.nom}")
    else:
        print(f"✅ Entreprise existante: {entreprise.nom}")
    
    return entreprise

def assign_company_to_admin(entreprise):
    """Assigner l'entreprise à l'admin."""
    print("👑 Assignation de l'entreprise à l'admin...")
    
    admin = User.objects.filter(type_utilisateur='admin').first()
    if admin:
        admin.entreprise = entreprise
        admin.save()
        print(f"✅ Entreprise assignée à l'admin: {admin.email}")
        return admin
    else:
        print("❌ Aucun admin trouvé")
        return None

def create_test_products(admin):
    """Créer des produits de test avec images."""
    print("📦 Création de produits de test...")
    
    # Créer une catégorie
    categorie, created = Categorie.objects.get_or_create(
        nom='Électronique',
        defaults={
            'description': 'Appareils électroniques et accessoires',
            'slug': 'electronique',
            'icone': 'smartphone',
            'couleur': '#2196F3',
            'ordre_affichage': 1,
        }
    )
    if created:
        print(f"✅ Catégorie créée: {categorie.nom}")
    
    # Créer une marque
    marque, created = Marque.objects.get_or_create(
        nom='TechBrand',
        defaults={'pays_origine': 'Sénégal'}
    )
    if created:
        print(f"✅ Marque créée: {marque.nom}")
    
    # Créer des produits
    products_data = [
        {
            'nom': 'Smartphone Galaxy S24',
            'description_courte': 'Smartphone haut de gamme avec caméra 108MP',
            'description_longue': 'Le Galaxy S24 offre des performances exceptionnelles avec son processeur dernier cri et sa caméra professionnelle.',
            'categorie': categorie,
            'marque': marque,
            'sku': 'GALAXY-S24-128',
            'code_barre': '1234567890130',
            'prix_achat': Decimal('450000'),
            'prix_vente': Decimal('650000'),
            'tva_taux': Decimal('18.00'),
            'unite_mesure': 'piece',
            'stock_minimum': 5,
            'stock_maximum': 50,
            'point_recommande': 15,
            'entreprise': admin.entreprise,
            'popularite_score': 95,
            'nombre_vues': 1250,
            'nombre_ventes': 45,
            'slug': 'smartphone-galaxy-s24',
        },
        {
            'nom': 'Ordinateur Portable Dell XPS',
            'description_courte': 'Laptop ultra-fin pour professionnels',
            'description_longue': 'L\'XPS de Dell allie performance et design avec son écran 4K et son processeur Intel i7.',
            'categorie': categorie,
            'marque': marque,
            'sku': 'DELL-XPS-15',
            'code_barre': '1234567890131',
            'prix_achat': Decimal('850000'),
            'prix_vente': Decimal('1200000'),
            'tva_taux': Decimal('18.00'),
            'unite_mesure': 'piece',
            'stock_minimum': 3,
            'stock_maximum': 20,
            'point_recommande': 8,
            'entreprise': admin.entreprise,
            'popularite_score': 88,
            'nombre_vues': 890,
            'nombre_ventes': 28,
            'slug': 'ordinateur-portable-dell-xps',
        },
        {
            'nom': 'Écouteurs Bluetooth AirPods',
            'description_courte': 'Écouteurs sans fil avec réduction de bruit',
            'description_longue': 'Les AirPods offrent une qualité audio exceptionnelle et une autonomie de 30 heures.',
            'categorie': categorie,
            'marque': marque,
            'sku': 'AIRPODS-PRO-2',
            'code_barre': '1234567890132',
            'prix_achat': Decimal('120000'),
            'prix_vente': Decimal('180000'),
            'tva_taux': Decimal('18.00'),
            'unite_mesure': 'piece',
            'stock_minimum': 10,
            'stock_maximum': 100,
            'point_recommande': 25,
            'entreprise': admin.entreprise,
            'popularite_score': 92,
            'nombre_vues': 2100,
            'nombre_ventes': 156,
            'slug': 'ecouteurs-bluetooth-airpods',
        }
    ]
    
    products = []
    for product_data in products_data:
        product, created = Produit.objects.get_or_create(
            sku=product_data['sku'],
            defaults=product_data
        )
        if created:
            print(f"✅ Produit créé: {product.nom}")
        else:
            print(f"✅ Produit existant: {product.nom}")
        products.append(product)
    
    return products

def main():
    """Fonction principale."""
    print("🚀 Configuration de l'entreprise admin et création de produits...")
    
    # 1. Créer l'entreprise
    entreprise = create_admin_company()
    
    # 2. Assigner à l'admin
    admin = assign_company_to_admin(entreprise)
    
    if admin:
        # 3. Créer des produits de test
        products = create_test_products(admin)
        
        print(f"\n✅ Configuration terminée !")
        print(f"🏢 Entreprise: {entreprise.nom}")
        print(f"👑 Admin: {admin.email}")
        print(f"📦 Produits créés: {len(products)}")
        
        print("\n🔐 Comptes de test disponibles:")
        print("   👑 Admin: admin4@platform.com / admin123")
        print("   💼 Entrepreneur: marie@boutiquemarie.sn / password")
        print("   🛍️ Client: client2@example.com / password")
    else:
        print("❌ Impossible de continuer sans admin")

if __name__ == '__main__':
    main()
