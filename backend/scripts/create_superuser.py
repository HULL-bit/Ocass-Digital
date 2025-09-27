#!/usr/bin/env python
"""
Script pour créer un superutilisateur.
"""
import os
import sys
import django

# Configuration Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def create_superuser():
    """Créer un superutilisateur."""
    if not User.objects.filter(username='client').exists():
        User.objects.create_superuser(
            username='client',
            email='client@platform.com',
            password='client123',
            first_name='Super',
            last_name='Admin',
            type_utilisateur='client'
        )
        print("✅ Superutilisateur créé: admin / admin123")
    else:
        print("ℹ️ Superutilisateur existe déjà")

if __name__ == '__main__':
    create_superuser()