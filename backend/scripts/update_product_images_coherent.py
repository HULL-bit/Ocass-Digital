#!/usr/bin/env python3
"""
Script pour mettre à jour les images des produits avec des images cohérentes
basées sur le nom et la catégorie des produits
"""

import os
import sys
import django
import requests
import random
from django.core.files.base import ContentFile
from PIL import Image
import io

# Configuration Django
sys.path.append('/home/suleimaan/Téléchargements/Mm/project/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.products.models import Produit, ImageProduit

# Images cohérentes basées sur les noms de produits
PRODUCT_IMAGES = {
    # Santé & Pharmacie
    'betadine': [
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1559757148-5c350d0f3c56?w=400&h=400&fit=crop'
    ],
    'tensiomètre': [
        'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=400&fit=crop'
    ],
    'gel hydroalcoolique': [
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1559757148-5c350d0f3c56?w=400&h=400&fit=crop'
    ],
    'masque chirurgical': [
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1559757148-5c350d0f3c56?w=400&h=400&fit=crop'
    ],
    'thermomètre': [
        'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=400&fit=crop'
    ],
    
    # Électronique
    'iphone': [
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1592899677977-9c0c58c0b4b2?w=400&h=400&fit=crop'
    ],
    'macbook': [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop'
    ],
    'samsung': [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop'
    ],
    'laptop': [
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop'
    ],
    'tablet': [
        'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&h=400&fit=crop'
    ],
    
    # Mode & Vêtements
    'robe': [
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop'
    ],
    'chemise': [
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop'
    ],
    'pantalon': [
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop'
    ],
    'chaussures': [
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop'
    ],
    'baskets': [
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop'
    ],
    
    # Maison & Déco
    'chaise': [
        'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop'
    ],
    'table': [
        'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop'
    ],
    'lamp': [
        'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop'
    ],
    'déco': [
        'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop'
    ],
    
    # Sports
    'ballon': [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop'
    ],
    'sport': [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop'
    ],
    'fitness': [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop'
    ],
    
    # Livres
    'livre': [
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop'
    ],
    'book': [
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop'
    ],
    'roman': [
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop'
    ],
    
    # Jouets
    'jouet': [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop'
    ],
    'toy': [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop'
    ],
    'poupée': [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop'
    ],
    
    # Auto
    'pièce': [
        'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop'
    ],
    'auto': [
        'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop'
    ],
    'voiture': [
        'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop'
    ],
    
    # Beauté
    'beauté': [
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop'
    ],
    'cosmétique': [
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop'
    ],
    'parfum': [
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop'
    ],
}

# Images par défaut par catégorie
CATEGORY_DEFAULT_IMAGES = {
    'Électronique': [
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop'
    ],
    'Mode & Vêtements': [
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop'
    ],
    'Maison & Déco': [
        'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop'
    ],
    'Sports': [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop'
    ],
    'Livres': [
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop'
    ],
    'Jouets': [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop'
    ],
    'Auto': [
        'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop'
    ],
    'Beauté': [
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop'
    ],
    'Santé & Pharmacie': [
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1559757148-5c350d0f3c56?w=400&h=400&fit=crop'
    ]
}

def download_image(url, max_retries=3):
    """Télécharge une image depuis une URL"""
    for attempt in range(max_retries):
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            return response.content
        except Exception as e:
            if attempt == max_retries - 1:
                print(f"❌ Échec du téléchargement de {url}: {e}")
            else:
                print(f"⚠️  Tentative {attempt + 1} échouée pour {url}, retry...")
    return None

def get_product_images(product_name, category_name):
    """Détermine les images appropriées pour un produit"""
    product_name_lower = product_name.lower()
    
    # Chercher une correspondance exacte dans les mots-clés
    for keyword, images in PRODUCT_IMAGES.items():
        if keyword in product_name_lower:
            return images
    
    # Si pas de correspondance, utiliser les images par défaut de la catégorie
    return CATEGORY_DEFAULT_IMAGES.get(category_name, CATEGORY_DEFAULT_IMAGES['Électronique'])

def update_product_images():
    """Met à jour les images des produits avec des images cohérentes"""
    print("🖼️ Mise à jour des images des produits avec des images cohérentes...")
    
    produits = Produit.objects.all()
    print(f"📦 Nombre de produits à traiter: {produits.count()}")
    
    updated_count = 0
    failed_count = 0
    
    for produit in produits:
        try:
            # Déterminer la catégorie
            categorie_nom = produit.categorie.nom if produit.categorie else 'Électronique'
            
            # Obtenir les images appropriées
            images_urls = get_product_images(produit.nom, categorie_nom)
            
            print(f"🔄 Mise à jour de {produit.nom} (catégorie: {categorie_nom})...")
            
            # Supprimer les anciennes images
            ImageProduit.objects.filter(produit=produit).delete()
            
            # Ajouter de nouvelles images
            for i, image_url in enumerate(images_urls[:3]):  # Maximum 3 images
                image_data = download_image(image_url)
                if image_data:
                    # Créer le fichier image
                    image_file = ContentFile(image_data)
                    filename = f"product_{produit.id}_{i+1}.jpg"
                    
                    # Créer l'image produit
                    image_produit = ImageProduit.objects.create(
                        produit=produit,
                        image=image_file,
                        alt_text=f"Image de {produit.nom}",
                        ordre_affichage=i + 1,
                        principale=(i == 0)
                    )
                    print(f"  ✅ Image {i+1} ajoutée pour {produit.nom}")
                else:
                    print(f"  ❌ Échec du téléchargement de l'image {i+1}")
            
            updated_count += 1
            print(f"✅ {produit.nom} mis à jour avec {len(images_urls[:3])} images")
            
        except Exception as e:
            failed_count += 1
            print(f"❌ Erreur lors de la mise à jour de {produit.nom}: {e}")
            continue
    
    print(f"\n📊 Résumé de la mise à jour:")
    print(f"  ✅ Produits mis à jour: {updated_count}")
    print(f"  ❌ Échecs: {failed_count}")
    print(f"  📈 Taux de succès: {(updated_count / (updated_count + failed_count)) * 100:.1f}%")

def show_product_categories():
    """Affiche les catégories et produits pour vérification"""
    print("\n📋 Catégories et produits actuels:")
    
    produits = Produit.objects.all()
    categories = {}
    
    for produit in produits:
        categorie = produit.categorie.nom if produit.categorie else 'Sans catégorie'
        if categorie not in categories:
            categories[categorie] = []
        categories[categorie].append(produit.nom)
    
    for categorie, produits_list in categories.items():
        print(f"\n📂 {categorie}:")
        for produit in produits_list[:5]:  # Afficher les 5 premiers
            print(f"  📦 {produit}")
        if len(produits_list) > 5:
            print(f"  ... et {len(produits_list) - 5} autres produits")

def main():
    """Fonction principale"""
    try:
        show_product_categories()
        update_product_images()
        print("\n🎉 Mise à jour des images cohérentes terminée!")
    except Exception as e:
        print(f"❌ Erreur générale: {e}")

if __name__ == "__main__":
    main()

