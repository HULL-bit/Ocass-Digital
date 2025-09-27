#!/usr/bin/env python3
"""
Script pour tester l'API de modification de produit
"""

import os
import sys
import django
import requests
import json
from django.conf import settings

# Configuration Django
sys.path.append('/home/suleimaan/Téléchargements/Mm/project/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.products.models import Produit
from apps.users.models import UtilisateurPersonnalise

def test_api_product_update():
    """Teste l'API de modification de produit"""
    print("🔍 Test de l'API de modification de produit...")
    
    # Récupérer le produit
    try:
        produit = Produit.objects.get(nom="Robe Élégante Africaine")
        print(f"📦 Produit trouvé: {produit.nom} (ID: {produit.id})")
    except Produit.DoesNotExist:
        print("❌ Produit non trouvé")
        return
    
    # Utiliser l'utilisateur admin pour le test
    try:
        user = UtilisateurPersonnalise.objects.filter(
            type_utilisateur='admin'
        ).first()
        if not user:
            print("❌ Aucun utilisateur admin trouvé")
            return
        print(f"👤 Utilisateur admin: {user.email}")
    except Exception as e:
        print(f"❌ Erreur lors de la récupération de l'utilisateur: {e}")
        return
    
    # Obtenir un token d'authentification
    login_url = "http://localhost:8000/api/v1/auth/login/"
    login_data = {
        "email": user.email,
        "password": "admin123",  # Mot de passe par défaut
        "type_utilisateur": "admin"
    }
    
    print(f"\n🔐 Connexion...")
    try:
        login_response = requests.post(login_url, json=login_data)
        print(f"  Status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            token_data = login_response.json()
            token = token_data.get('access')
            print(f"  ✅ Token obtenu")
        else:
            print(f"  ❌ Erreur de connexion: {login_response.text}")
            return
    except Exception as e:
        print(f"  ❌ Erreur de connexion: {e}")
        return
    
    # Tester la modification du produit
    update_url = f"http://localhost:8000/api/v1/products/products/{produit.id}/"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    update_data = {
        "nom": "Robe Élégante Africaine",
        "description_courte": "Robe traditionnelle moderne en wax premium",
        "description_longue": "Robe traditionnelle moderne en wax premium avec des motifs authentiques",
        "prix_achat": 18000,
        "prix_vente": 35000,
        "stock_minimum": 10,
        "stock_maximum": 100,
        "sku": "ROBE-WAX-001",
        "code_barre": "1234567890124",
        "unite_mesure": "piece",
        "tva_taux": 18.0,
        "categorie": str(produit.categorie_id),
        "marque": str(produit.marque_id) if produit.marque_id else None,
        "slug": produit.slug
    }
    
    print(f"\n✏️  Tentative de modification via API...")
    print(f"  URL: {update_url}")
    print(f"  Données: {json.dumps(update_data, indent=2)}")
    
    try:
        update_response = requests.put(update_url, json=update_data, headers=headers)
        print(f"  Status: {update_response.status_code}")
        
        if update_response.status_code == 200:
            print(f"  ✅ Modification réussie!")
            response_data = update_response.json()
            print(f"  Réponse: {json.dumps(response_data, indent=2)}")
        else:
            print(f"  ❌ Erreur de modification: {update_response.text}")
            
    except Exception as e:
        print(f"  ❌ Erreur lors de la modification: {e}")

if __name__ == '__main__':
    try:
        test_api_product_update()
    except Exception as e:
        print(f"❌ Erreur: {e}")
        sys.exit(1)
