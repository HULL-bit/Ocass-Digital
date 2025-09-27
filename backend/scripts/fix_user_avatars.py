#!/usr/bin/env python3
"""
Script pour corriger les avatars des utilisateurs avec des images uniques
"""

import os
import sys
import django
import random
import hashlib
from django.core.files.base import ContentFile
from PIL import Image, ImageDraw, ImageFont
import io

# Configuration Django
sys.path.append('/home/suleimaan/Téléchargements/Mm/project/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.users.models import UtilisateurPersonnalise

def create_unique_avatar(first_name, last_name, user_id):
    """Crée un avatar unique basé sur les initiales et l'ID utilisateur"""
    # Utiliser l'ID utilisateur pour générer une couleur déterministe
    hash_obj = hashlib.md5(str(user_id).encode())
    hash_int = int(hash_obj.hexdigest()[:8], 16)
    
    # Générer des couleurs basées sur le hash
    base_colors = [
        (52, 152, 219),   # Bleu
        (46, 204, 113),   # Vert
        (155, 89, 182),   # Violet
        (241, 196, 15),   # Jaune
        (230, 126, 34),   # Orange
        (231, 76, 60),    # Rouge
        (26, 188, 156),  # Turquoise
        (142, 68, 173),   # Violet foncé
        (39, 174, 96),    # Vert foncé
        (41, 128, 185),   # Bleu foncé
    ]
    
    color_index = hash_int % len(base_colors)
    base_color = base_colors[color_index]
    
    # Varier légèrement la couleur
    variation = hash_int % 50
    color = (
        max(0, min(255, base_color[0] + variation - 25)),
        max(0, min(255, base_color[1] + variation - 25)),
        max(0, min(255, base_color[2] + variation - 25))
    )
    
    # Créer l'image
    size = 200
    img = Image.new('RGB', (size, size), color)
    draw = ImageDraw.Draw(img)
    
    # Ajouter un cercle de fond
    margin = 10
    draw.ellipse([margin, margin, size-margin, size-margin], fill=color, outline=(255, 255, 255), width=3)
    
    # Générer les initiales
    initials = f"{first_name[0]}{last_name[0]}".upper()
    
    # Essayer différentes polices
    font_size = 60
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
    except:
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", font_size)
        except:
            font = ImageFont.load_default()
    
    # Centrer le texte
    bbox = draw.textbbox((0, 0), initials, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (size - text_width) // 2
    y = (size - text_height) // 2
    
    # Ajouter une ombre au texte
    draw.text((x+2, y+2), initials, fill=(0, 0, 0, 100), font=font)
    draw.text((x, y), initials, fill=(255, 255, 255), font=font)
    
    # Convertir en bytes
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG', quality=95)
    img_byte_arr.seek(0)
    
    return ContentFile(img_byte_arr.getvalue())

def fix_user_avatars():
    """Corrige les avatars de tous les utilisateurs"""
    print("👤 Correction des avatars des utilisateurs...")
    
    users = UtilisateurPersonnalise.objects.all()
    print(f"👤 Nombre d'utilisateurs à traiter: {users.count()}")
    
    if users.count() == 0:
        print("❌ Aucun utilisateur trouvé.")
        return
    
    updated_count = 0
    
    for user in users:
        try:
            # Supprimer l'ancien avatar s'il existe
            if user.avatar:
                user.avatar.delete(save=False)
            
            # Créer un nouvel avatar unique
            avatar_file = create_unique_avatar(
                user.first_name or "U", 
                user.last_name or "U", 
                user.id
            )
            
            # Sauvegarder le nouvel avatar
            filename = f"avatar_{user.id}_{user.first_name}_{user.last_name}.png"
            user.avatar.save(filename, avatar_file, save=True)
            
            updated_count += 1
            
            if updated_count % 10 == 0:
                print(f"✅ {updated_count} avatars traités...")
                
        except Exception as e:
            print(f"❌ Erreur lors de la mise à jour de l'avatar de {user.get_full_name()}: {e}")
            continue
    
    print(f"✅ {updated_count} avatars d'utilisateurs mis à jour avec succès!")

def main():
    """Fonction principale"""
    print("🚀 Début de la correction des avatars...")
    
    try:
        fix_user_avatars()
        print("\n✅ Correction des avatars terminée avec succès!")
        
    except Exception as e:
        print(f"❌ Erreur générale: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()


