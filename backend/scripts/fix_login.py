#!/usr/bin/env python
"""
Script pour corriger les problèmes de connexion.
"""
import os
import sys
import django

# Configuration Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def fix_users():
    """Corriger les utilisateurs existants."""
    print("🔧 Correction des utilisateurs...")
    
    # Vérifier les utilisateurs existants
    users = User.objects.all()
    print(f"📊 {users.count()} utilisateurs trouvés")
    
    for user in users:
        print(f"   - {user.email} ({user.type_utilisateur}) - Actif: {user.is_active}")
        
        # S'assurer que l'utilisateur est actif
        if not user.is_active:
            user.is_active = True
            user.save()
            print(f"     ✅ Utilisateur activé")
        
        # Vérifier le mot de passe
        if user.check_password('password'):
            print(f"     ✅ Mot de passe correct")
        elif user.check_password('admin123'):
            print(f"     ✅ Mot de passe admin correct")
        else:
            # Définir un mot de passe par défaut
            if user.type_utilisateur == 'admin':
                user.set_password('admin123')
            else:
                user.set_password('password')
            user.save()
            print(f"     ✅ Mot de passe défini")

def test_login():
    """Tester la connexion."""
    print("\n🧪 Test de connexion...")
    
    from django.contrib.auth import authenticate
    
    test_accounts = [
        ('admin4@platform.com', 'admin123', 'admin'),
        ('marie@boutiquemarie.sn', 'password', 'entrepreneur'),
        ('client2@example.com', 'password', 'client'),
    ]
    
    for email, password, expected_type in test_accounts:
        try:
            user = authenticate(username=email, password=password)
            if user:
                print(f"   ✅ {email} - Connexion réussie ({user.type_utilisateur})")
            else:
                print(f"   ❌ {email} - Échec de connexion")
        except Exception as e:
            print(f"   ❌ {email} - Erreur: {e}")

def main():
    """Fonction principale."""
    print("🚀 Correction des problèmes de connexion...")
    
    fix_users()
    test_login()
    
    print("\n✅ Correction terminée !")
    print("\n🔐 Comptes de test disponibles:")
    print("   👑 Admin: admin4@platform.com / admin123")
    print("   💼 Entrepreneur: marie@boutiquemarie.sn / password")
    print("   🛍️ Client: client2@example.com / password")

if __name__ == '__main__':
    main()
