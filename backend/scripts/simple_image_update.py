#!/usr/bin/env python3
"""
Script simple pour mettre à jour les images des produits avec des images locales
"""

import os
import sys
import django
from django.core.files.base import ContentFile
from PIL import Image
import io
import random

# Configuration Django
sys.path.append('/home/suleimaan/Téléchargements/Mm/project/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.products.models import Produit, ImageProduit
from apps.companies.models import Entreprise

def create_simple_image(color=(100, 150, 200), text="PRODUIT"):
    """Crée une image simple avec une couleur et un texte"""
    img = Image.new('RGB', (400, 400), color)
    
    # Ajouter du texte simple
    from PIL import ImageDraw, ImageFont
    draw = ImageDraw.Draw(img)
    
    try:
        # Essayer d'utiliser une police système
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 40)
    except:
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 40)
        except:
            font = ImageFont.load_default()
    
    # Centrer le texte
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (400 - text_width) // 2
    y = (400 - text_height) // 2
    
    draw.text((x, y), text, fill=(255, 255, 255), font=font)
    
    # Convertir en bytes
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG', quality=85)
    return ContentFile(img_byte_arr.getvalue())

def update_product_images():
    """Met à jour les images des produits avec des images simples"""
    print("🖼️ Mise à jour des images des produits...")
    
    produits = Produit.objects.all()
    print(f"📦 Nombre de produits à traiter: {produits.count()}")
    
    updated_count = 0
    
    for produit in produits:
        try:
            # Supprimer les anciennes images
            ImageProduit.objects.filter(produit=produit).delete()
            
            # Créer des images simples basées sur la catégorie
            category_colors = {
                'Électronique': (100, 150, 200),
                'Vêtements': (200, 100, 150),
                'Alimentation': (150, 200, 100),
                'Maison et Jardin': (200, 150, 100),
                'Sports et Loisirs': (100, 200, 150),
                'Santé et Beauté': (200, 100, 200),
                'Livres et Médias': (150, 150, 200),
                'Automobile': (100, 100, 100)
            }
            
            categorie_nom = produit.categorie.nom if produit.categorie else 'Électronique'
            base_color = category_colors.get(categorie_nom, (100, 150, 200))
            
            # Créer 2-3 images par produit
            for i in range(random.randint(2, 3)):
                # Varier légèrement la couleur
                color_variation = (
                    max(0, min(255, base_color[0] + random.randint(-50, 50))),
                    max(0, min(255, base_color[1] + random.randint(-50, 50))),
                    max(0, min(255, base_color[2] + random.randint(-50, 50)))
                )
                
                image_file = create_simple_image(color_variation, f"{produit.nom[:8]}")
                
                image_produit = ImageProduit.objects.create(
                    produit=produit,
                    image=image_file,
                    ordre_affichage=i + 1,
                    principale=(i == 0)
                )
                print(f"  ✅ Image {i+1} créée pour {produit.nom}")
            
            updated_count += 1
            
        except Exception as e:
            print(f"❌ Erreur lors de la mise à jour de {produit.nom}: {e}")
    
    print(f"✅ {updated_count} produits mis à jour avec de nouvelles images")

def update_company_logos():
    """Met à jour les logos des entreprises avec des images simples"""
    print("🏢 Mise à jour des logos des entreprises...")
    
    entreprises = Entreprise.objects.all()
    print(f"🏢 Nombre d'entreprises à traiter: {entreprises.count()}")
    
    updated_count = 0
    
    for entreprise in entreprises:
        try:
            # Créer un logo simple basé sur l'ID de l'entreprise
            colors = [
                (100, 150, 200), (200, 100, 150), (150, 200, 100),
                (200, 150, 100), (100, 200, 150), (200, 100, 200),
                (150, 150, 200), (100, 100, 100), (200, 200, 100),
                (100, 200, 200)
            ]
            
            # Convertir UUID en int pour l'index
            color_index = hash(str(entreprise.id)) % len(colors)
            color = colors[color_index]
            logo_file = create_simple_image(color, entreprise.nom[:4].upper())
            
            # Sauvegarder le logo
            entreprise.logo.save(f'logo_{entreprise.id}.jpg', logo_file, save=True)
            print(f"  ✅ Logo créé pour {entreprise.nom}")
            updated_count += 1
            
        except Exception as e:
            print(f"❌ Erreur lors de la mise à jour du logo de {entreprise.nom}: {e}")
    
    print(f"✅ {updated_count} logos d'entreprises mis à jour")

def main():
    """Fonction principale"""
    print("🚀 Début de la mise à jour des images...")
    
    try:
        # 1. Mettre à jour les images des produits
        update_product_images()
        
        # 2. Mettre à jour les logos des entreprises
        update_company_logos()
        
        print("\n✅ Mise à jour terminée avec succès!")
        
    except Exception as e:
        print(f"❌ Erreur générale: {e}")
        sys.exit(1)
if __name__ == '__main__':
    main()
