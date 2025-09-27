#!/usr/bin/env python
"""
Script principal pour configurer la plateforme avec des données sénégalaises.
"""
import os
import sys
import django
import subprocess

# Configuration Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

def run_command(command, description):
    """Exécute une commande avec gestion d'erreurs."""
    print(f"\n🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} terminé avec succès")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Erreur lors de {description.lower()}: {e.stderr}")
        return False

def main():
    """Configuration complète de la plateforme sénégalaise."""
    print("🇸🇳 Configuration de la Plateforme Commerciale Sénégalaise")
    print("=" * 60)
    
    # 1. Migrations
    if not run_command("python manage.py makemigrations", "Création des migrations"):
        return
    
    if not run_command("python manage.py migrate", "Application des migrations"):
        return
    
    # 2. Superutilisateur
    if not run_command("python scripts/create_superuser.py", "Création du superutilisateur"):
        return
    
    # 3. Données de base
    if not run_command("python scripts/populate_test_data.py", "Peuplement données de base"):
        return
    
    # 4. Données sénégalaises
    if not run_command("python scripts/populate_senegal_data.py", "Ajout données sénégalaises"):
        return
    
    # 5. Données supplémentaires
    if not run_command("python scripts/add_more_test_data.py", "Ajout données supplémentaires"):
        return
    
    print("\n🎉 Configuration terminée avec succès !")
    print("\n📋 Informations importantes:")
    print("   🌐 Backend Django: http://localhost:8000")
    print("   📚 Documentation API: http://localhost:8000/api/docs/")
    print("   🔧 Admin Django: http://localhost:8000/admin/")
    print("   ⚡ Frontend React: http://localhost:5173")
    
    print("\n🔐 Comptes de test sénégalais:")
    print("   👑 Admin: admin@platform.com / password")
    print("   💼 Marie Diallo: marie@boutiquemarie.sn / password")
    print("   💼 Amadou Ba: amadou@techsolutions.sn / password")
    print("   💼 Fatou Sow: fatou@pharmaciemoderne.sn / password")
    print("   💼 Aminata Diop: aminata@auchan.sn / password")
    print("   🛍️ Abdou Samb: abdou.samb@email.sn / password")
    print("   🛍️ Khadija Fall: khadija.fall@email.sn / password")
    
    print("\n🚀 Pour démarrer:")
    print("   Backend: cd backend && python manage.py runserver")
    print("   Frontend: npm run dev")
    print("   Ou les deux: npm run start:all")

if __name__ == '__main__':
    main()