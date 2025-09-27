#!/usr/bin/env python
"""
Script pour démarrer tous les services nécessaires.
"""
import subprocess
import sys
import time
import os

def start_django_server():
    """Démarrer le serveur Django."""
    print("🚀 Démarrage du serveur Django...")
    try:
        subprocess.Popen([
            sys.executable, 'manage.py', 'runserver', '0.0.0.0:8000'
        ], cwd='backend')
        print("✅ Serveur Django démarré sur http://localhost:8000")
    except Exception as e:
        print(f"❌ Erreur démarrage Django: {e}")

def start_celery_worker():
    """Démarrer Celery worker."""
    print("🔄 Démarrage de Celery worker...")
    try:
        subprocess.Popen([
            'celery', '-A', 'config', 'worker', '--loglevel=info'
        ], cwd='backend')
        print("✅ Celery worker démarré")
    except Exception as e:
        print(f"⚠️ Celery worker non démarré (Redis requis): {e}")

def start_celery_beat():
    """Démarrer Celery beat."""
    print("⏰ Démarrage de Celery beat...")
    try:
        subprocess.Popen([
            'celery', '-A', 'config', 'beat', '--loglevel=info'
        ], cwd='backend')
        print("✅ Celery beat démarré")
    except Exception as e:
        print(f"⚠️ Celery beat non démarré (Redis requis): {e}")

def main():
    """Démarrer tous les services."""
    print("🎯 Démarrage de tous les services de la plateforme...")
    
    # Vérifier que nous sommes dans le bon répertoire
    if not os.path.exists('backend/manage.py'):
        print("❌ Erreur: Exécutez ce script depuis la racine du projet")
        return
    
    # Démarrer Django
    start_django_server()
    
    # Attendre un peu
    time.sleep(2)
    
    # Démarrer Celery (optionnel si Redis disponible)
    start_celery_worker()
    start_celery_beat()
    
    print("\n🎉 Tous les services sont démarrés !")
    print("\n📋 URLs importantes:")
    print("   🌐 API Django: http://localhost:8000")
    print("   📚 Documentation API: http://localhost:8000/api/docs/")
    print("   🔧 Admin Django: http://localhost:8000/admin/")
    print("   ⚡ Frontend React: http://localhost:5173")
    
    print("\n🔐 Comptes de test:")
    print("   👑 Admin: admin@platform.com / password")
    print("   💼 Entrepreneur: marie@boutiquemarie.sn / password")
    print("   🛍️ Client: client1@example.com / password")

if __name__ == '__main__':
    main()