#!/usr/bin/env python3
"""
Script pour réinitialiser le mot de passe d'un utilisateur entrepreneur
"""

import os
import sys
import django
from django.conf import settings

# Configuration Django
sys.path.append('/home/suleimaan/Téléchargements/Mm/project/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.users.models import UtilisateurPersonnalise
from apps.products.models import Produit

def reset_entrepreneur_password():
    """Réinitialise le mot de passe d'un utilisateur entrepreneur"""
    print("🔐 Réinitialisation du mot de passe entrepreneur...")
    
    # Récupérer le produit "Robe Élégante Africaine"
    try:
        produit = Produit.objects.get(nom="Robe Élégante Africaine")
        print(f"📦 Produit: {produit.nom} (Entreprise: {produit.entreprise})")
    except Produit.DoesNotExist:
        print("❌ Produit non trouvé")
        return
    
    # Récupérer un utilisateur entrepreneur de la même entreprise
    try:
        user = UtilisateurPersonnalise.objects.filter(
            type_utilisateur='entrepreneur',
            entreprise_id=produit.entreprise_id
        ).first()
        if not user:
            print("❌ Aucun utilisateur entrepreneur trouvé pour cette entreprise")
            return
        print(f"👤 Utilisateur: {user.email}")
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return
    
    # Réinitialiser le mot de passe
    new_password = "admin123"
    user.set_password(new_password)
    user.save()
    
    print(f"✅ Mot de passe réinitialisé pour {user.email}")
    print(f"🔑 Nouveau mot de passe: {new_password}")
    
    # Tester la connexion
    print(f"\n🧪 Test de connexion...")
    from django.contrib.auth import authenticate
    
    authenticated_user = authenticate(email=user.email, password=new_password)
    if authenticated_user:
        print(f"✅ Connexion réussie!")
    else:
        print(f"❌ Échec de la connexion")

if __name__ == '__main__':
    try:
        reset_entrepreneur_password()
    except Exception as e:
        print(f"❌ Erreur: {e}")
        sys.exit(1)
