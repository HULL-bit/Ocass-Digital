#!/usr/bin/env python
"""
Script pour peupler la base de données avec des données réalistes du Sénégal.
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
from apps.products.models import Categorie, Marque, Fournisseur, Produit
from apps.customers.models import Client
from apps.sales.models import Vente, LigneVente

User = get_user_model()

def create_senegal_companies():
    """Créer des entreprises sénégalaises réalistes."""
    plan_pro = PlanAbonnement.objects.get(nom='Professional')
    plan_enterprise = PlanAbonnement.objects.get(nom='Enterprise')
    
    senegal_companies = [
        {
            'nom': 'Auchan Sénégal',
            'secteur_activite': 'commerce',
            'adresse_complete': 'Sea Plaza, Route de l\'Aéroport, Dakar',
            'ville': 'Dakar',
            'region': 'Dakar',
            'telephone': '+221 33 869 69 69',
            'email': 'contact@auchan.sn',
            'site_web': 'https://auchan.sn',
            'couleur_primaire': '#E60012',
            'couleur_secondaire': '#FF6B35',
            'plan_abonnement': plan_enterprise,
            'nombre_employes': 150,
            'chiffre_affaires_annuel': Decimal('2500000000'),
        },
        {
            'nom': 'Touba Distribution',
            'secteur_activite': 'commerce',
            'adresse_complete': 'Marché Central, Touba, Diourbel',
            'ville': 'Touba',
            'region': 'Diourbel',
            'telephone': '+221 33 975 12 34',
            'email': 'info@toubadistrib.sn',
            'couleur_primaire': '#2E7D32',
            'couleur_secondaire': '#4CAF50',
            'plan_abonnement': plan_pro,
            'nombre_employes': 25,
            'chiffre_affaires_annuel': Decimal('450000000'),
        },
        {
            'nom': 'Pharmacie du Plateau',
            'secteur_activite': 'sante',
            'adresse_complete': 'Place de l\'Indépendance, Plateau, Dakar',
            'ville': 'Dakar',
            'region': 'Dakar',
            'telephone': '+221 33 821 23 45',
            'email': 'contact@pharmacieplateau.sn',
            'couleur_primaire': '#1976D2',
            'couleur_secondaire': '#42A5F5',
            'plan_abonnement': plan_pro,
            'nombre_employes': 12,
            'chiffre_affaires_annuel': Decimal('180000000'),
        },
        {
            'nom': 'Atelier Couture Fatou',
            'secteur_activite': 'artisanat',
            'adresse_complete': 'Médina, Rue 15, Dakar',
            'ville': 'Dakar',
            'region': 'Dakar',
            'telephone': '+221 77 654 32 10',
            'email': 'fatou@ateliercouture.sn',
            'couleur_primaire': '#E91E63',
            'couleur_secondaire': '#F06292',
            'plan_abonnement': plan_pro,
            'nombre_employes': 8,
            'chiffre_affaires_annuel': Decimal('85000000'),
        },
        {
            'nom': 'Restaurant Teranga',
            'secteur_activite': 'services',
            'adresse_complete': 'Corniche Ouest, Almadies, Dakar',
            'ville': 'Dakar',
            'region': 'Dakar',
            'telephone': '+221 33 820 45 67',
            'email': 'reservation@teranga.sn',
            'site_web': 'https://restaurant-teranga.sn',
            'couleur_primaire': '#FF5722',
            'couleur_secondaire': '#FF8A65',
            'plan_abonnement': plan_pro,
            'nombre_employes': 35,
            'chiffre_affaires_annuel': Decimal('320000000'),
        },
        {
            'nom': 'Garage Auto Thiès',
            'secteur_activite': 'services',
            'adresse_complete': 'Route de Dakar, Thiès',
            'ville': 'Thiès',
            'region': 'Thiès',
            'telephone': '+221 33 951 78 90',
            'email': 'contact@garageauto.sn',
            'couleur_primaire': '#424242',
            'couleur_secondaire': '#757575',
            'plan_abonnement': plan_pro,
            'nombre_employes': 15,
            'chiffre_affaires_annuel': Decimal('125000000'),
        },
        {
            'nom': 'Boulangerie Moderne Saint-Louis',
            'secteur_activite': 'alimentation',
            'adresse_complete': 'Île de Saint-Louis, Saint-Louis',
            'ville': 'Saint-Louis',
            'region': 'Saint-Louis',
            'telephone': '+221 33 961 23 45',
            'email': 'commande@boulangerie-sl.sn',
            'couleur_primaire': '#8D6E63',
            'couleur_secondaire': '#A1887F',
            'plan_abonnement': plan_pro,
            'nombre_employes': 20,
            'chiffre_affaires_annuel': Decimal('95000000'),
        },
    ]
    
    created_companies = []
    for company_data in senegal_companies:
        company, created = Entreprise.objects.get_or_create(
            nom=company_data['nom'],
            defaults=company_data
        )
        if created:
            print(f"✅ Entreprise sénégalaise créée: {company.nom}")
        created_companies.append(company)
    
    return created_companies

def create_senegal_products():
    """Créer des produits typiquement sénégalais."""
    # Récupérer les catégories existantes
    alimentation = Categorie.objects.get_or_create(
        slug='alimentation',
        defaults={
            'nom': 'Alimentation',
            'description': 'Produits alimentaires locaux et importés',
            'icone': 'utensils',
            'couleur': '#FF9800',
        }
    )[0]
    
    artisanat = Categorie.objects.get_or_create(
        slug='artisanat',
        defaults={
            'nom': 'Artisanat',
            'description': 'Produits artisanaux sénégalais',
            'icone': 'palette',
            'couleur': '#795548',
        }
    )[0]
    
    # Marques locales
    marques_locales = [
        {'nom': 'Kirène', 'pays_origine': 'Sénégal'},
        {'nom': 'Soboa', 'pays_origine': 'Sénégal'},
        {'nom': 'Patisen', 'pays_origine': 'Sénégal'},
        {'nom': 'Artisan Sénégal', 'pays_origine': 'Sénégal'},
        {'nom': 'Wax Authentique', 'pays_origine': 'Sénégal'},
    ]
    
    for marque_data in marques_locales:
        Marque.objects.get_or_create(
            nom=marque_data['nom'],
            defaults=marque_data
        )
    
    # Récupérer les entreprises
    entreprises = list(Entreprise.objects.all())
    
    produits_senegal = [
        # Alimentation
        {
            'nom': 'Riz Brisé Local',
            'description_courte': 'Riz brisé de qualité supérieure produit au Sénégal',
            'description_longue': 'Riz brisé cultivé dans la vallée du fleuve Sénégal, parfait pour le thiéboudienne et autres plats traditionnels.',
            'categorie': alimentation,
            'sku': 'RIZ-BRISE-25KG',
            'prix_achat': Decimal('8000'),
            'prix_vente': Decimal('12000'),
            'unite_mesure': 'kg',
            'poids': Decimal('25.0'),
            'stock_minimum': 50,
            'stock_maximum': 500,
            'entreprise': random.choice(entreprises),
            'slug': 'riz-brise-local',
        },
        {
            'nom': 'Huile d\'Arachide Soboa',
            'description_courte': 'Huile d\'arachide 100% naturelle - Bidon 5L',
            'description_longue': 'Huile d\'arachide pure extraite des meilleures arachides sénégalaises, idéale pour la cuisine traditionnelle.',
            'categorie': alimentation,
            'sku': 'HUILE-ARACH-5L',
            'prix_achat': Decimal('4500'),
            'prix_vente': Decimal('6500'),
            'unite_mesure': 'l',
            'stock_minimum': 30,
            'stock_maximum': 200,
            'entreprise': random.choice(entreprises),
            'slug': 'huile-arachide-soboa',
        },
        {
            'nom': 'Thiakry Traditionnel',
            'description_courte': 'Dessert traditionnel sénégalais au lait caillé',
            'description_longue': 'Thiakry artisanal préparé selon la recette traditionnelle avec du lait caillé, couscous et arômes naturels.',
            'categorie': alimentation,
            'sku': 'THIAKRY-500G',
            'prix_achat': Decimal('800'),
            'prix_vente': Decimal('1500'),
            'unite_mesure': 'piece',
            'stock_minimum': 20,
            'stock_maximum': 100,
            'entreprise': random.choice(entreprises),
            'slug': 'thiakry-traditionnel',
        },
        {
            'nom': 'Bissap Rouge Kirène',
            'description_courte': 'Boisson à base d\'hibiscus - Bouteille 1.5L',
            'description_longue': 'Boisson rafraîchissante à base de fleurs d\'hibiscus, riche en vitamine C et antioxydants.',
            'categorie': alimentation,
            'sku': 'BISSAP-1.5L',
            'prix_achat': Decimal('600'),
            'prix_vente': Decimal('1200'),
            'unite_mesure': 'piece',
            'stock_minimum': 40,
            'stock_maximum': 300,
            'entreprise': random.choice(entreprises),
            'slug': 'bissap-rouge-kirene',
        },
        
        # Artisanat
        {
            'nom': 'Boubou Grand Boubou Homme',
            'description_courte': 'Boubou traditionnel brodé main pour homme',
            'description_longue': 'Magnifique boubou traditionnel sénégalais avec broderies artisanales, confectionné par des maîtres tailleurs.',
            'categorie': artisanat,
            'sku': 'BOUBOU-H-001',
            'prix_achat': Decimal('25000'),
            'prix_vente': Decimal('65000'),
            'couleurs_disponibles': ['Blanc', 'Bleu Royal', 'Noir', 'Beige'],
            'tailles_disponibles': ['M', 'L', 'XL', 'XXL', 'XXXL'],
            'stock_minimum': 5,
            'stock_maximum': 50,
            'entreprise': random.choice(entreprises),
            'slug': 'boubou-grand-boubou-homme',
        },
        {
            'nom': 'Kaftan Femme Bazin',
            'description_courte': 'Kaftan élégant en bazin riche avec broderies',
            'description_longue': 'Kaftan féminin en bazin riche de qualité supérieure, orné de broderies dorées traditionnelles.',
            'categorie': artisanat,
            'sku': 'KAFTAN-F-001',
            'prix_achat': Decimal('35000'),
            'prix_vente': Decimal('85000'),
            'couleurs_disponibles': ['Blanc Cassé', 'Rose Poudré', 'Bleu Ciel', 'Vert Menthe'],
            'tailles_disponibles': ['S', 'M', 'L', 'XL', 'XXL'],
            'stock_minimum': 8,
            'stock_maximum': 40,
            'entreprise': random.choice(entreprises),
            'slug': 'kaftan-femme-bazin',
        },
        {
            'nom': 'Masque Africain Décoratif',
            'description_courte': 'Masque traditionnel sculpté en bois d\'ébène',
            'description_longue': 'Masque décoratif authentique sculpté à la main dans du bois d\'ébène par des artisans de Casamance.',
            'categorie': artisanat,
            'sku': 'MASQUE-EBENE-001',
            'prix_achat': Decimal('15000'),
            'prix_vente': Decimal('35000'),
            'stock_minimum': 10,
            'stock_maximum': 50,
            'entreprise': random.choice(entreprises),
            'slug': 'masque-africain-decoratif',
        },
        {
            'nom': 'Djembé Artisanal',
            'description_courte': 'Djembé traditionnel en peau de chèvre',
            'description_longue': 'Djembé authentique fabriqué selon les techniques ancestrales, avec peau de chèvre et bois de lenké.',
            'categorie': artisanat,
            'sku': 'DJEMBE-TRAD-001',
            'prix_achat': Decimal('45000'),
            'prix_vente': Decimal('95000'),
            'tailles_disponibles': ['Petit (25cm)', 'Moyen (30cm)', 'Grand (35cm)'],
            'stock_minimum': 5,
            'stock_maximum': 25,
            'entreprise': random.choice(entreprises),
            'slug': 'djembe-artisanal',
        },
        {
            'nom': 'Sac en Cuir Maroquinerie',
            'description_courte': 'Sac à main en cuir véritable fait main',
            'description_longue': 'Sac à main élégant en cuir véritable, confectionné par des maroquiniers expérimentés de Dakar.',
            'categorie': artisanat,
            'sku': 'SAC-CUIR-001',
            'prix_achat': Decimal('18000'),
            'prix_vente': Decimal('45000'),
            'couleurs_disponibles': ['Marron', 'Noir', 'Camel', 'Rouge'],
            'stock_minimum': 15,
            'stock_maximum': 80,
            'entreprise': random.choice(entreprises),
            'slug': 'sac-cuir-maroquinerie',
        },
        
        # Produits de santé locaux
        {
            'nom': 'Savon Noir Africain',
            'description_courte': 'Savon noir traditionnel aux huiles naturelles',
            'description_longue': 'Savon noir authentique fabriqué avec des huiles de karité et de coco, idéal pour tous types de peau.',
            'categorie': alimentation,  # Ou créer catégorie cosmétiques
            'sku': 'SAVON-NOIR-250G',
            'prix_achat': Decimal('1200'),
            'prix_vente': Decimal('2500'),
            'unite_mesure': 'piece',
            'stock_minimum': 50,
            'stock_maximum': 300,
            'entreprise': random.choice(entreprises),
            'slug': 'savon-noir-africain',
        },
        {
            'nom': 'Beurre de Karité Pur',
            'description_courte': 'Beurre de karité 100% naturel - Pot 200g',
            'description_longue': 'Beurre de karité pur extrait des noix de karité du Sénégal, excellent pour hydrater la peau.',
            'categorie': alimentation,
            'sku': 'KARITE-200G',
            'prix_achat': Decimal('2000'),
            'prix_vente': Decimal('4500'),
            'unite_mesure': 'piece',
            'stock_minimum': 25,
            'stock_maximum': 150,
            'entreprise': random.choice(entreprises),
            'slug': 'beurre-karite-pur',
        },
        
        # Épices et condiments
        {
            'nom': 'Cube Maggi Crevette',
            'description_courte': 'Cube d\'assaisonnement goût crevette - Boîte 24 cubes',
            'description_longue': 'Cubes d\'assaisonnement Maggi au goût crevette, indispensables pour la cuisine sénégalaise.',
            'categorie': alimentation,
            'sku': 'MAGGI-CREV-24',
            'prix_achat': Decimal('800'),
            'prix_vente': Decimal('1500'),
            'unite_mesure': 'piece',
            'stock_minimum': 100,
            'stock_maximum': 1000,
            'entreprise': random.choice(entreprises),
            'slug': 'cube-maggi-crevette',
        },
        {
            'nom': 'Piment Pilé Traditionnel',
            'description_courte': 'Piment rouge pilé artisanal - Sachet 100g',
            'description_longue': 'Piment rouge pilé selon la méthode traditionnelle, parfait pour relever vos plats sénégalais.',
            'categorie': alimentation,
            'sku': 'PIMENT-PILE-100G',
            'prix_achat': Decimal('500'),
            'prix_vente': Decimal('1000'),
            'unite_mesure': 'piece',
            'stock_minimum': 80,
            'stock_maximum': 500,
            'entreprise': random.choice(entreprises),
            'slug': 'piment-pile-traditionnel',
        },
        {
            'nom': 'Soumbala Fermenté',
            'description_courte': 'Condiment traditionnel fermenté - Pot 150g',
            'description_longue': 'Soumbala traditionnel fermenté, condiment essentiel de la cuisine sénégalaise, riche en protéines.',
            'categorie': alimentation,
            'sku': 'SOUMBALA-150G',
            'prix_achat': Decimal('800'),
            'prix_vente': Decimal('1800'),
            'unite_mesure': 'piece',
            'stock_minimum': 30,
            'stock_maximum': 200,
            'entreprise': random.choice(entreprises),
            'slug': 'soumbala-fermente',
        },
    ]
    
    products = []
    for product_data in produits_senegal:
        product, created = Produit.objects.get_or_create(
            sku=product_data['sku'],
            defaults=product_data
        )
        if created:
            print(f"✅ Produit sénégalais créé: {product.nom}")
        products.append(product)
    
    return products

def create_senegal_customers():
    """Créer des clients avec noms sénégalais."""
    entrepreneurs = User.objects.filter(type_utilisateur='entrepreneur')
    
    noms_senegalais = [
        {'nom': 'Diop', 'prenom': 'Aminata'},
        {'nom': 'Ndiaye', 'prenom': 'Ousmane'},
        {'nom': 'Fall', 'prenom': 'Khadija'},
        {'nom': 'Sarr', 'prenom': 'Ibrahima'},
        {'nom': 'Thiam', 'prenom': 'Mariama'},
        {'nom': 'Ba', 'prenom': 'Moustapha'},
        {'nom': 'Sow', 'prenom': 'Awa'},
        {'nom': 'Gueye', 'prenom': 'Alioune'},
        {'nom': 'Diouf', 'prenom': 'Fatou'},
        {'nom': 'Cissé', 'prenom': 'Mamadou'},
        {'nom': 'Sy', 'prenom': 'Aïssatou'},
        {'nom': 'Mbaye', 'prenom': 'Cheikh'},
        {'nom': 'Seck', 'prenom': 'Ndèye'},
        {'nom': 'Diallo', 'prenom': 'Boubacar'},
        {'nom': 'Kane', 'prenom': 'Marième'},
    ]
    
    quartiers_dakar = [
        'Plateau, Dakar',
        'Médina, Dakar', 
        'Fann, Dakar',
        'Mermoz, Dakar',
        'Sacré-Cœur, Dakar',
        'Point E, Dakar',
        'Almadies, Dakar',
        'Yoff, Dakar',
        'Ouakam, Dakar',
        'Ngor, Dakar',
        'Pikine',
        'Guédiawaye',
        'Rufisque',
        'Bargny',
        'Sébikotane',
    ]
    
    customers = []
    for i, nom_data in enumerate(noms_senegalais):
        entrepreneur = random.choice(entrepreneurs)
        quartier = random.choice(quartiers_dakar)
        
        customer_data = {
            'code_client': f'SN-CLI-{i+10:03d}',
            'type_client': random.choice(['particulier', 'professionnel', 'entreprise']),
            'nom': nom_data['nom'],
            'prenom': nom_data['prenom'],
            'email': f"{nom_data['prenom'].lower()}.{nom_data['nom'].lower()}@email.sn",
            'telephone': f"+221 77 {random.randint(100, 999)} {random.randint(10, 99)} {random.randint(10, 99)}",
            'adresse_facturation': f"{random.randint(1, 50)} Rue {random.choice(['de la Paix', 'de l\'Indépendance', 'Félix Faure', 'Pompidou', 'Bourguiba'])}, {quartier}",
            'segment': random.choice(['nouveau', 'regulier', 'vip', 'inactif']),
            'score_fidelite': random.randint(20, 95),
            'source_acquisition': random.choice(['referencement', 'bouche_a_oreille', 'reseaux_sociaux', 'publicite']),
            'total_achats': Decimal(str(random.randint(50000, 2000000))),
            'nombre_commandes': random.randint(1, 50),
            'points_fidelite': random.randint(50, 2000),
            'niveau_fidelite': random.choice(['bronze', 'argent', 'or', 'platine']),
            'entrepreneur': entrepreneur,
        }
        
        # Calculer panier moyen
        if customer_data['nombre_commandes'] > 0:
            customer_data['panier_moyen'] = customer_data['total_achats'] / customer_data['nombre_commandes']
        
        customer, created = Client.objects.get_or_create(
            code_client=customer_data['code_client'],
            entrepreneur=customer_data['entrepreneur'],
            defaults=customer_data
        )
        if created:
            print(f"✅ Client sénégalais créé: {customer.prenom} {customer.nom}")
        customers.append(customer)
    
    return customers

def create_realistic_sales():
    """Créer des ventes réalistes avec produits sénégalais."""
    entrepreneurs = User.objects.filter(type_utilisateur='entrepreneur')
    
    for entrepreneur in entrepreneurs:
        clients = Client.objects.filter(entrepreneur=entrepreneur)
        products = Produit.objects.filter(entreprise=entrepreneur.entreprise)
        
        if clients.exists() and products.exists():
            # Créer 15-25 ventes par entrepreneur
            num_sales = random.randint(15, 25)
            
            for i in range(num_sales):
                customer = random.choice(clients)
                
                # Date de vente dans les 90 derniers jours
                days_ago = random.randint(0, 90)
                sale_date = timezone.now() - timedelta(days=days_ago)
                
                vente = Vente.objects.create(
                    client=customer,
                    entrepreneur=entrepreneur,
                    vendeur=entrepreneur,
                    date_creation=sale_date,
                    statut=random.choice(['confirmee', 'livree', 'terminee']),
                    mode_paiement=random.choice(['cash', 'wave', 'orange_money', 'card']),
                    statut_paiement='completed',
                    date_paiement=sale_date + timedelta(hours=random.randint(1, 48)),
                    source_vente=random.choice(['pos', 'online', 'telephone', 'visite']),
                    notes=random.choice([
                        'Client satisfait, livraison rapide',
                        'Commande urgente traitée en priorité',
                        'Client fidèle, remise accordée',
                        'Première commande, suivi personnalisé',
                        'Commande groupée famille',
                    ]),
                )
                
                # Ajouter 1-4 lignes par vente
                num_lines = random.randint(1, 4)
                sous_total = Decimal('0')
                
                selected_products = random.sample(list(products), min(num_lines, len(products)))
                
                for product in selected_products:
                    quantite = random.randint(1, 5)
                    remise = Decimal(str(random.uniform(0, 15)))  # Remise jusqu'à 15%
                    
                    ligne = LigneVente.objects.create(
                        vente=vente,
                        produit=product,
                        quantite=quantite,
                        prix_unitaire=product.prix_vente,
                        remise_pourcentage=remise,
                        tva_taux=product.tva_taux,
                        notes=random.choice([
                            'Produit en promotion',
                            'Remise fidélité appliquée',
                            'Prix négocié',
                            'Offre spéciale',
                            '',
                        ]),
                    )
                    
                    sous_total += ligne.total_ttc
                
                # Frais de livraison aléatoires
                frais_livraison = Decimal(str(random.choice([0, 2500, 5000])))
                
                vente.sous_total = sous_total
                vente.taxe_montant = sous_total * Decimal('0.18')
                vente.frais_livraison = frais_livraison
                vente.total_ttc = sous_total + frais_livraison
                vente.save()
                
                print(f"✅ Vente sénégalaise créée: {vente.numero_facture} - {vente.total_ttc} XOF")

def create_senegal_users():
    """Créer des utilisateurs avec profils sénégalais."""
    companies = list(Entreprise.objects.all())
    
    # Entrepreneurs sénégalais
    entrepreneurs_senegal = [
        {
            'username': 'aminata@auchan.sn',
            'email': 'aminata@auchan.sn',
            'first_name': 'Aminata',
            'last_name': 'Diop',
            'entreprise': next((c for c in companies if c.nom == 'Auchan Sénégal'), companies[0]),
            'telephone': '+221 77 123 45 67',
            'type_utilisateur': 'entrepreneur',
            'bio': 'Directrice commerciale passionnée par l\'innovation retail au Sénégal.',
            'competences': ['Gestion commerciale', 'Marketing digital', 'Management équipe'],
        },
        {
            'username': 'ousmane@touba.sn',
            'email': 'ousmane@touba.sn',
            'first_name': 'Ousmane',
            'last_name': 'Ndiaye',
            'entreprise': next((c for c in companies if c.nom == 'Touba Distribution'), companies[1]),
            'telephone': '+221 77 234 56 78',
            'type_utilisateur': 'entrepreneur',
            'bio': 'Entrepreneur engagé dans le développement économique de Touba.',
            'competences': ['Commerce traditionnel', 'Logistique', 'Relations communautaires'],
        },
        {
            'username': 'fatou@atelier.sn',
            'email': 'fatou@atelier.sn',
            'first_name': 'Fatou',
            'last_name': 'Sow',
            'entreprise': next((c for c in companies if c.nom == 'Atelier Couture Fatou'), companies[3]),
            'telephone': '+221 77 345 67 89',
            'type_utilisateur': 'entrepreneur',
            'bio': 'Styliste créatrice spécialisée dans la mode africaine contemporaine.',
            'competences': ['Couture artisanale', 'Design mode', 'Gestion atelier'],
        },
    ]
    
    # Clients sénégalais
    clients_senegal = [
        {
            'username': 'khadija.fall@email.sn',
            'email': 'khadija.fall@email.sn',
            'first_name': 'Khadija',
            'last_name': 'Fall',
            'telephone': '+221 77 456 78 90',
            'type_utilisateur': 'client',
            'bio': 'Amatrice de mode africaine et produits artisanaux authentiques.',
        },
        {
            'username': 'mamadou.cisse@email.sn',
            'email': 'mamadou.cisse@email.sn',
            'first_name': 'Mamadou',
            'last_name': 'Cissé',
            'telephone': '+221 77 567 89 01',
            'type_utilisateur': 'client',
            'bio': 'Passionné de technologie et early adopter des innovations.',
        },
        {
            'username': 'aissatou.sy@email.sn',
            'email': 'aissatou.sy@email.sn',
            'first_name': 'Aïssatou',
            'last_name': 'Sy',
            'telephone': '+221 77 678 90 12',
            'type_utilisateur': 'client',
            'bio': 'Entrepreneure dans l\'événementiel, cliente fidèle.',
        },
    ]
    
    all_users = []
    
    # Créer entrepreneurs
    for user_data in entrepreneurs_senegal:
        user, created = User.objects.get_or_create(
            username=user_data['username'],
            defaults=user_data
        )
        if created:
            user.set_password('password')
            user.save()
            print(f"✅ Entrepreneur sénégalais créé: {user.first_name} {user.last_name}")
        all_users.append(user)
    
    # Créer clients
    for user_data in clients_senegal:
        user, created = User.objects.get_or_create(
            username=user_data['username'],
            defaults=user_data
        )
        if created:
            user.set_password('password')
            user.save()
            print(f"✅ Client sénégalais créé: {user.first_name} {user.last_name}")
        all_users.append(user)
    
    return all_users

def main():
    """Fonction principale pour peupler avec des données sénégalaises."""
    print("🇸🇳 Début du peuplement avec des données sénégalaises...")
    
    # 1. Entreprises sénégalaises
    print("\n🏢 Création des entreprises sénégalaises...")
    companies = create_senegal_companies()
    
    # 2. Utilisateurs sénégalais
    print("\n👥 Création des utilisateurs sénégalais...")
    users = create_senegal_users()
    
    # 3. Produits sénégalais
    print("\n🛍️ Création des produits sénégalais...")
    products = create_senegal_products()
    
    # 4. Clients sénégalais
    print("\n👤 Création des clients sénégalais...")
    customers = create_senegal_customers()
    
    # 5. Ventes réalistes
    print("\n💰 Création des ventes réalistes...")
    create_realistic_sales()
    
    print("\n✅ Données sénégalaises ajoutées avec succès !")
    
    # Statistiques finales
    print(f"\n📊 Statistiques finales:")
    print(f"   • {Entreprise.objects.count()} entreprises au total")
    print(f"   • {User.objects.count()} utilisateurs au total")
    print(f"   • {Produit.objects.count()} produits au total")
    print(f"   • {Client.objects.count()} clients au total")
    print(f"   • {Vente.objects.count()} ventes au total")
    
    print("\n🎉 La plateforme est maintenant remplie de données authentiquement sénégalaises !")

if __name__ == '__main__':
    main()