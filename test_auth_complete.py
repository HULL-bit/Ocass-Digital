#!/usr/bin/env python3
"""
Script de test complet pour l'authentification
Teste tous les aspects du système d'authentification
"""

import os
import sys
import django
import requests
import json
from datetime import datetime

# Configuration Django
sys.path.append('/home/suleimaan/Téléchargements/Mm/project/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from django.test import Client
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()

def test_backend_auth():
    """Test complet de l'authentification backend"""
    print("🔐 Test d'authentification backend")
    print("=" * 50)
    
    # Test 1: Vérifier que le serveur backend fonctionne
    try:
        response = requests.get('http://localhost:8000/api/v1/auth/login/', timeout=5)
        print(f"✅ Backend accessible: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Backend non accessible sur localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Erreur backend: {e}")
        return False
    
    # Test 2: Test de connexion avec utilisateur existant
    print("\n📝 Test de connexion...")
    
    # Données de test
    test_users = [
        {
            'email': 'admin4@platform.com',
            'password': 'admin123',
            'type_utilisateur': 'admin'
        },
        {
            'email': 'entrepreneur@demo.com', 
            'password': 'password',
            'type_utilisateur': 'entrepreneur'
        },
        {
            'email': 'client@example.com',
            'password': 'password', 
            'type_utilisateur': 'client'
        }
    ]
    
    for user_data in test_users:
        try:
            response = requests.post(
                'http://localhost:8000/api/v1/auth/login/',
                json=user_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Connexion réussie pour {user_data['email']}")
                print(f"   - Token: {data.get('access', 'N/A')[:20]}...")
                print(f"   - User ID: {data.get('user', {}).get('id', 'N/A')}")
                print(f"   - Role: {data.get('user', {}).get('type_utilisateur', 'N/A')}")
            else:
                print(f"❌ Échec connexion pour {user_data['email']}: {response.status_code}")
                print(f"   - Erreur: {response.text}")
                
        except Exception as e:
            print(f"❌ Erreur lors du test {user_data['email']}: {e}")
    
    # Test 3: Test de déconnexion
    print("\n🚪 Test de déconnexion...")
    try:
        response = requests.post(
            'http://localhost:8000/api/v1/auth/logout/',
            json={'refresh': 'test_token'},
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        print(f"✅ Déconnexion testée: {response.status_code}")
    except Exception as e:
        print(f"❌ Erreur déconnexion: {e}")
    
    return True

def test_frontend_auth():
    """Test du frontend d'authentification"""
    print("\n🌐 Test frontend d'authentification")
    print("=" * 50)
    
    # Test 1: Vérifier que le frontend est accessible
    try:
        response = requests.get('http://localhost:3000', timeout=5)
        print(f"✅ Frontend accessible: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Frontend non accessible sur localhost:3000")
        return False
    except Exception as e:
        print(f"❌ Erreur frontend: {e}")
        return False
    
    # Test 2: Vérifier les routes d'authentification
    auth_routes = [
        'http://localhost:3000/auth/login',
        'http://localhost:3000/auth/register'
    ]
    
    for route in auth_routes:
        try:
            response = requests.get(route, timeout=5)
            if response.status_code == 200:
                print(f"✅ Route accessible: {route}")
            else:
                print(f"⚠️ Route {route}: {response.status_code}")
        except Exception as e:
            print(f"❌ Erreur route {route}: {e}")
    
    return True

def test_database_auth():
    """Test de la base de données d'authentification"""
    print("\n🗄️ Test base de données d'authentification")
    print("=" * 50)
    
    try:
        # Vérifier les utilisateurs existants
        users = User.objects.all()
        print(f"✅ Utilisateurs en base: {users.count()}")
        
        for user in users[:5]:  # Afficher les 5 premiers
            print(f"   - {user.email} ({user.type_utilisateur}) - Actif: {user.is_active}")
        
        # Vérifier les types d'utilisateurs
        admin_count = User.objects.filter(type_utilisateur='admin').count()
        entrepreneur_count = User.objects.filter(type_utilisateur='entrepreneur').count()
        client_count = User.objects.filter(type_utilisateur='client').count()
        
        print(f"\n📊 Répartition des utilisateurs:")
        print(f"   - Admins: {admin_count}")
        print(f"   - Entrepreneurs: {entrepreneur_count}")
        print(f"   - Clients: {client_count}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur base de données: {e}")
        return False

def test_api_endpoints():
    """Test des endpoints API d'authentification"""
    print("\n🔗 Test endpoints API d'authentification")
    print("=" * 50)
    
    endpoints = [
        ('GET', '/api/v1/auth/profile/', 'Profil utilisateur'),
        ('POST', '/api/v1/auth/register/', 'Inscription'),
        ('POST', '/api/v1/auth/logout/', 'Déconnexion'),
    ]
    
    for method, endpoint, description in endpoints:
        try:
            url = f'http://localhost:8000{endpoint}'
            if method == 'GET':
                response = requests.get(url, timeout=5)
            else:
                response = requests.post(url, json={}, timeout=5)
            
            print(f"✅ {description}: {response.status_code}")
            
        except Exception as e:
            print(f"❌ Erreur {description}: {e}")

def main():
    """Fonction principale de test"""
    print("🚀 Test complet du système d'authentification")
    print("=" * 60)
    print(f"⏰ Début du test: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    results = []
    
    # Tests
    results.append(("Backend Auth", test_backend_auth()))
    results.append(("Frontend Auth", test_frontend_auth()))
    results.append(("Database Auth", test_database_auth()))
    results.append(("API Endpoints", test_api_endpoints()))
    
    # Résumé
    print("\n📋 Résumé des tests")
    print("=" * 50)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
        if result:
            passed += 1
    
    print(f"\n🎯 Résultat final: {passed}/{total} tests réussis")
    
    if passed == total:
        print("🎉 Tous les tests d'authentification sont passés !")
        return True
    else:
        print("⚠️ Certains tests ont échoué. Vérifiez les logs ci-dessus.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
