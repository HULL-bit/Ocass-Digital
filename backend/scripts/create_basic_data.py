#!/usr/bin/env python
"""
Script simple pour créer des données de base et des utilisateurs.
"""
import os
import sys
import django
from decimal import Decimal
from datetime import datetime, timedelta, date
import random

# Configuration Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.companies.models import PlanAbonnement, Entreprise
from apps.products.models import Categorie, Marque, Produit
from apps.inventory.models import Entrepot, Stock
from apps.customers.models import Client
from apps.sales.models import Vente, LigneVente

User = get_user_model()

def create_basic_users():
    """Créer des utilisateurs de base."""
    print("👥 Création des utilisateurs de base...")
    
    # Admin
    admin, created = User.objects.get_or_create(
        username='admin1@platform.com',
        email='admin1@platform.com',
        defaults={
            'first_name': 'Aminata',
            'last_name': 'Diop',
            'type_utilisateur': 'admin',
            'telephone': '+221 77 000 00 01',
            'is_staff': True,
            'is_superuser': True,
            'theme_interface': 'dark',
            'langue': 'fr',
            'points_experience': 5000,
            'niveau': 5,
            'statut': 'actif',
        }
    )
    if created:
        admin.set_password('admin123')
        admin.save()
        print(f"✅ Admin créé: {admin.email}")

    # Entrepreneurs
    entrepreneurs_data = [
        {
            'username': 'entrepreneur1@business.sn',
            'email': 'entrepreneur1@business.sn',
            'first_name': 'Ousmane',
            'last_name': 'Cissé',
            'telephone': '+221 77 123 45 67',
            'type_utilisateur': 'entrepreneur',
            'points_experience': 2500,
            'niveau': 3,
        },
        {
            'username': 'entrepreneur2@business.sn',
            'email': 'entrepreneur2@business.sn',
            'first_name': 'Fatou',
            'last_name': 'Diallo',
            'telephone': '+221 77 234 56 78',
            'type_utilisateur': 'entrepreneur',
            'points_experience': 4200,
            'niveau': 4,
        },
    ]
    
    entrepreneurs = []
    for user_data in entrepreneurs_data:
        user, created = User.objects.get_or_create(
            username=user_data['username'],
            defaults=user_data
        )
        if created:
            user.set_password('password')
            user.save()
            print(f"✅ Entrepreneur créé: {user.email}")
        entrepreneurs.append(user)

    # Clients
    clients_data = [
        {
            'username': 'client4@example.com',
            'email': 'client4@example.com',
            'first_name': 'Mariama',
            'last_name': 'Fall',
            'telephone': '+221 77 456 78 90',
            'type_utilisateur': 'client',
            'points_experience': 850,
            'niveau': 1,
        },
        {
            'username': 'client5@example.com',
            'email': 'client5@example.com',
            'first_name': 'Samba',
            'last_name': 'Diop',
            'telephone': '+221 77 567 89 01',
            'type_utilisateur': 'client',
            'points_experience': 1200,
            'niveau': 2,
        },
    ]
    
    clients = []
    for user_data in clients_data:
        user, created = User.objects.get_or_create(
            username=user_data['username'],
            defaults=user_data
        )
        if created:
            user.set_password('password')
            user.save()
            print(f"✅ Client créé: {user.email}")
        clients.append(user)
    
    return admin, entrepreneurs, clients

def create_basic_products():
    """Créer des produits de base."""
    print("📦 Création des produits de base...")
    
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
        nom='Apple',
        defaults={'pays_origine': 'États-Unis'}
    )
    if created:
        print(f"✅ Marque créée: {marque.nom}")
    
    # Créer des produits
    products_data = [
        {
            'nom': 'iPhone 15 Pro',
            'description_courte': 'Le smartphone le plus avancé avec puce A17 Pro',
            'categorie': categorie,
            'marque': marque,
            'sku': 'IPH15PRO128',
            'code_barre': '1234567890123',
            'prix_achat': Decimal('650000'),
            'prix_vente': Decimal('850000'),
            'tva_taux': Decimal('18.00'),
            'unite_mesure': 'piece',
            'stock_minimum': 5,
            'stock_maximum': 50,
            'point_recommande': 15,
            'popularite_score': 95,
            'nombre_vues': 1250,
            'nombre_ventes': 45,
            'slug': 'iphone-15-pro',
        },
        {
            'nom': 'MacBook Air M3',
            'description_courte': 'Ordinateur portable ultra-fin avec puce M3',
            'categorie': categorie,
            'marque': marque,
            'sku': 'MBA13M3256',
            'code_barre': '1234567890124',
            'prix_achat': Decimal('850000'),
            'prix_vente': Decimal('1150000'),
            'tva_taux': Decimal('18.00'),
            'unite_mesure': 'piece',
            'stock_minimum': 3,
            'stock_maximum': 20,
            'point_recommande': 8,
            'popularite_score': 88,
            'nombre_vues': 890,
            'nombre_ventes': 28,
            'slug': 'macbook-air-m3',
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
        products.append(product)
    
    return products

def create_basic_sales(entrepreneurs, products):
    """Créer des ventes de base."""
    print("💰 Création des ventes de base...")
    
    for i in range(5):
        entrepreneur = random.choice(entrepreneurs)
        
        # Créer un client temporaire pour la vente
        from apps.customers.models import Client
        client, _ = Client.objects.get_or_create(
            nom=f"Client Test {i+1}",
            email=f"client{i+1}@test.com",
            telephone=f"+221 77 123 45 {i+1:02d}",
            defaults={
                'code_client': f"CLI{i+1:03d}",
                'adresse_facturation': f"Adresse Test {i+1}",
                'entrepreneur': entrepreneur,
                'statut': 'actif'
            }
        )
        
        # Créer la vente
        vente = Vente.objects.create(
            client=client,
            entrepreneur=entrepreneur,
            vendeur=entrepreneur,
            date_creation=timezone.now() - timedelta(days=random.randint(0, 30)),
            statut='confirmee',
            mode_paiement=random.choice(['cash', 'wave', 'orange_money']),
            statut_paiement='completed',
            date_paiement=timezone.now() - timedelta(days=random.randint(0, 30)),
            source_vente='pos',
        )
        
        # Ajouter des lignes de vente
        product = random.choice(products)
        quantite = random.randint(1, 3)
        prix_unitaire = product.prix_vente
        
        ligne = LigneVente.objects.create(
            vente=vente,
            produit=product,
            quantite=quantite,
            prix_unitaire=prix_unitaire,
            remise_pourcentage=Decimal('0'),
            tva_taux=product.tva_taux,
        )
        
        # Mettre à jour les totaux de la vente
        vente.sous_total = ligne.total_ttc
        vente.taxe_montant = ligne.total_ttc * Decimal('0.18')
        vente.total_ttc = ligne.total_ttc
        vente.save()
        
        print(f"✅ Vente créée: {vente.numero_facture} - {vente.total_ttc} XOF")

def main():
    """Fonction principale."""
    print("🚀 Création des données de base...")
    
    # 1. Utilisateurs
    admin, entrepreneurs, clients = create_basic_users()
    
    # 2. Produits
    products = create_basic_products()
    
    # 3. Ventes
    create_basic_sales(entrepreneurs, products)
    
    print("\n✅ Données de base créées avec succès !")
    print("\n🔐 Comptes de test disponibles:")
    print("   👑 Admin: admin1@platform.com / admin123")
    print("   💼 Entrepreneur 1: entrepreneur1@business.sn / password")
    print("   💼 Entrepreneur 2: entrepreneur2@business.sn / password")
    print("   🛍️ Client 1: client4@example.com / password")
    print("   🛍️ Client 2: client5@example.com / password")

if __name__ == '__main__':
    main()
