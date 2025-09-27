#!/usr/bin/env python3
"""
Script pour télécharger et remplacer les avatars par des images réelles de Sénégalais
"""

import os
import sys
import django
import requests
import random
from django.core.files.base import ContentFile
from PIL import Image, ImageDraw
import io

# Configuration Django
sys.path.append('/home/suleimaan/Téléchargements/Mm/project/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.users.models import UtilisateurPersonnalise

# Images réelles de Sénégalais (URLs d'images libres de droits)
SENEGAL_AVATARS = [
    # Hommes
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face",
    
    # Femmes
    "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face",
    
    # Images spécifiques africaines/sénégalaises
    "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face",
]

def download_image(url):
    """Télécharge une image depuis une URL"""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.content
    except Exception as e:
        print(f"❌ Erreur lors du téléchargement de {url}: {e}")
        return None

def process_image(image_data):
    """Traite l'image téléchargée (redimensionne, optimise)"""
    try:
        # Ouvrir l'image
        image = Image.open(io.BytesIO(image_data))
        
        # Convertir en RGB si nécessaire
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Redimensionner à 200x200
        image = image.resize((200, 200), Image.Resampling.LANCZOS)
        
        # Créer un cercle (masque)
        mask = Image.new('L', (200, 200), 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse([0, 0, 200, 200], fill=255)
        
        # Appliquer le masque
        output = Image.new('RGB', (200, 200), (255, 255, 255))
        output.paste(image, (0, 0))
        output.putalpha(mask)
        
        # Convertir en RGB final
        final_image = Image.new('RGB', (200, 200), (255, 255, 255))
        final_image.paste(output, mask=output.split()[-1])
        
        # Sauvegarder en bytes
        img_byte_arr = io.BytesIO()
        final_image.save(img_byte_arr, format='PNG', quality=95)
        img_byte_arr.seek(0)
        
        return img_byte_arr.getvalue()
        
    except Exception as e:
        print(f"❌ Erreur lors du traitement de l'image: {e}")
        return None

def update_user_avatar(user, avatar_url):
    """Met à jour l'avatar d'un utilisateur"""
    try:
        # Télécharger l'image
        image_data = download_image(avatar_url)
        if not image_data:
            return False
        
        # Traiter l'image
        processed_image = process_image(image_data)
        if not processed_image:
            return False
        
        # Supprimer l'ancien avatar
        if user.avatar:
            user.avatar.delete(save=False)
        
        # Créer le nouveau fichier
        avatar_file = ContentFile(processed_image)
        filename = f"real_avatar_{user.id}_{user.first_name}_{user.last_name}.png"
        user.avatar.save(filename, avatar_file, save=True)
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de la mise à jour de l'avatar pour {user.get_full_name()}: {e}")
        return False

def update_all_avatars():
    """Met à jour tous les avatars des utilisateurs"""
    print("🇸🇳 Mise à jour des avatars avec des images réelles de Sénégalais...")
    
    users = UtilisateurPersonnalise.objects.all()
    print(f"👤 Nombre d'utilisateurs à traiter: {users.count()}")
    
    if users.count() == 0:
        print("❌ Aucun utilisateur trouvé.")
        return
    
    updated_count = 0
    failed_count = 0
    
    for user in users:
        try:
            # Choisir une image aléatoire
            avatar_url = random.choice(SENEGAL_AVATARS)
            
            print(f"🔄 Mise à jour de l'avatar pour {user.get_full_name()} ({user.type_utilisateur})...")
            
            if update_user_avatar(user, avatar_url):
                updated_count += 1
                print(f"✅ Avatar mis à jour pour {user.get_full_name()}")
            else:
                failed_count += 1
                print(f"❌ Échec de la mise à jour pour {user.get_full_name()}")
                
        except Exception as e:
            failed_count += 1
            print(f"❌ Erreur pour {user.get_full_name()}: {e}")
            continue
    
    print(f"\n📊 Résumé:")
    print(f"  ✅ Avatars mis à jour: {updated_count}")
    print(f"  ❌ Échecs: {failed_count}")
    print(f"  📈 Taux de succès: {(updated_count / (updated_count + failed_count)) * 100:.1f}%")

def main():
    """Fonction principale"""
    try:
        update_all_avatars()
        print("\n🎉 Mise à jour des avatars terminée!")
    except Exception as e:
        print(f"❌ Erreur générale: {e}")

if __name__ == "__main__":
    main()
