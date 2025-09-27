#!/usr/bin/env python3
"""
Script pour vérifier les avatars des utilisateurs
"""

import os
import sys
import django

# Configuration Django
sys.path.append('/home/suleimaan/Téléchargements/Mm/project/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.users.models import UtilisateurPersonnalise

def check_user_avatars():
    """Vérifie les avatars des utilisateurs"""
    print("👤 Vérification des avatars des utilisateurs...")
    
    users = UtilisateurPersonnalise.objects.all()
    print(f"👤 Nombre d'utilisateurs: {users.count()}")
    
    users_with_avatars = users.filter(avatar__isnull=False).exclude(avatar='')
    print(f"👤 Utilisateurs avec avatars: {users_with_avatars.count()}")
    
    print("\n📋 Premiers utilisateurs avec avatars:")
    for i, user in enumerate(users_with_avatars[:10]):
        avatar_url = user.avatar.url if user.avatar else "Aucun"
        print(f"  {i+1}. {user.get_full_name()} - Avatar: {avatar_url}")
    
    print(f"\n📊 Statistiques:")
    print(f"  - Total utilisateurs: {users.count()}")
    print(f"  - Avec avatars: {users_with_avatars.count()}")
    print(f"  - Sans avatars: {users.count() - users_with_avatars.count()}")

if __name__ == "__main__":
    check_user_avatars()


