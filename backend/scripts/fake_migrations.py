#!/usr/bin/env python
"""
Script pour marquer toutes les migrations comme déjà appliquées.
Utile après import de données complètes.
"""
import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')
django.setup()

from django.db import connection
from django.core.management import call_command

def fake_all_migrations():
    """Marquer toutes les migrations comme appliquées"""
    print("=" * 70)
    print("Marquage de toutes les migrations comme appliquées...")
    print("=" * 70)
    
    try:
        # Obtenir toutes les apps avec migrations
        from django.apps import apps
        from django.db.migrations.loader import MigrationLoader
        
        loader = MigrationLoader(connection)
        unapplied = loader.get_unapplied_migrations()
        
        if not unapplied:
            print("✓ Toutes les migrations sont déjà appliquées")
            return True
        
        print(f"Nombre de migrations non appliquées: {len(unapplied)}")
        
        # Marquer toutes les migrations comme appliquées
        for app_label, migration_name in unapplied:
            try:
                call_command('migrate', app_label, migration_name, fake=True, verbosity=0)
                print(f"✓ {app_label}.{migration_name} marquée comme appliquée")
            except Exception as e:
                print(f"⚠ {app_label}.{migration_name}: {e}")
        
        print("=" * 70)
        print("✓ Toutes les migrations ont été marquées comme appliquées")
        print("=" * 70)
        return True
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

if __name__ == '__main__':
    success = fake_all_migrations()
    sys.exit(0 if success else 1)

