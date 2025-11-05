"""
Commande Django pour créer des produits basés sur les images locales dans public/Res.
Les noms des fichiers images deviennent les noms des produits.
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify
from django.core.files import File
from django.conf import settings
from decimal import Decimal
import os
import shutil
from apps.products.models import Categorie, Marque, Produit, ImageProduit
from apps.companies.models import Entreprise, PlanAbonnement


class Command(BaseCommand):
    help = 'Crée des produits basés sur les noms des images dans public/Res'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('📦 Création des produits depuis les images locales...'))
        
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
        
        # Chemin vers le dossier public (frontend public/)
        # Note: Ce script doit être exécuté depuis le backend, donc on utilise le chemin relatif
        public_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))), 'public')
        
        # Si le chemin n'existe pas, essayer un chemin alternatif
        if not os.path.exists(public_path):
            public_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))), 'public')
        
        if not os.path.exists(public_path):
            self.stdout.write(self.style.ERROR(f'❌ Dossier public non trouvé: {public_path}'))
            return
        
        # Récupérer les entreprises existantes
        try:
            entreprise_tech = Entreprise.objects.get(nom='TechSolutions Sénégal')
            entreprise_boutique = Entreprise.objects.get(nom='Boutique Marie Diallo')
            entreprise_pharmacie = Entreprise.objects.get(nom='Pharmacie Moderne')
        except Entreprise.DoesNotExist as e:
            self.stdout.write(self.style.ERROR(f'❌ Entreprise manquante: {str(e)}'))
            self.stdout.write(self.style.WARNING('💡 Exécutez d\'abord: python manage.py create_landing_products'))
            return
        
        # Mapping des images aux noms de produits cohérents
        # Format: nom_fichier (sans extension) -> (nom_produit, entreprise, catégorie, prix)
        image_to_product_mapping = {
            # Images TechSolutions (électronique)
            'iwaria-inc-tvTFMDwH-cQ-unsplash': ('Ordinateur Portable Pro 15"', entreprise_tech, 'Électronique', 850000),
            'iwaria-inc-JnOFLg09yRE-unsplash': ('Laptop Business 14"', entreprise_tech, 'Électronique', 750000),
            'tech': ('Tablette Professionnelle 12"', entreprise_tech, 'Électronique', 450000),
            'entrepreneur': ('Smartphone Business Edition', entreprise_tech, 'Électronique', 380000),
            'ent2': ('Montre Connectée Pro', entreprise_tech, 'Électronique', 195000),
            'pexels-cenali-2733918': ('Écouteurs Sans Fil Premium', entreprise_tech, 'Électronique', 125000),
            'pexels-bohlemedia-1884581': ('Clavier Mécanique RGB Gaming', entreprise_tech, 'Électronique', 95000),
            'stefan-buhler-qQY44BbC2mw-unsplash': ('Souris Gaming Professionnelle', entreprise_tech, 'Électronique', 45000),
            'shivansh-sharma-l2cFxUEEY7I-unsplash': ('Webcam HD 1080p', entreprise_tech, 'Électronique', 75000),
            'mathieu-gauzy-qLT3rBVwiLY-unsplash': ('Micro-casque Professionnel', entreprise_tech, 'Électronique', 150000),
            'tr-n-thanh-h-i-g7pcs7FYx0Y-unsplash': ('Chargeur Sans Fil Rapide', entreprise_tech, 'Électronique', 35000),
            'gerent': ('Batterie Externe 20000mAh', entreprise_tech, 'Électronique', 28000),
            
            # Images Boutique Marie Diallo (mode/vêtements)
            'boutque': ('Sac à Main Cuir Premium', entreprise_boutique, 'Vêtements & Mode', 95000),
            'boutiqueMarie Diallo': ('Robe Wax Royale Élégante', entreprise_boutique, 'Vêtements & Mode', 85000),
            'boutique': ('Ensemble Mode Africain', entreprise_boutique, 'Vêtements & Mode', 75000),
            'couture': ('Tenue Traditionnelle Brodée', entreprise_boutique, 'Vêtements & Mode', 120000),
            'pexels-planeteelevene-2290243': ('Sac Bandoulière Cuir', entreprise_boutique, 'Vêtements & Mode', 65000),
            'pexels-shattha-pilabut-38930-135620': ('Boubou Femme Brodé Artisanal', entreprise_boutique, 'Vêtements & Mode', 75000),
            'rutendo-petros-Tzp_yd6W8LM-unsplash': ('Pagne Premium Wax', entreprise_boutique, 'Vêtements & Mode', 55000),
            'monody-le-mZ_7CuqsRV0-unsplash': ('Accessoires Mode Élégants', entreprise_boutique, 'Vêtements & Mode', 45000),
            'mak-K8vfT-8xxEQ-unsplash': ('Tissu Africain Premium', entreprise_boutique, 'Vêtements & Mode', 50000),
            
            # Images Pharmacie Moderne
            'SuperMarche': ('Multivitamines Complètes', entreprise_pharmacie, 'Pharmacie', 12000),
        }
        
        # Mapping des dossiers vers les catégories et entreprises
        folder_to_category_mapping = {
            'technologie': ('Électronique', entreprise_tech, 150000),
            'electronique': ('Électronique', entreprise_tech, 150000),
            'vetements': ('Vêtements & Mode', entreprise_boutique, 75000),
            'accessoires': ('Accessoires', entreprise_boutique, 45000),
            'beaute': ('Beauté & Cosmétiques', entreprise_boutique, 85000),
            'sante': ('Pharmacie', entreprise_pharmacie, 15000),
            'pharmacie': ('Pharmacie', entreprise_pharmacie, 15000),
            'alimentation': ('Alimentation', entreprise_boutique, 12000),
            'maison': ('Maison & Décoration', entreprise_boutique, 55000),
            'sport': ('Sport & Fitness', entreprise_boutique, 95000),
            'jouets': ('Jouets & Jeux', entreprise_boutique, 35000),
            'electromenager': ('Électroménager', entreprise_tech, 125000),
        }
        
        def get_product_info_from_folder(folder_name, base_name):
            """Récupère les informations du produit basées sur le dossier parent"""
            folder_lower = folder_name.lower()
            
            # Chercher dans le mapping
            if folder_lower in folder_to_category_mapping:
                category_name, entreprise, default_price = folder_to_category_mapping[folder_lower]
            else:
                # Par défaut
                category_name = 'Autres'
                entreprise = entreprise_boutique
                default_price = 50000
            
            # Générer un nom de produit lisible depuis le nom du fichier
            product_name = format_product_name(base_name)
            
            return (product_name, entreprise, category_name, default_price)
        
        def format_product_name(base_name):
            """Formate le nom du fichier en nom de produit lisible"""
            # Retirer les numéros et underscores à la fin (ex: backpack_1 -> backpack)
            name = base_name
            # Retirer les patterns comme _1, _2, etc.
            import re
            name = re.sub(r'_\d+$', '', name)
            # Remplacer les underscores et tirets par des espaces
            name = name.replace('_', ' ').replace('-', ' ')
            # Capitaliser chaque mot
            words = name.split()
            formatted = ' '.join(word.capitalize() for word in words)
            return formatted
        
        try:
            with transaction.atomic():
                products_created = 0
                products_updated = 0
                
                # Parcourir tous les sous-dossiers de public/ (sauf Res, videos, logo.svg)
                excluded_folders = {'Res', 'videos', 'logo.svg'}
                image_files = []
                
                if public_path and os.path.exists(public_path):
                    for item in os.listdir(public_path):
                        item_path = os.path.join(public_path, item)
                        
                        # Ignorer les fichiers et dossiers exclus
                        if item in excluded_folders or not os.path.isdir(item_path):
                            continue
                        
                        # Parcourir les fichiers images dans chaque sous-dossier
                        folder_name = item
                        try:
                            for filename in os.listdir(item_path):
                                if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                                    # Ignorer les captures d'écran
                                    if 'capture' in filename.lower() or 'écran' in filename.lower():
                                        continue
                                    
                                    base_name = os.path.splitext(filename)[0]
                                    image_files.append({
                                        'base_name': base_name,
                                        'filename': filename,
                                        'folder': folder_name,
                                        'path': f'/{folder_name}/{filename}',
                                        'full_path': os.path.join(item_path, filename)
                                    })
                        except PermissionError:
                            self.stdout.write(self.style.WARNING(f'⚠️  Permission refusée pour le dossier: {folder_name}'))
                            continue
                
                if not image_files:
                    self.stdout.write(self.style.WARNING('⚠️  Aucune image trouvée dans les sous-dossiers'))
                    return
                
                self.stdout.write(f'📸 {len(image_files)} image(s) trouvée(s) dans les sous-dossiers\n')
                
                # Créer les produits pour chaque image
                for img_info in image_files:
                    base_name = img_info['base_name']
                    image_path = img_info['path']
                    folder_name = img_info['folder']
                    full_image_path = img_info['full_path']
                    
                    # Récupérer les informations du produit basées sur le dossier
                    product_name, entreprise, category_name, price = get_product_info_from_folder(folder_name, base_name)
                    
                    # Calculer le stock (aléatoire entre 10 et 50)
                    import random
                    stock = random.randint(10, 50)
                    # Récupérer ou créer la catégorie
                    categorie, _ = Categorie.objects.get_or_create(
                        slug=slugify(category_name),
                        defaults={
                            'nom': category_name,
                            'description': f"Catégorie {category_name}",
                            'visible': True
                        }
                    )
                    
                    # Récupérer ou créer une marque par défaut pour l'entreprise
                    brand_name = entreprise.nom.split()[0] if entreprise.nom else 'Générique'
                    marque, _ = Marque.objects.get_or_create(
                        nom=brand_name,
                        defaults={'description': f"Marque {brand_name}"}
                    )
                    
                    # Générer un SKU unique
                    base_sku = slugify(product_name).upper().replace('-', '')
                    sku = base_sku
                    counter = 1
                    while Produit.objects.filter(sku=sku).exists():
                        sku = f"{base_sku}-{counter}"
                        counter += 1
                    
                    # Calculer le prix d'achat (80% du prix de vente)
                    prix_achat = Decimal(str(float(price) * 0.8))
                    prix_vente = Decimal(str(price))
                    
                    # Créer ou mettre à jour le produit
                    product, created = Produit.objects.get_or_create(
                        nom=product_name,
                        entreprise=entreprise,
                        defaults={
                            'description_courte': f'{product_name} - Produit de qualité',
                            'description_longue': f'{product_name} - Produit de qualité professionnelle avec garantie. Disponible dans notre catalogue.',
                            'categorie': categorie,
                            'marque': marque,
                            'sku': sku,
                            'prix_achat': prix_achat,
                            'prix_vente': prix_vente,
                            'stock': stock,
                            'unite_mesure': 'piece',
                            'statut': 'actif',
                            'visible_catalogue': True,
                            'vendable': True,
                            'achetable': True,
                            'slug': slugify(product_name),
                        }
                    )
                    
                    # Créer ImageProduit en utilisant le chemin depuis public/
                    image_created = False
                    if os.path.exists(full_image_path):
                        try:
                            # Vérifier si une image existe déjà pour ce produit
                            existing_image = ImageProduit.objects.filter(produit=product, principale=True).first()
                            
                            if not existing_image:
                                # Copier l'image vers media/produits/ pour Django
                                media_products_dir = os.path.join(settings.MEDIA_ROOT, 'produits')
                                os.makedirs(media_products_dir, exist_ok=True)
                                
                                # Nom du fichier de destination
                                dest_filename = f"{product.sku}_{slugify(product_name)}_{img_info['filename']}"
                                dest_path = os.path.join(media_products_dir, dest_filename)
                                
                                # Copier le fichier
                                shutil.copy2(full_image_path, dest_path)
                                
                                # Ouvrir le fichier et créer l'objet ImageProduit
                                with open(dest_path, 'rb') as f:
                                    django_file = File(f, name=dest_filename)
                                    image_produit = ImageProduit.objects.create(
                                        produit=product,
                                        image=django_file,
                                        alt_text=product_name,
                                        principale=True,
                                        ordre_affichage=0
                                    )
                                    image_created = True
                                    self.stdout.write(f'     🖼️  Image: {image_path}')
                        except Exception as e:
                            self.stdout.write(self.style.WARNING(f'     ⚠️  Erreur lors de la copie de l\'image: {str(e)}'))
                    
                    if created:
                        products_created += 1
                        self.stdout.write(self.style.SUCCESS(f'  ✅ Produit créé: {product.nom}'))
                        self.stdout.write(f'     📁 Dossier: {folder_name} | 📦 Entreprise: {entreprise.nom} | Catégorie: {category_name}')
                        self.stdout.write(f'     💰 Prix: {prix_vente} XOF | Stock: {stock}')
                        if not image_created:
                            self.stdout.write(self.style.WARNING(f'     ⚠️  Image non copiée pour: {image_path}'))
                    else:
                        # Mettre à jour les champs si le produit existe
                        product.description_courte = f'{product_name} - Produit de qualité'
                        product.description_longue = f'{product_name} - Produit de qualité professionnelle avec garantie. Disponible dans notre catalogue.'
                        product.categorie = categorie
                        product.marque = marque
                        product.prix_achat = prix_achat
                        product.prix_vente = prix_vente
                        product.stock = stock
                        product.statut = 'actif'
                        product.visible_catalogue = True
                        product.save()
                        products_updated += 1
                        self.stdout.write(self.style.WARNING(f'  🔄 Produit mis à jour: {product.nom} ({entreprise.nom})'))
                
                self.stdout.write(self.style.SUCCESS(
                    f'\n🎉 Opération terminée: {products_created} produits créés, {products_updated} produits mis à jour.'
                ))
                self.stdout.write(self.style.SUCCESS(f'📊 Total: {products_created + products_updated} produits créés depuis les images'))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\n❌ Erreur lors de la création des produits: {str(e)}'))
            import traceback
            self.stdout.write(self.style.ERROR(traceback.format_exc()))
            raise

