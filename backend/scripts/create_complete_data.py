#!/usr/bin/env python
"""
Script pour créer des données complètes :
- 10 entreprises avec 50 produits chacune
- 20 clients avec images cohérentes
"""
import os
import sys
import django
from django.conf import settings
from django.core.files.base import ContentFile
from PIL import Image
import io
import random
import uuid
import time
from datetime import datetime, timedelta

# Configuration Django
sys.path.append('/home/suleimaan/Téléchargements/Mm/project/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.users.models import UtilisateurPersonnalise
from apps.companies.models import Entreprise, PlanAbonnement
from apps.products.models import Produit, Categorie, Marque
from apps.customers.models import Client
from apps.core.models import SECTEURS_ACTIVITE

def create_test_image(name, width=400, height=300, color=None):
    """Créer une image de test avec PIL"""
    if color is None:
        color = (random.randint(50, 255), random.randint(50, 255), random.randint(50, 255))
    
    # Créer une image avec un fond coloré
    img = Image.new('RGB', (width, height), color)
    
    # Ajouter du texte sur l'image
    from PIL import ImageDraw, ImageFont
    draw = ImageDraw.Draw(img)
    
    try:
        # Essayer d'utiliser une police système
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 24)
    except:
        # Police par défaut si pas trouvée
        font = ImageFont.load_default()
    
    # Centrer le texte
    text = name[:20]  # Limiter la longueur
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (width - text_width) // 2
    y = (height - text_height) // 2
    
    draw.text((x, y), text, fill=(255, 255, 255), font=font)
    
    # Sauvegarder en mémoire
    img_io = io.BytesIO()
    img.save(img_io, format='PNG')
    img_io.seek(0)
    
    return ContentFile(img_io.getvalue(), name=f"{name.replace(' ', '_')}.png")

def create_subscription_plans():
    """Créer les plans d'abonnement"""
    print("💳 Création des plans d'abonnement...")
    
    plans_data = [
        {
            'nom': 'Plan Starter',
            'description': 'Plan de base pour petites entreprises',
            'prix_mensuel': 5000,
            'prix_annuel': 50000,
            'max_utilisateurs': 2,
            'max_produits': 100,
            'max_ventes_mensuelles': 500,
            'stockage_gb': 1,
            'fonctionnalites': {'inventaire': True, 'ventes': True, 'rapports_basiques': True},
            'populaire': False
        },
        {
            'nom': 'Plan Business',
            'description': 'Plan professionnel pour entreprises en croissance',
            'prix_mensuel': 15000,
            'prix_annuel': 150000,
            'max_utilisateurs': 10,
            'max_produits': 1000,
            'max_ventes_mensuelles': 2000,
            'stockage_gb': 10,
            'fonctionnalites': {'inventaire': True, 'ventes': True, 'rapports_avances': True, 'analytics': True},
            'populaire': True
        },
        {
            'nom': 'Plan Enterprise',
            'description': 'Plan complet pour grandes entreprises',
            'prix_mensuel': 50000,
            'prix_annuel': 500000,
            'max_utilisateurs': 100,
            'max_produits': 10000,
            'max_ventes_mensuelles': 10000,
            'stockage_gb': 100,
            'fonctionnalites': {'inventaire': True, 'ventes': True, 'rapports_avances': True, 'analytics': True, 'api': True, 'support_prioritaire': True},
            'populaire': False
        }
    ]
    
    plans = []
    for plan_data in plans_data:
        plan, created = PlanAbonnement.objects.get_or_create(
            nom=plan_data['nom'],
            defaults=plan_data
        )
        plans.append(plan)
        if created:
            print(f"  ✅ Plan créé: {plan.nom}")
    
    return plans

def create_categories_and_brands():
    """Créer des catégories et marques de base"""
    print("📦 Création des catégories et marques...")
    
    # Catégories
    categories_data = [
        {'nom': 'Électronique', 'description': 'Appareils électroniques et gadgets'},
        {'nom': 'Vêtements', 'description': 'Vêtements et accessoires de mode'},
        {'nom': 'Alimentation', 'description': 'Produits alimentaires et boissons'},
        {'nom': 'Maison & Jardin', 'description': 'Articles pour la maison et le jardin'},
        {'nom': 'Sports', 'description': 'Équipements et vêtements de sport'},
        {'nom': 'Beauté', 'description': 'Produits de beauté et cosmétiques'},
        {'nom': 'Livre', 'description': 'Livres et publications'},
        {'nom': 'Jouets', 'description': 'Jouets et jeux pour enfants'},
        {'nom': 'Automobile', 'description': 'Pièces et accessoires automobiles'},
        {'nom': 'Santé', 'description': 'Produits de santé et bien-être'}
    ]
    
    categories = []
    for cat_data in categories_data:
        slug = cat_data['nom'].lower().replace(' ', '-').replace('&', 'et')
        cat, created = Categorie.objects.get_or_create(
            nom=cat_data['nom'],
            defaults={
                'description': cat_data['description'],
                'slug': slug
            }
        )
        categories.append(cat)
        if created:
            print(f"  ✅ Catégorie créée: {cat.nom}")
    
    # Marques
    marques_data = [
        {'nom': 'TechCorp', 'description': 'Technologie innovante'},
        {'nom': 'FashionStyle', 'description': 'Mode et style'},
        {'nom': 'FoodMaster', 'description': 'Excellence culinaire'},
        {'nom': 'HomePro', 'description': 'Solutions pour la maison'},
        {'nom': 'SportMax', 'description': 'Performance sportive'},
        {'nom': 'BeautyPlus', 'description': 'Beauté naturelle'},
        {'nom': 'BookWorld', 'description': 'Monde des livres'},
        {'nom': 'ToyLand', 'description': 'Jouets de qualité'},
        {'nom': 'AutoParts', 'description': 'Pièces automobiles'},
        {'nom': 'HealthCare', 'description': 'Soins et santé'}
    ]
    
    marques = []
    for marque_data in marques_data:
        marque, created = Marque.objects.get_or_create(
            nom=marque_data['nom'],
            defaults={'description': marque_data['description']}
        )
        marques.append(marque)
        if created:
            print(f"  ✅ Marque créée: {marque.nom}")
    
    return categories, marques

def create_enterprises_and_entrepreneurs(plans):
    """Créer 10 entreprises avec leurs entrepreneurs"""
    print("🏢 Création des entreprises et entrepreneurs...")
    
    entreprises_data = [
        {
            'nom': 'TechStore Dakar',
            'description': 'Magasin d\'électronique et gadgets technologiques',
            'secteur': 'commerce_electronique',
            'entrepreneur': {
                'email': 'techstore@dakar.sn',
                'first_name': 'Ahmadou',
                'last_name': 'Diallo',
                'telephone': '+221771234567'
            }
        },
        {
            'nom': 'Fashion Boutique',
            'description': 'Boutique de mode et vêtements tendance',
            'secteur': 'commerce_textile',
            'entrepreneur': {
                'email': 'fashion@dakar.sn',
                'first_name': 'Fatou',
                'last_name': 'Sarr',
                'telephone': '+221771234568'
            }
        },
        {
            'nom': 'Super Marché Central',
            'description': 'Super marché avec produits alimentaires variés',
            'secteur': 'commerce_alimentaire',
            'entrepreneur': {
                'email': 'supermarche@dakar.sn',
                'first_name': 'Moussa',
                'last_name': 'Ndiaye',
                'telephone': '+221771234569'
            }
        },
        {
            'nom': 'Maison & Déco',
            'description': 'Articles de décoration et mobilier',
            'secteur': 'commerce_maison',
            'entrepreneur': {
                'email': 'maison@dakar.sn',
                'first_name': 'Aminata',
                'last_name': 'Fall',
                'telephone': '+221771234570'
            }
        },
        {
            'nom': 'Sport Center',
            'description': 'Équipements et vêtements de sport',
            'secteur': 'commerce_sport',
            'entrepreneur': {
                'email': 'sport@dakar.sn',
                'first_name': 'Ibrahima',
                'last_name': 'Ba',
                'telephone': '+221771234571'
            }
        },
        {
            'nom': 'Beauty Shop',
            'description': 'Produits de beauté et cosmétiques',
            'secteur': 'commerce_beaute',
            'entrepreneur': {
                'email': 'beauty@dakar.sn',
                'first_name': 'Mariama',
                'last_name': 'Diop',
                'telephone': '+221771234572'
            }
        },
        {
            'nom': 'Book World',
            'description': 'Librairie et papeterie',
            'secteur': 'commerce_livre',
            'entrepreneur': {
                'email': 'bookworld@dakar.sn',
                'first_name': 'Cheikh',
                'last_name': 'Thiam',
                'telephone': '+221771234573'
            }
        },
        {
            'nom': 'Toy Land',
            'description': 'Jouets et jeux pour enfants',
            'secteur': 'commerce_jouets',
            'entrepreneur': {
                'email': 'toyland@dakar.sn',
                'first_name': 'Khadija',
                'last_name': 'Cissé',
                'telephone': '+221771234574'
            }
        },
        {
            'nom': 'Auto Parts Plus',
            'description': 'Pièces et accessoires automobiles',
            'secteur': 'commerce_automobile',
            'entrepreneur': {
                'email': 'autoparts@dakar.sn',
                'first_name': 'Ousmane',
                'last_name': 'Gueye',
                'telephone': '+221771234575'
            }
        },
        {
            'nom': 'Health Care Store',
            'description': 'Produits de santé et bien-être',
            'secteur': 'commerce_sante',
            'entrepreneur': {
                'email': 'healthcare@dakar.sn',
                'first_name': 'Aïcha',
                'last_name': 'Mbaye',
                'telephone': '+221771234576'
            }
        }
    ]
    
    entreprises = []
    entrepreneurs = []
    
    for i, data in enumerate(entreprises_data):
        # Créer l'entrepreneur
        entrepreneur, created = UtilisateurPersonnalise.objects.get_or_create(
            email=data['entrepreneur']['email'],
            defaults={
                'first_name': data['entrepreneur']['first_name'],
                'last_name': data['entrepreneur']['last_name'],
                'telephone': data['entrepreneur']['telephone'],
                'type_utilisateur': 'entrepreneur',
                'username': data['entrepreneur']['email'],
                'is_active': True
            }
        )
        
        if created:
            entrepreneur.set_password('password')
            entrepreneur.save()
            print(f"  ✅ Entrepreneur créé: {entrepreneur.email}")
        
        entrepreneurs.append(entrepreneur)
        
        # Créer l'entreprise
        plan = random.choice(plans)  # Sélectionner un plan aléatoire
        entreprise, created = Entreprise.objects.get_or_create(
            nom=data['nom'],
            defaults={
                'description': data['description'],
                'secteur_activite': data['secteur'],
                'forme_juridique': 'sarl',
                'siret': f'SIRET{i+1:06d}',
                'adresse_complete': f'{i+1}00 Rue de la Paix, Dakar, Sénégal',
                'telephone': f'+2217712345{70+i}',
                'email': data['entrepreneur']['email'],
                'couleur_primaire': '#3B82F6',
                'couleur_secondaire': '#10B981',
                'devise_principale': 'XOF',
                'fuseau_horaire': 'Africa/Dakar',
                'nombre_employes': random.randint(5, 50),
                'chiffre_affaires_annuel': str(random.randint(10000000, 1000000000)),
                'plan_abonnement': plan
            }
        )
        
        if created:
            # Assigner l'entrepreneur à l'entreprise
            entreprise.entrepreneur = entrepreneur
            entreprise.save()
            print(f"  ✅ Entreprise créée: {entreprise.nom}")
        
        entreprises.append(entreprise)
    
    return entreprises, entrepreneurs

def create_products_for_enterprises(entreprises, entrepreneurs, categories, marques):
    """Créer 50 produits pour chaque entreprise"""
    print("📦 Création des produits...")
    
    # Données de produits par secteur
    produits_par_secteur = {
        'commerce_electronique': [
            {'nom': 'Smartphone', 'prix_base': 150000, 'description': 'Téléphone intelligent'},
            {'nom': 'Ordinateur portable', 'prix_base': 300000, 'description': 'Laptop performant'},
            {'nom': 'Tablette', 'prix_base': 120000, 'description': 'Tablette tactile'},
            {'nom': 'Casque audio', 'prix_base': 25000, 'description': 'Casque sans fil'},
            {'nom': 'Chargeur universel', 'prix_base': 15000, 'description': 'Chargeur multi-ports'},
        ],
        'commerce_textile': [
            {'nom': 'T-shirt', 'prix_base': 5000, 'description': 'T-shirt en coton'},
            {'nom': 'Jean', 'prix_base': 15000, 'description': 'Jean classique'},
            {'nom': 'Robe', 'prix_base': 25000, 'description': 'Robe élégante'},
            {'nom': 'Chaussures', 'prix_base': 20000, 'description': 'Chaussures confortables'},
            {'nom': 'Sac à main', 'prix_base': 30000, 'description': 'Sac en cuir'},
        ],
        'commerce_alimentaire': [
            {'nom': 'Riz parfumé', 'prix_base': 2000, 'description': 'Riz de qualité'},
            {'nom': 'Huile de tournesol', 'prix_base': 1500, 'description': 'Huile végétale'},
            {'nom': 'Pâtes alimentaires', 'prix_base': 1000, 'description': 'Pâtes italiennes'},
            {'nom': 'Conserves', 'prix_base': 3000, 'description': 'Conserves variées'},
            {'nom': 'Épices', 'prix_base': 500, 'description': 'Épices du monde'},
        ],
        'commerce_maison': [
            {'nom': 'Vase décoratif', 'prix_base': 8000, 'description': 'Vase en céramique'},
            {'nom': 'Coussin', 'prix_base': 5000, 'description': 'Coussin décoratif'},
            {'nom': 'Lampe', 'prix_base': 12000, 'description': 'Lampe LED'},
            {'nom': 'Tapis', 'prix_base': 15000, 'description': 'Tapis moelleux'},
            {'nom': 'Cadre photo', 'prix_base': 3000, 'description': 'Cadre en bois'},
        ],
        'commerce_sport': [
            {'nom': 'Ballon de football', 'prix_base': 8000, 'description': 'Ballon officiel'},
            {'nom': 'Raquette de tennis', 'prix_base': 25000, 'description': 'Raquette professionnelle'},
            {'nom': 'Vélo', 'prix_base': 80000, 'description': 'Vélo de course'},
            {'nom': 'Chaussures de sport', 'prix_base': 15000, 'description': 'Chaussures running'},
            {'nom': 'Haltères', 'prix_base': 20000, 'description': 'Haltères ajustables'},
        ],
        'commerce_beaute': [
            {'nom': 'Crème hydratante', 'prix_base': 5000, 'description': 'Crème pour le visage'},
            {'nom': 'Rouge à lèvres', 'prix_base': 3000, 'description': 'Rouge longue tenue'},
            {'nom': 'Parfum', 'prix_base': 15000, 'description': 'Parfum de luxe'},
            {'nom': 'Shampoing', 'prix_base': 2000, 'description': 'Shampoing naturel'},
            {'nom': 'Masque facial', 'prix_base': 4000, 'description': 'Masque purifiant'},
        ],
        'commerce_livre': [
            {'nom': 'Roman', 'prix_base': 3000, 'description': 'Roman à succès'},
            {'nom': 'Livre de cuisine', 'prix_base': 5000, 'description': 'Recettes traditionnelles'},
            {'nom': 'Cahier', 'prix_base': 1000, 'description': 'Cahier 200 pages'},
            {'nom': 'Stylo', 'prix_base': 500, 'description': 'Stylo à bille'},
            {'nom': 'Dictionnaire', 'prix_base': 8000, 'description': 'Dictionnaire français'},
        ],
        'commerce_jouets': [
            {'nom': 'Poupée', 'prix_base': 5000, 'description': 'Poupée interactive'},
            {'nom': 'Voiture télécommandée', 'prix_base': 12000, 'description': 'Voiture RC'},
            {'nom': 'Puzzle', 'prix_base': 3000, 'description': 'Puzzle 1000 pièces'},
            {'nom': 'Lego', 'prix_base': 8000, 'description': 'Jeu de construction'},
            {'nom': 'Peluche', 'prix_base': 2000, 'description': 'Ours en peluche'},
        ],
        'commerce_automobile': [
            {'nom': 'Pneu', 'prix_base': 25000, 'description': 'Pneu neuf'},
            {'nom': 'Batterie', 'prix_base': 35000, 'description': 'Batterie auto'},
            {'nom': 'Filtre à huile', 'prix_base': 5000, 'description': 'Filtre haute qualité'},
            {'nom': 'Plaquettes de frein', 'prix_base': 15000, 'description': 'Plaquettes céramiques'},
            {'nom': 'Antigel', 'prix_base': 3000, 'description': 'Liquide de refroidissement'},
        ],
        'commerce_sante': [
            {'nom': 'Vitamines', 'prix_base': 8000, 'description': 'Compléments vitaminés'},
            {'nom': 'Thermomètre', 'prix_base': 5000, 'description': 'Thermomètre digital'},
            {'nom': 'Tensiomètre', 'prix_base': 15000, 'description': 'Tensiomètre électronique'},
            {'nom': 'Masque chirurgical', 'prix_base': 1000, 'description': 'Masque de protection'},
            {'nom': 'Gel hydroalcoolique', 'prix_base': 2000, 'description': 'Désinfectant mains'},
        ]
    }
    
    total_produits = 0
    
    for entreprise in entreprises:
        secteur = entreprise.secteur_activite
        produits_secteur = produits_par_secteur.get(secteur, produits_par_secteur['commerce_electronique'])
        
        # Sélectionner une catégorie et une marque appropriées
        categorie = random.choice(categories)
        marque = random.choice(marques)
        
        print(f"  📦 Création des produits pour {entreprise.nom}...")
        
        for i in range(50):
            # Sélectionner un produit de base
            produit_base = random.choice(produits_secteur)
            
            # Générer des variations
            nom = f"{produit_base['nom']} {i+1}"
            prix_achat = produit_base['prix_base'] + random.randint(-5000, 10000)
            prix_vente = prix_achat * (1 + random.uniform(0.2, 0.5))  # Marge de 20-50%
            
            # Créer le produit
            produit = Produit.objects.create(
                nom=nom,
                description_longue=produit_base['description'],
                description_courte=produit_base['description'][:50],
                prix_achat=prix_achat,
                prix_vente=prix_vente,
                stock_minimum=random.randint(5, 15),
                code_barre=f"BARRE{random.randint(1000000000000, 9999999999999)}",
                sku=f"SKU{entreprise.id.hex[:8].upper()}{i+1:03d}{int(time.time())}",
                slug=f"{nom.lower().replace(' ', '-')}-{i+1}-{int(time.time())}",
                categorie=categorie,
                marque=marque,
                entreprise=entreprise,
                statut='actif'
            )
            
            # Ajouter une image
            try:
                image = create_test_image(nom, color=(random.randint(100, 255), random.randint(100, 255), random.randint(100, 255)))
                produit.image.save(f"{nom.replace(' ', '_')}.png", image, save=True)
            except Exception as e:
                print(f"    ⚠️ Erreur image pour {nom}: {e}")
            
            total_produits += 1
            
            if (i + 1) % 10 == 0:
                print(f"    ✅ {i+1}/50 produits créés")
        
        print(f"  ✅ {entreprise.nom}: 50 produits créés")
    
    print(f"📦 Total: {total_produits} produits créés")

def create_clients(entrepreneurs):
    """Créer 20 clients avec images cohérentes"""
    print("👥 Création des clients...")
    
    clients_data = [
        {'first_name': 'Aminata', 'last_name': 'Diop', 'email': 'aminata.diop@email.com', 'telephone': '+221771234580'},
        {'first_name': 'Moussa', 'last_name': 'Fall', 'email': 'moussa.fall@email.com', 'telephone': '+221771234581'},
        {'first_name': 'Fatou', 'last_name': 'Ndiaye', 'email': 'fatou.ndiaye@email.com', 'telephone': '+221771234582'},
        {'first_name': 'Ibrahima', 'last_name': 'Sarr', 'email': 'ibrahima.sarr@email.com', 'telephone': '+221771234583'},
        {'first_name': 'Mariama', 'last_name': 'Ba', 'email': 'mariama.ba@email.com', 'telephone': '+221771234584'},
        {'first_name': 'Cheikh', 'last_name': 'Cissé', 'email': 'cheikh.cisse@email.com', 'telephone': '+221771234585'},
        {'first_name': 'Khadija', 'last_name': 'Thiam', 'email': 'khadija.thiam@email.com', 'telephone': '+221771234586'},
        {'first_name': 'Ousmane', 'last_name': 'Gueye', 'email': 'ousmane.gueye@email.com', 'telephone': '+221771234587'},
        {'first_name': 'Aïcha', 'last_name': 'Mbaye', 'email': 'aicha.mbaye@email.com', 'telephone': '+221771234588'},
        {'first_name': 'Ahmadou', 'last_name': 'Diallo', 'email': 'ahmadou.diallo@email.com', 'telephone': '+221771234589'},
        {'first_name': 'Awa', 'last_name': 'Sow', 'email': 'awa.sow@email.com', 'telephone': '+221771234590'},
        {'first_name': 'Boubacar', 'last_name': 'Faye', 'email': 'boubacar.faye@email.com', 'telephone': '+221771234591'},
        {'first_name': 'Diarra', 'last_name': 'Kane', 'email': 'diarra.kane@email.com', 'telephone': '+221771234592'},
        {'first_name': 'Elhadj', 'last_name': 'Sy', 'email': 'elhadj.sy@email.com', 'telephone': '+221771234593'},
        {'first_name': 'Fanta', 'last_name': 'Traoré', 'email': 'fanta.traore@email.com', 'telephone': '+221771234594'},
        {'first_name': 'Gora', 'last_name': 'Diagne', 'email': 'gora.diagne@email.com', 'telephone': '+221771234595'},
        {'first_name': 'Hawa', 'last_name': 'Seck', 'email': 'hawa.seck@email.com', 'telephone': '+221771234596'},
        {'first_name': 'Idrissa', 'last_name': 'Wade', 'email': 'idrissa.wade@email.com', 'telephone': '+221771234597'},
        {'first_name': 'Jabou', 'last_name': 'Mbacké', 'email': 'jabou.mbacke@email.com', 'telephone': '+221771234598'},
        {'first_name': 'Khalifa', 'last_name': 'Sall', 'email': 'khalifa.sall@email.com', 'telephone': '+221771234599'}
    ]
    
    clients = []
    
    for i, data in enumerate(clients_data):
        # Créer l'utilisateur client
        user, created = UtilisateurPersonnalise.objects.get_or_create(
            email=data['email'],
            defaults={
                'first_name': data['first_name'],
                'last_name': data['last_name'],
                'telephone': data['telephone'],
                'type_utilisateur': 'client',
                'username': data['email'],
                'is_active': True
            }
        )
        
        if created:
            user.set_password('password')
            user.save()
            print(f"  ✅ Utilisateur client créé: {user.email}")
        
        # Créer le profil client
        client, created = Client.objects.get_or_create(
            email=data['email'],
            defaults={
                'code_client': f"CLI{i+1:03d}{int(time.time())}",
                'nom': data['last_name'],
                'prenom': data['first_name'],
                'telephone': data['telephone'],
                'adresse_facturation': f"{i+1}00 Avenue de la République, Dakar, Sénégal",
                'statut': 'actif',
                'entrepreneur': random.choice(entrepreneurs)
            }
        )
        
        if created:
            # Ajouter une image de profil
            try:
                # Créer une image de profil avec initiales
                initiales = f"{data['first_name'][0]}{data['last_name'][0]}"
                image = create_test_image(initiales, width=200, height=200, 
                                        color=(random.randint(50, 200), random.randint(50, 200), random.randint(50, 200)))
                user.avatar.save(f"avatar_{data['first_name'].lower()}_{data['last_name'].lower()}.png", image, save=True)
            except Exception as e:
                print(f"    ⚠️ Erreur image pour {data['first_name']}: {e}")
            
            print(f"  ✅ Client créé: {client.code_client} - {user.get_full_name()}")
        
        clients.append(client)
    
    print(f"👥 Total: {len(clients)} clients créés")
    return clients

def main():
    """Fonction principale"""
    print("🚀 Création des données complètes...")
    print("=" * 50)
    
    try:
        # 1. Créer plans d'abonnement
        plans = create_subscription_plans()
        
        # 2. Créer catégories et marques
        categories, marques = create_categories_and_brands()
        
        # 3. Créer entreprises et entrepreneurs
        entreprises, entrepreneurs = create_enterprises_and_entrepreneurs(plans)
        
        # 4. Créer produits pour chaque entreprise
        create_products_for_enterprises(entreprises, entrepreneurs, categories, marques)
        
        # 5. Créer clients
        clients = create_clients(entrepreneurs)
        
        print("\n🎉 CRÉATION TERMINÉE !")
        print("=" * 50)
        print(f"✅ {len(entreprises)} entreprises créées")
        print(f"✅ {len(entrepreneurs)} entrepreneurs créés")
        print(f"✅ {len(entreprises) * 50} produits créés")
        print(f"✅ {len(clients)} clients créés")
        print(f"✅ Toutes les images ont été générées")
        
        print("\n📊 RÉSUMÉ:")
        print(f"- Entrepreneurs: {len(entrepreneurs)}")
        print(f"- Entreprises: {len(entreprises)}")
        print(f"- Produits: {len(entreprises) * 50}")
        print(f"- Clients: {len(clients)}")
        print(f"- Catégories: {len(categories)}")
        print(f"- Marques: {len(marques)}")
        
    except Exception as e:
        print(f"❌ Erreur lors de la création: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
