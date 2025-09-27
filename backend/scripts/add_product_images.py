#!/usr/bin/env python3
"""
Script pour ajouter des images aux produits existants.
"""
import os
import sys
import django
from django.core.files import File
from django.core.files.base import ContentFile
import requests
from io import BytesIO

# Configuration Django
sys.path.append('/home/suleimaan/Téléchargements/Mm/project/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.products.models import Produit, ImageProduit

def add_images_to_products():
    """Ajouter des images aux produits existants."""
    print("🖼️  Ajout d'images aux produits...")
    
    # URLs d'images de démonstration
    image_urls = {
        'Électronique': [
            'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
            'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
            'https://images.pexels.com/photos/163117/plugs-cables-sockets-163117.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2'
        ],
        'Mode & Beauté': [
            'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
            'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
            'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2'
        ],
        'Alimentation': [
            'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
            'https://images.pexels.com/photos/1346155/pexels-photo-1346155.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
            'https://images.pexels.com/photos/164743/pexels-photo-164743.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2'
        ],
        'Santé & Pharmacie': [
            'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
            'https://images.pexels.com/photos/4386464/pexels-photo-4386464.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2'
        ],
        'Maison & Jardin': [
            'https://images.pexels.com/photos/164743/pexels-photo-164743.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
            'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2'
        ]
    }
    
    produits = Produit.objects.all()
    print(f"📦 {produits.count()} produits trouvés")
    
    for produit in produits:
        try:
            # Vérifier si le produit a déjà des images
            if produit.images.exists():
                print(f"  ⏭️  {produit.nom} a déjà des images")
                continue
            
            # Obtenir la catégorie du produit
            categorie_nom = produit.categorie.nom if produit.categorie else 'Électronique'
            
            # Sélectionner une image appropriée
            if categorie_nom in image_urls:
                image_url = image_urls[categorie_nom][0]  # Prendre la première image
            else:
                image_url = image_urls['Électronique'][0]  # Image par défaut
            
            # Télécharger l'image
            try:
                response = requests.get(image_url, timeout=10)
                response.raise_for_status()
                
                # Créer l'image
                image_content = ContentFile(response.content)
                image_name = f"{produit.slug}_main.jpg"
                
                # Créer l'objet ImageProduit
                image_produit = ImageProduit.objects.create(
                    produit=produit,
                    alt_text=f"Image de {produit.nom}",
                    ordre_affichage=1,
                    principale=True
                )
                
                # Sauvegarder l'image
                image_produit.image.save(image_name, image_content, save=True)
                
                print(f"  ✅ Image ajoutée à {produit.nom}")
                
            except requests.RequestException as e:
                print(f"  ❌ Erreur lors du téléchargement de l'image pour {produit.nom}: {e}")
                continue
                
        except Exception as e:
            print(f"  ❌ Erreur lors de l'ajout d'image à {produit.nom}: {e}")
            continue
    
    print("🎉 Ajout d'images terminé !")

if __name__ == '__main__':
    add_images_to_products()
