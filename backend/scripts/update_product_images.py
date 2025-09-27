#!/usr/bin/env python3
"""
Script pour mettre à jour les images des produits avec des images appropriées
et supprimer les catégories de test
"""

import os
import sys
import django
import requests
from django.conf import settings
from django.core.files.base import ContentFile

# Configuration Django
sys.path.append('/home/suleimaan/Téléchargements/Mm/project/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.products.models import Produit, Categorie, ImageProduit
from apps.companies.models import Entreprise

# Images appropriées par catégorie
CATEGORY_IMAGES = {
    'Électronique': [
        'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
        'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
        'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2'
    ],
    'Vêtements': [
        'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
        'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
        'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2'
    ],
    'Alimentation': [
        'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
        'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
        'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2'
    ],
    'Maison et Jardin': [
        'https://images.pexels.com/photos/271897/pexels-photo-271897.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
        'https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
        'https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2'
    ],
    'Sports et Loisirs': [
        'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
        'https://images.pexels.com/photos/1552241/pexels-photo-1552241.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
        'https://images.pexels.com/photos/1552240/pexels-photo-1552240.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2'
    ],
    'Santé et Beauté': [
        'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
        'https://images.pexels.com/photos/3373735/pexels-photo-3373735.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
        'https://images.pexels.com/photos/3373734/pexels-photo-3373734.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2'
    ],
    'Livres et Médias': [
        'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
        'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
        'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2'
    ],
    'Automobile': [
        'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
        'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
        'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2'
    ]
}

def download_image(url):
    """Télécharge une image depuis une URL"""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return ContentFile(response.content)
    except Exception as e:
        print(f"❌ Erreur lors du téléchargement de {url}: {e}")
        return None

def update_product_images():
    """Met à jour les images des produits avec des images appropriées"""
    print("🖼️ Mise à jour des images des produits...")
    
    # Récupérer tous les produits
    produits = Produit.objects.all()
    print(f"📦 Nombre de produits à traiter: {produits.count()}")
    
    updated_count = 0
    
    for produit in produits:
        try:
            # Déterminer la catégorie du produit
            categorie_nom = produit.categorie.nom if produit.categorie else 'Électronique'
            
            # Obtenir les images appropriées pour cette catégorie
            images_urls = CATEGORY_IMAGES.get(categorie_nom, CATEGORY_IMAGES['Électronique'])
            
            # Supprimer les anciennes images
            ImageProduit.objects.filter(produit=produit).delete()
            
            # Ajouter de nouvelles images
            for i, image_url in enumerate(images_urls[:3]):  # Maximum 3 images
                image_file = download_image(image_url)
                if image_file:
                    image_produit = ImageProduit.objects.create(
                        produit=produit,
                        image=image_file,
                        ordre_affichage=i + 1,
                        principale=(i == 0)
                    )
                    print(f"  ✅ Image {i+1} ajoutée pour {produit.nom}")
            
            updated_count += 1
            
        except Exception as e:
            print(f"❌ Erreur lors de la mise à jour de {produit.nom}: {e}")
    
    print(f"✅ {updated_count} produits mis à jour avec de nouvelles images")

def remove_test_categories():
    """Supprime les catégories de test"""
    print("🗑️ Suppression des catégories de test...")
    
    # Catégories de test à supprimer
    test_categories = [
        'Test Catégorie',
        'Catégorie Test',
        'Test',
        'Demo',
        'Exemple',
        'Sample'
    ]
    
    deleted_count = 0
    
    for nom in test_categories:
        try:
            categories = Categorie.objects.filter(nom__icontains=nom)
            count = categories.count()
            if count > 0:
                categories.delete()
                print(f"  ✅ {count} catégorie(s) '{nom}' supprimée(s)")
                deleted_count += count
        except Exception as e:
            print(f"❌ Erreur lors de la suppression de '{nom}': {e}")
    
    print(f"✅ {deleted_count} catégories de test supprimées")

def create_proper_categories():
    """Crée des catégories appropriées"""
    print("📂 Création de catégories appropriées...")
    
    proper_categories = [
        {
            'nom': 'Électronique',
            'description': 'Appareils électroniques et accessoires',
            'slug': 'electronique',
            'couleur': '#3B82F6',
            'icone': 'smartphone'
        },
        {
            'nom': 'Vêtements',
            'description': 'Vêtements pour hommes, femmes et enfants',
            'slug': 'vetements',
            'couleur': '#EF4444',
            'icone': 'shirt'
        },
        {
            'nom': 'Alimentation',
            'description': 'Produits alimentaires et boissons',
            'slug': 'alimentation',
            'couleur': '#10B981',
            'icone': 'utensils'
        },
        {
            'nom': 'Maison et Jardin',
            'description': 'Articles pour la maison et le jardin',
            'slug': 'maison-jardin',
            'couleur': '#8B5CF6',
            'icone': 'home'
        },
        {
            'nom': 'Sports et Loisirs',
            'description': 'Équipements sportifs et articles de loisirs',
            'slug': 'sports-loisirs',
            'couleur': '#F59E0B',
            'icone': 'activity'
        },
        {
            'nom': 'Santé et Beauté',
            'description': 'Produits de santé et de beauté',
            'slug': 'sante-beaute',
            'couleur': '#EC4899',
            'icone': 'heart'
        },
        {
            'nom': 'Livres et Médias',
            'description': 'Livres, magazines et supports multimédias',
            'slug': 'livres-medias',
            'couleur': '#6366F1',
            'icone': 'book'
        },
        {
            'nom': 'Automobile',
            'description': 'Pièces et accessoires automobiles',
            'slug': 'automobile',
            'couleur': '#6B7280',
            'icone': 'car'
        }
    ]
    
    created_count = 0
    
    for cat_data in proper_categories:
        try:
            categorie, created = Categorie.objects.get_or_create(
                slug=cat_data['slug'],
                defaults={
                    'nom': cat_data['nom'],
                    'description': cat_data['description'],
                    'couleur': cat_data['couleur'],
                    'icone': cat_data['icone'],
                    'visible': True,
                    'ordre_affichage': created_count + 1
                }
            )
            
            if created:
                print(f"  ✅ Catégorie '{cat_data['nom']}' créée")
                created_count += 1
            else:
                print(f"  ℹ️ Catégorie '{cat_data['nom']}' existe déjà")
                
        except Exception as e:
            print(f"❌ Erreur lors de la création de '{cat_data['nom']}': {e}")
    
    print(f"✅ {created_count} nouvelles catégories créées")

def main():
    """Fonction principale"""
    print("🚀 Début de la mise à jour des produits et catégories...")
    
    try:
        # 1. Supprimer les catégories de test
        remove_test_categories()
        
        # 2. Créer des catégories appropriées
        create_proper_categories()
        
        # 3. Mettre à jour les images des produits
        update_product_images()
        
        print("\n✅ Mise à jour terminée avec succès!")
        
    except Exception as e:
        print(f"❌ Erreur générale: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
