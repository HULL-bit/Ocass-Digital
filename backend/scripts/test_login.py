#!/usr/bin/env python3
"""
Script pour tester la connexion et l'API
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
from apps.users.models import UtilisateurPersonnalise

User = get_user_model()

def test_login():
    """Test de connexion via API"""
    print("🔐 Test de connexion...")
    
    # Test de connexion
    login_data = {
        "email": "admin@platform.com",
        "password": "admin123",
        "type_utilisateur": "admin"
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/api/v1/auth/login/",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            access_token = data.get('access')
            print(f"✅ Token obtenu: {access_token[:50]}...")
            
            # Test de l'API produits avec le token
            if access_token:
                headers = {"Authorization": f"Bearer {access_token}"}
                products_response = requests.get(
                    "http://localhost:8000/api/v1/products/products/",
                    headers=headers
                )
                
                print(f"Products API Status: {products_response.status_code}")
                if products_response.status_code == 200:
                    products_data = products_response.json()
                    print(f"✅ Produits trouvés: {products_data.get('count', 0)}")
                    if products_data.get('results'):
                        first_product = products_data['results'][0]
                        print(f"Premier produit: {first_product.get('nom')}")
                        if first_product.get('images'):
                            print(f"Image: {first_product['images'][0].get('image')}")
                else:
                    print(f"❌ Erreur API produits: {products_response.text}")
        else:
            print(f"❌ Erreur de connexion: {response.text}")
            
    except Exception as e:
        print(f"❌ Erreur: {e}")

def test_user_exists():
    """Vérifier si l'utilisateur admin existe"""
    print("\n👤 Vérification de l'utilisateur admin...")
    
    try:
        admin_user = User.objects.filter(email="admin@platform.com").first()
        if admin_user:
            print(f"✅ Utilisateur trouvé: {admin_user.email}")
            print(f"   Type: {admin_user.type_utilisateur}")
            print(f"   Actif: {admin_user.is_active}")
            print(f"   Entreprise: {admin_user.entreprise_id}")
            
            # Test du mot de passe
            if admin_user.check_password("admin123"):
                print("✅ Mot de passe correct")
            else:
                print("❌ Mot de passe incorrect")
        else:
            print("❌ Utilisateur admin non trouvé")
            
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    test_user_exists()
    test_login()
