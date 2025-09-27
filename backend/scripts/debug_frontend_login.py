#!/usr/bin/env python3
"""
Script pour déboguer le problème de connexion frontend
"""

import os
import sys
import django
import json
import requests
from django.conf import settings

# Configuration Django
sys.path.append('/home/suleimaan/Téléchargements/Mm/project/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.authentication.serializers import LoginSerializer
from apps.users.models import UtilisateurPersonnalise

def test_backend_login():
    """Test de connexion côté backend"""
    print("=== TEST BACKEND LOGIN ===")
    
    # Test avec les identifiants admin
    email = "admin5@platform.com"
    password = "admin123"
    type_utilisateur = "admin"
    
    print(f"Tentative de connexion avec:")
    print(f"  Email: {email}")
    print(f"  Password: {password}")
    print(f"  Type utilisateur: {type_utilisateur}")
    
    # Vérifier si l'utilisateur existe
    try:
        user = UtilisateurPersonnalise.objects.get(email=email)
        print(f"✓ Utilisateur trouvé: {user.email}")
        print(f"  - Type: {user.type_utilisateur}")
        print(f"  - Actif: {user.is_active}")
        print(f"  - Staff: {user.is_staff}")
        print(f"  - Superuser: {user.is_superuser}")
    except UtilisateurPersonnalise.DoesNotExist:
        print("✗ Utilisateur non trouvé!")
        return
    
    # Test avec le serializer
    login_data = {
        'email': email,
        'password': password,
        'type_utilisateur': type_utilisateur
    }
    
    print(f"\nTest avec LoginSerializer:")
    print(f"Données: {login_data}")
    
    serializer = LoginSerializer(data=login_data)
    if serializer.is_valid():
        print("✓ Serializer valide")
        try:
            user = serializer.authenticate()
            if user:
                print(f"✓ Authentification réussie: {user.email}")
            else:
                print("✗ Authentification échouée")
        except Exception as e:
            print(f"✗ Erreur d'authentification: {e}")
    else:
        print(f"✗ Serializer invalide: {serializer.errors}")

def test_api_endpoint():
    """Test de l'endpoint API"""
    print("\n=== TEST API ENDPOINT ===")
    
    url = "http://localhost:8000/api/v1/auth/login/"
    data = {
        "email": "admin5@platform.com",
        "password": "admin123",
        "type_utilisateur": "admin"
    }
    
    print(f"URL: {url}")
    print(f"Données: {json.dumps(data, indent=2)}")
    
    try:
        response = requests.post(url, json=data, headers={
            'Content-Type': 'application/json'
        })
        
        print(f"Status: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        try:
            response_data = response.json()
            print(f"Response: {json.dumps(response_data, indent=2)}")
        except:
            print(f"Response text: {response.text}")
            
    except Exception as e:
        print(f"Erreur: {e}")

def test_cors():
    """Test CORS"""
    print("\n=== TEST CORS ===")
    
    url = "http://localhost:8000/api/v1/auth/login/"
    data = {
        "email": "admin5@platform.com",
        "password": "admin123",
        "type_utilisateur": "admin"
    }
    
    headers = {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
    }
    
    print(f"Test CORS avec Origin: http://localhost:5173")
    
    try:
        response = requests.post(url, json=data, headers=headers)
        print(f"Status: {response.status_code}")
        print(f"CORS Headers:")
        for header, value in response.headers.items():
            if 'access-control' in header.lower():
                print(f"  {header}: {value}")
                
    except Exception as e:
        print(f"Erreur: {e}")

if __name__ == "__main__":
    test_backend_login()
    test_api_endpoint()
    test_cors()

