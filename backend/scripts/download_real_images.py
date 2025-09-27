#!/usr/bin/env python3
"""
Script pour télécharger des images réelles et les assigner aux entreprises et produits
"""

import os
import sys
import django
import requests
from django.conf import settings
from django.core.files.base import ContentFile
from PIL import Image
import io

# Configuration Django
sys.path.append('/home/suleimaan/Téléchargements/Mm/project/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.products.models import Produit, Categorie, ImageProduit
from apps.companies.models import Entreprise

# Images réelles par catégorie
REAL_IMAGES = {
    'Électronique': [
        'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1593642702821-c8a6771f0686?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=400&fit=crop'
    ],
    'Vêtements': [
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop'
    ],
    'Alimentation': [
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1551782450-a2134b4cb150?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=400&fit=crop'
    ],
    'Maison et Jardin': [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop'
    ],
    'Sports et Loisirs': [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop'
    ],
    'Santé et Beauté': [
        'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop'
    ],
    'Livres et Médias': [
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop'
    ],
    'Automobile': [
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop'
    ]
}

# Logos d'entreprises réels
COMPANY_LOGOS = [
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1593642702821-c8a6771f0686?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1445205170230-053b83016050?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'
]

def download_image(url, max_retries=3):
    """Télécharge une image depuis une URL avec retry"""
    for attempt in range(max_retries):
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            # Redimensionner l'image
            img = Image.open(io.BytesIO(response.content))
            img = img.resize((400, 400), Image.Resampling.LANCZOS)
            
            # Convertir en bytes
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='JPEG', quality=85)
            img_byte_arr = img_byte_arr.getvalue()
            
            return ContentFile(img_byte_arr)
        except Exception as e:
            print(f"Tentative {attempt + 1} échouée pour {url}: {e}")
            if attempt == max_retries - 1:
                return None
    return None

def update_product_images():
    """Met à jour les images des produits avec des images réelles"""
    print("🖼️ Mise à jour des images des produits avec des images réelles...")
    
    produits = Produit.objects.all()
    print(f"📦 Nombre de produits à traiter: {produits.count()}")
    
    updated_count = 0
    
    for produit in produits:
        try:
            # Déterminer la catégorie du produit
            categorie_nom = produit.categorie.nom if produit.categorie else 'Électronique'
            
            # Obtenir les images appropriées pour cette catégorie
            images_urls = REAL_IMAGES.get(categorie_nom, REAL_IMAGES['Électronique'])
            
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

def update_company_logos():
    """Met à jour les logos des entreprises avec des images réelles"""
    print("🏢 Mise à jour des logos des entreprises...")
    
    entreprises = Entreprise.objects.all()
    print(f"🏢 Nombre d'entreprises à traiter: {entreprises.count()}")
    
    updated_count = 0
    
    for entreprise in entreprises:
        try:
            # Sélectionner un logo basé sur l'ID de l'entreprise
            logo_url = COMPANY_LOGOS[entreprise.id % len(COMPANY_LOGOS)]
            
            # Télécharger et redimensionner le logo
            logo_file = download_image(logo_url)
            if logo_file:
                # Sauvegarder le logo
                entreprise.logo.save(f'logo_{entreprise.id}.jpg', logo_file, save=True)
                print(f"  ✅ Logo mis à jour pour {entreprise.nom}")
                updated_count += 1
            
        except Exception as e:
            print(f"❌ Erreur lors de la mise à jour du logo de {entreprise.nom}: {e}")
    
    print(f"✅ {updated_count} logos d'entreprises mis à jour")

def main():
    """Fonction principale"""
    print("🚀 Début du téléchargement des images réelles...")
    
    try:
        # 1. Mettre à jour les images des produits
        update_product_images()
        
        # 2. Mettre à jour les logos des entreprises
        update_company_logos()
        
        print("\n✅ Téléchargement terminé avec succès!")
        
    except Exception as e:
        print(f"❌ Erreur générale: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
