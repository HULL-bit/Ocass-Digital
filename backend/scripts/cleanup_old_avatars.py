#!/usr/bin/env python3
"""
Script pour nettoyer les anciens avatars et ne garder que les nouveaux avatars sénégalais
"""

import os
import sys
import django
import glob

# Configuration Django
sys.path.append('/home/suleimaan/Téléchargements/Mm/project/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

def cleanup_old_avatars():
    """Supprime les anciens avatars générés automatiquement"""
    print("🧹 Nettoyage des anciens avatars...")
    
    avatars_dir = "/home/suleimaan/Téléchargements/Mm/project/backend/media/avatars"
    
    if not os.path.exists(avatars_dir):
        print("❌ Dossier avatars introuvable.")
        return
    
    # Supprimer les anciens avatars (ceux qui commencent par "avatar_" et non "senegal_avatar_")
    old_avatar_pattern = os.path.join(avatars_dir, "avatar_*.png")
    old_avatars = glob.glob(old_avatar_pattern)
    
    print(f"📁 Anciens avatars trouvés: {len(old_avatars)}")
    
    deleted_count = 0
    for avatar_path in old_avatars:
        try:
            os.remove(avatar_path)
            deleted_count += 1
            print(f"🗑️  Supprimé: {os.path.basename(avatar_path)}")
        except Exception as e:
            print(f"❌ Erreur lors de la suppression de {avatar_path}: {e}")
    
    print(f"\n📊 Résumé du nettoyage:")
    print(f"  🗑️  Anciens avatars supprimés: {deleted_count}")
    print(f"  ✅ Nettoyage terminé!")

def show_avatar_stats():
    """Affiche les statistiques des avatars"""
    print("\n📊 Statistiques des avatars:")
    
    avatars_dir = "/home/suleimaan/Téléchargements/Mm/project/backend/media/avatars"
    
    if not os.path.exists(avatars_dir):
        print("❌ Dossier avatars introuvable.")
        return
    
    # Compter les nouveaux avatars sénégalais
    senegal_avatars = glob.glob(os.path.join(avatars_dir, "senegal_avatar_*.png"))
    old_avatars = glob.glob(os.path.join(avatars_dir, "avatar_*.png"))
    
    print(f"  🇸🇳 Avatars sénégalais: {len(senegal_avatars)}")
    print(f"  🗑️  Anciens avatars: {len(old_avatars)}")
    print(f"  📁 Total fichiers: {len(senegal_avatars) + len(old_avatars)}")

def main():
    """Fonction principale"""
    try:
        show_avatar_stats()
        cleanup_old_avatars()
        show_avatar_stats()
        print("\n🎉 Nettoyage des avatars terminé!")
    except Exception as e:
        print(f"❌ Erreur générale: {e}")

if __name__ == "__main__":
    main()
