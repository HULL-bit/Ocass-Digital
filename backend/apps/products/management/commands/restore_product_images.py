"""
Commande Django pour restaurer les images de produits depuis public/ vers media/produits/.
Utile pour Render où les fichiers média sont perdus à chaque déploiement.
"""
from django.core.management.base import BaseCommand
from django.core.files import File
from django.conf import settings
from django.utils.text import slugify
import os
import shutil
from apps.products.models import Produit, ImageProduit


class Command(BaseCommand):
    help = 'Restaure les images de produits depuis public/ vers media/produits/'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Forcer la restauration même si l\'image existe déjà',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🖼️  Restauration des images de produits...'))
        
        # Trouver le répertoire public
        # Depuis backend/apps/products/management/commands/ vers public/
        current_dir = os.path.dirname(os.path.abspath(__file__))
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(current_dir))))
        project_root = os.path.dirname(os.path.dirname(backend_dir))
        public_path = os.path.join(project_root, 'public')
        
        # Si le chemin n'existe pas, essayer un chemin alternatif (pour Render)
        if not os.path.exists(public_path):
            # Sur Render, public/ pourrait être dans le même répertoire que backend/
            public_path = os.path.join(os.path.dirname(backend_dir), 'public')
        
        if not os.path.exists(public_path):
            self.stdout.write(self.style.WARNING(f'⚠️  Dossier public non trouvé: {public_path}'))
            self.stdout.write(self.style.WARNING('💡 Sur Render, le dossier public/ est dans le frontend et n\'est pas accessible depuis le backend.'))
            self.stdout.write(self.style.WARNING('💡 Les images doivent être uploadées manuellement ou via un service de stockage externe (S3, Cloudinary).'))
            self.stdout.write(self.style.WARNING('💡 Solution temporaire: Utiliser les images depuis le frontend statique (public/) comme fallback.'))
            return
        
        self.stdout.write(f'📁 Dossier public trouvé: {public_path}')
        
        # Créer le répertoire media/produits/ s'il n'existe pas
        media_products_dir = os.path.join(settings.MEDIA_ROOT, 'produits')
        os.makedirs(media_products_dir, exist_ok=True)
        self.stdout.write(f'📁 Dossier média: {media_products_dir}')
        
        # Mapping des noms de produits vers les fichiers dans public/
        # Basé sur les catégories et les noms de produits
        category_folders = {
            'technologie': ['technologie'],
            'électronique': ['technologie'],
            'electronique': ['technologie'],
            'vetements': ['vetements'],
            'vêtements': ['vetements'],
            'accessoires': ['accessoires'],
            'alimentation': ['alimentation'],
            'beaute': ['beaute'],
            'beauté': ['beaute'],
            'cosmetique': ['beaute'],
            'sante': ['sante'],
            'santé': ['sante'],
            'pharmacie': ['sante'],
            'maison': ['maison'],
            'jouets': ['jouets'],
            'sport': ['sport'],
            'electromenager': ['electromenager'],
            'électroménager': ['electromenager'],
        }
        
        # Mapping des mots-clés de produits vers les fichiers d'images
        product_keywords = {
            'backpack': 'backpack_1.jpg',
            'bag': 'bag_1.jpg',
            'belt': 'belt_1.jpg',
            'sunglasses': 'sunglasses_1.jpg',
            'wallet': 'wallet_1.jpg',
            'sneakers': 'sneakers_1.jpg',
            'dress': 'dress_1.jpg',
            'shirt': 'shirt_1.jpg',
            'jeans': 'jeans_1.jpg',
            'hat': 'hat_1.jpg',
            'tshirt': 'tshirt_1.jpg',
            'shoes': 'shoes_1.jpg',
            'bread': 'bread_1.jpg',
            'chocolate': 'chocolate_1.jpg',
            'coffee': 'coffee_beans_1.jpg',
            'fruits': 'fruits_1.jpg',
            'vegetables': 'vegetables_1.jpg',
            'keyboard': 'keyboard_1.jpg',
            'tablet': 'tablet_1.jpg',
            'smartwatch': 'smartwatch_1.jpg',
            'smartphone': 'smartphone_1.jpg',
            'mouse': 'mouse_1.jpg',
            'headphones': 'headphones_1.jpg',
            'laptop': 'laptop_1.jpg',
            'camera': 'camera_1.jpg',
            'stethoscope': 'stethoscope_1.jpg',
            'medical': 'medical_1.jpg',
            'pills': 'pills_1.jpg',
            'fitness': 'fitness_1.jpg',
            'supplement': 'supplement_1.jpg',
            'thermometer': 'thermometer_1.jpg',
            'vase': 'vase_1.jpg',
            'mirror': 'mirror_1.jpg',
            'lamp': 'lamp_1.jpg',
            'cushion': 'cushion_1.jpg',
            'clock': 'clock_1.jpg',
            'candle': 'candle_1.jpg',
            'toy': 'toy_1.jpg',
            'puzzle': 'puzzle_1.jpg',
            'lego': 'lego_1.jpg',
            'doll': 'doll_1.jpg',
            'car-toy': 'car_toy_1.jpg',
            'vacuum': 'vacuum_1.jpg',
            'toaster': 'toaster_1.jpg',
            'mixer': 'mixer_1.jpg',
            'microwave': 'microwave_1.jpg',
            'coffee': 'coffee_1.jpg',
            'blender': 'blender_1.jpg',
            'shampoo': 'shampoo_1.jpg',
            'perfume': 'perfume_1.jpg',
            'makeup': 'makeup_1.jpg',
            'lipstick': 'lipstick_1.jpg',
            'cream': 'cream_1.jpg',
            'yoga-mat': 'yoga_mat_1.jpg',
            'running-shoes': 'running_shoes_1.jpg',
            'gym-equipment': 'gym_equipment_1.jpg',
            'dumbbells': 'dumbbells_1.jpg',
            'bike': 'bike_1.jpg',
            'ball': 'ball_1.jpg',
        }
        
        # Récupérer tous les produits
        produits = Produit.objects.all()
        self.stdout.write(f'📦 {produits.count()} produits trouvés')
        
        restored_count = 0
        skipped_count = 0
        error_count = 0
        
        for produit in produits:
            # Vérifier si l'image existe déjà
            existing_image = ImageProduit.objects.filter(produit=produit, principale=True).first()
            
            if existing_image and not options['force']:
                # Vérifier si le fichier existe physiquement
                if existing_image.image and os.path.exists(existing_image.image.path):
                    skipped_count += 1
                    continue
            
            # Trouver l'image dans public/ basé sur le nom du produit et la catégorie
            product_name_lower = produit.nom.lower() if produit.nom else ''
            category_name = ''
            if produit.categorie:
                category_name = produit.categorie.nom.lower() if hasattr(produit.categorie, 'nom') else str(produit.categorie).lower()
            
            # Chercher le fichier d'image
            image_file = None
            image_folder = None
            
            # 1. Chercher par mot-clé dans le nom du produit
            for keyword, filename in product_keywords.items():
                if keyword in product_name_lower:
                    # Trouver le dossier de catégorie
                    for cat_key, folders in category_folders.items():
                        if cat_key in category_name or cat_key in product_name_lower:
                            for folder in folders:
                                potential_path = os.path.join(public_path, folder, filename)
                                if os.path.exists(potential_path):
                                    image_file = potential_path
                                    image_folder = folder
                                    break
                            if image_file:
                                break
                    if image_file:
                        break
            
            # 2. Si pas trouvé, chercher par catégorie uniquement
            if not image_file and category_name:
                for cat_key, folders in category_folders.items():
                    if cat_key in category_name:
                        for folder in folders:
                            # Prendre la première image disponible dans le dossier
                            folder_path = os.path.join(public_path, folder)
                            if os.path.exists(folder_path):
                                images = [f for f in os.listdir(folder_path) if f.endswith(('.jpg', '.jpeg', '.png'))]
                                if images:
                                    image_file = os.path.join(folder_path, images[0])
                                    image_folder = folder
                                    break
                        if image_file:
                            break
            
            # 3. Si toujours pas trouvé, utiliser une image par défaut
            if not image_file:
                default_path = os.path.join(public_path, 'accessoires', 'backpack_1.jpg')
                if os.path.exists(default_path):
                    image_file = default_path
                    image_folder = 'accessoires'
            
            if not image_file or not os.path.exists(image_file):
                self.stdout.write(self.style.WARNING(f'  ⚠️  Image non trouvée pour: {produit.nom}'))
                error_count += 1
                continue
            
            try:
                # Copier l'image vers media/produits/
                filename = os.path.basename(image_file)
                dest_filename = f"{produit.sku}_{slugify(produit.nom)}_{filename}"
                dest_path = os.path.join(media_products_dir, dest_filename)
                
                # Copier le fichier
                shutil.copy2(image_file, dest_path)
                
                # Créer ou mettre à jour l'objet ImageProduit
                if existing_image and options['force']:
                    # Supprimer l'ancienne image si elle existe
                    if existing_image.image and os.path.exists(existing_image.image.path):
                        os.remove(existing_image.image.path)
                    # Mettre à jour
                    with open(dest_path, 'rb') as f:
                        django_file = File(f, name=dest_filename)
                        existing_image.image = django_file
                        existing_image.save()
                    self.stdout.write(self.style.SUCCESS(f'  ✅ Image restaurée: {produit.nom}'))
                else:
                    # Créer une nouvelle image
                    with open(dest_path, 'rb') as f:
                        django_file = File(f, name=dest_filename)
                        ImageProduit.objects.create(
                            produit=produit,
                            image=django_file,
                            alt_text=produit.nom or 'Image produit',
                            principale=True,
                            ordre_affichage=0
                        )
                    self.stdout.write(self.style.SUCCESS(f'  ✅ Image créée: {produit.nom}'))
                
                restored_count += 1
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'  ❌ Erreur pour {produit.nom}: {str(e)}'))
                error_count += 1
        
        self.stdout.write(self.style.SUCCESS(
            f'\n🎉 Restauration terminée:'
            f'\n   ✅ {restored_count} image(s) restaurée(s)'
            f'\n   ⏭️  {skipped_count} image(s) déjà existante(s)'
            f'\n   ❌ {error_count} erreur(s)'
        ))

