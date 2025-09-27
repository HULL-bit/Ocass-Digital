#!/usr/bin/env python3
"""
Script pour vérifier les utilisateurs entrepreneurs
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
from apps.companies.models import Entreprise

def check_entrepreneur_users():
    """Vérifie les utilisateurs entrepreneurs"""
    print("🔍 Vérification des utilisateurs entrepreneurs...")
    
    entrepreneurs = UtilisateurPersonnalise.objects.filter(type_utilisateur='entrepreneur')
    print(f"📊 Nombre d'entrepreneurs: {entrepreneurs.count()}")
    
    for user in entrepreneurs:
        print(f"\n👤 Utilisateur: {user.email}")
        print(f"  ID: {user.id}")
        print(f"  Nom: {user.first_name} {user.last_name}")
        print(f"  Type: {user.type_utilisateur}")
        print(f"  Entreprise: {user.entreprise_id}")
        print(f"  Actif: {user.is_active}")
        print(f"  Date création: {user.date_joined}")
        
        # Vérifier l'entreprise associée
        if user.entreprise_id:
            try:
                entreprise = Entreprise.objects.get(id=user.entreprise_id)
                print(f"  Entreprise: {entreprise.nom}")
            except Entreprise.DoesNotExist:
                print(f"  ❌ Entreprise non trouvée (ID: {user.entreprise_id})")
    
    # Vérifier les entreprises
    print(f"\n🏢 Entreprises disponibles:")
    entreprises = Entreprise.objects.all()
    for entreprise in entreprises:
        print(f"  - {entreprise.nom} (ID: {entreprise.id})")
        
        # Compter les entrepreneurs de cette entreprise
        entrepreneurs_count = UtilisateurPersonnalise.objects.filter(
            entreprise_id=entreprise.id, 
            type_utilisateur='entrepreneur'
        ).count()
        print(f"    Entrepreneurs: {entrepreneurs_count}")

if __name__ == '__main__':
    try:
        check_entrepreneur_users()
    except Exception as e:
        print(f"❌ Erreur: {e}")
        sys.exit(1)
