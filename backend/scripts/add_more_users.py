#!/usr/bin/env python
"""
Script pour ajouter plus d'utilisateurs de chaque type.
"""
import os
import sys
import django
import random
from datetime import datetime, timedelta

# Configuration Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.users.models import UtilisateurPersonnalise
from apps.companies.models import Entreprise

User = UtilisateurPersonnalise

def create_additional_users():
    """Créer 5 utilisateurs supplémentaires de chaque type."""
    
    # Récupérer les entreprises existantes
    companies = list(Entreprise.objects.all())
    if not companies:
        print("❌ Aucune entreprise trouvée. Créez d'abord des entreprises.")
        return
    
    # Données pour les nouveaux utilisateurs
    admin_data = [
        {
            'username': 'admin1@platform.com',
            'email': 'admin1@platform.com',
            'first_name': 'Aminata',
            'last_name': 'Diop',
            'telephone': '+221 77 111 11 11',
            'type_utilisateur': 'admin',
            'points_experience': 6000,
            'niveau': 6,
        },
        {
            'username': 'admin2@platform.com',
            'email': 'admin2@platform.com',
            'first_name': 'Moussa',
            'last_name': 'Fall',
            'telephone': '+221 77 222 22 22',
            'type_utilisateur': 'admin',
            'points_experience': 5500,
            'niveau': 5,
        },
        {
            'username': 'admin3@platform.com',
            'email': 'admin3@platform.com',
            'first_name': 'Khadija',
            'last_name': 'Ndiaye',
            'telephone': '+221 77 333 33 33',
            'type_utilisateur': 'admin',
            'points_experience': 7000,
            'niveau': 7,
        },
        {
            'username': 'admin4@platform.com',
            'email': 'admin4@platform.com',
            'first_name': 'Ibrahima',
            'last_name': 'Sow',
            'telephone': '+221 77 444 44 44',
            'type_utilisateur': 'admin',
            'points_experience': 4800,
            'niveau': 4,
        },
        {
            'username': 'admin5@platform.com',
            'email': 'admin5@platform.com',
            'first_name': 'Aïcha',
            'last_name': 'Ba',
            'telephone': '+221 77 555 55 55',
            'type_utilisateur': 'admin',
            'points_experience': 6200,
            'niveau': 6,
        }
    ]

    entrepreneur_data = [
        {
            'username': 'entrepreneur1@business.sn',
            'email': 'entrepreneur1@business.sn',
            'first_name': 'Ousmane',
            'last_name': 'Cissé',
            'entreprise_id': companies[0].id,
            'telephone': '+221 77 666 66 66',
            'type_utilisateur': 'entrepreneur',
            'points_experience': 3200,
            'niveau': 3,
        },
        {
            'username': 'entrepreneur2@business.sn',
            'email': 'entrepreneur2@business.sn',
            'first_name': 'Fatou',
            'last_name': 'Diallo',
            'entreprise_id': companies[1].id if len(companies) > 1 else companies[0].id,
            'telephone': '+221 77 777 77 77',
            'type_utilisateur': 'entrepreneur',
            'points_experience': 2800,
            'niveau': 2,
        },
        {
            'username': 'entrepreneur3@business.sn',
            'email': 'entrepreneur3@business.sn',
            'first_name': 'Mamadou',
            'last_name': 'Samb',
            'entreprise_id': companies[2].id if len(companies) > 2 else companies[0].id,
            'telephone': '+221 77 888 88 88',
            'type_utilisateur': 'entrepreneur',
            'points_experience': 4500,
            'niveau': 4,
        },
        {
            'username': 'entrepreneur4@business.sn',
            'email': 'entrepreneur4@business.sn',
            'first_name': 'Aïssatou',
            'last_name': 'Sy',
            'entreprise_id': companies[3].id if len(companies) > 3 else companies[0].id,
            'telephone': '+221 77 999 99 99',
            'type_utilisateur': 'entrepreneur',
            'points_experience': 3800,
            'niveau': 3,
        },
        {
            'username': 'entrepreneur5@business.sn',
            'email': 'entrepreneur5@business.sn',
            'first_name': 'Cheikh',
            'last_name': 'Ndiaye',
            'entreprise_id': companies[4].id if len(companies) > 4 else companies[0].id,
            'telephone': '+221 77 000 11 11',
            'type_utilisateur': 'entrepreneur',
            'points_experience': 5200,
            'niveau': 5,
        }
    ]

    client_data = [
        {
            'username': 'client4@example.com',
            'email': 'client4@example.com',
            'first_name': 'Mariama',
            'last_name': 'Fall',
            'telephone': '+221 77 111 22 33',
            'type_utilisateur': 'client',
            'points_experience': 1200,
            'niveau': 1,
        },
        {
            'username': 'client5@example.com',
            'email': 'client5@example.com',
            'first_name': 'Samba',
            'last_name': 'Diop',
            'telephone': '+221 77 222 33 44',
            'type_utilisateur': 'client',
            'points_experience': 950,
            'niveau': 1,
        },
        {
            'username': 'client6@example.com',
            'email': 'client6@example.com',
            'first_name': 'Ndeye',
            'last_name': 'Sow',
            'telephone': '+221 77 333 44 55',
            'type_utilisateur': 'client',
            'points_experience': 1800,
            'niveau': 2,
        },
        {
            'username': 'client7@example.com',
            'email': 'client7@example.com',
            'first_name': 'Modou',
            'last_name': 'Ba',
            'telephone': '+221 77 444 55 66',
            'type_utilisateur': 'client',
            'points_experience': 2100,
            'niveau': 2,
        },
        {
            'username': 'client8@example.com',
            'email': 'client8@example.com',
            'first_name': 'Awa',
            'last_name': 'Ndiaye',
            'telephone': '+221 77 555 66 77',
            'type_utilisateur': 'client',
            'points_experience': 1500,
            'niveau': 1,
        }
    ]

    created_users = []

    # Créer les administrateurs
    print("\n👑 Création des administrateurs...")
    for user_data in admin_data:
        user, created = User.objects.get_or_create(
            username=user_data['username'],
            defaults=user_data
        )
        if created:
            user.set_password('admin123')
            user.is_staff = True
            user.is_superuser = True
            user.save()
            print(f"✅ Admin créé: {user.email} - {user.first_name} {user.last_name}")
            created_users.append(user)
        else:
            print(f"ℹ️ Admin existe déjà: {user.email}")

    # Créer les entrepreneurs
    print("\n💼 Création des entrepreneurs...")
    for user_data in entrepreneur_data:
        user, created = User.objects.get_or_create(
            username=user_data['username'],
            defaults=user_data
        )
        if created:
            user.set_password('password')
            user.save()
            print(f"✅ Entrepreneur créé: {user.email} - {user.first_name} {user.last_name}")
            created_users.append(user)
        else:
            print(f"ℹ️ Entrepreneur existe déjà: {user.email}")

    # Créer les clients
    print("\n🛍️ Création des clients...")
    for user_data in client_data:
        user, created = User.objects.get_or_create(
            username=user_data['username'],
            defaults=user_data
        )
        if created:
            user.set_password('password')
            user.save()
            print(f"✅ Client créé: {user.email} - {user.first_name} {user.last_name}")
            created_users.append(user)
        else:
            print(f"ℹ️ Client existe déjà: {user.email}")

    return created_users

def main():
    """Fonction principale."""
    print("🚀 Ajout d'utilisateurs supplémentaires...")
    print("=" * 50)
    
    try:
        created_users = create_additional_users()
        
        print("\n✅ Ajout d'utilisateurs terminé !")
        print(f"\n📊 Résumé:")
        print(f"   • Total d'utilisateurs créés: {len(created_users)}")
        print(f"   • Total d'utilisateurs dans la base: {User.objects.count()}")
        
        print("\n🔐 Comptes créés:")
        print("\n👑 Administrateurs (mot de passe: admin123):")
        for user in User.objects.filter(type_utilisateur='admin'):
            print(f"   • {user.email} - {user.first_name} {user.last_name}")
        
        print("\n💼 Entrepreneurs (mot de passe: password):")
        for user in User.objects.filter(type_utilisateur='entrepreneur'):
            print(f"   • {user.email} - {user.first_name} {user.last_name}")
        
        print("\n🛍️ Clients (mot de passe: password):")
        for user in User.objects.filter(type_utilisateur='client'):
            print(f"   • {user.email} - {user.first_name} {user.last_name}")
            
    except Exception as e:
        print(f"❌ Erreur lors de la création des utilisateurs: {e}")
        return False
    
    return True

if __name__ == '__main__':
    main()
