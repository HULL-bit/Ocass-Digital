#!/usr/bin/env python
"""
Script pour tester toutes les corrections appliquées.
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
            return None
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return None

def test_register_entrepreneur():
    """Tester l'inscription d'un entrepreneur."""
    print("\n💼 Test d'inscription entrepreneur...")
    
    url = "http://localhost:8000/api/v1/auth/register/"
    data = {
        "email": "newentrepreneur@example.com",
        "first_name": "New",
        "last_name": "Entrepreneur",
        "type_utilisateur": "entrepreneur",
        "telephone": "771234569",
        "password": "password123",
        "confirm_password": "password123"
    }
    
    try:
        response = requests.post(url, json=data)
        if response.status_code == 201:
            print("✅ Inscription entrepreneur réussie")
            return True
        else:
            print(f"❌ Erreur d'inscription: {response.status_code}")
            print(response.text[:500])
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_register_client():
    """Tester l'inscription d'un client."""
    print("\n🛍️ Test d'inscription client...")
    
    url = "http://localhost:8000/api/v1/auth/register/"
    data = {
        "email": "newclient@example.com",
        "first_name": "New",
        "last_name": "Client",
        "type_utilisateur": "client",
        "telephone": "771234570",
        "password": "password123",
        "confirm_password": "password123"
    }
    
    try:
        response = requests.post(url, json=data)
        if response.status_code == 201:
            print("✅ Inscription client réussie")
            return True
        else:
            print(f"❌ Erreur d'inscription: {response.status_code}")
            print(response.text[:500])
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_analytics(token):
    """Tester l'endpoint analytics."""
    print("\n📊 Test analytics...")
    
    url = "http://localhost:8000/api/v1/analytics/dashboard/"
    headers = {"Authorization": f"Bearer {token}"}
    params = {"period": "today"}
    
    try:
        response = requests.get(url, headers=headers, params=params)
        if response.status_code == 200:
            print("✅ Analytics fonctionne")
            return True
        else:
            print(f"❌ Erreur analytics: {response.status_code}")
            print(response.text[:500])
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_user_creation(token):
    """Tester la création d'utilisateur par admin."""
    print("\n👥 Test création utilisateur par admin...")
    
    url = "http://localhost:8000/api/v1/users/users/"
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "username": "newuser@example.com",
        "email": "newuser@example.com",
        "first_name": "New",
        "last_name": "User",
        "type_utilisateur": "client",
        "telephone": "771234571",
        "password": "password123"
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        if response.status_code == 201:
            print("✅ Création utilisateur réussie")
            return True
        else:
            print(f"❌ Erreur de création: {response.status_code}")
            print(response.text[:500])
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_product_creation(token):
    """Tester la création de produit."""
    print("\n📦 Test création produit...")
    
    # D'abord créer une catégorie
    url_cat = "http://localhost:8000/api/v1/products/categories/"
    headers = {"Authorization": f"Bearer {token}"}
    cat_data = {
        "nom": "Test Category 3",
        "description": "Catégorie de test 3",
        "slug": "test-category-3",
        "icone": "test",
        "couleur": "#0000FF"
    }
    
    try:
        response = requests.post(url_cat, json=cat_data, headers=headers)
        if response.status_code == 201:
            category_id = response.json().get('id')
            print("✅ Catégorie créée")
        else:
            print(f"❌ Erreur catégorie: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erreur catégorie: {e}")
        return False
    
    # Créer une marque
    url_brand = "http://localhost:8000/api/v1/products/marques/"
    brand_data = {
        "nom": "Test Brand 3",
        "pays_origine": "Sénégal"
    }
    
    try:
        response = requests.post(url_brand, json=brand_data, headers=headers)
        if response.status_code == 201:
            brand_id = response.json().get('id')
            print("✅ Marque créée")
        else:
            print(f"❌ Erreur marque: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erreur marque: {e}")
        return False
    
    # Créer le produit
    url_prod = "http://localhost:8000/api/v1/products/products/"
    prod_data = {
        "nom": "Produit Test 3",
        "description_courte": "Description courte",
        "categorie": category_id,
        "marque": brand_id,
        "sku": "TEST-003",
        "code_barre": "1234567890129",
        "prix_achat": 1000,
        "prix_vente": 1500,
        "tva_taux": 18.0,
        "unite_mesure": "piece",
        "stock_minimum": 5,
        "stock_maximum": 100,
        "slug": "produit-test-3"
    }
    
    try:
        response = requests.post(url_prod, json=prod_data, headers=headers)
        if response.status_code == 201:
            print("✅ Produit créé")
            return True
        else:
            print(f"❌ Erreur produit: {response.status_code}")
            print(response.text[:500])
            return False
    except Exception as e:
        print(f"❌ Erreur produit: {e}")
        return False

def main():
    """Fonction principale."""
    print("🚀 Test de toutes les corrections...")
    
    # 1. Test de connexion
    token = test_login()
    if not token:
        print("❌ Impossible de continuer sans token")
        return
    
    # 2. Test d'inscription entrepreneur
    test_register_entrepreneur()
    
    # 3. Test d'inscription client
    test_register_client()
    
    # 4. Test analytics
    test_analytics(token)
    
    # 5. Test création utilisateur par admin
    test_user_creation(token)
    
    # 6. Test création produit
    test_product_creation(token)
    
    print("\n✅ Tests terminés !")

if __name__ == '__main__':
    main()
