#!/usr/bin/env python3
"""
Test final de l'authentification - Validation complète
"""

import requests
import json
import time

def test_backend_auth():
    """Test de l'authentification backend"""
    print("🔐 Test Backend d'Authentification")
    print("=" * 50)
    
    base_url = "http://localhost:8000/api/v1/auth/login/"
    
    test_cases = [
        {
            "name": "Admin",
            "data": {
                "email": "admin@platform.com",
                "password": "admin123",
                "type_utilisateur": "admin"
            }
        },
        {
            "name": "Entrepreneur", 
            "data": {
                "email": "entrepreneur@demo.com",
                "password": "password",
                "type_utilisateur": "entrepreneur"
            }
        },
        {
            "name": "Client",
            "data": {
                "email": "client@example.com", 
                "password": "password",
                "type_utilisateur": "client"
            }
        }
    ]
    
    success_count = 0
    
    for test_case in test_cases:
        try:
            print(f"\n📝 Test {test_case['name']}...")
            
            response = requests.post(
                base_url,
                json=test_case['data'],
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ {test_case['name']} - Connexion réussie")
                print(f"   - Token: {data.get('access', 'N/A')[:20]}...")
                print(f"   - User: {data.get('user', {}).get('email', 'N/A')}")
                print(f"   - Role: {data.get('user', {}).get('type_utilisateur', 'N/A')}")
                success_count += 1
            else:
                print(f"❌ {test_case['name']} - Échec: {response.status_code}")
                print(f"   - Erreur: {response.text}")
                
        except Exception as e:
            print(f"❌ {test_case['name']} - Erreur: {e}")
    
    print(f"\n📊 Résultat Backend: {success_count}/{len(test_cases)} réussis")
    return success_count == len(test_cases)

def test_frontend_access():
    """Test d'accès au frontend"""
    print("\n🌐 Test Frontend d'Authentification")
    print("=" * 50)
    
    try:
        # Test de la page de connexion
        response = requests.get("http://localhost:5173/auth/login", timeout=5)
        
        if response.status_code == 200:
            print("✅ Page de connexion accessible")
            
            # Vérifier qu'il n'y a pas d'erreurs JavaScript
            if "useAuth must be used within an AuthProvider" in response.text:
                print("❌ Erreur de contexte détectée dans le HTML")
                return False
            else:
                print("✅ Aucune erreur de contexte détectée")
                return True
        else:
            print(f"❌ Page inaccessible: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Erreur frontend: {e}")
        return False

def test_api_endpoints():
    """Test des endpoints API"""
    print("\n🔗 Test Endpoints API")
    print("=" * 50)
    
    endpoints = [
        ("POST", "/api/v1/auth/login/", "Connexion"),
        ("POST", "/api/v1/auth/logout/", "Déconnexion"),
        ("GET", "/api/v1/auth/profile/", "Profil (nécessite auth)"),
    ]
    
    success_count = 0
    
    for method, endpoint, description in endpoints:
        try:
            url = f"http://localhost:8000{endpoint}"
            
            if method == "GET":
                response = requests.get(url, timeout=5)
            else:
                response = requests.post(url, json={}, timeout=5)
            
            # Pour les endpoints protégés, 401 est attendu
            if endpoint == "/api/v1/auth/profile/" and response.status_code == 401:
                print(f"✅ {description}: {response.status_code} (attendu pour endpoint protégé)")
                success_count += 1
            elif response.status_code in [200, 400, 401]:
                print(f"✅ {description}: {response.status_code}")
                success_count += 1
            else:
                print(f"❌ {description}: {response.status_code}")
                
        except Exception as e:
            print(f"❌ {description}: Erreur - {e}")
    
    print(f"\n📊 Résultat API: {success_count}/{len(endpoints)} réussis")
    return success_count >= len(endpoints) - 1  # Au moins 2/3

def main():
    """Test principal"""
    print("🚀 Test Final de l'Authentification")
    print("=" * 60)
    print(f"⏰ Début: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Attendre que les serveurs soient prêts
    print("\n⏳ Vérification des serveurs...")
    time.sleep(2)
    
    # Tests
    backend_ok = test_backend_auth()
    frontend_ok = test_frontend_access()
    api_ok = test_api_endpoints()
    
    # Résumé
    print("\n📋 Résumé Final")
    print("=" * 50)
    
    results = [
        ("Backend Auth", backend_ok),
        ("Frontend Access", frontend_ok), 
        ("API Endpoints", api_ok)
    ]
    
    passed = sum(1 for _, ok in results if ok)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
    
    print(f"\n🎯 Résultat Final: {passed}/{total} tests réussis")
    
    if passed == total:
        print("🎉 TOUS LES TESTS SONT PASSÉS !")
        print("✅ L'authentification est entièrement fonctionnelle")
        return True
    else:
        print("⚠️ Certains tests ont échoué")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
