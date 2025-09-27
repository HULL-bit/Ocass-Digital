#!/usr/bin/env python
"""
Script pour tester la connexion frontend avec les bonnes informations.
"""
import os
import sys
import django
import requests
import json

# Configuration Django
sys.path.append('/home/suleimaan/Téléchargements/Mm/project/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

def test_frontend_login_scenarios():
    """Test des scénarios de connexion frontend."""
    print("🚀 Test des scénarios de connexion frontend...")
    
    # Scénarios de test avec les bonnes informations
    test_cases = [
        {
            'name': 'Entrepreneur - amadou@techsolutions.sn',
            'data': {
                'email': 'amadou@techsolutions.sn',
                'password': 'password',
                'type_utilisateur': 'entrepreneur'
            }
        },
        {
            'name': 'Client - client1@example.com',
            'data': {
                'email': 'client1@example.com',
                'password': 'password',
                'type_utilisateur': 'client'
            }
        },
        {
            'name': 'Admin - admin5@platform.com',
            'data': {
                'email': 'admin5@platform.com',
                'password': 'admin123',
                'type_utilisateur': 'admin'
            }
        }
    ]
    
    for test_case in test_cases:
        print(f"\n🔍 Test: {test_case['name']}")
        
        try:
            response = requests.post('http://localhost:8000/api/v1/auth/login/', json=test_case['data'])
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                print("✅ Connexion réussie")
                data = response.json()
                print(f"Token: {data.get('access', 'N/A')[:30]}...")
                print(f"User: {data.get('user', {}).get('email', 'N/A')}")
                print(f"Type: {data.get('user', {}).get('type_utilisateur', 'N/A')}")
                print(f"Entreprise: {data.get('user', {}).get('entreprise', 'N/A')}")
            else:
                print(f"❌ Erreur: {response.text}")
                
        except Exception as e:
            print(f"❌ Exception: {e}")

def create_test_user():
    """Créer un utilisateur de test pour le frontend."""
    print("\n🚀 Création d'un utilisateur de test...")
    
    timestamp = int(time.time())
    test_user_data = {
        'email': f'testuser{timestamp}@example.com',
        'first_name': 'Test',
        'last_name': 'User',
        'type_utilisateur': 'entrepreneur',
        'telephone': '+221701234567',
        'password': 'testpassword123',
        'confirm_password': 'testpassword123'
    }
    
    try:
        response = requests.post('http://localhost:8000/api/v1/auth/register/', json=test_user_data)
        print(f"Status inscription: {response.status_code}")
        
        if response.status_code == 201:
            print("✅ Utilisateur de test créé")
            data = response.json()
            print(f"Email: {test_user_data['email']}")
            print(f"Type: {test_user_data['type_utilisateur']}")
            print(f"Mot de passe: {test_user_data['password']}")
            
            # Tester la connexion immédiatement
            print("\n🔍 Test de connexion immédiate...")
            login_data = {
                'email': test_user_data['email'],
                'password': test_user_data['password'],
                'type_utilisateur': test_user_data['type_utilisateur']
            }
            
            login_response = requests.post('http://localhost:8000/api/v1/auth/login/', json=login_data)
            print(f"Status connexion: {login_response.status_code}")
            
            if login_response.status_code == 200:
                print("✅ Connexion immédiate réussie")
                login_data = login_response.json()
                print(f"Token: {login_data.get('access', 'N/A')[:30]}...")
            else:
                print(f"❌ Erreur connexion: {login_response.text}")
                
        else:
            print(f"❌ Erreur inscription: {response.text[:500]}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == '__main__':
    import time
    
    print("🚀 Test de connexion frontend avec informations correctes...")
    
    # Test 1: Connexion avec utilisateurs existants
    test_frontend_login_scenarios()
    
    # Test 2: Création et connexion d'un nouvel utilisateur
    create_test_user()
    
    print("\n✅ Tests terminés!")
    print("\n📋 Informations de connexion pour le frontend:")
    print("Entrepreneur: amadou@techsolutions.sn / password")
    print("Client: client1@example.com / password")
    print("Admin: admin5@platform.com / admin123")
