#!/usr/bin/env python3
"""
Script pour vérifier que tous les avatars sénégalais sont correctement mis à jour
"""

import os
import sys
import django
import glob
from django.core.files.storage import default_storage

# Configuration Django
sys.path.append('/home/suleimaan/Téléchargements/Mm/project/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.users.models import UtilisateurPersonnalise

def verify_senegal_avatars():
    """Vérifie que tous les utilisateurs ont des avatars sénégalais"""
    print("🔍 Vérification des avatars sénégalais...")
    
    users = UtilisateurPersonnalise.objects.all()
    print(f"👤 Nombre d'utilisateurs: {users.count()}")
    
    users_with_avatars = users.filter(avatar__isnull=False).exclude(avatar='')
    print(f"👤 Utilisateurs avec avatars: {users_with_avatars.count()}")
    
    senegal_avatars_count = 0
    old_avatars_count = 0
    
    print("\n📋 Vérification des avatars:")
    for user in users_with_avatars:
        avatar_url = user.avatar.url if user.avatar else "Aucun"
        avatar_name = os.path.basename(avatar_url) if avatar_url != "Aucun" else "Aucun"
        
        if "senegal_avatar_" in avatar_name:
            senegal_avatars_count += 1
            print(f"  ✅ {user.get_full_name()} - Avatar sénégalais: {avatar_name}")
        else:
            old_avatars_count += 1
            print(f"  ❌ {user.get_full_name()} - Ancien avatar: {avatar_name}")
    
    print(f"\n📊 Résumé de la vérification:")
    print(f"  🇸🇳 Avatars sénégalais: {senegal_avatars_count}")
    print(f"  🗑️  Anciens avatars: {old_avatars_count}")
    print(f"  📈 Taux de mise à jour: {(senegal_avatars_count / users_with_avatars.count()) * 100:.1f}%")
    
    if old_avatars_count == 0:
        print("🎉 Tous les avatars sont des avatars sénégalais!")
    else:
        print(f"⚠️  {old_avatars_count} utilisateurs ont encore des anciens avatars.")

def check_avatar_files():
    """Vérifie les fichiers d'avatars sur le disque"""
    print("\n📁 Vérification des fichiers d'avatars:")
    
    avatars_dir = "/home/suleimaan/Téléchargements/Mm/project/backend/media/avatars"
    
    if not os.path.exists(avatars_dir):
        print("❌ Dossier avatars introuvable.")
        return
    
    # Compter les fichiers
    senegal_files = glob.glob(os.path.join(avatars_dir, "senegal_avatar_*.png"))
    old_files = glob.glob(os.path.join(avatars_dir, "avatar_*.png"))
    
    print(f"  🇸🇳 Fichiers avatars sénégalais: {len(senegal_files)}")
    print(f"  🗑️  Fichiers anciens avatars: {len(old_files)}")
    print(f"  📁 Total fichiers: {len(senegal_files) + len(old_files)}")
    
    if len(old_files) == 0:
        print("✅ Aucun ancien fichier d'avatar trouvé!")
    else:
        print(f"⚠️  {len(old_files)} anciens fichiers d'avatars trouvés.")

def show_sample_avatars():
    """Affiche quelques exemples d'avatars"""
    print("\n🖼️  Exemples d'avatars sénégalais:")
    
    users_with_senegal_avatars = UtilisateurPersonnalise.objects.filter(
        avatar__isnull=False
    ).exclude(avatar='')
    
    # Filtrer ceux qui ont des avatars sénégalais
    senegal_users = []
    for user in users_with_senegal_avatars:
        if user.avatar and "senegal_avatar_" in user.avatar.name:
            senegal_users.append(user)
    
    # Afficher les 10 premiers
    for i, user in enumerate(senegal_users[:10]):
        avatar_url = user.avatar.url if user.avatar else "Aucun"
        print(f"  {i+1}. {user.get_full_name()} ({user.type_utilisateur}) - {os.path.basename(avatar_url)}")

def main():
    """Fonction principale"""
    try:
        verify_senegal_avatars()
        check_avatar_files()
        show_sample_avatars()
        print("\n🎉 Vérification des avatars sénégalais terminée!")
    except Exception as e:
        print(f"❌ Erreur générale: {e}")

if __name__ == "__main__":
    main()
