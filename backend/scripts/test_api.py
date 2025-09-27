#!/usr/bin/env python
"""
Script pour tester l'API et corriger les problèmes.
"""
import os
import sys
import django
import requests
import json

# Configuration Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from apps.products.models import Produit, Categorie, Marque

User = get_user_model()

def test_login():
    """Tester la connexion."""
    print("🔐 Test de connexion...")
    
    url = "http://localhost:8000/api/v1/auth/login/"
    data = {
        "email": "admin4@platform.com",
        "password": "admin123",
        "type_utilisateur": "admin"
    }
    
    try:
        response = requests.post(url, json=data)
        if response.status_code == 200:
            result = response.json()
            print("✅ Connexion réussie")
            return result.get('access')
        else:
            print(f"❌ Erreur de connexion: {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return None

def test_create_user(token):
    """Tester la création d'utilisateur."""
    print("\n👥 Test de création d'utilisateur...")
    
    url = "http://localhost:8000/api/v1/users/users/"
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "username": "testuser3@example.com",
        "email": "testuser3@example.com",
        "first_name": "Test",
        "last_name": "User",
        "type_utilisateur": "client",
        "telephone": "771234567",
        "password": "password123"
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        if response.status_code == 201:
            print("✅ Utilisateur créé avec succès")
            return True
        else:
            print(f"❌ Erreur de création: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_create_category(token):
    """Tester la création de catégorie."""
    print("\n📂 Test de création de catégorie...")
    
    url = "http://localhost:8000/api/v1/products/categories/"
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "nom": "Test Category 2",
        "description": "Catégorie de test 2",
        "slug": "test-category-2",
        "icone": "test",
        "couleur": "#00FF00"
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        if response.status_code == 201:
            result = response.json()
            print("✅ Catégorie créée avec succès")
            return result.get('id')
        else:
            print(f"❌ Erreur de création: {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return None

def test_create_brand(token):
    """Tester la création de marque."""
    print("\n🏷️ Test de création de marque...")
    
    url = "http://localhost:8000/api/v1/products/marques/"
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "nom": "Test Brand 2",
        "pays_origine": "Sénégal"
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        if response.status_code == 201:
            result = response.json()
            print("✅ Marque créée avec succès")
            return result.get('id')
        else:
            print(f"❌ Erreur de création: {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return None

def test_create_product(token, category_id, brand_id):
    """Tester la création de produit."""
    print("\n📦 Test de création de produit...")
    
    url = "http://localhost:8000/api/v1/products/products/"
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "nom": "Produit Test 2",
        "description_courte": "Description courte",
        "categorie": category_id,
        "marque": brand_id,
        "sku": "TEST-002",
        "code_barre": "1234567890128",
        "prix_achat": 1000,
        "prix_vente": 1500,
        "tva_taux": 18.0,
        "unite_mesure": "piece",
        "stock_minimum": 5,
        "stock_maximum": 100,
        "slug": "produit-test-2"
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        if response.status_code == 201:
            print("✅ Produit créé avec succès")
            return True
        else:
            print(f"❌ Erreur de création: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def main():
    """Fonction principale."""
    print("🚀 Test de l'API...")
    
    # 1. Test de connexion
    token = test_login()
    if not token:
        print("❌ Impossible de continuer sans token")
        return
    
    # 2. Test de création d'utilisateur
    test_create_user(token)
    
    # 3. Test de création de catégorie
    category_id = test_create_category(token)
    
    # 4. Test de création de marque
    brand_id = test_create_brand(token)
    
    # 5. Test de création de produit
    if category_id and brand_id:
        test_create_product(token, category_id, brand_id)
    
    print("\n✅ Tests terminés !")

if __name__ == '__main__':
    main()
