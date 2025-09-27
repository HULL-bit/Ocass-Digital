#!/usr/bin/env python
"""
Script de debug pour l'inscription.
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

from django.contrib.auth import get_user_model
from apps.authentication.serializers import RegisterSerializer

User = get_user_model()

def test_register_serializer():
    """Test du serializer d'inscription."""
    print("🔍 Test du serializer d'inscription...")
    
    # Données de test
    data = {
        'email': 'test@example.com',
        'first_name': 'Test',
        'last_name': 'User',
        'type_utilisateur': 'client',
        'telephone': '+221701234567',
        'password': 'testpassword123',
        'confirm_password': 'testpassword123'
    }
    
    serializer = RegisterSerializer(data=data)
    
    if serializer.is_valid():
        print("✅ Serializer valide")
        try:
            user = serializer.save()
            print(f"✅ Utilisateur créé: {user.email}")
            return user
        except Exception as e:
            print(f"❌ Erreur lors de la création: {e}")
            return None
    else:
        print(f"❌ Erreurs de validation: {serializer.errors}")
        return None

def test_direct_user_creation():
    """Test de création directe d'utilisateur."""
    print("\n🔍 Test de création directe d'utilisateur...")
    
    try:
        # Vérifier si l'utilisateur existe déjà
        existing_user = User.objects.filter(email='test2@example.com').first()
        if existing_user:
            print("⚠️ Utilisateur existe déjà, suppression...")
            existing_user.delete()
        
        user = User.objects.create_user(
            username='test2@example.com',
            email='test2@example.com',
            first_name='Test2',
            last_name='User2',
            type_utilisateur='client',
            telephone='+221701234568',
            password='testpassword123'
        )
        print(f"✅ Utilisateur créé directement: {user.email}")
        return user
    except Exception as e:
        print(f"❌ Erreur lors de la création directe: {e}")
        return None

def test_api_register():
    """Test de l'API d'inscription."""
    print("\n🔍 Test de l'API d'inscription...")
    
    # D'abord se connecter pour obtenir un token
    login_data = {
        'email': 'admin@commercial-platform.com',
        'password': 'admin123',
        'type_utilisateur': 'admin'
    }
    
    try:
        response = requests.post('http://localhost:8000/api/v1/auth/login/', json=login_data)
        if response.status_code == 200:
            token = response.json().get('access')
            print("✅ Connexion réussie")
        else:
            print(f"❌ Erreur de connexion: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Erreur de connexion: {e}")
        return
    
    # Test d'inscription
    register_data = {
        'email': 'test3@example.com',
        'first_name': 'Test3',
        'last_name': 'User3',
        'type_utilisateur': 'client',
        'telephone': '+221701234569',
        'password': 'testpassword123',
        'confirm_password': 'testpassword123'
    }
    
    try:
        response = requests.post('http://localhost:8000/api/v1/auth/register/', json=register_data)
        print(f"Status: {response.status_code}")
        if response.status_code == 201:
            print("✅ Inscription réussie via API")
        else:
            print(f"❌ Erreur d'inscription: {response.text[:500]}")
    except Exception as e:
        print(f"❌ Erreur API: {e}")

if __name__ == '__main__':
    print("🚀 Debug de l'inscription...")
    
    # Test 1: Serializer
    user1 = test_register_serializer()
    
    # Test 2: Création directe
    user2 = test_direct_user_creation()
    
    # Test 3: API
    test_api_register()
    
    print("\n✅ Tests terminés!")
