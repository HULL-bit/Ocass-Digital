#!/usr/bin/env python
"""
Script de test pour la connexion frontend.
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

def test_login_scenarios():
    """Test de différents scénarios de connexion."""
    print("🚀 Test des scénarios de connexion...")
    
    # Scénarios de test
    test_cases = [
        {
            'name': 'Entrepreneur existant',
            'data': {
                'email': 'amadou@techsolutions.sn',
                'password': 'password',
                'type_utilisateur': 'entrepreneur'
            }
        },
        {
            'name': 'Client existant',
            'data': {
                'email': 'client1@example.com',
                'password': 'password',
                'type_utilisateur': 'client'
            }
        },
        {
            'name': 'Admin existant',
            'data': {
                'email': 'admin5@platform.com',
                'password': 'password',
                'type_utilisateur': 'admin'
            }
        },
        {
            'name': 'Mauvais rôle',
            'data': {
                'email': 'amadou@techsolutions.sn',
                'password': 'password',
                'type_utilisateur': 'client'  # Mauvais rôle
            }
        },
        {
            'name': 'Mauvais mot de passe',
            'data': {
                'email': 'amadou@techsolutions.sn',
                'password': 'wrongpassword',
                'type_utilisateur': 'entrepreneur'
            }
        }
    ]
    
    for test_case in test_cases:
        print(f"\n🔍 Test: {test_case['name']}")
        print(f"Données: {test_case['data']}")
        
        try:
            response = requests.post('http://localhost:8000/api/v1/auth/login/', json=test_case['data'])
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                print("✅ Connexion réussie")
                data = response.json()
                print(f"Token: {data.get('access', 'N/A')[:20]}...")
                print(f"User: {data.get('user', {}).get('email', 'N/A')}")
            else:
                print(f"❌ Erreur: {response.text[:500]}")
                
        except Exception as e:
            print(f"❌ Exception: {e}")

def test_login_with_different_passwords():
    """Test avec différents mots de passe pour les utilisateurs existants."""
    print("\n🚀 Test avec différents mots de passe...")
    
    users = [
        {'email': 'amadou@techsolutions.sn', 'type': 'entrepreneur'},
        {'email': 'client1@example.com', 'type': 'client'},
        {'email': 'admin5@platform.com', 'type': 'admin'}
    ]
    
    passwords = ['password', 'admin123', 'test123', '123456', 'admin']
    
    for user in users:
        print(f"\n👤 Test utilisateur: {user['email']}")
        for password in passwords:
            try:
                response = requests.post('http://localhost:8000/api/v1/auth/login/', json={
                    'email': user['email'],
                    'password': password,
                    'type_utilisateur': user['type']
                })
                
                if response.status_code == 200:
                    print(f"✅ Mot de passe correct: {password}")
                    break
                else:
                    print(f"❌ Mot de passe incorrect: {password}")
                    
            except Exception as e:
                print(f"❌ Exception avec {password}: {e}")

if __name__ == '__main__':
    print("🚀 Test de connexion frontend...")
    
    # Test 1: Scénarios de connexion
    test_login_scenarios()
    
    # Test 2: Mots de passe
    test_login_with_different_passwords()
    
    print("\n✅ Tests terminés!")
