#!/usr/bin/env python
"""
Script pour tester la connexion frontend-backend.
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

def test_cors_headers():
    """Test des en-têtes CORS."""
    print("🚀 Test des en-têtes CORS...")
    
    # Test avec les en-têtes du navigateur
    headers = {
        'Origin': 'http://localhost:5173',
        'Content-Type': 'application/json',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
    }
    
    try:
        # Test OPTIONS (preflight)
        response = requests.options('http://localhost:8000/api/v1/auth/login/', headers=headers)
        print(f"OPTIONS Status: {response.status_code}")
        print(f"CORS Headers: {dict(response.headers)}")
        
        # Test POST
        login_data = {
            'email': 'admin5@platform.com',
            'password': 'admin123',
            'type_utilisateur': 'admin'
        }
        
        response = requests.post('http://localhost:8000/api/v1/auth/login/', 
                               json=login_data, 
                               headers={'Origin': 'http://localhost:5173'})
        print(f"POST Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ Connexion réussie avec en-têtes CORS")
        else:
            print(f"❌ Erreur: {response.text[:200]}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

def test_different_origins():
    """Test avec différentes origines."""
    print("\n🚀 Test avec différentes origines...")
    
    origins = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ]
    
    login_data = {
        'email': 'admin5@platform.com',
        'password': 'admin123',
        'type_utilisateur': 'admin'
    }
    
    for origin in origins:
        print(f"\n🔍 Test avec origine: {origin}")
        try:
            response = requests.post('http://localhost:8000/api/v1/auth/login/', 
                                   json=login_data, 
                                   headers={'Origin': origin})
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                print("✅ Connexion réussie")
            else:
                print(f"❌ Erreur: {response.text[:100]}")
                
        except Exception as e:
            print(f"❌ Exception: {e}")

def test_api_endpoints():
    """Test des différents endpoints de l'API."""
    print("\n🚀 Test des endpoints API...")
    
    endpoints = [
        '/api/v1/auth/login/',
        '/api/v1/auth/register/',
        '/api/v1/products/products/',
        '/api/v1/products/categories/',
        '/api/v1/products/marques/'
    ]
    
    for endpoint in endpoints:
        print(f"\n🔍 Test endpoint: {endpoint}")
        try:
            response = requests.get(f'http://localhost:8000{endpoint}')
            print(f"Status: {response.status_code}")
            
            if response.status_code in [200, 401, 405]:  # 401 = non authentifié, 405 = méthode non autorisée
                print("✅ Endpoint accessible")
            else:
                print(f"❌ Erreur: {response.text[:100]}")
                
        except Exception as e:
            print(f"❌ Exception: {e}")

def test_frontend_simulation():
    """Simulation d'une requête frontend."""
    print("\n🚀 Simulation requête frontend...")
    
    # Simuler exactement ce que fait le frontend
    url = 'http://localhost:8000/api/v1/auth/login/'
    headers = {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
    }
    
    login_data = {
        'email': 'admin5@platform.com',
        'password': 'admin123',
        'type_utilisateur': 'admin'
    }
    
    try:
        print(f"URL: {url}")
        print(f"Headers: {headers}")
        print(f"Data: {login_data}")
        
        response = requests.post(url, json=login_data, headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ Simulation frontend réussie")
            data = response.json()
            print(f"Token: {data.get('access', 'N/A')[:30]}...")
        else:
            print(f"❌ Erreur: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == '__main__':
    print("🚀 Test de connexion frontend-backend...")
    
    # Test 1: En-têtes CORS
    test_cors_headers()
    
    # Test 2: Différentes origines
    test_different_origins()
    
    # Test 3: Endpoints API
    test_api_endpoints()
    
    # Test 4: Simulation frontend
    test_frontend_simulation()
    
    print("\n✅ Tests terminés!")
