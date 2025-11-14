#!/usr/bin/env python3
"""
Script complet pour exporter la base de données locale et l'importer dans Render.
"""
import os
import sys
import subprocess
from pathlib import Path
from datetime import datetime

# Configuration de la base de données locale
LOCAL_DB_CONFIG = {
    'host': 'localhost',
    'port': '5432',
    'database': 'BaseMeoire',
    'user': 'postgres',
    'password': None  # Sera demandé
}

# Configuration de la base de données Render
RENDER_DB_URL = "postgresql://commercial_platform_pro_user:cPS9UdVWB53U5ffKCkXXkeWCGp2Y9FWE@dpg-d4big5umcj7s73fh8nq0-a.oregon-postgres.render.com/commercial_platform_pro"

# Extraire les infos de connexion Render
RENDER_DB_CONFIG = {
    'host': 'dpg-d4big5umcj7s73fh8nq0-a.oregon-postgres.render.com',
    'port': '5432',
    'database': 'commercial_platform_pro',
    'user': 'commercial_platform_pro_user',
    'password': 'cPS9UdVWB53U5ffKCkXXkeWCGp2Y9FWE'
}

def get_password(prompt="Mot de passe PostgreSQL: "):
    """Demander le mot de passe de manière sécurisée"""
    import getpass
    return getpass.getpass(prompt)

def export_local_database():
    """Exporter la base de données locale"""
    print("=" * 50)
    print("EXPORT DE LA BASE DE DONNÉES LOCALE")
    print("=" * 50)
    
    if not LOCAL_DB_CONFIG['password']:
        LOCAL_DB_CONFIG['password'] = get_password(f"Mot de passe pour {LOCAL_DB_CONFIG['user']}: ")
    
    # Créer le nom du fichier avec timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    dump_file = f"commercial_platform_local_{timestamp}.dump"
    sql_file = f"commercial_platform_local_{timestamp}.sql"
    
    print(f"\n📦 Export en format custom (recommandé)...")
    print(f"   Fichier: {dump_file}")
    
    # Export en format custom
    dump_cmd = [
        'pg_dump',
        f"--host={LOCAL_DB_CONFIG['host']}",
        f"--port={LOCAL_DB_CONFIG['port']}",
        f"--username={LOCAL_DB_CONFIG['user']}",
        f"--dbname={LOCAL_DB_CONFIG['database']}",
        '--format=custom',
        '--no-owner',
        '--no-privileges',
        '--verbose',
        f'--file={dump_file}'
    ]
    
    env = os.environ.copy()
    env['PGPASSWORD'] = LOCAL_DB_CONFIG['password']
    
    try:
        result = subprocess.run(dump_cmd, env=env, check=True, capture_output=True, text=True)
        print("✅ Export custom réussi!")
    except subprocess.CalledProcessError as e:
        print(f"❌ Erreur lors de l'export custom: {e.stderr}")
        return None
    
    print(f"\n📦 Export en format SQL (compatibilité)...")
    print(f"   Fichier: {sql_file}")
    
    # Export en format SQL
    sql_cmd = [
        'pg_dump',
        f"--host={LOCAL_DB_CONFIG['host']}",
        f"--port={LOCAL_DB_CONFIG['port']}",
        f"--username={LOCAL_DB_CONFIG['user']}",
        f"--dbname={LOCAL_DB_CONFIG['database']}",
        '--format=plain',
        '--no-owner',
        '--no-privileges',
        '--verbose',
        f'--file={sql_file}'
    ]
    
    try:
        result = subprocess.run(sql_cmd, env=env, check=True, capture_output=True, text=True)
        print("✅ Export SQL réussi!")
    except subprocess.CalledProcessError as e:
        print(f"❌ Erreur lors de l'export SQL: {e.stderr}")
        return None
    
    print(f"\n✅ Export terminé avec succès!")
    print(f"   - {dump_file} (format custom, recommandé)")
    print(f"   - {sql_file} (format SQL)")
    
    return dump_file

def import_to_render(dump_file=None):
    """Importer la base de données dans Render"""
    print("\n" + "=" * 50)
    print("IMPORT VERS LA BASE DE DONNÉES RENDER")
    print("=" * 50)
    
    if not dump_file:
        # Chercher le dernier fichier dump
        dump_files = sorted(Path('.').glob('commercial_platform_local_*.dump'), reverse=True)
        if not dump_files:
            print("❌ Aucun fichier dump trouvé. Veuillez d'abord exporter la base locale.")
            return False
        dump_file = str(dump_files[0])
        print(f"📦 Utilisation du fichier: {dump_file}")
    
    if not Path(dump_file).exists():
        print(f"❌ Le fichier {dump_file} n'existe pas")
        return False
    
    print(f"\n🔄 Import vers Render...")
    print(f"   Host: {RENDER_DB_CONFIG['host']}")
    print(f"   Database: {RENDER_DB_CONFIG['database']}")
    
    # Commande pg_restore
    restore_cmd = [
        'pg_restore',
        f"--host={RENDER_DB_CONFIG['host']}",
        f"--port={RENDER_DB_CONFIG['port']}",
        f"--username={RENDER_DB_CONFIG['user']}",
        f"--dbname={RENDER_DB_CONFIG['database']}",
        '--clean',
        '--if-exists',
        '--no-owner',
        '--no-privileges',
        '--verbose',
        dump_file
    ]
    
    env = os.environ.copy()
    env['PGPASSWORD'] = RENDER_DB_CONFIG['password']
    
    try:
        result = subprocess.run(restore_cmd, env=env, check=True, capture_output=True, text=True)
        print("\n✅ Import terminé avec succès!")
        print("   La base de données Render a été mise à jour.")
        return True
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Erreur lors de l'import: {e.stderr}")
        return False

def main():
    """Fonction principale"""
    print("\n" + "=" * 50)
    print("EXPORT ET IMPORT DE BASE DE DONNÉES")
    print("=" * 50)
    print("\nCe script va:")
    print("1. Exporter votre base de données locale PostgreSQL")
    print("2. Importer les données dans la base Render")
    print()
    
    response = input("Voulez-vous continuer? (o/n): ")
    if response.lower() not in ['o', 'oui', 'y', 'yes']:
        print("Opération annulée.")
        return
    
    # Étape 1: Export
    dump_file = export_local_database()
    if not dump_file:
        print("\n❌ L'export a échoué. Arrêt du script.")
        return
    
    # Étape 2: Import
    print("\n" + "-" * 50)
    response = input("\nVoulez-vous importer maintenant dans Render? (o/n): ")
    if response.lower() in ['o', 'oui', 'y', 'yes']:
        success = import_to_render(dump_file)
        if success:
            print("\n" + "=" * 50)
            print("✅ PROCESSUS TERMINÉ AVEC SUCCÈS!")
            print("=" * 50)
        else:
            print("\n" + "=" * 50)
            print("❌ L'import a échoué.")
            print("=" * 50)
            print(f"\nVous pouvez réessayer manuellement avec:")
            print(f"  ./import_to_render.sh {dump_file}")
    else:
        print(f"\n✅ Export terminé. Vous pouvez importer plus tard avec:")
        print(f"  ./import_to_render.sh {dump_file}")

if __name__ == '__main__':
    main()

