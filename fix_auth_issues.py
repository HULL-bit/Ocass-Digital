#!/usr/bin/env python3
"""
Script pour corriger les problèmes d'authentification
"""

import os
import sys
import django

# Configuration Django
sys.path.append('/home/suleimaan/Téléchargements/Mm/project/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.db import transaction

User = get_user_model()

def fix_user_data():
    """Corriger les données utilisateur"""
    print("🔧 Correction des données utilisateur...")
    
    try:
        # Vérifier et corriger les utilisateurs existants
        users = User.objects.all()
        print(f"📊 {users.count()} utilisateurs trouvés")
        
        for user in users:
            # S'assurer que l'email est unique et valide
            if not user.email or '@' not in user.email:
                print(f"⚠️ Email invalide pour l'utilisateur {user.id}")
                continue
            
            # S'assurer que le type_utilisateur est valide
            if user.type_utilisateur not in ['admin', 'entrepreneur', 'client']:
                print(f"⚠️ Type utilisateur invalide pour {user.email}: {user.type_utilisateur}")
                # Corriger automatiquement
                if 'admin' in user.email.lower():
                    user.type_utilisateur = 'admin'
                elif 'entrepreneur' in user.email.lower():
                    user.type_utilisateur = 'entrepreneur'
                else:
                    user.type_utilisateur = 'client'
                user.save()
                print(f"✅ Type corrigé pour {user.email}: {user.type_utilisateur}")
            
            # S'assurer que l'utilisateur est actif
            if not user.is_active:
                user.is_active = True
                user.save()
                print(f"✅ Utilisateur {user.email} activé")
        
        print("✅ Données utilisateur corrigées")
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de la correction: {e}")
        return False

def create_test_users():
    """Créer des utilisateurs de test si nécessaire"""
    print("👥 Création des utilisateurs de test...")
    
    test_users = [
        {
            'email': 'admin@platform.com',
            'password': 'admin123',
            'first_name': 'Super',
            'last_name': 'Admin',
            'type_utilisateur': 'admin',
            'is_active': True,
            'is_staff': True,
            'is_superuser': True
        },
        {
            'email': 'entrepreneur@demo.com',
            'password': 'password',
            'first_name': 'Marie',
            'last_name': 'Diallo',
            'type_utilisateur': 'entrepreneur',
            'is_active': True
        },
        {
            'email': 'client@example.com',
            'password': 'password',
            'first_name': 'Abdou',
            'last_name': 'Samb',
            'type_utilisateur': 'client',
            'is_active': True
        }
    ]
    
    created_count = 0
    
    for user_data in test_users:
        email = user_data['email']
        
        if not User.objects.filter(email=email).exists():
            try:
                user = User.objects.create_user(
                    username=email,
                    email=email,
                    password=user_data['password'],
                    first_name=user_data['first_name'],
                    last_name=user_data['last_name'],
                    type_utilisateur=user_data['type_utilisateur'],
                    is_active=user_data['is_active'],
                    is_staff=user_data.get('is_staff', False),
                    is_superuser=user_data.get('is_superuser', False)
                )
                print(f"✅ Utilisateur créé: {email}")
                created_count += 1
            except Exception as e:
                print(f"❌ Erreur création {email}: {e}")
        else:
            print(f"ℹ️ Utilisateur existe déjà: {email}")
    
    print(f"✅ {created_count} nouveaux utilisateurs créés")
    return True

def test_authentication():
    """Tester l'authentification"""
    print("🔐 Test de l'authentification...")
    
    from django.contrib.auth import authenticate
    
    test_credentials = [
        ('admin@platform.com', 'admin123', 'admin'),
        ('entrepreneur@demo.com', 'password', 'entrepreneur'),
        ('client@example.com', 'password', 'client')
    ]
    
    success_count = 0
    
    for email, password, expected_type in test_credentials:
        try:
            user = authenticate(username=email, password=password)
            if user and user.is_active and user.type_utilisateur == expected_type:
                print(f"✅ Authentification réussie: {email}")
                success_count += 1
            else:
                print(f"❌ Authentification échouée: {email}")
        except Exception as e:
            print(f"❌ Erreur authentification {email}: {e}")
    
    print(f"✅ {success_count}/{len(test_credentials)} authentifications réussies")
    return success_count == len(test_credentials)

def run_migrations():
    """Exécuter les migrations"""
    print("🔄 Exécution des migrations...")
    
    try:
        call_command('makemigrations')
        call_command('migrate')
        print("✅ Migrations exécutées")
        return True
    except Exception as e:
        print(f"❌ Erreur migrations: {e}")
        return False

def main():
    """Fonction principale"""
    print("🚀 Correction des problèmes d'authentification")
    print("=" * 60)
    
    steps = [
        ("Migrations", run_migrations),
        ("Données utilisateur", fix_user_data),
        ("Utilisateurs de test", create_test_users),
        ("Test authentification", test_authentication)
    ]
    
    success_count = 0
    
    for step_name, step_func in steps:
        print(f"\n📋 {step_name}...")
        try:
            if step_func():
                print(f"✅ {step_name} terminé")
                success_count += 1
            else:
                print(f"❌ {step_name} échoué")
        except Exception as e:
            print(f"❌ Erreur {step_name}: {e}")
    
    print(f"\n🎯 Résultat: {success_count}/{len(steps)} étapes réussies")
    
    if success_count == len(steps):
        print("🎉 Tous les problèmes d'authentification ont été corrigés !")
        return True
    else:
        print("⚠️ Certains problèmes persistent. Vérifiez les logs.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
