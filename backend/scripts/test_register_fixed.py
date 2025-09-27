#!/usr/bin/env python
"""
Script de test pour l'inscription avec emails uniques.
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

def test_register_with_unique_emails():
    """Test d'inscription avec des emails uniques."""
    print("🚀 Test d'inscription avec emails uniques...")
    
    # Générer des emails uniques basés sur le timestamp
    timestamp = int(time.time())
    
    # Test entrepreneur
    entrepreneur_data = {
        'email': f'entrepreneur{timestamp}@business.sn',
        'first_name': 'Test',
        'last_name': 'Entrepreneur',
        'type_utilisateur': 'entrepreneur',
        'telephone': '+221701234567',
        'password': 'testpassword123',
        'confirm_password': 'testpassword123'
    }
    
    print(f"📧 Test entrepreneur avec email: {entrepreneur_data['email']}")
    
    try:
        response = requests.post('http://localhost:8000/api/v1/auth/register/', json=entrepreneur_data)
        print(f"Status: {response.status_code}")
        if response.status_code == 201:
            print("✅ Inscription entrepreneur réussie")
            entrepreneur_response = response.json()
            print(f"Token: {entrepreneur_response.get('access', 'N/A')[:20]}...")
        else:
            print(f"❌ Erreur entrepreneur: {response.text[:500]}")
    except Exception as e:
        print(f"❌ Erreur entrepreneur: {e}")
    
    # Test client
    client_data = {
        'email': f'client{timestamp}@example.com',
        'first_name': 'Test',
        'last_name': 'Client',
        'type_utilisateur': 'client',
        'telephone': '+221701234568',
        'password': 'testpassword123',
        'confirm_password': 'testpassword123'
    }
    
    print(f"\n📧 Test client avec email: {client_data['email']}")
    
    try:
        response = requests.post('http://localhost:8000/api/v1/auth/register/', json=client_data)
        print(f"Status: {response.status_code}")
        if response.status_code == 201:
            print("✅ Inscription client réussie")
            client_response = response.json()
            print(f"Token: {client_response.get('access', 'N/A')[:20]}...")
        else:
            print(f"❌ Erreur client: {response.text[:500]}")
    except Exception as e:
        print(f"❌ Erreur client: {e}")

def test_login_with_new_users():
    """Test de connexion avec les nouveaux utilisateurs."""
    print("\n🔐 Test de connexion avec nouveaux utilisateurs...")
    
    timestamp = int(time.time())
    
    # Test connexion entrepreneur
    login_data = {
        'email': f'entrepreneur{timestamp}@business.sn',
        'password': 'testpassword123',
        'type_utilisateur': 'entrepreneur'
    }
    
    try:
        response = requests.post('http://localhost:8000/api/v1/auth/login/', json=login_data)
        print(f"Status connexion entrepreneur: {response.status_code}")
        if response.status_code == 200:
            print("✅ Connexion entrepreneur réussie")
            return response.json().get('access')
        else:
            print(f"❌ Erreur connexion entrepreneur: {response.text[:500]}")
    except Exception as e:
        print(f"❌ Erreur connexion entrepreneur: {e}")
    
    return None

def test_product_creation_with_token(token):
    """Test de création de produit avec token."""
    if not token:
        print("❌ Pas de token, impossible de tester la création de produit")
        return
    
    print("\n📦 Test de création de produit...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # D'abord créer une catégorie
    category_data = {
        "nom": f"Test Category {int(time.time())}",
        "description": "Catégorie de test",
        "slug": f"test-category-{int(time.time())}",
        "icone": "test",
        "couleur": "#0000FF"
    }
    
    try:
        response = requests.post('http://localhost:8000/api/v1/products/categories/', json=category_data, headers=headers)
        if response.status_code == 201:
            category_id = response.json().get('id')
            print("✅ Catégorie créée")
        else:
            print(f"❌ Erreur catégorie: {response.status_code} - {response.text[:200]}")
            return
    except Exception as e:
        print(f"❌ Erreur catégorie: {e}")
        return
    
    # Créer une marque
    brand_data = {
        "nom": f"Test Brand {int(time.time())}",
        "pays_origine": "Sénégal"
    }
    
    try:
        response = requests.post('http://localhost:8000/api/v1/products/marques/', json=brand_data, headers=headers)
        if response.status_code == 201:
            brand_id = response.json().get('id')
            print("✅ Marque créée")
        else:
            print(f"❌ Erreur marque: {response.status_code} - {response.text[:200]}")
            return
    except Exception as e:
        print(f"❌ Erreur marque: {e}")
        return
    
    # Créer le produit
    product_data = {
        "nom": f"Produit Test {int(time.time())}",
        "description_courte": "Description courte",
        "categorie": category_id,
        "marque": brand_id,
        "sku": f"TEST-{int(time.time())}",
        "code_barre": f"1234567890{int(time.time()) % 10000}",
        "prix_achat": 1000,
        "prix_vente": 1500,
        "tva_taux": 18.0,
        "unite_mesure": "piece",
        "stock_minimum": 5,
        "stock_maximum": 100,
        "slug": f"produit-test-{int(time.time())}"
    }
    
    try:
        response = requests.post('http://localhost:8000/api/v1/products/products/', json=product_data, headers=headers)
        if response.status_code == 201:
            print("✅ Produit créé avec succès")
            product_response = response.json()
            print(f"Produit ID: {product_response.get('id')}")
        else:
            print(f"❌ Erreur produit: {response.status_code}")
            print(f"Réponse: {response.text[:500]}")
    except Exception as e:
        print(f"❌ Erreur produit: {e}")

if __name__ == '__main__':
    print("🚀 Test complet d'inscription et création de produit...")
    
    # Test 1: Inscription
    test_register_with_unique_emails()
    
    # Test 2: Connexion
    token = test_login_with_new_users()
    
    # Test 3: Création de produit
    test_product_creation_with_token(token)
    
    print("\n✅ Tests terminés!")
