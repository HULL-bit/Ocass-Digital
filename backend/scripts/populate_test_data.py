#!/usr/bin/env python
"""
Script pour peupler la base de données avec des données de test réalistes.
"""
import os
import sys
import django
from decimal import Decimal
from datetime import datetime, timedelta, date
import random
import uuid

# Configuration Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.companies.models import PlanAbonnement, Entreprise
from apps.products.models import Categorie, Marque, Fournisseur, Produit, ImageProduit, VarianteProduit, Bundle, BundleItem
from apps.inventory.models import Entrepot, Stock, MouvementStock
from apps.customers.models import Client, InteractionClient, CampagneMarketing
from apps.sales.models import Vente, LigneVente, Devis, LigneDevis
from apps.projects.models import Projet, TacheProjet
from apps.payments.models import PaiementMobile, LienPaiement
from apps.notifications.models import Notification, TemplateNotification
from apps.support.models import TicketSupport, ReponseTicket, FAQ, BaseConnaissance
from apps.gamification.models import Badge, UtilisateurBadge, Defi, ParticipationDefi
from apps.ai_engine.models import ModeleIA, PredictionVente, RecommandationProduit
from apps.analytics.models import MetriquePerformance, RapportPersonnalise

User = get_user_model()

def create_subscription_plans():
    """Créer les plans d'abonnement."""
    plans = [
        {
            'nom': 'Starter',
            'description': 'Plan parfait pour débuter votre activité commerciale',
            'prix_mensuel': Decimal('15000'),
            'prix_annuel': Decimal('150000'),
            'max_utilisateurs': 2,
            'max_produits': 100,
            'max_ventes_mensuelles': 500,
            'stockage_gb': 5,
            'fonctionnalites': {
                'pos': True,
                'inventory': True,
                'basic_analytics': True,
                'mobile_payments': True,
                'customer_management': True,
                'basic_reports': True,
                'email_support': True,
            }
        },
        {
            'nom': 'Professional',
            'description': 'Solution complète pour entreprises en croissance',
            'prix_mensuel': Decimal('35000'),
            'prix_annuel': Decimal('350000'),
            'max_utilisateurs': 10,
            'max_produits': 1000,
            'max_ventes_mensuelles': 2000,
            'stockage_gb': 25,
            'populaire': True,
            'fonctionnalites': {
                'pos': True,
                'inventory': True,
                'advanced_analytics': True,
                'mobile_payments': True,
                'customer_management': True,
                'project_management': True,
                'advanced_reports': True,
                'multi_warehouse': True,
                'api_access': True,
                'priority_support': True,
            }
        },
        {
            'nom': 'Enterprise',
            'description': 'Solution enterprise avec toutes les fonctionnalités premium',
            'prix_mensuel': Decimal('75000'),
            'prix_annuel': Decimal('750000'),
            'max_utilisateurs': 50,
            'max_produits': 10000,
            'max_ventes_mensuelles': 10000,
            'stockage_gb': 100,
            'fonctionnalites': {
                'pos': True,
                'inventory': True,
                'ai_analytics': True,
                'mobile_payments': True,
                'customer_management': True,
                'project_management': True,
                'custom_reports': True,
                'multi_warehouse': True,
                'api_access': True,
                'white_label': True,
                'dedicated_support': True,
                'ai_recommendations': True,
                'advanced_integrations': True,
            }
        }
    ]
    
    for plan_data in plans:
        plan, created = PlanAbonnement.objects.get_or_create(
            nom=plan_data['nom'],
            defaults=plan_data
        )
        if created:
            print(f"✅ Plan créé: {plan.nom}")

def create_companies():
    """Créer les entreprises de test."""
    plan_pro = PlanAbonnement.objects.get(nom='Professional')
    plan_enterprise = PlanAbonnement.objects.get(nom='Enterprise')
    
    companies = [
        {
            'nom': 'Boutique Marie Diallo',
            'secteur_activite': 'commerce',
            'adresse_complete': '15 Avenue Bourguiba, Plateau, Dakar, Sénégal',
            'ville': 'Dakar',
            'region': 'Dakar',
            'telephone': '+221 77 123 45 67',
            'email': 'contact@boutiquemarie.sn',
            'site_web': 'https://boutiquemarie.sn',
            'siret': 'SN123456789',
            'couleur_primaire': '#E91E63',
            'couleur_secondaire': '#FF4081',
            'plan_abonnement': plan_pro,
            'nombre_employes': 5,
            'chiffre_affaires_annuel': Decimal('25000000'),
        },
        {
            'nom': 'TechSolutions Sénégal',
            'secteur_activite': 'technologie',
            'adresse_complete': '25 Rue de la République, Plateau, Dakar, Sénégal',
            'ville': 'Dakar',
            'region': 'Dakar',
            'telephone': '+221 33 821 45 67',
            'email': 'info@techsolutions.sn',
            'site_web': 'https://techsolutions.sn',
            'siret': 'SN987654321',
            'couleur_primaire': '#2196F3',
            'couleur_secondaire': '#03A9F4',
            'plan_abonnement': plan_enterprise,
            'nombre_employes': 25,
            'chiffre_affaires_annuel': Decimal('150000000'),
        },
        {
            'nom': 'Pharmacie Moderne',
            'secteur_activite': 'sante',
            'adresse_complete': '10 Avenue Cheikh Anta Diop, Fann, Dakar, Sénégal',
            'ville': 'Dakar',
            'region': 'Dakar',
            'telephone': '+221 77 987 65 43',
            'email': 'contact@pharmaciemoderne.sn',
            'couleur_primaire': '#4CAF50',
            'couleur_secondaire': '#8BC34A',
            'plan_abonnement': plan_pro,
            'nombre_employes': 8,
            'chiffre_affaires_annuel': Decimal('45000000'),
        }
    ]
    
    created_companies = []
    for company_data in companies:
        company, created = Entreprise.objects.get_or_create(
            nom=company_data['nom'],
            defaults=company_data
        )
        if created:
            print(f"✅ Entreprise créée: {company.nom}")
        created_companies.append(company)
    
    return created_companies

def create_users(companies):
    """Créer les utilisateurs de test."""
    # Admin
    admin, created = User.objects.get_or_create(
        username='admin@platform.com',
        email='admin@platform.com',
        defaults={
            'first_name': 'Super',
            'last_name': 'Admin',
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
        admin.set_password('password')
        admin.save()
        print(f"✅ Admin créé: {admin.email}")

    # Entrepreneurs
    entrepreneurs_data = [
        {
            'username': 'marie@boutiquemarie.sn',
            'email': 'marie@boutiquemarie.sn',
            'first_name': 'Marie',
            'last_name': 'Diallo',
            'entreprise_id': companies[0].id,
            'telephone': '+221 77 123 45 67',
            'type_utilisateur': 'entrepreneur',
            'points_experience': 2500,
            'niveau': 3,
        },
        {
            'username': 'amadou@techsolutions.sn',
            'email': 'amadou@techsolutions.sn',
            'first_name': 'Amadou',
            'last_name': 'Ba',
            'entreprise_id': companies[1].id,
            'telephone': '+221 77 234 56 78',
            'type_utilisateur': 'entrepreneur',
            'points_experience': 4200,
            'niveau': 4,
        },
        {
            'username': 'fatou@pharmaciemoderne.sn',
            'email': 'fatou@pharmaciemoderne.sn',
            'first_name': 'Fatou',
            'last_name': 'Sow',
            'entreprise_id': companies[2].id,
            'telephone': '+221 77 345 67 89',
            'type_utilisateur': 'entrepreneur',
            'points_experience': 1800,
            'niveau': 2,
        }
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
            'username': 'client1@example.com',
            'email': 'client1@example.com',
            'first_name': 'Abdou',
            'last_name': 'Samb',
            'telephone': '+221 77 456 78 90',
            'type_utilisateur': 'client',
            'points_experience': 850,
            'niveau': 1,
        },
        {
            'username': 'client2@example.com',
            'email': 'client2@example.com',
            'first_name': 'Aïcha',
            'last_name': 'Fall',
            'telephone': '+221 77 567 89 01',
            'type_utilisateur': 'client',
            'points_experience': 1200,
            'niveau': 2,
        },
        {
            'username': 'client3@example.com',
            'email': 'client3@example.com',
            'first_name': 'Moussa',
            'last_name': 'Ndiaye',
            'telephone': '+221 77 678 90 12',
            'type_utilisateur': 'client',
            'points_experience': 650,
            'niveau': 1,
        }
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

def create_categories():
    """Créer les catégories de produits."""
    categories_data = [
        {
            'nom': 'Électronique',
            'description': 'Appareils électroniques et accessoires',
            'slug': 'electronique',
            'icone': 'smartphone',
            'couleur': '#2196F3',
            'ordre_affichage': 1,
        },
        {
            'nom': 'Mode & Beauté',
            'description': 'Vêtements, chaussures et produits de beauté',
            'slug': 'mode-beaute',
            'icone': 'shirt',
            'couleur': '#E91E63',
            'ordre_affichage': 2,
        },
        {
            'nom': 'Maison & Jardin',
            'description': 'Mobilier, décoration et jardinage',
            'slug': 'maison-jardin',
            'icone': 'home',
            'couleur': '#4CAF50',
            'ordre_affichage': 3,
        },
        {
            'nom': 'Santé & Pharmacie',
            'description': 'Médicaments et produits de santé',
            'slug': 'sante-pharmacie',
            'icone': 'heart',
            'couleur': '#FF5722',
            'ordre_affichage': 4,
        },
        {
            'nom': 'Alimentation',
            'description': 'Produits alimentaires et boissons',
            'slug': 'alimentation',
            'icone': 'utensils',
            'couleur': '#FF9800',
            'ordre_affichage': 5,
        }
    ]
    
    categories = []
    for cat_data in categories_data:
        category, created = Categorie.objects.get_or_create(
            slug=cat_data['slug'],
            defaults=cat_data
        )
        if created:
            print(f"✅ Catégorie créée: {category.nom}")
        categories.append(category)
    
    # Sous-catégories
    sous_categories_data = [
        # Électronique
        {'nom': 'Smartphones', 'parent': categories[0], 'slug': 'smartphones'},
        {'nom': 'Ordinateurs', 'parent': categories[0], 'slug': 'ordinateurs'},
        {'nom': 'Accessoires', 'parent': categories[0], 'slug': 'accessoires-electronique'},
        
        # Mode & Beauté
        {'nom': 'Vêtements Femme', 'parent': categories[1], 'slug': 'vetements-femme'},
        {'nom': 'Vêtements Homme', 'parent': categories[1], 'slug': 'vetements-homme'},
        {'nom': 'Chaussures', 'parent': categories[1], 'slug': 'chaussures'},
        {'nom': 'Cosmétiques', 'parent': categories[1], 'slug': 'cosmetiques'},
        
        # Maison & Jardin
        {'nom': 'Mobilier', 'parent': categories[2], 'slug': 'mobilier'},
        {'nom': 'Décoration', 'parent': categories[2], 'slug': 'decoration'},
        {'nom': 'Jardinage', 'parent': categories[2], 'slug': 'jardinage'},
    ]
    
    for sous_cat_data in sous_categories_data:
        sous_cat, created = Categorie.objects.get_or_create(
            slug=sous_cat_data['slug'],
            defaults=sous_cat_data
        )
        if created:
            print(f"✅ Sous-catégorie créée: {sous_cat.nom}")
    
    return categories

def create_brands():
    """Créer les marques."""
    brands_data = [
        {'nom': 'Apple', 'pays_origine': 'États-Unis'},
        {'nom': 'Samsung', 'pays_origine': 'Corée du Sud'},
        {'nom': 'Nike', 'pays_origine': 'États-Unis'},
        {'nom': 'Adidas', 'pays_origine': 'Allemagne'},
        {'nom': 'Zara', 'pays_origine': 'Espagne'},
        {'nom': 'H&M', 'pays_origine': 'Suède'},
        {'nom': 'IKEA', 'pays_origine': 'Suède'},
        {'nom': 'Nivea', 'pays_origine': 'Allemagne'},
        {'nom': 'L\'Oréal', 'pays_origine': 'France'},
        {'nom': 'Nestlé', 'pays_origine': 'Suisse'},
    ]
    
    brands = []
    for brand_data in brands_data:
        brand, created = Marque.objects.get_or_create(
            nom=brand_data['nom'],
            defaults=brand_data
        )
        if created:
            print(f"✅ Marque créée: {brand.nom}")
        brands.append(brand)
    
    return brands

def create_suppliers(companies):
    """Créer les fournisseurs."""
    suppliers_data = [
        {
            'nom': 'Distributeur Électronique Dakar',
            'contact_nom': 'Ibrahima Sarr',
            'contact_fonction': 'Directeur Commercial',
            'email': 'contact@distributeur-elec.sn',
            'telephone': '+221 33 123 45 67',
            'conditions_paiement': '30 jours fin de mois',
            'delai_livraison': 3,
            'montant_minimum_commande': Decimal('50000'),
            'evaluation': Decimal('4.5'),
            'nombre_evaluations': 25,
            'entreprise_id': companies[0].id,
        },
        {
            'nom': 'Grossiste Mode Afrique',
            'contact_nom': 'Aminata Touré',
            'contact_fonction': 'Responsable Ventes',
            'email': 'ventes@grossiste-mode.com',
            'telephone': '+221 77 234 56 78',
            'conditions_paiement': '15 jours',
            'delai_livraison': 7,
            'montant_minimum_commande': Decimal('100000'),
            'evaluation': Decimal('4.2'),
            'nombre_evaluations': 18,
            'entreprise_id': companies[0].id,
        },
        {
            'nom': 'Laboratoire Pharma Plus',
            'contact_nom': 'Dr. Ousmane Diop',
            'contact_fonction': 'Directeur Médical',
            'email': 'commandes@pharmaplus.sn',
            'telephone': '+221 33 345 67 89',
            'conditions_paiement': '45 jours',
            'delai_livraison': 2,
            'montant_minimum_commande': Decimal('25000'),
            'evaluation': Decimal('4.8'),
            'nombre_evaluations': 42,
            'entreprise_id': companies[2].id,
        }
    ]
    
    suppliers = []
    for supplier_data in suppliers_data:
        supplier, created = Fournisseur.objects.get_or_create(
            nom=supplier_data['nom'],
            entreprise_id=supplier_data['entreprise_id'],
            defaults=supplier_data
        )
        if created:
            print(f"✅ Fournisseur créé: {supplier.nom}")
        suppliers.append(supplier)
    
    return suppliers

def create_products(categories, brands, companies):
    """Créer les produits de test."""
    products_data = [
        # Électronique
        {
            'nom': 'iPhone 15 Pro',
            'description_courte': 'Le smartphone le plus avancé avec puce A17 Pro',
            'description_longue': 'iPhone 15 Pro avec écran Super Retina XDR de 6,1 pouces, puce A17 Pro révolutionnaire, système de caméra Pro avec téléobjectif 3x, bouton Action personnalisable et USB-C.',
            'categorie': categories[0],
            'marque': brands[0],
            'sku': 'IPH15PRO128',
            'code_barre': '1234567890123',
            'prix_achat': Decimal('650000'),
            'prix_vente': Decimal('850000'),
            'tva_taux': Decimal('18.00'),
            'unite_mesure': 'piece',
            'poids': Decimal('0.187'),
            'dimensions': {'longueur': 14.67, 'largeur': 7.09, 'hauteur': 0.83},
            'couleurs_disponibles': ['Titane Naturel', 'Titane Bleu', 'Titane Blanc', 'Titane Noir'],
            'tailles_disponibles': ['128GB', '256GB', '512GB', '1TB'],
            'stock_minimum': 5,
            'stock_maximum': 50,
            'point_recommande': 15,
            'entreprise_id': companies[1].id,
            'popularite_score': 95,
            'nombre_vues': 1250,
            'nombre_ventes': 45,
            'slug': 'iphone-15-pro',
        },
        {
            'nom': 'MacBook Air M3',
            'description_courte': 'Ordinateur portable ultra-fin avec puce M3',
            'description_longue': 'MacBook Air avec puce M3, écran Liquid Retina de 13,6 pouces, jusqu\'à 18 heures d\'autonomie, design ultra-fin et léger.',
            'categorie': categories[0],
            'marque': brands[0],
            'sku': 'MBA13M3256',
            'prix_achat': Decimal('850000'),
            'prix_vente': Decimal('1150000'),
            'tva_taux': Decimal('18.00'),
            'unite_mesure': 'piece',
            'poids': Decimal('1.24'),
            'couleurs_disponibles': ['Gris Sidéral', 'Argent', 'Or', 'Minuit'],
            'tailles_disponibles': ['256GB', '512GB', '1TB', '2TB'],
            'stock_minimum': 3,
            'stock_maximum': 20,
            'point_recommande': 8,
            'entreprise_id': companies[1].id,
            'popularite_score': 88,
            'nombre_vues': 890,
            'nombre_ventes': 28,
            'slug': 'macbook-air-m3',
        },
        {
            'nom': 'Robe Élégante Africaine',
            'description_courte': 'Robe traditionnelle moderne en wax premium',
            'description_longue': 'Magnifique robe en tissu wax authentique, coupe moderne et élégante, parfaite pour toutes occasions. Confectionnée par des artisans locaux.',
            'categorie': categories[1],
            'sku': 'ROBE-WAX-001',
            'code_barre': '1234567890124',
            'prix_achat': Decimal('15000'),
            'prix_vente': Decimal('35000'),
            'tva_taux': Decimal('18.00'),
            'unite_mesure': 'piece',
            'couleurs_disponibles': ['Bleu Royal', 'Rouge Passion', 'Vert Émeraude', 'Jaune Soleil'],
            'tailles_disponibles': ['S', 'M', 'L', 'XL', 'XXL'],
            'stock_minimum': 10,
            'stock_maximum': 100,
            'point_recommande': 25,
            'entreprise_id': companies[0].id,
            'popularite_score': 72,
            'nombre_vues': 650,
            'nombre_ventes': 85,
            'slug': 'robe-elegante-africaine',
        },
        {
            'nom': 'Paracétamol 500mg',
            'description_courte': 'Antalgique et antipyrétique - Boîte de 20 comprimés',
            'description_longue': 'Paracétamol 500mg, médicament antalgique et antipyrétique pour le traitement de la douleur et de la fièvre. Boîte de 20 comprimés pelliculés.',
            'categorie': categories[3],
            'sku': 'PARA500-20',
            'code_barre': '1234567890125',
            'prix_achat': Decimal('800'),
            'prix_vente': Decimal('1500'),
            'tva_taux': Decimal('0.00'),  # Médicaments exonérés
            'unite_mesure': 'piece',
            'stock_minimum': 50,
            'stock_maximum': 500,
            'point_recommande': 150,
            'date_peremption': date.today() + timedelta(days=730),
            'duree_conservation': 730,
            'entreprise_id': companies[2].id,
            'popularite_score': 95,
            'nombre_vues': 2100,
            'nombre_ventes': 320,
            'slug': 'paracetamol-500mg',
        },
        {
            'nom': 'Riz Parfumé Premium',
            'description_courte': 'Riz basmati de qualité supérieure - Sac 25kg',
            'description_longue': 'Riz basmati premium importé, grains longs et parfumés, idéal pour tous vos plats. Sac de 25kg pour usage familial ou professionnel.',
            'categorie': categories[4],
            'sku': 'RIZ-BASM-25KG',
            'code_barre': '1234567890126',
            'prix_achat': Decimal('12000'),
            'prix_vente': Decimal('18000'),
            'tva_taux': Decimal('18.00'),
            'unite_mesure': 'kg',
            'poids': Decimal('25.0'),
            'stock_minimum': 20,
            'stock_maximum': 200,
            'point_recommande': 50,
            'entreprise_id': companies[0].id,
            'popularite_score': 78,
            'nombre_vues': 450,
            'nombre_ventes': 125,
            'slug': 'riz-parfume-premium',
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

def create_warehouses(companies):
    """Créer les entrepôts."""
    warehouses_data = [
        {
            'nom': 'Entrepôt Principal Dakar',
            'code': 'DAK-001',
            'description': 'Entrepôt principal situé à Dakar',
            'entreprise_id': companies[0].id,
            'principal': True,
        },
        {
            'nom': 'Entrepôt Secondaire Pikine',
            'code': 'PIK-001',
            'description': 'Entrepôt secondaire à Pikine',
            'entreprise_id': companies[0].id,
        },
        {
            'nom': 'Centre Logistique Tech',
            'code': 'TECH-001',
            'description': 'Centre logistique pour produits technologiques',
            'entreprise_id': companies[1].id,
            'principal': True,
        },
        {
            'nom': 'Pharmacie Centrale',
            'code': 'PHAR-001',
            'description': 'Stock central de la pharmacie',
            'entreprise_id': companies[2].id,
            'principal': True,
        }
    ]
    
    warehouses = []
    for warehouse_data in warehouses_data:
        warehouse, created = Entrepot.objects.get_or_create(
            code=warehouse_data['code'],
            defaults=warehouse_data
        )
        if created:
            print(f"✅ Entrepôt créé: {warehouse.nom}")
        warehouses.append(warehouse)
    
    return warehouses

def create_stock(products, warehouses):
    """Créer les stocks."""
    for product in products:
        # Trouver l'entrepôt de l'entreprise du produit
        warehouse = next((w for w in warehouses if w.entreprise_id == product.entreprise_id), None)
        if warehouse:
            stock_quantity = random.randint(10, 200)
            stock, created = Stock.objects.get_or_create(
                produit=product,
                entrepot=warehouse,
                defaults={
                    'quantite_physique': stock_quantity,
                    'quantite_reservee': random.randint(0, 5),
                    'cout_unitaire_moyen': product.prix_achat,
                    'emplacement': f"A{random.randint(1,10)}-{random.randint(1,20)}",
                    'zone': random.choice(['A', 'B', 'C']),
                    'allee': str(random.randint(1, 10)),
                    'etagere': str(random.randint(1, 5)),
                }
            )
            if created:
                print(f"✅ Stock créé: {product.nom} - {stock_quantity} unités")

def create_customers(entrepreneurs):
    """Créer les clients."""
    customers_data = [
        {
            'code_client': 'CLI-001',
            'type_client': 'particulier',
            'nom': 'Samb',
            'prenom': 'Abdou',
            'email': 'abdou.samb@email.com',
            'telephone': '+221 77 111 22 33',
            'adresse_facturation': '25 Rue de la Paix, Médina, Dakar',
            'adresse_livraison': '25 Rue de la Paix, Médina, Dakar',
            'segment': 'regulier',
            'score_fidelite': 85,
            'source_acquisition': 'referencement',
            'total_achats': Decimal('450000'),
            'nombre_commandes': 12,
            'panier_moyen': Decimal('37500'),
            'points_fidelite': 450,
            'niveau_fidelite': 'argent',
            'entrepreneur': entrepreneurs[0],
        },
        {
            'code_client': 'CLI-002',
            'type_client': 'professionnel',
            'nom': 'Fall',
            'prenom': 'Aïcha',
            'entreprise_nom': 'Salon de Beauté Aïcha',
            'email': 'aicha.fall@salonbeaute.sn',
            'telephone': '+221 77 222 33 44',
            'adresse_facturation': '12 Avenue Pompidou, Plateau, Dakar',
            'segment': 'vip',
            'score_fidelite': 95,
            'source_acquisition': 'bouche_a_oreille',
            'total_achats': Decimal('850000'),
            'nombre_commandes': 28,
            'panier_moyen': Decimal('30357'),
            'points_fidelite': 850,
            'niveau_fidelite': 'or',
            'entrepreneur': entrepreneurs[0],
        },
        {
            'code_client': 'CLI-003',
            'type_client': 'entreprise',
            'nom': 'Ndiaye',
            'prenom': 'Moussa',
            'entreprise_nom': 'Restaurant Le Baobab',
            'email': 'moussa@restaurant-baobab.sn',
            'telephone': '+221 77 333 44 55',
            'adresse_facturation': '8 Corniche Ouest, Almadies, Dakar',
            'segment': 'nouveau',
            'score_fidelite': 45,
            'source_acquisition': 'publicite',
            'total_achats': Decimal('125000'),
            'nombre_commandes': 3,
            'panier_moyen': Decimal('41667'),
            'points_fidelite': 125,
            'niveau_fidelite': 'bronze',
            'entrepreneur': entrepreneurs[0],
        }
    ]
    
    customers = []
    for customer_data in customers_data:
        customer, created = Client.objects.get_or_create(
            code_client=customer_data['code_client'],
            entrepreneur=customer_data['entrepreneur'],
            defaults=customer_data
        )
        if created:
            print(f"✅ Client créé: {customer.nom} {customer.prenom}")
        customers.append(customer)
    
    return customers

def create_sales(entrepreneurs, customers, products):
    """Créer les ventes de test."""
    for i in range(20):
        entrepreneur = random.choice(entrepreneurs)
        customer = random.choice([c for c in customers if c.entrepreneur == entrepreneur])
        
        # Créer la vente
        vente = Vente.objects.create(
            client=customer,
            entrepreneur=entrepreneur,
            vendeur=entrepreneur,
            date_creation=timezone.now() - timedelta(days=random.randint(0, 30)),
            statut=random.choice(['confirmee', 'livree', 'terminee']),
            mode_paiement=random.choice(['cash', 'wave', 'orange_money', 'card']),
            statut_paiement='completed',
            date_paiement=timezone.now() - timedelta(days=random.randint(0, 30)),
            source_vente=random.choice(['pos', 'online', 'telephone']),
        )
        
        # Ajouter des lignes de vente
        num_lines = random.randint(1, 4)
        sous_total = Decimal('0')
        
        for j in range(num_lines):
            # Sélectionner un produit de la même entreprise
            available_products = [p for p in products if p.entreprise_id == entrepreneur.entreprise_id]
            if available_products:
                product = random.choice(available_products)
                quantite = random.randint(1, 5)
                prix_unitaire = product.prix_vente
                
                ligne = LigneVente.objects.create(
                    vente=vente,
                    produit=product,
                    quantite=quantite,
                    prix_unitaire=prix_unitaire,
                    remise_pourcentage=Decimal(str(random.uniform(0, 10))),
                    tva_taux=product.tva_taux,
                )
                
                sous_total += ligne.total_ttc
        
        # Mettre à jour les totaux de la vente
        vente.sous_total = sous_total
        vente.taxe_montant = sous_total * Decimal('0.18')
        vente.total_ttc = sous_total
        vente.save()
        
        print(f"✅ Vente créée: {vente.numero_facture} - {vente.total_ttc} XOF")

def create_projects(entrepreneurs, customers):
    """Créer les projets de test."""
    projects_data = [
        {
            'nom': 'Site E-commerce Boutique Marie',
            'description': 'Développement d\'un site e-commerce moderne pour la boutique',
            'code_projet': 'PROJ-001',
            'entrepreneur': entrepreneurs[1],  # TechSolutions
            'client': customers[1],  # Aïcha Fall
            'date_debut': date.today() - timedelta(days=15),
            'date_fin_prevue': date.today() + timedelta(days=45),
            'statut': 'en_cours',
            'priorite': 'high',
            'budget_prevu': Decimal('2500000'),
            'budget_consomme': Decimal('800000'),
            'marge_prevue': Decimal('750000'),
            'pourcentage_completion': 35,
        },
        {
            'nom': 'Système de Gestion Pharmacie',
            'description': 'Implémentation d\'un système de gestion complet pour la pharmacie',
            'code_projet': 'PROJ-002',
            'entrepreneur': entrepreneurs[1],  # TechSolutions
            'client': customers[0],  # Abdou Samb (représentant pharmacie)
            'date_debut': date.today() - timedelta(days=30),
            'date_fin_prevue': date.today() + timedelta(days=30),
            'statut': 'en_cours',
            'priorite': 'urgent',
            'budget_prevu': Decimal('1800000'),
            'budget_consomme': Decimal('1200000'),
            'marge_prevue': Decimal('500000'),
            'pourcentage_completion': 70,
        }
    ]
    
    projects = []
    for project_data in projects_data:
        project, created = Projet.objects.get_or_create(
            code_projet=project_data['code_projet'],
            defaults=project_data
        )
        if created:
            project.responsable = project.entrepreneur
            project.save()
            print(f"✅ Projet créé: {project.nom}")
        projects.append(project)
    
    return projects

def create_badges():
    """Créer les badges de gamification."""
    badges_data = [
        {
            'nom': 'Premier Pas',
            'description': 'Première connexion à la plateforme',
            'icone': 'star',
            'couleur': '#FFD700',
            'points_bonus': 10,
            'conditions': {'first_login': True},
        },
        {
            'nom': 'Vendeur Pro',
            'description': '100 ventes réalisées',
            'icone': 'trophy',
            'couleur': '#FF6B35',
            'points_bonus': 100,
            'conditions': {'sales_count': 100},
        },
        {
            'nom': 'Client Fidèle',
            'description': '50 achats effectués',
            'icone': 'heart',
            'couleur': '#E91E63',
            'points_bonus': 50,
            'conditions': {'purchases_count': 50},
        },
        {
            'nom': 'Gestionnaire Expert',
            'description': '500 produits ajoutés',
            'icone': 'package',
            'couleur': '#2196F3',
            'points_bonus': 200,
            'rare': True,
            'conditions': {'products_added': 500},
        }
    ]
    
    badges = []
    for badge_data in badges_data:
        badge, created = Badge.objects.get_or_create(
            nom=badge_data['nom'],
            defaults=badge_data
        )
        if created:
            print(f"✅ Badge créé: {badge.nom}")
        badges.append(badge)
    
    return badges

def create_notifications(users):
    """Créer des notifications de test."""
    notifications_data = [
        {
            'titre': 'Bienvenue sur la plateforme !',
            'message': 'Découvrez toutes les fonctionnalités de votre nouveau tableau de bord.',
            'type': 'info',
            'action_url': '/dashboard',
            'action_label': 'Explorer',
        },
        {
            'titre': 'Stock bas détecté',
            'message': 'Le produit iPhone 15 Pro a un stock inférieur au minimum recommandé.',
            'type': 'warning',
            'action_url': '/inventory/products',
            'action_label': 'Voir le stock',
        },
        {
            'titre': 'Nouvelle vente !',
            'message': 'Une vente de 85,000 XOF vient d\'être réalisée.',
            'type': 'success',
            'action_url': '/sales',
            'action_label': 'Voir la vente',
        },
        {
            'titre': 'Paiement reçu',
            'message': 'Paiement Wave Money de 125,000 XOF confirmé.',
            'type': 'success',
            'action_url': '/payments',
            'action_label': 'Voir les paiements',
        }
    ]
    
    for user in users:
        for notif_data in notifications_data:
            notification = Notification.objects.create(
                utilisateur=user,
                **notif_data,
                metadata={'test_data': True}
            )
            print(f"✅ Notification créée pour {user.first_name}: {notification.titre}")

def create_support_tickets(users):
    """Créer des tickets de support."""
    tickets_data = [
        {
            'sujet': 'Problème de synchronisation stock',
            'description': 'Les quantités en stock ne se mettent pas à jour automatiquement après les ventes.',
            'categorie': 'technique',
            'priorite': 'high',
        },
        {
            'sujet': 'Question sur la facturation',
            'description': 'Comment configurer la TVA pour les produits exonérés ?',
            'categorie': 'facturation',
            'priorite': 'medium',
        },
        {
            'sujet': 'Demande de formation',
            'description': 'Souhait d\'une formation sur l\'utilisation des analytics avancés.',
            'categorie': 'autre',
            'priorite': 'low',
        }
    ]
    
    for i, ticket_data in enumerate(tickets_data):
        user = users[i % len(users)]
        ticket = TicketSupport.objects.create(
            utilisateur=user,
            **ticket_data
        )
        print(f"✅ Ticket créé: {ticket.numero_ticket}")

def create_faq():
    """Créer la FAQ."""
    faq_data = [
        {
            'question': 'Comment ajouter un nouveau produit ?',
            'reponse': 'Allez dans Gestion Stock > Produits > Ajouter un produit. Remplissez les informations obligatoires et cliquez sur Enregistrer.',
            'categorie': 'produits',
            'ordre_affichage': 1,
        },
        {
            'question': 'Comment configurer Wave Money ?',
            'reponse': 'Dans Paramètres > Intégrations > Paiements, ajoutez vos clés API Wave Money et activez l\'intégration.',
            'categorie': 'paiements',
            'ordre_affichage': 2,
        },
        {
            'question': 'Comment générer un rapport de ventes ?',
            'reponse': 'Allez dans Analytics > Rapports > Nouveau rapport. Sélectionnez "Ventes" et configurez vos critères.',
            'categorie': 'rapports',
            'ordre_affichage': 3,
        }
    ]
    
    for faq_item in faq_data:
        faq, created = FAQ.objects.get_or_create(
            question=faq_item['question'],
            defaults=faq_item
        )
        if created:
            print(f"✅ FAQ créée: {faq.question}")

def create_ai_models():
    """Créer les modèles IA."""
    models_data = [
        {
            'nom': 'Recommandations Produits',
            'description': 'Modèle de recommandation basé sur l\'historique d\'achat',
            'type_modele': 'recommendation',
            'version': '1.0',
            'statut': 'actif',
            'precision': Decimal('0.8500'),
            'rappel': Decimal('0.7800'),
            'f1_score': Decimal('0.8140'),
            'taille_dataset': 10000,
            'nombre_predictions': 2500,
        },
        {
            'nom': 'Prédiction Ventes',
            'description': 'Prédiction des ventes futures basée sur l\'historique',
            'type_modele': 'prediction_ventes',
            'version': '2.1',
            'statut': 'actif',
            'precision': Decimal('0.9200'),
            'rappel': Decimal('0.8900'),
            'f1_score': Decimal('0.9048'),
            'taille_dataset': 25000,
            'nombre_predictions': 1200,
        },
        {
            'nom': 'Chatbot Support',
            'description': 'Assistant virtuel pour le support client',
            'type_modele': 'chatbot',
            'version': '1.5',
            'statut': 'actif',
            'precision': Decimal('0.7800'),
            'rappel': Decimal('0.8200'),
            'f1_score': Decimal('0.7995'),
            'taille_dataset': 5000,
            'nombre_predictions': 8500,
        }
    ]
    
    for model_data in models_data:
        model, created = ModeleIA.objects.get_or_create(
            nom=model_data['nom'],
            version=model_data['version'],
            defaults=model_data
        )
        if created:
            print(f"✅ Modèle IA créé: {model.nom}")

def create_analytics_metrics(entrepreneurs):
    """Créer les métriques analytics."""
    for entrepreneur in entrepreneurs:
        # Métriques des 7 derniers jours
        for i in range(7):
            date_metrique = date.today() - timedelta(days=i)
            
            # Ventes du jour
            MetriquePerformance.objects.create(
                type_metrique='ventes_jour',
                entrepreneur=entrepreneur,
                valeur_numerique=Decimal(str(random.randint(50000, 200000))),
                date_debut=date_metrique,
                date_fin=date_metrique,
            )
            
            # Clients actifs
            MetriquePerformance.objects.create(
                type_metrique='clients_actifs',
                entrepreneur=entrepreneur,
                valeur_numerique=Decimal(str(random.randint(10, 50))),
                date_debut=date_metrique,
                date_fin=date_metrique,
            )
            
            # Panier moyen
            MetriquePerformance.objects.create(
                type_metrique='panier_moyen',
                entrepreneur=entrepreneur,
                valeur_numerique=Decimal(str(random.randint(25000, 75000))),
                date_debut=date_metrique,
                date_fin=date_metrique,
            )
    
    print("✅ Métriques analytics créées")

def main():
    """Fonction principale pour peupler la base de données."""
    print("🚀 Début du peuplement de la base de données...")
    
    # 1. Plans d'abonnement
    print("\n📋 Création des plans d'abonnement...")
    create_subscription_plans()
    
    # 2. Entreprises
    print("\n🏢 Création des entreprises...")
    companies = create_companies()
    
    # 3. Utilisateurs
    print("\n👥 Création des utilisateurs...")
    admin, entrepreneurs, clients = create_users(companies)
    all_users = [admin] + entrepreneurs + clients
    
    # 4. Catégories
    print("\n📂 Création des catégories...")
    categories = create_categories()
    
    # 5. Marques
    print("\n🏷️ Création des marques...")
    brands = create_brands()
    
    # 6. Fournisseurs
    print("\n🏭 Création des fournisseurs...")
    suppliers = create_suppliers(companies)
    
    # 7. Produits
    print("\n📦 Création des produits...")
    products = create_products(categories, brands, companies)
    
    # 8. Entrepôts
    print("\n🏪 Création des entrepôts...")
    warehouses = create_warehouses(companies)
    
    # 9. Stock
    print("\n📊 Création des stocks...")
    create_stock(products, warehouses)
    
    # 10. Clients
    print("\n👤 Création des clients...")
    customers = create_customers(entrepreneurs)
    
    # 11. Ventes
    print("\n💰 Création des ventes...")
    create_sales(entrepreneurs, customers, products)
    
    # 12. Projets
    print("\n🎯 Création des projets...")
    projects = create_projects(entrepreneurs, customers)
    
    # 13. Badges
    print("\n🏆 Création des badges...")
    badges = create_badges()
    
    # 14. Notifications
    print("\n🔔 Création des notifications...")
    create_notifications(all_users)
    
    # 15. Support
    print("\n🎫 Création des tickets de support...")
    create_support_tickets(all_users)
    
    # 16. FAQ
    print("\n❓ Création de la FAQ...")
    create_faq()
    
    # 17. Modèles IA
    print("\n🤖 Création des modèles IA...")
    create_ai_models()
    
    # 18. Métriques Analytics
    print("\n📈 Création des métriques analytics...")
    create_analytics_metrics(entrepreneurs)
    
    print("\n✅ Peuplement de la base de données terminé avec succès !")
    print("\n📊 Résumé des données créées:")
    print(f"   • {PlanAbonnement.objects.count()} plans d'abonnement")
    print(f"   • {Entreprise.objects.count()} entreprises")
    print(f"   • {User.objects.count()} utilisateurs")
    print(f"   • {Categorie.objects.count()} catégories")
    print(f"   • {Marque.objects.count()} marques")
    print(f"   • {Produit.objects.count()} produits")
    print(f"   • {Stock.objects.count()} stocks")
    print(f"   • {Client.objects.count()} clients")
    print(f"   • {Vente.objects.count()} ventes")
    print(f"   • {Projet.objects.count()} projets")
    print(f"   • {Badge.objects.count()} badges")
    print(f"   • {Notification.objects.count()} notifications")
    print(f"   • {TicketSupport.objects.count()} tickets de support")
    print(f"   • {FAQ.objects.count()} questions FAQ")
    print(f"   • {ModeleIA.objects.count()} modèles IA")
    print(f"   • {MetriquePerformance.objects.count()} métriques")
    
    print("\n🎉 La plateforme est maintenant prête avec des données de test complètes !")
    print("\n🔐 Comptes de test disponibles:")
    print("   👑 Admin: admin@platform.com / password")
    print("   💼 Entrepreneur 1: marie@boutiquemarie.sn / password")
    print("   💼 Entrepreneur 2: amadou@techsolutions.sn / password")
    print("   💼 Entrepreneur 3: fatou@pharmaciemoderne.sn / password")
    print("   🛍️ Client 1: client1@example.com / password")
    print("   🛍️ Client 2: client2@example.com / password")
    print("   🛍️ Client 3: client3@example.com / password")

if __name__ == '__main__':
    main()