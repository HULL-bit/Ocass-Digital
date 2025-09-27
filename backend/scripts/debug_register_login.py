#!/usr/bin/env python
"""
Script de debug pour l'inscription et la connexion.
"""
import os
import sys
import django
import requests
import json
import time

# Configuration Django
sys.path.append('/home/suleimaan/Téléchargements/Mm/project/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model, authenticate
from apps.authentication.serializers import RegisterSerializer, LoginSerializer

User = get_user_model()

def test_register_and_login():
    """Test d'inscription puis de connexion."""
    print("🚀 Test d'inscription puis de connexion...")
    
    timestamp = int(time.time())
    email = f'entrepreneur{timestamp}@business.sn'
    
    # Test d'inscription via API
    register_data = {
        'email': email,
        'first_name': 'Test',
        'last_name': 'Entrepreneur',
        'type_utilisateur': 'entrepreneur',
        'telephone': '+221701234567',
        'password': 'testpassword123',
        'confirm_password': 'testpassword123'
    }
    
    print(f"📧 Inscription avec email: {email}")
    
    try:
        response = requests.post('http://localhost:8000/api/v1/auth/register/', json=register_data)
        print(f"Status inscription: {response.status_code}")
        if response.status_code == 201:
            print("✅ Inscription réussie")
            register_response = response.json()
            print(f"Token inscription: {register_response.get('access', 'N/A')[:20]}...")
        else:
            print(f"❌ Erreur inscription: {response.text[:500]}")
            return
    except Exception as e:
        print(f"❌ Erreur inscription: {e}")
        return
    
    # Vérifier l'utilisateur créé
    try:
        user = User.objects.get(email=email)
        print(f"✅ Utilisateur trouvé: {user.email}")
        print(f"Username: {user.username}")
        print(f"Type: {user.type_utilisateur}")
        print(f"Active: {user.is_active}")
        print(f"Entreprise: {user.entreprise_id}")
    except User.DoesNotExist:
        print("❌ Utilisateur non trouvé")
        return
    except Exception as e:
        print(f"❌ Erreur récupération utilisateur: {e}")
        return
    
    # Test d'authentification directe
    print("\n🔍 Test d'authentification directe...")
    try:
        auth_user = authenticate(username=email, password='testpassword123')
        if auth_user:
            print("✅ Authentification directe réussie")
        else:
            print("❌ Authentification directe échouée")
    except Exception as e:
        print(f"❌ Erreur authentification directe: {e}")
    
    # Test de connexion via API
    print("\n🔍 Test de connexion via API...")
    login_data = {
        'email': email,
        'password': 'testpassword123',
        'type_utilisateur': 'entrepreneur'
    }
    
    try:
        response = requests.post('http://localhost:8000/api/v1/auth/login/', json=login_data)
        print(f"Status connexion: {response.status_code}")
        if response.status_code == 200:
            print("✅ Connexion réussie")
            login_response = response.json()
            print(f"Token connexion: {login_response.get('access', 'N/A')[:20]}...")
            return login_response.get('access')
        else:
            print(f"❌ Erreur connexion: {response.text[:500]}")
    except Exception as e:
        print(f"❌ Erreur connexion: {e}")
    
    return None

def test_serializer_register_and_login():
    """Test du serializer d'inscription puis de connexion."""
    print("\n🚀 Test du serializer d'inscription puis de connexion...")
    
    timestamp = int(time.time())
    email = f'client{timestamp}@example.com'
    
    # Test d'inscription via serializer
    register_data = {
        'email': email,
        'first_name': 'Test',
        'last_name': 'Client',
        'type_utilisateur': 'client',
        'telephone': '+221701234568',
        'password': 'testpassword123',
        'confirm_password': 'testpassword123'
    }
    
    print(f"📧 Inscription serializer avec email: {email}")
    
    serializer = RegisterSerializer(data=register_data)
    if serializer.is_valid():
        try:
            user = serializer.save()
            print(f"✅ Utilisateur créé via serializer: {user.email}")
            print(f"Username: {user.username}")
            print(f"Type: {user.type_utilisateur}")
            print(f"Active: {user.is_active}")
        except Exception as e:
            print(f"❌ Erreur création via serializer: {e}")
            return
    else:
        print(f"❌ Erreurs serializer inscription: {serializer.errors}")
        return
    
    # Test de connexion via serializer
    print("\n🔍 Test de connexion via serializer...")
    login_data = {
        'email': email,
        'password': 'testpassword123',
        'type_utilisateur': 'client'
    }
    
    serializer = LoginSerializer(data=login_data)
    if serializer.is_valid():
        print("✅ Serializer de connexion valide")
        user = serializer.validated_data['user']
        print(f"Utilisateur validé: {user.email}")
    else:
        print(f"❌ Erreurs serializer connexion: {serializer.errors}")

if __name__ == '__main__':
    print("🚀 Debug complet inscription et connexion...")
    
    # Test 1: API inscription puis connexion
    token = test_register_and_login()
    
    # Test 2: Serializer inscription puis connexion
    test_serializer_register_and_login()
    
    print("\n✅ Tests terminés!")
