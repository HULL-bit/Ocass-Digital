#!/usr/bin/env python3
"""
Script pour comparer les données entre la base locale et la base Render
pour vérifier que toutes les données ont été exportées.

Usage: python3 compare_databases.py [mot_de_passe_postgres_local]
"""

import psycopg2
import sys
import getpass
from collections import defaultdict

# Configuration base locale
if len(sys.argv) > 1:
    local_password = sys.argv[1]
else:
    local_password = getpass.getpass("Mot de passe PostgreSQL local: ")

LOCAL_DB = {
    'host': 'localhost',
    'port': 5432,
    'database': 'BaseMeoire',
    'user': 'postgres',
    'password': local_password
}

# Configuration base Render
RENDER_DB = {
    'host': 'dpg-d4big5umcj7s73fh8nq0-a.oregon-postgres.render.com',
    'port': 5432,
    'database': 'commercial_platform_pro',
    'user': 'commercial_platform_pro_user',
    'password': 'cPS9UdVWB53U5ffKCkXXkeWCGp2Y9FWE',
    'sslmode': 'require'
}

def get_table_counts(conn, schema='public'):
    """Récupère le nombre de lignes pour chaque table"""
    counts = {}
    try:
        with conn.cursor() as cur:
            # Récupérer toutes les tables
            cur.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = %s 
                AND table_type = 'BASE TABLE'
                ORDER BY table_name
            """, (schema,))
            
            tables = [row[0] for row in cur.fetchall()]
            
            for table in tables:
                try:
                    cur.execute(f'SELECT COUNT(*) FROM "{table}"')
                    count = cur.fetchone()[0]
                    counts[table] = count
                except Exception as e:
                    print(f"  ⚠️  Erreur pour {table}: {e}")
                    counts[table] = -1
    except Exception as e:
        print(f"❌ Erreur lors de la récupération des tables: {e}")
    
    return counts

def compare_databases():
    """Compare les deux bases de données"""
    print("=" * 70)
    print("COMPARAISON DES BASES DE DONNÉES")
    print("=" * 70)
    print()
    
    # Connexion à la base locale
    print("📊 Connexion à la base locale...")
    try:
        local_conn = psycopg2.connect(**{k: v for k, v in LOCAL_DB.items() if k != 'sslmode'})
        print("✅ Connecté à la base locale")
    except Exception as e:
        print(f"❌ Erreur de connexion à la base locale: {e}")
        return
    
    # Connexion à la base Render
    print("📊 Connexion à la base Render...")
    try:
        render_conn = psycopg2.connect(**RENDER_DB)
        print("✅ Connecté à la base Render")
    except Exception as e:
        print(f"❌ Erreur de connexion à la base Render: {e}")
        local_conn.close()
        return
    
    print()
    print("🔍 Récupération des comptages...")
    print()
    
    # Récupérer les comptages
    local_counts = get_table_counts(local_conn)
    render_counts = get_table_counts(render_conn)
    
    # Fermer les connexions
    local_conn.close()
    render_conn.close()
    
    # Comparer
    print("=" * 70)
    print("RÉSULTATS DE LA COMPARAISON")
    print("=" * 70)
    print()
    
    all_tables = set(local_counts.keys()) | set(render_counts.keys())
    
    differences = []
    matches = []
    missing_local = []
    missing_render = []
    
    for table in sorted(all_tables):
        local_count = local_counts.get(table, 0)
        render_count = render_counts.get(table, 0)
        
        if table not in local_counts:
            missing_local.append((table, render_count))
        elif table not in render_counts:
            missing_render.append((table, local_count))
        elif local_count != render_count:
            differences.append((table, local_count, render_count))
        else:
            matches.append((table, local_count))
    
    # Afficher les résultats
    if matches:
        print(f"✅ {len(matches)} tables identiques:")
        for table, count in matches[:10]:  # Afficher les 10 premières
            print(f"   {table}: {count} lignes")
        if len(matches) > 10:
            print(f"   ... et {len(matches) - 10} autres tables")
        print()
    
    if differences:
        print(f"⚠️  {len(differences)} tables avec des différences:")
        for table, local_count, render_count in differences:
            diff = render_count - local_count
            status = "✅" if diff >= 0 else "❌"
            print(f"   {status} {table}:")
            print(f"      Local: {local_count} lignes")
            print(f"      Render: {render_count} lignes")
            print(f"      Différence: {diff:+d} lignes")
        print()
    
    if missing_render:
        print(f"❌ {len(missing_render)} tables manquantes dans Render:")
        for table, count in missing_render:
            print(f"   {table}: {count} lignes (local uniquement)")
        print()
    
    if missing_local:
        print(f"ℹ️  {len(missing_local)} tables présentes uniquement dans Render:")
        for table, count in missing_local:
            print(f"   {table}: {count} lignes")
        print()
    
    # Résumé
    print("=" * 70)
    print("RÉSUMÉ")
    print("=" * 70)
    print(f"Total tables locales: {len(local_counts)}")
    print(f"Total tables Render: {len(render_counts)}")
    print(f"Tables identiques: {len(matches)}")
    print(f"Tables avec différences: {len(differences)}")
    print(f"Tables manquantes dans Render: {len(missing_render)}")
    print()
    
    if not differences and not missing_render:
        print("✅ TOUTES LES DONNÉES ONT ÉTÉ EXPORTÉES AVEC SUCCÈS!")
    elif len(differences) == 0 and len(missing_render) == 0:
        print("✅ Toutes les tables sont présentes, mais certaines ont des différences de comptage.")
        print("   Cela peut être normal si des données ont été ajoutées/supprimées après l'export.")
    else:
        print("⚠️  Certaines données peuvent manquer. Vérifiez les détails ci-dessus.")
    
    print()

if __name__ == '__main__':
    compare_databases()
