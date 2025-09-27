#!/usr/bin/env python3
"""
Script pour simuler exactement ce que fait le frontend
"""

import requests
import json

def test_frontend_simulation():
    """Simulation exacte du frontend"""
    print("=== SIMULATION FRONTEND ===")
    
    url = "http://localhost:8000/api/v1/auth/login/"
    
    # Exactement comme le frontend
    login_data = {
        "email": "admin5@platform.com",
        "password": "admin123", 
        "type_utilisateur": "admin"
    }
    
    print(f"URL: {url}")
    print(f"Données JSON: {json.dumps(login_data)}")
    
    # Headers exacts comme le frontend
    headers = {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173',
        'Referer': 'http://localhost:5173/',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
    }
    
    print(f"Headers: {json.dumps(headers, indent=2)}")
    
    try:
        response = requests.post(url, json=login_data, headers=headers)
        
        print(f"\nStatus: {response.status_code}")
        print(f"Headers de réponse:")
        for header, value in response.headers.items():
            print(f"  {header}: {value}")
        
        print(f"\nContenu de la réponse:")
        try:
            response_data = response.json()
            print(json.dumps(response_data, indent=2, ensure_ascii=False))
        except:
            print(f"Texte brut: {response.text}")
            
    except Exception as e:
        print(f"Erreur: {e}")

def test_with_different_content_types():
    """Test avec différents Content-Type"""
    print("\n=== TEST DIFFÉRENTS CONTENT-TYPE ===")
    
    url = "http://localhost:8000/api/v1/auth/login/"
    login_data = {
        "email": "admin5@platform.com",
        "password": "admin123",
        "type_utilisateur": "admin"
    }
    
    # Test 1: Content-Type: application/json
    print("1. Content-Type: application/json")
    try:
        response = requests.post(url, json=login_data, headers={'Content-Type': 'application/json'})
        print(f"   Status: {response.status_code}")
    except Exception as e:
        print(f"   Erreur: {e}")
    
    # Test 2: Content-Type: application/x-www-form-urlencoded
    print("2. Content-Type: application/x-www-form-urlencoded")
    try:
        response = requests.post(url, data=login_data, headers={'Content-Type': 'application/x-www-form-urlencoded'})
        print(f"   Status: {response.status_code}")
    except Exception as e:
        print(f"   Erreur: {e}")
    
    # Test 3: Sans Content-Type
    print("3. Sans Content-Type")
    try:
        response = requests.post(url, json=login_data)
        print(f"   Status: {response.status_code}")
    except Exception as e:
        print(f"   Erreur: {e}")

if __name__ == "__main__":
    test_frontend_simulation()
    test_with_different_content_types()

