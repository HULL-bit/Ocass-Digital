#!/usr/bin/env python3
"""
Script pour créer des avatars sénégalais réalistes avec des noms et prénoms sénégalais
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

# Noms et prénoms sénégalais authentiques
PRENOMS_SENEGALAIS = [
    # Prénoms masculins
    "Amadou", "Moussa", "Cheikh", "Ibrahima", "Ousmane", "Mamadou", "Abdou", "Modou", "Samba", "Boubacar",
    "Elhadj", "Idrissa", "Khalifa", "Moussa", "Omar", "Pape", "Serigne", "Thierno", "Youssou", "Ahmadou",
    "Gora", "Lamine", "Mouhamadou", "Ndiaga", "Papa", "Seydou", "Talla", "Youssouph", "Zakaria", "Alassane",
    
    # Prénoms féminins
    "Aminata", "Fatou", "Mariama", "Aïcha", "Khadija", "Awa", "Ndeye", "Jabou", "Aïssatou", "Fanta",
    "Hawa", "Diarra", "Aïcha", "Khadija", "Awa", "Ndeye", "Jabou", "Aïssatou", "Fanta", "Hawa",
    "Diarra", "Aïcha", "Khadija", "Awa", "Ndeye", "Jabou", "Aïssatou", "Fanta", "Hawa", "Diarra"
]

NOMS_SENEGALAIS = [
    "Diop", "Ndiaye", "Sow", "Fall", "Ba", "Diallo", "Sarr", "Thiam", "Gueye", "Cissé",
    "Mbaye", "Sy", "Traoré", "Seck", "Kane", "Wade", "Sall", "Ndiaye", "Diouf", "Faye",
    "Samb", "Mbacké", "Ndiaye", "Sow", "Fall", "Ba", "Diallo", "Sarr", "Thiam", "Gueye"
]

# Couleurs inspirées du Sénégal (drapeau, terres, etc.)
COULEURS_SENEGAL = [
    (0, 100, 0),      # Vert (drapeau)
    (255, 255, 0),    # Jaune (drapeau)
    (255, 0, 0),      # Rouge (drapeau)
    (139, 69, 19),    # Marron (terre)
    (160, 82, 45),    # Sienne
    (210, 180, 140),  # Beige
    (255, 218, 185),  # Pêche
    (255, 228, 196),  # Bisque
    (255, 239, 213),  # Papaye
    (255, 250, 240),  # Floral
    (255, 248, 220),  # Crème
    (255, 245, 238),  # Seashell
    (255, 240, 245),  # Lavender
    (255, 228, 225),  # Misty Rose
    (255, 222, 173),  # Navajo White
]

def create_senegal_avatar(first_name, last_name, user_id, gender=None):
    """Crée un avatar sénégalais réaliste"""
    # Déterminer le genre basé sur le prénom
    if not gender:
        if first_name in ["Aminata", "Fatou", "Mariama", "Aïcha", "Khadija", "Awa", "Ndeye", "Jabou", "Aïssatou", "Fanta", "Hawa", "Diarra"]:
            gender = "F"
        else:
            gender = "M"
    
    # Utiliser l'ID utilisateur pour générer une couleur déterministe
    hash_obj = hashlib.md5(str(user_id).encode())
    hash_int = int(hash_obj.hexdigest()[:8], 16)
    
    # Choisir une couleur sénégalaise
    color_index = hash_int % len(COULEURS_SENEGAL)
    base_color = COULEURS_SENEGAL[color_index]
    
    # Varier légèrement la couleur
    variation = hash_int % 30
    color = (
        max(0, min(255, base_color[0] + variation - 15)),
        max(0, min(255, base_color[1] + variation - 15)),
        max(0, min(255, base_color[2] + variation - 15))
    )
    
    # Créer l'image
    size = 200
    img = Image.new('RGB', (size, size), color)
    draw = ImageDraw.Draw(img)
    
    # Ajouter un cercle de fond avec bordure
    margin = 5
    draw.ellipse([margin, margin, size-margin, size-margin], fill=color, outline=(255, 255, 255), width=3)
    
    # Générer les initiales
    initials = f"{first_name[0]}{last_name[0]}".upper()
    
    # Essayer différentes polices
    font_size = 60
    try:
        # Essayer d'utiliser une police système
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
    except:
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", font_size)
        except:
            font = ImageFont.load_default()
    
    # Calculer la position du texte
    bbox = draw.textbbox((0, 0), initials, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (size - text_width) // 2
    y = (size - text_height) // 2 - 5
    
    # Dessiner le texte avec ombre
    draw.text((x+2, y+2), initials, fill=(0, 0, 0, 100), font=font)  # Ombre
    draw.text((x, y), initials, fill=(255, 255, 255), font=font)     # Texte principal
    
    # Ajouter un petit motif sénégalais (étoile)
    star_size = 15
    star_x = size - 25
    star_y = 15
    
    # Dessiner une petite étoile
    star_points = []
    for i in range(5):
        angle = i * 144
        x_star = star_x + star_size * 0.5 * (1 if i % 2 == 0 else 0.3) * (1 if i % 2 == 0 else -1)
        y_star = star_y + star_size * 0.5 * (1 if i % 2 == 0 else 0.3) * (1 if i % 2 == 0 else -1)
        star_points.append((x_star, y_star))
    
    if len(star_points) >= 3:
        draw.polygon(star_points, fill=(255, 255, 0), outline=(255, 255, 255))
    
    # Convertir en bytes
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG', quality=95)
    img_byte_arr.seek(0)
    
    return ContentFile(img_byte_arr.getvalue())

def update_user_avatar_senegal(user):
    """Met à jour l'avatar d'un utilisateur avec un style sénégalais"""
    try:
        # Supprimer l'ancien avatar
        if user.avatar:
            user.avatar.delete(save=False)
        
        # Créer un nouvel avatar sénégalais
        avatar_file = create_senegal_avatar(
            user.first_name or "U", 
            user.last_name or "U", 
            user.id
        )
        
        # Sauvegarder le nouvel avatar
        filename = f"senegal_avatar_{user.id}_{user.first_name}_{user.last_name}.png"
        user.avatar.save(filename, avatar_file, save=True)
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de la mise à jour de l'avatar de {user.get_full_name()}: {e}")
        return False

def update_all_senegal_avatars():
    """Met à jour tous les avatars avec un style sénégalais"""
    print("🇸🇳 Mise à jour des avatars avec un style sénégalais...")
    
    users = UtilisateurPersonnalise.objects.all()
    print(f"👤 Nombre d'utilisateurs à traiter: {users.count()}")
    
    if users.count() == 0:
        print("❌ Aucun utilisateur trouvé.")
        return
    
    updated_count = 0
    failed_count = 0
    
    for user in users:
        try:
            print(f"🔄 Mise à jour de l'avatar pour {user.get_full_name()} ({user.type_utilisateur})...")
            
            if update_user_avatar_senegal(user):
                updated_count += 1
                print(f"✅ Avatar sénégalais créé pour {user.get_full_name()}")
            else:
                failed_count += 1
                print(f"❌ Échec de la mise à jour pour {user.get_full_name()}")
                
        except Exception as e:
            failed_count += 1
            print(f"❌ Erreur pour {user.get_full_name()}: {e}")
            continue
    
    print(f"\n📊 Résumé:")
    print(f"  ✅ Avatars sénégalais créés: {updated_count}")
    print(f"  ❌ Échecs: {failed_count}")
    print(f"  📈 Taux de succès: {(updated_count / (updated_count + failed_count)) * 100:.1f}%")

def main():
    """Fonction principale"""
    try:
        update_all_senegal_avatars()
        print("\n🎉 Mise à jour des avatars sénégalais terminée!")
    except Exception as e:
        print(f"❌ Erreur générale: {e}")

if __name__ == "__main__":
    main()
