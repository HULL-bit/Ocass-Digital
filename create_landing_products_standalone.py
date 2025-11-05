#!/usr/bin/env python3
"""
Script standalone pour créer les produits de la page d'accueil (LandingPage.tsx).
Utilise la configuration Django directement.
"""
import os
import sys
import django

# Configuration Django
sys.path.append('/home/suleimaan/Téléchargements/Mm/project/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.db import transaction
from django.utils.text import slugify
from decimal import Decimal
from apps.products.models import Categorie, Marque, Produit
from apps.companies.models import Entreprise, PlanAbonnement


def create_landing_products():
    """Crée les produits de la page d'accueil avec leurs entreprises."""
    print('📦 Création des produits de la page d\'accueil...')
    
    # Créer ou récupérer le plan d'abonnement par défaut
    plan_default, _ = PlanAbonnement.objects.get_or_create(
        nom='Plan Gratuit',
        defaults={
            'description': 'Plan gratuit pour les nouvelles entreprises',
            'prix_mensuel': 0,
            'prix_annuel': 0,
            'devise': 'XOF',
            'max_utilisateurs': 5,
            'max_produits': 100,
            'max_ventes_mensuelles': 1000,
            'stockage_gb': 1,
            'fonctionnalites': {'basic': True},
            'populaire': False,
            'ordre_affichage': 0
        }
    )
    
    try:
        with transaction.atomic():
            # 1. Créer ou récupérer les entreprises
            entreprises_data = [
                {
                    'nom': 'TechSolutions Sénégal',
                    'secteur_activite': 'technologie',
                    'description': 'Solutions tech et électroniques',
                    'telephone': '+221 77 123 45 67',
                    'email': 'contact@techsolutions.sn',
                    'adresse_complete': 'Avenue Cheikh Anta Diop, Dakar',
                    'ville': 'Dakar',
                    'region': 'Dakar',
                    'pays': 'Sénégal',
                    'statut': 'actif',
                    'siret': 'SN-TECH-001'
                },
                {
                    'nom': 'Boutique Marie Diallo',
                    'secteur_activite': 'commerce_general',
                    'description': 'Mode et accessoires',
                    'telephone': '+221 77 234 56 78',
                    'email': 'contact@boutiquemarie.sn',
                    'adresse_complete': 'Marché HLM, Dakar',
                    'ville': 'Dakar',
                    'region': 'Dakar',
                    'pays': 'Sénégal',
                    'statut': 'actif',
                    'siret': 'SN-BOUT-002'
                },
                {
                    'nom': 'Pharmacie Moderne',
                    'secteur_activite': 'sante',
                    'description': 'Produits pharmaceutiques',
                    'telephone': '+221 77 345 67 89',
                    'email': 'contact@pharmaciemoderne.sn',
                    'adresse_complete': 'Avenue Léopold Sédar Senghor, Dakar',
                    'ville': 'Dakar',
                    'region': 'Dakar',
                    'pays': 'Sénégal',
                    'statut': 'actif',
                    'siret': 'SN-PHAR-003'
                }
            ]
            
            entreprises = {}
            for entreprise_data in entreprises_data:
                entreprise, created = Entreprise.objects.get_or_create(
                    nom=entreprise_data['nom'],
                    defaults={
                        **entreprise_data,
                        'plan_abonnement': plan_default
                    }
                )
                if created:
                    print(f'  ✅ Entreprise créée: {entreprise.nom}')
                else:
                    # Mettre à jour les données si nécessaire
                    for key, value in entreprise_data.items():
                        if key != 'nom':
                            setattr(entreprise, key, value)
                    entreprise.plan_abonnement = plan_default
                    entreprise.save()
                    print(f'  🔄 Entreprise mise à jour: {entreprise.nom}')
                entreprises[entreprise_data['nom']] = entreprise
            
            # 2. Créer ou récupérer les catégories nécessaires
            categories_data = [
                {'nom': 'Électronique', 'description': 'Produits électroniques et informatiques'},
                {'nom': 'Vêtements & Mode', 'description': 'Vêtements, accessoires et articles de mode'},
                {'nom': 'Pharmacie', 'description': 'Médicaments et produits parapharmaceutiques'}
            ]
            
            categories = {}
            for cat_data in categories_data:
                slug = slugify(cat_data['nom'])
                categorie, created = Categorie.objects.get_or_create(
                    slug=slug,
                    defaults={
                        'nom': cat_data['nom'],
                        'description': cat_data['description'],
                        'icone': '💻' if 'Électronique' in cat_data['nom'] else '👕' if 'Mode' in cat_data['nom'] else '💊',
                        'couleur': '#3B82F6' if 'Électronique' in cat_data['nom'] else '#EC4899' if 'Mode' in cat_data['nom'] else '#06B6D4',
                        'visible': True,
                        'ordre_affichage': 1 if 'Électronique' in cat_data['nom'] else 2 if 'Mode' in cat_data['nom'] else 9
                    }
                )
                categories[cat_data['nom']] = categorie
            
            # 3. Créer ou récupérer les marques
            marques_data = [
                {'nom': 'TechSolutions'},
                {'nom': 'Boutique Marie Diallo'},
                {'nom': 'Pharmacie Moderne'}
            ]
            
            marques = {}
            for marque_data in marques_data:
                marque, created = Marque.objects.get_or_create(
                    nom=marque_data['nom']
                )
                marques[marque_data['nom']] = marque
            
            # 4. Définir les produits à créer
            produits_data = [
                # TechSolutions Sénégal
                {
                    'nom': 'Ordinateur Pro 14" M3',
                    'description_courte': 'Ordinateur professionnel haute performance avec processeur M3',
                    'description_longue': 'Ordinateur portable professionnel équipé du processeur Apple M3, 16GB RAM, 512GB SSD. Idéal pour les professionnels exigeants.',
                    'prix_vente': Decimal('1450000.00'),
                    'categorie_nom': 'Électronique',
                    'marque_nom': 'TechSolutions',
                    'entreprise_nom': 'TechSolutions Sénégal',
                    'image_url': 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=800&auto=format&fit=crop',
                    'stock': 15
                },
                {
                    'nom': 'Casque Sans Fil ANC',
                    'description_courte': 'Casque audio premium avec réduction de bruit active',
                    'description_longue': 'Casque audio sans fil avec technologie ANC (Active Noise Cancelling), autonomie 30h, Bluetooth 5.0.',
                    'prix_vente': Decimal('165000.00'),
                    'categorie_nom': 'Électronique',
                    'marque_nom': 'TechSolutions',
                    'entreprise_nom': 'TechSolutions Sénégal',
                    'image_url': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
                    'stock': 25
                },
                {
                    'nom': 'Clavier Mécanique Pro',
                    'description_courte': 'Clavier mécanique rétroéclairé pour gaming et bureautique',
                    'description_longue': 'Clavier mécanique rétroéclairé RGB avec switches mécaniques, anti-ghosting, design ergonomique.',
                    'prix_vente': Decimal('120000.00'),
                    'categorie_nom': 'Électronique',
                    'marque_nom': 'TechSolutions',
                    'entreprise_nom': 'TechSolutions Sénégal',
                    'image_url': 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?q=80&w=800&auto=format&fit=crop',
                    'stock': 18
                },
                {
                    'nom': 'Caméra 4K Créateur',
                    'description_courte': 'Caméra 4K professionnelle pour création de contenu',
                    'description_longue': 'Caméra 4K 60fps avec stabilisation, Wi-Fi, écran tactile. Parfaite pour les créateurs de contenu.',
                    'prix_vente': Decimal('890000.00'),
                    'categorie_nom': 'Électronique',
                    'marque_nom': 'TechSolutions',
                    'entreprise_nom': 'TechSolutions Sénégal',
                    'image_url': 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800&auto=format&fit=crop',
                    'stock': 8
                },
                # Boutique Marie Diallo
                {
                    'nom': 'Robe Wax Royale',
                    'description_courte': 'Robe élégante en tissu wax authentique',
                    'description_longue': 'Robe élégante confectionnée en tissu wax authentique, disponible en plusieurs tailles et motifs.',
                    'prix_vente': Decimal('95000.00'),
                    'categorie_nom': 'Vêtements & Mode',
                    'marque_nom': 'Boutique Marie Diallo',
                    'entreprise_nom': 'Boutique Marie Diallo',
                    'image_url': 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?q=80&w=800&auto=format&fit=crop',
                    'stock': 45
                },
                {
                    'nom': 'Sac Cuir Artisan',
                    'description_courte': 'Sac en cuir artisanal fait main',
                    'description_longue': 'Sac en cuir véritable confectionné artisanalement, fermeture sécurisée, design authentique.',
                    'prix_vente': Decimal('78000.00'),
                    'categorie_nom': 'Vêtements & Mode',
                    'marque_nom': 'Boutique Marie Diallo',
                    'entreprise_nom': 'Boutique Marie Diallo',
                    'image_url': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
                    'stock': 32
                },
                {
                    'nom': 'Boubou Homme Brodé',
                    'description_courte': 'Boubou traditionnel brodé main pour homme',
                    'description_longue': 'Boubou traditionnel pour homme avec broderies faites à la main, tissu premium, plusieurs tailles disponibles.',
                    'prix_vente': Decimal('65000.00'),
                    'categorie_nom': 'Vêtements & Mode',
                    'marque_nom': 'Boutique Marie Diallo',
                    'entreprise_nom': 'Boutique Marie Diallo',
                    'image_url': 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop',
                    'stock': 28
                },
                {
                    'nom': 'Sandales Cuir Premium',
                    'description_courte': 'Sandales en cuir premium confortables',
                    'description_longue': 'Sandales en cuir véritable avec semelle confortable, toutes tailles disponibles, lavables.',
                    'prix_vente': Decimal('35000.00'),
                    'categorie_nom': 'Vêtements & Mode',
                    'marque_nom': 'Boutique Marie Diallo',
                    'entreprise_nom': 'Boutique Marie Diallo',
                    'image_url': 'https://images.unsplash.com/photo-1544966503-7cc4ac881e57?q=80&w=800&auto=format&fit=crop',
                    'stock': 56
                },
                # Pharmacie Moderne
                {
                    'nom': 'Vitamine C 1000mg',
                    'description_courte': 'Complément alimentaire vitamine C haute dose',
                    'description_longue': 'Complément alimentaire vitamine C 1000mg par comprimé, boîte de 60 comprimés. Renforce le système immunitaire.',
                    'prix_vente': Decimal('8500.00'),
                    'categorie_nom': 'Pharmacie',
                    'marque_nom': 'Pharmacie Moderne',
                    'entreprise_nom': 'Pharmacie Moderne',
                    'image_url': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800&auto=format&fit=crop',
                    'stock': 120
                },
                {
                    'nom': 'Gel Hydroalcoolique',
                    'description_courte': 'Gel désinfectant pour les mains 500ml',
                    'description_longue': 'Gel hydroalcoolique désinfectant pour les mains, 70% alcool, sans rinçage, hydratant. Flacon 500ml.',
                    'prix_vente': Decimal('2500.00'),
                    'categorie_nom': 'Pharmacie',
                    'marque_nom': 'Pharmacie Moderne',
                    'entreprise_nom': 'Pharmacie Moderne',
                    'image_url': 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=800&auto=format&fit=crop',
                    'stock': 200
                },
                {
                    'nom': 'Crème Solaire SPF50',
                    'description_courte': 'Protection solaire haute performance SPF50',
                    'description_longue': 'Crème solaire protection UVA/UVB SPF50, résistante à l\'eau, hypoallergénique. Tube 200ml.',
                    'prix_vente': Decimal('9800.00'),
                    'categorie_nom': 'Pharmacie',
                    'marque_nom': 'Pharmacie Moderne',
                    'entreprise_nom': 'Pharmacie Moderne',
                    'image_url': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800&auto=format&fit=crop',
                    'stock': 85
                },
                {
                    'nom': 'Tensiomètre Bras',
                    'description_courte': 'Tensiomètre électronique pour bras professionnel',
                    'description_longue': 'Tensiomètre électronique professionnel avec écran LCD, mémoire des mesures, brassard pour bras. Garantie 2 ans.',
                    'prix_vente': Decimal('29500.00'),
                    'categorie_nom': 'Pharmacie',
                    'marque_nom': 'Pharmacie Moderne',
                    'entreprise_nom': 'Pharmacie Moderne',
                    'image_url': 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=800&auto=format&fit=crop',
                    'stock': 42
                }
            ]
            
            # 5. Créer les produits
            created_count = 0
            updated_count = 0
            
            for prod_data in produits_data:
                # Calculer le prix d'achat (environ 60% du prix de vente pour avoir une marge)
                prix_achat = prod_data['prix_vente'] * Decimal('0.60')
                
                # Générer un SKU unique basé sur le nom
                sku_base = slugify(prod_data['nom']).upper().replace('-', '')[:15]
                sku = f"{sku_base}-{prod_data['entreprise_nom'][:3].upper()}"
                
                # Créer le slug unique
                slug = slugify(prod_data['nom'])
                
                # Récupérer les objets nécessaires
                categorie = categories[prod_data['categorie_nom']]
                marque = marques[prod_data['marque_nom']]
                entreprise = entreprises[prod_data['entreprise_nom']]
                
                # Créer ou mettre à jour le produit
                produit, created = Produit.objects.get_or_create(
                    slug=slug,
                    defaults={
                        'nom': prod_data['nom'],
                        'description_courte': prod_data['description_courte'],
                        'description_longue': prod_data.get('description_longue', prod_data['description_courte']),
                        'categorie': categorie,
                        'marque': marque,
                        'entreprise': entreprise,
                        'sku': sku,
                        'prix_achat': prix_achat,
                        'prix_vente': prod_data['prix_vente'],
                        'tva_taux': Decimal('18.00'),
                        'unite_mesure': 'piece',
                        'stock': prod_data.get('stock', 0),
                        'statut': 'actif',
                        'vendable': True,
                        'achetable': True,
                        'visible_catalogue': True
                    }
                )
                
                if created:
                    created_count += 1
                    print(f'  ✅ Produit créé: {produit.nom} ({entreprise.nom})')
                else:
                    # Mettre à jour les données si nécessaire
                    produit.nom = prod_data['nom']
                    produit.description_courte = prod_data['description_courte']
                    produit.description_longue = prod_data.get('description_longue', prod_data['description_courte'])
                    produit.categorie = categorie
                    produit.marque = marque
                    produit.entreprise = entreprise
                    produit.prix_achat = prix_achat
                    produit.prix_vente = prod_data['prix_vente']
                    produit.stock = prod_data.get('stock', 0)
                    produit.statut = 'actif'
                    produit.vendable = True
                    produit.achetable = True
                    produit.visible_catalogue = True
                    produit.save()
                    updated_count += 1
                    print(f'  🔄 Produit mis à jour: {produit.nom} ({entreprise.nom})')
            
            print(f'\n🎉 Opération terminée: {created_count} produits créés, {updated_count} produits mis à jour.')
            print(f'📊 Total: {created_count + updated_count} produits')
            
    except Exception as e:
        print(f'\n❌ Erreur lors de la création des produits: {str(e)}')
        import traceback
        print(traceback.format_exc())
        raise


if __name__ == '__main__':
    create_landing_products()

