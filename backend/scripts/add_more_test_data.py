#!/usr/bin/env python
"""
Script pour ajouter encore plus de données de test réalistes.
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
from apps.products.models import Produit, Categorie, Marque
from apps.customers.models import Client
from apps.sales.models import Vente, LigneVente

User = get_user_model()

def add_more_products():
    """Ajouter plus de produits variés."""
    electronique = Categorie.objects.get(slug='electronique')
    mode = Categorie.objects.get(slug='mode-beaute')
    maison = Categorie.objects.get(slug='maison-jardin')
    
    apple = Marque.objects.get(nom='Apple')
    samsung = Marque.objects.get(nom='Samsung')
    nike = Marque.objects.get(nom='Nike')
    
    # Récupérer les entreprises
    from apps.companies.models import Entreprise
    boutique_marie = Entreprise.objects.get(nom='Boutique Marie Diallo')
    tech_solutions = Entreprise.objects.get(nom='TechSolutions Sénégal')
    
    additional_products = [
        # Électronique
        {
            'nom': 'iPad Air M2',
            'description_courte': 'Tablette puissante avec puce M2 et écran Liquid Retina',
            'description_longue': 'iPad Air avec puce M2, écran Liquid Retina de 10,9 pouces, caméra avant 12 Mpx avec Cadre centré, compatible avec Apple Pencil et Magic Keyboard.',
            'categorie': electronique,
            'marque': apple,
            'sku': 'IPAD-AIR-M2-256',
            'prix_achat': Decimal('450000'),
            'prix_vente': Decimal('650000'),
            'couleurs_disponibles': ['Gris Sidéral', 'Lumière Stellaire', 'Rose', 'Bleu', 'Mauve'],
            'tailles_disponibles': ['64GB', '256GB', '512GB'],
            'stock_minimum': 3,
            'stock_maximum': 25,
            'entreprise': tech_solutions,
            'popularite_score': 82,
            'slug': 'ipad-air-m2',
        },
        {
            'nom': 'Galaxy S24 Ultra',
            'description_courte': 'Smartphone premium avec S Pen et caméra 200MP',
            'description_longue': 'Samsung Galaxy S24 Ultra avec écran Dynamic AMOLED 2X de 6,8 pouces, S Pen intégré, caméra principale 200MP, processeur Snapdragon 8 Gen 3.',
            'categorie': electronique,
            'marque': samsung,
            'sku': 'GAL-S24U-512',
            'prix_achat': Decimal('580000'),
            'prix_vente': Decimal('780000'),
            'couleurs_disponibles': ['Noir Titane', 'Gris Titane', 'Violet Titane', 'Jaune Titane'],
            'tailles_disponibles': ['256GB', '512GB', '1TB'],
            'stock_minimum': 4,
            'stock_maximum': 30,
            'entreprise': tech_solutions,
            'popularite_score': 89,
            'slug': 'galaxy-s24-ultra',
        },
        {
            'nom': 'Air Jordan 1 Retro',
            'description_courte': 'Baskets iconiques Air Jordan 1 en cuir premium',
            'description_longue': 'Les légendaires Air Jordan 1 Retro High OG avec leur design iconique, cuir premium et semelle Air-Sole pour un confort optimal.',
            'categorie': mode,
            'marque': nike,
            'sku': 'AJ1-RETRO-42',
            'prix_achat': Decimal('85000'),
            'prix_vente': Decimal('145000'),
            'couleurs_disponibles': ['Chicago', 'Bred', 'Royal', 'Shadow', 'Court Purple'],
            'tailles_disponibles': ['38', '39', '40', '41', '42', '43', '44', '45'],
            'stock_minimum': 8,
            'stock_maximum': 60,
            'entreprise': boutique_marie,
            'popularite_score': 91,
            'slug': 'air-jordan-1-retro',
        },
        {
            'nom': 'Ensemble Salon Moderne',
            'description_courte': 'Canapé 3 places + 2 fauteuils en cuir synthétique',
            'description_longue': 'Ensemble salon complet comprenant un canapé 3 places et 2 fauteuils assortis en cuir synthétique de qualité, structure en bois massif.',
            'categorie': maison,
            'sku': 'SALON-MOD-001',
            'prix_achat': Decimal('350000'),
            'prix_vente': Decimal('550000'),
            'couleurs_disponibles': ['Noir', 'Marron', 'Beige', 'Gris'],
            'stock_minimum': 2,
            'stock_maximum': 10,
            'entreprise': boutique_marie,
            'popularite_score': 65,
            'slug': 'ensemble-salon-moderne',
        },
        {
            'nom': 'Smartwatch Series 9',
            'description_courte': 'Montre connectée avec GPS et monitoring santé',
            'description_longue': 'Apple Watch Series 9 avec puce S9, écran Always-On Retina, GPS, monitoring cardiaque avancé, résistance à l\'eau jusqu\'à 50 mètres.',
            'categorie': electronique,
            'marque': apple,
            'sku': 'AW-S9-45MM',
            'prix_achat': Decimal('280000'),
            'prix_vente': Decimal('420000'),
            'couleurs_disponibles': ['Minuit', 'Lumière Stellaire', 'Rose', 'Rouge'],
            'tailles_disponibles': ['41mm', '45mm'],
            'stock_minimum': 5,
            'stock_maximum': 40,
            'entreprise': tech_solutions,
            'popularite_score': 76,
            'slug': 'smartwatch-series-9',
        }
    ]
    
    for product_data in additional_products:
        product, created = Produit.objects.get_or_create(
            sku=product_data['sku'],
            defaults=product_data
        )
        if created:
            print(f"✅ Produit supplémentaire créé: {product.nom}")

def add_more_customers():
    """Ajouter plus de clients."""
    entrepreneurs = User.objects.filter(type_utilisateur='entrepreneur')
    
    additional_customers = [
        {
            'code_client': 'CLI-004',
            'type_client': 'particulier',
            'nom': 'Thiam',
            'prenom': 'Khadija',
            'email': 'khadija.thiam@email.com',
            'telephone': '+221 77 444 55 66',
            'adresse_facturation': '18 Rue Félix Faure, Dakar',
            'segment': 'vip',
            'score_fidelite': 92,
            'total_achats': Decimal('750000'),
            'nombre_commandes': 18,
            'points_fidelite': 750,
            'niveau_fidelite': 'or',
            'entrepreneur': entrepreneurs[0],
        },
        {
            'code_client': 'CLI-005',
            'type_client': 'entreprise',
            'nom': 'Diop',
            'prenom': 'Cheikh',
            'entreprise_nom': 'Hôtel Teranga',
            'email': 'cheikh@hotelteranga.sn',
            'telephone': '+221 33 555 66 77',
            'adresse_facturation': '45 Corniche Ouest, Dakar',
            'segment': 'regulier',
            'score_fidelite': 78,
            'total_achats': Decimal('1200000'),
            'nombre_commandes': 24,
            'points_fidelite': 1200,
            'niveau_fidelite': 'platine',
            'entrepreneur': entrepreneurs[1],
        },
        {
            'code_client': 'CLI-006',
            'type_client': 'professionnel',
            'nom': 'Gueye',
            'prenom': 'Mariama',
            'entreprise_nom': 'Cabinet Médical Gueye',
            'email': 'mariama@cabinet-gueye.sn',
            'telephone': '+221 77 666 77 88',
            'adresse_facturation': '22 Avenue Bourguiba, Dakar',
            'segment': 'nouveau',
            'score_fidelite': 35,
            'total_achats': Decimal('85000'),
            'nombre_commandes': 2,
            'points_fidelite': 85,
            'niveau_fidelite': 'bronze',
            'entrepreneur': entrepreneurs[2],
        }
    ]
    
    for customer_data in additional_customers:
        customer, created = Client.objects.get_or_create(
            code_client=customer_data['code_client'],
            entrepreneur=customer_data['entrepreneur'],
            defaults=customer_data
        )
        if created:
            print(f"✅ Client supplémentaire créé: {customer.nom} {customer.prenom}")

def add_more_sales():
    """Ajouter plus de ventes."""
    entrepreneurs = User.objects.filter(type_utilisateur='entrepreneur')
    
    for entrepreneur in entrepreneurs:
        clients = Client.objects.filter(entrepreneur=entrepreneur)
        products = Produit.objects.filter(entreprise=entrepreneur.entreprise)
        
        # Créer 10 ventes supplémentaires par entrepreneur
        for i in range(10):
            if clients.exists() and products.exists():
                customer = random.choice(clients)
                
                vente = Vente.objects.create(
                    client=customer,
                    entrepreneur=entrepreneur,
                    vendeur=entrepreneur,
                    date_creation=timezone.now() - timedelta(days=random.randint(0, 60)),
                    statut=random.choice(['confirmee', 'livree', 'terminee']),
                    mode_paiement=random.choice(['cash', 'wave', 'orange_money', 'card']),
                    statut_paiement='completed',
                    source_vente=random.choice(['pos', 'online', 'telephone']),
                )
                
                # Ajouter 1-3 lignes par vente
                num_lines = random.randint(1, 3)
                sous_total = Decimal('0')
                
                for j in range(num_lines):
                    product = random.choice(products)
                    quantite = random.randint(1, 3)
                    
                    ligne = LigneVente.objects.create(
                        vente=vente,
                        produit=product,
                        quantite=quantite,
                        prix_unitaire=product.prix_vente,
                        remise_pourcentage=Decimal(str(random.uniform(0, 5))),
                        tva_taux=product.tva_taux,
                    )
                    
                    sous_total += ligne.total_ttc
                
                vente.sous_total = sous_total
                vente.taxe_montant = sous_total * Decimal('0.18')
                vente.total_ttc = sous_total
                vente.save()
                
                print(f"✅ Vente supplémentaire créée: {vente.numero_facture}")

def main():
    """Ajouter plus de données de test."""
    print("📈 Ajout de données supplémentaires...")
    
    add_more_products()
    add_more_customers()
    add_more_sales()
    
    print("\n✅ Données supplémentaires ajoutées avec succès !")
    
    # Statistiques finales
    print(f"\n📊 Nouvelles statistiques:")
    print(f"   • {Produit.objects.count()} produits au total")
    print(f"   • {Client.objects.count()} clients au total")
    print(f"   • {Vente.objects.count()} ventes au total")

if __name__ == '__main__':
    main()