#!/usr/bin/env python3
"""
Script pour comparer les données entre la base locale et Render.
"""
import psycopg2
from psycopg2.extras import RealDictCursor
import getpass

# Configuration de la base de données locale
LOCAL_DB_CONFIG = {
    'host': 'localhost',
    'port': '5432',
    'database': 'BaseMeoire',
    'user': 'postgres',
    'password': None
}

# Configuration de la base de données Render
RENDER_DB_CONFIG = {
    'host': 'dpg-d4big5umcj7s73fh8nq0-a.oregon-postgres.render.com',
    'port': '5432',
    'database': 'commercial_platform_pro',
    'user': 'commercial_platform_pro_user',
    'password': 'cPS9UdVWB53U5ffKCkXXkeWCGp2Y9FWE',
    'sslmode': 'require'
}

def get_table_counts(conn, schema='public'):
    """Récupérer le nombre d'enregistrements par table"""
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    # Récupérer toutes les tables
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = %s
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
    """, (schema,))
    
    tables = [row['table_name'] for row in cursor.fetchall()]
    
    counts = {}
    for table in tables:
        try:
            cursor.execute(f'SELECT COUNT(*) as count FROM "{table}";')
            result = cursor.fetchone()
            counts[table] = result['count'] if result else 0
        except Exception as e:
            counts[table] = f"ERROR: {str(e)}"
    
    cursor.close()
    return counts

def compare_databases(local_password=None):
    """Comparer les deux bases de données"""
    print("=" * 70)
    print("COMPARAISON DES BASES DE DONNÉES")
    print("=" * 70)
    
    # Connexion à la base locale
    print("\n🔌 Connexion à la base locale...")
    if not LOCAL_DB_CONFIG['password']:
        if local_password:
            LOCAL_DB_CONFIG['password'] = local_password
        else:
            try:
                LOCAL_DB_CONFIG['password'] = getpass.getpass(f"Mot de passe pour {LOCAL_DB_CONFIG['user']}: ")
            except:
                print("⚠️  Impossible de demander le mot de passe interactivement.")
                print("   Utilisez: python3 compare_databases.py <mot_de_passe_local>")
                print("   Ou définissez la variable d'environnement: export PGPASSWORD=<mot_de_passe>")
                return
    
    try:
        local_conn = psycopg2.connect(**LOCAL_DB_CONFIG)
        print("✅ Connexion locale réussie")
    except Exception as e:
        print(f"❌ Erreur de connexion locale: {e}")
        return
    
    # Connexion à Render
    print("🔌 Connexion à Render...")
    try:
        render_conn = psycopg2.connect(**RENDER_DB_CONFIG)
        print("✅ Connexion Render réussie")
    except Exception as e:
        print(f"❌ Erreur de connexion Render: {e}")
        local_conn.close()
        return
    
    # Récupérer les comptages
    print("\n📊 Comptage des enregistrements...")
    print("   Base locale...")
    local_counts = get_table_counts(local_conn)
    print("   Base Render...")
    render_counts = get_table_counts(render_conn)
    
    # Comparer
    print("\n" + "=" * 70)
    print("RÉSULTATS DE LA COMPARAISON")
    print("=" * 70)
    
    all_tables = set(local_counts.keys()) | set(render_counts.keys())
    
    differences = []
    matches = []
    missing_in_render = []
    missing_in_local = []
    
    for table in sorted(all_tables):
        local_count = local_counts.get(table, 0)
        render_count = render_counts.get(table, 0)
        
        if isinstance(local_count, str) or isinstance(render_count, str):
            status = "⚠️  ERREUR"
            differences.append((table, local_count, render_count, status))
        elif local_count != render_count:
            status = "❌ DIFFÉRENT"
            differences.append((table, local_count, render_count, status))
        else:
            status = "✅ IDENTIQUE"
            matches.append((table, local_count))
        
        if table not in render_counts:
            missing_in_render.append(table)
        if table not in local_counts:
            missing_in_local.append(table)
    
    # Afficher les résultats
    print(f"\n✅ Tables identiques: {len(matches)}")
    if matches:
        print("\n   Tables avec données identiques:")
        for table, count in matches[:10]:  # Afficher les 10 premières
            print(f"      - {table}: {count} enregistrements")
        if len(matches) > 10:
            print(f"      ... et {len(matches) - 10} autres")
    
    print(f"\n❌ Tables différentes: {len(differences)}")
    if differences:
        print("\n   Tables avec différences:")
        print(f"   {'Table':<40} {'Locale':<15} {'Render':<15} {'Status'}")
        print("   " + "-" * 85)
        for table, local, render, status in differences:
            print(f"   {table:<40} {str(local):<15} {str(render):<15} {status}")
    
    if missing_in_render:
        print(f"\n⚠️  Tables manquantes dans Render: {len(missing_in_render)}")
        for table in missing_in_render:
            print(f"      - {table}")
    
    if missing_in_local:
        print(f"\n⚠️  Tables manquantes dans la base locale: {len(missing_in_local)}")
        for table in missing_in_local:
            print(f"      - {table}")
    
    # Résumé
    print("\n" + "=" * 70)
    print("RÉSUMÉ")
    print("=" * 70)
    total_local = sum(c for c in local_counts.values() if isinstance(c, int))
    total_render = sum(c for c in render_counts.values() if isinstance(c, int))
    
    print(f"Total enregistrements (locale):  {total_local:,}")
    print(f"Total enregistrements (Render):  {total_render:,}")
    print(f"Différence:                       {total_local - total_render:,}")
    
    if len(differences) == 0 and len(missing_in_render) == 0:
        print("\n✅ TOUTES LES DONNÉES SONT IDENTIQUES!")
    else:
        print("\n⚠️  Il y a des différences. Vous devriez exporter les données.")
    
    # Fermer les connexions
    local_conn.close()
    render_conn.close()

if __name__ == '__main__':
    import sys
    local_password = sys.argv[1] if len(sys.argv) > 1 else None
    compare_databases(local_password)

