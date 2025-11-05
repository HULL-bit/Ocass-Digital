#!/usr/bin/env python3
"""
Script simple pour supprimer tous les produits directement depuis PostgreSQL.
"""
import psycopg2
from psycopg2.extras import RealDictCursor

# Configuration de la base de données (depuis settings.py)
DB_CONFIG = {
    'host': 'dpg-d3qejn0dl3ps73bsudeg-a.virginia-postgres.render.com',
    'port': '5432',
    'database': 'od',
    'user': 'od_user',
    'password': 'RRcjYdst9i3HU9CpVLf5Vcm5WWMvb68t',
    'sslmode': 'require'
}

def delete_all_products():
    """Supprime tous les produits et leurs images."""
    try:
        # Connexion à la base de données
        print('🔌 Connexion à la base de données...')
        conn = psycopg2.connect(**DB_CONFIG)
        conn.autocommit = False
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Compter avant suppression
        cur.execute("SELECT COUNT(*) as count FROM products_produit")
        total_products = cur.fetchone()['count']
        
        cur.execute("SELECT COUNT(*) as count FROM products_imageproduit")
        total_images = cur.fetchone()['count']
        
        print(f'\n📊 Avant suppression:')
        print(f'   - Produits: {total_products}')
        print(f'   - Images: {total_images}')
        
        if total_products == 0:
            print('\n✅ Aucun produit à supprimer.')
            conn.close()
            return
        
        # Demander confirmation
        print('\n⚠️  ATTENTION: Cette opération va supprimer définitivement:')
        print(f'   - {total_products} produit(s)')
        print(f'   - {total_images} image(s)')
        confirmation = input('\nÊtes-vous sûr de vouloir continuer ? (tapez "OUI" pour confirmer): ')
        
        if confirmation != 'OUI':
            print('❌ Suppression annulée.')
            conn.close()
            return
        
        # Supprimer dans une transaction
        print('\n🗑️  Suppression en cours...')
        
        # Supprimer d'abord toutes les données liées (à cause des clés étrangères)
        print('📊 Suppression des stocks...')
        cur.execute("DELETE FROM inventory_stock")
        deleted_stocks = cur.rowcount
        print(f'   ✅ {deleted_stocks} stock(s) supprimé(s)')
        
        print('\n💰 Suppression des lignes de vente...')
        cur.execute("DELETE FROM sales_lignevente")
        deleted_sales_lines = cur.rowcount
        print(f'   ✅ {deleted_sales_lines} ligne(s) de vente supprimée(s)')
        
        print('\n🛒 Suppression des ventes...')
        cur.execute("DELETE FROM sales_vente")
        deleted_sales = cur.rowcount
        print(f'   ✅ {deleted_sales} vente(s) supprimée(s)')
        
        # Supprimer les images
        print('\n🖼️  Suppression des images...')
        cur.execute("DELETE FROM products_imageproduit")
        deleted_images = cur.rowcount
        print(f'   ✅ {deleted_images} image(s) supprimée(s)')
        
        # Supprimer les produits
        print('\n📦 Suppression des produits...')
        cur.execute("DELETE FROM products_produit")
        deleted_products = cur.rowcount
        print(f'   ✅ {deleted_products} produit(s) supprimé(s)')
        
        # Commit
        conn.commit()
        
        # Vérification après suppression
        cur.execute("SELECT COUNT(*) as count FROM products_produit")
        remaining_products = cur.fetchone()['count']
        
        cur.execute("SELECT COUNT(*) as count FROM products_imageproduit")
        remaining_images = cur.fetchone()['count']
        
        print(f'\n📊 Après suppression:')
        print(f'   - Produits restants: {remaining_products}')
        print(f'   - Images restantes: {remaining_images}')
        
        if remaining_products == 0 and remaining_images == 0:
            print('\n✅ Tous les produits et images ont été supprimés avec succès!')
        else:
            print(f'\n⚠️  Il reste {remaining_products} produits et {remaining_images} images')
        
        cur.close()
        conn.close()
        
    except psycopg2.OperationalError as e:
        print(f'❌ Erreur de connexion à la base de données: {str(e)}')
        print('   Vérifiez que les informations de connexion sont correctes.')
    except Exception as e:
        print(f'❌ Erreur: {str(e)}')
        import traceback
        traceback.print_exc()
        if 'conn' in locals():
            conn.rollback()
            conn.close()

if __name__ == '__main__':
    try:
        import psycopg2
    except ImportError:
        print('❌ Module psycopg2 non installé.')
        print('   Installez-le avec: pip install psycopg2-binary')
        exit(1)
    
    delete_all_products()
