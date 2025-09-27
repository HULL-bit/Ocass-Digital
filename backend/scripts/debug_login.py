#!/usr/bin/env python
"""
Script de debug pour la connexion.
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
from apps.authentication.serializers import LoginSerializer

User = get_user_model()

def test_direct_authentication():
    """Test d'authentification directe."""
    print("🔍 Test d'authentification directe...")
    
    timestamp = int(time.time())
    email = f'entrepreneur{timestamp}@business.sn'
    
    # Créer un utilisateur directement
    try:
        user = User.objects.create_user(
            username=email,
            email=email,
            first_name='Test',
            last_name='Entrepreneur',
            type_utilisateur='entrepreneur',
            telephone='+221701234567',
            password='testpassword123'
        )
        print(f"✅ Utilisateur créé: {user.email}")
        print(f"Username: {user.username}")
        print(f"Email: {user.email}")
        print(f"Type: {user.type_utilisateur}")
        print(f"Active: {user.is_active}")
    except Exception as e:
        print(f"❌ Erreur création utilisateur: {e}")
        return None
    
    # Test d'authentification directe
    try:
        auth_user = authenticate(username=email, password='testpassword123')
        if auth_user:
            print("✅ Authentification directe réussie")
            return auth_user
        else:
            print("❌ Authentification directe échouée")
            return None
    except Exception as e:
        print(f"❌ Erreur authentification: {e}")
        return None

def test_login_serializer():
    """Test du serializer de login."""
    print("\n🔍 Test du serializer de login...")
    
    timestamp = int(time.time())
    email = f'client{timestamp}@example.com'
    
    # Créer un utilisateur directement
    try:
        user = User.objects.create_user(
            username=email,
            email=email,
            first_name='Test',
            last_name='Client',
            type_utilisateur='client',
            telephone='+221701234568',
            password='testpassword123'
        )
        print(f"✅ Utilisateur créé: {user.email}")
    except Exception as e:
        print(f"❌ Erreur création utilisateur: {e}")
        return None
    
    # Test du serializer
    data = {
        'email': email,
        'password': 'testpassword123',
        'type_utilisateur': 'client'
    }
    
    serializer = LoginSerializer(data=data)
    if serializer.is_valid():
        print("✅ Serializer de login valide")
        user = serializer.validated_data['user']
        print(f"Utilisateur validé: {user.email}")
        return user
    else:
        print(f"❌ Erreurs serializer: {serializer.errors}")
        return None

def test_api_login():
    """Test de l'API de login."""
    print("\n🔍 Test de l'API de login...")
    
    timestamp = int(time.time())
    email = f'admin{timestamp}@platform.com'
    
    # Créer un utilisateur admin directement
    try:
        user = User.objects.create_user(
            username=email,
            email=email,
            first_name='Test',
            last_name='Admin',
            type_utilisateur='admin',
            telephone='+221701234569',
            password='testpassword123'
        )
        print(f"✅ Utilisateur admin créé: {user.email}")
    except Exception as e:
        print(f"❌ Erreur création admin: {e}")
        return None
    
    # Test API
    login_data = {
        'email': email,
        'password': 'testpassword123',
        'type_utilisateur': 'admin'
    }
    
    try:
        response = requests.post('http://localhost:8000/api/v1/auth/login/', json=login_data)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ API login réussie")
            return response.json().get('access')
        else:
            print(f"❌ Erreur API login: {response.text[:500]}")
    except Exception as e:
        print(f"❌ Erreur API: {e}")
    
    return None

if __name__ == '__main__':
    print("🚀 Debug de la connexion...")
    
    # Test 1: Authentification directe
    user1 = test_direct_authentication()
    
    # Test 2: Serializer de login
    user2 = test_login_serializer()
    
    # Test 3: API de login
    token = test_api_login()
    
    print("\n✅ Tests terminés!")
