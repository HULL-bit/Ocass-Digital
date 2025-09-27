#!/usr/bin/env python
"""
Script de test pour la création de produit.
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

def test_product_creation():
    """Test de création de produit."""
    print("🚀 Test de création de produit...")
    
    timestamp = int(time.time())
    
    # D'abord s'inscrire comme entrepreneur
    register_data = {
        'email': f'entrepreneur{timestamp}@business.sn',
        'first_name': 'Test',
        'last_name': 'Entrepreneur',
        'type_utilisateur': 'entrepreneur',
        'telephone': '+221701234567',
        'password': 'testpassword123',
        'confirm_password': 'testpassword123'
    }
    
    print(f"📧 Inscription entrepreneur avec email: {register_data['email']}")
    
    try:
        response = requests.post('http://localhost:8000/api/v1/auth/register/', json=register_data)
        if response.status_code == 201:
            print("✅ Inscription entrepreneur réussie")
            token = response.json().get('access')
            print(f"Token: {token[:20]}...")
        else:
            print(f"❌ Erreur inscription: {response.status_code} - {response.text[:500]}")
            return
    except Exception as e:
        print(f"❌ Erreur inscription: {e}")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Créer une catégorie
    print("\n📂 Création de catégorie...")
    category_data = {
        "nom": f"Test Category {timestamp}",
        "description": "Catégorie de test",
        "slug": f"test-category-{timestamp}",
        "icone": "test",
        "couleur": "#0000FF"
    }
    
    try:
        response = requests.post('http://localhost:8000/api/v1/products/categories/', json=category_data, headers=headers)
        if response.status_code == 201:
            category_id = response.json().get('id')
            print(f"✅ Catégorie créée avec ID: {category_id}")
        else:
            print(f"❌ Erreur catégorie: {response.status_code} - {response.text[:200]}")
            return
    except Exception as e:
        print(f"❌ Erreur catégorie: {e}")
        return
    
    # Créer une marque
    print("\n🏷️ Création de marque...")
    brand_data = {
        "nom": f"Test Brand {timestamp}",
        "pays_origine": "Sénégal"
    }
    
    try:
        response = requests.post('http://localhost:8000/api/v1/products/marques/', json=brand_data, headers=headers)
        if response.status_code == 201:
            brand_id = response.json().get('id')
            print(f"✅ Marque créée avec ID: {brand_id}")
        else:
            print(f"❌ Erreur marque: {response.status_code} - {response.text[:200]}")
            return
    except Exception as e:
        print(f"❌ Erreur marque: {e}")
        return
    
    # Créer le produit
    print("\n📦 Création de produit...")
    product_data = {
        "nom": f"Produit Test {timestamp}",
        "description_courte": "Description courte du produit de test",
        "description_longue": "Description longue du produit de test avec plus de détails",
        "categorie": category_id,
        "marque": brand_id,
        "sku": f"TEST-{timestamp}",
        "code_barre": f"1234567890{timestamp % 10000}",
        "prix_achat": 1000.00,
        "prix_vente": 1500.00,
        "tva_taux": 18.0,
        "unite_mesure": "piece",
        "stock_minimum": 5,
        "stock_maximum": 100,
        "slug": f"produit-test-{timestamp}-{int(time.time() * 1000) % 10000}",
        "visible_catalogue": True,
        "vendable": True,
        "achetable": True
    }
    
    try:
        response = requests.post('http://localhost:8000/api/v1/products/products/', json=product_data, headers=headers)
        if response.status_code == 201:
            print("✅ Produit créé avec succès")
            product_response = response.json()
            print(f"Produit ID: {product_response.get('id')}")
            print(f"Nom: {product_response.get('nom')}")
            print(f"SKU: {product_response.get('sku')}")
            print(f"Prix: {product_response.get('prix_vente')}")
            return product_response.get('id')
        else:
            print(f"❌ Erreur produit: {response.status_code}")
            print(f"Réponse: {response.text[:500]}")
    except Exception as e:
        print(f"❌ Erreur produit: {e}")
    
    return None

def test_product_creation_with_admin():
    """Test de création de produit avec un admin."""
    print("\n🚀 Test de création de produit avec admin...")
    
    # Se connecter comme admin
    login_data = {
        'email': 'admin@platform.com',
        'password': 'admin123',
        'type_utilisateur': 'admin'
    }
    
    try:
        response = requests.post('http://localhost:8000/api/v1/auth/login/', json=login_data)
        if response.status_code == 200:
            print("✅ Connexion admin réussie")
            token = response.json().get('access')
            print(f"Token: {token[:20]}...")
        else:
            print(f"❌ Erreur connexion admin: {response.status_code} - {response.text[:500]}")
            return
    except Exception as e:
        print(f"❌ Erreur connexion admin: {e}")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    timestamp = int(time.time())
    
    # Créer une catégorie
    print("\n📂 Création de catégorie par admin...")
    category_data = {
        "nom": f"Admin Category {timestamp}",
        "description": "Catégorie créée par admin",
        "slug": f"admin-category-{timestamp}",
        "icone": "admin",
        "couleur": "#FF0000"
    }
    
    try:
        response = requests.post('http://localhost:8000/api/v1/products/categories/', json=category_data, headers=headers)
        if response.status_code == 201:
            category_id = response.json().get('id')
            print(f"✅ Catégorie créée par admin avec ID: {category_id}")
        else:
            print(f"❌ Erreur catégorie admin: {response.status_code} - {response.text[:200]}")
            return
    except Exception as e:
        print(f"❌ Erreur catégorie admin: {e}")
        return
    
    # Créer une marque
    print("\n🏷️ Création de marque par admin...")
    brand_data = {
        "nom": f"Admin Brand {timestamp}",
        "pays_origine": "Sénégal"
    }
    
    try:
        response = requests.post('http://localhost:8000/api/v1/products/marques/', json=brand_data, headers=headers)
        if response.status_code == 201:
            brand_id = response.json().get('id')
            print(f"✅ Marque créée par admin avec ID: {brand_id}")
        else:
            print(f"❌ Erreur marque admin: {response.status_code} - {response.text[:200]}")
            return
    except Exception as e:
        print(f"❌ Erreur marque admin: {e}")
        return
    
    # Créer le produit
    print("\n📦 Création de produit par admin...")
    product_data = {
        "nom": f"Admin Produit {timestamp}",
        "description_courte": "Produit créé par admin",
        "categorie": category_id,
        "marque": brand_id,
        "sku": f"ADMIN-{timestamp}",
        "code_barre": f"9876543210{timestamp % 10000}",
        "prix_achat": 2000.00,
        "prix_vente": 2500.00,
        "tva_taux": 18.0,
        "unite_mesure": "piece",
        "stock_minimum": 10,
        "stock_maximum": 200,
        "slug": f"admin-produit-{timestamp}-{int(time.time() * 1000) % 10000}"
    }
    
    try:
        response = requests.post('http://localhost:8000/api/v1/products/products/', json=product_data, headers=headers)
        if response.status_code == 201:
            print("✅ Produit créé par admin avec succès")
            product_response = response.json()
            print(f"Produit ID: {product_response.get('id')}")
            print(f"Nom: {product_response.get('nom')}")
            print(f"SKU: {product_response.get('sku')}")
            return product_response.get('id')
        else:
            print(f"❌ Erreur produit admin: {response.status_code}")
            print(f"Réponse: {response.text[:500]}")
    except Exception as e:
        print(f"❌ Erreur produit admin: {e}")
    
    return None

if __name__ == '__main__':
    print("🚀 Test complet de création de produit...")
    
    # Test 1: Création par entrepreneur
    product_id1 = test_product_creation()
    
    # Test 2: Création par admin
    product_id2 = test_product_creation_with_admin()
    
    print(f"\n✅ Tests terminés!")
    print(f"Produit entrepreneur: {product_id1}")
    print(f"Produit admin: {product_id2}")
