#!/usr/bin/env python
"""
Script pour créer des catégories et marques par défaut.
"""
import os
import sys
import django

# Configuration Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.products.models import Categorie, Marque

def create_default_categories():
    """Créer des catégories par défaut."""
    categories_data = [
        {
            'nom': 'Électronique',
            'description': 'Appareils électroniques et gadgets',
            'slug': 'electronique',
            'icone': '📱',
            'couleur': '#3B82F6'
        },
        {
            'nom': 'Vêtements',
            'description': 'Vêtements et accessoires',
            'slug': 'vetements',
            'icone': '👕',
            'couleur': '#EF4444'
        },
        {
            'nom': 'Maison & Jardin',
            'description': 'Articles pour la maison et le jardin',
            'slug': 'maison-jardin',
            'icone': '🏠',
            'couleur': '#10B981'
        },
        {
            'nom': 'Sport & Loisirs',
            'description': 'Équipements sportifs et loisirs',
            'slug': 'sport-loisirs',
            'icone': '⚽',
            'couleur': '#F59E0B'
        },
        {
            'nom': 'Beauté & Santé',
            'description': 'Produits de beauté et santé',
            'slug': 'beaute-sante',
            'icone': '💄',
            'couleur': '#EC4899'
        },
        {
            'nom': 'Livres & Médias',
            'description': 'Livres, films et médias',
            'slug': 'livres-medias',
            'icone': '📚',
            'couleur': '#8B5CF6'
        },
        {
            'nom': 'Automobile',
            'description': 'Pièces et accessoires auto',
            'slug': 'automobile',
            'icone': '🚗',
            'couleur': '#6B7280'
        },
        {
            'nom': 'Alimentation',
            'description': 'Produits alimentaires',
            'slug': 'alimentation',
            'icone': '🍎',
            'couleur': '#F97316'
        }
    ]

    created_categories = []
    for cat_data in categories_data:
        categorie, created = Categorie.objects.get_or_create(
            slug=cat_data['slug'],
            defaults=cat_data
        )
        if created:
            print(f"✅ Catégorie créée: {categorie.nom}")
            created_categories.append(categorie)
        else:
            print(f"ℹ️ Catégorie existe déjà: {categorie.nom}")
            created_categories.append(categorie)

    return created_categories

def create_default_brands():
    """Créer des marques par défaut."""
    brands_data = [
        {
            'nom': 'Samsung',
            'description': 'Marque coréenne d\'électronique',
            'slug': 'samsung',
            'pays_origine': 'Corée du Sud',
            'site_web': 'https://samsung.com'
        },
        {
            'nom': 'Apple',
            'description': 'Marque américaine de technologie',
            'slug': 'apple',
            'pays_origine': 'États-Unis',
            'site_web': 'https://apple.com'
        },
        {
            'nom': 'Nike',
            'description': 'Marque américaine de sportswear',
            'slug': 'nike',
            'pays_origine': 'États-Unis',
            'site_web': 'https://nike.com'
        },
        {
            'nom': 'Adidas',
            'description': 'Marque allemande de sportswear',
            'slug': 'adidas',
            'pays_origine': 'Allemagne',
            'site_web': 'https://adidas.com'
        },
        {
            'nom': 'Sony',
            'description': 'Marque japonaise d\'électronique',
            'slug': 'sony',
            'pays_origine': 'Japon',
            'site_web': 'https://sony.com'
        },
        {
            'nom': 'LG',
            'description': 'Marque coréenne d\'électronique',
            'slug': 'lg',
            'pays_origine': 'Corée du Sud',
            'site_web': 'https://lg.com'
        },
        {
            'nom': 'HP',
            'description': 'Marque américaine d\'informatique',
            'slug': 'hp',
            'pays_origine': 'États-Unis',
            'site_web': 'https://hp.com'
        },
        {
            'nom': 'Dell',
            'description': 'Marque américaine d\'informatique',
            'slug': 'dell',
            'pays_origine': 'États-Unis',
            'site_web': 'https://dell.com'
        },
        {
            'nom': 'Générique',
            'description': 'Marque générique pour produits sans marque spécifique',
            'slug': 'generique',
            'pays_origine': 'International',
            'site_web': ''
        }
    ]

    created_brands = []
    for brand_data in brands_data:
        # Supprimer le slug car le modèle Marque n'en a pas
        brand_data_copy = brand_data.copy()
        brand_data_copy.pop('slug', None)
        
        marque, created = Marque.objects.get_or_create(
            nom=brand_data['nom'],
            defaults=brand_data_copy
        )
        if created:
            print(f"✅ Marque créée: {marque.nom}")
            created_brands.append(marque)
        else:
            print(f"ℹ️ Marque existe déjà: {marque.nom}")
            created_brands.append(marque)

    return created_brands

def main():
    """Fonction principale."""
    print("🚀 Création des catégories et marques par défaut...")
    print("=" * 50)
    
    try:
        categories = create_default_categories()
        brands = create_default_brands()
        
        print("\n✅ Création terminée !")
        print(f"\n📊 Résumé:")
        print(f"   • Catégories créées: {len(categories)}")
        print(f"   • Marques créées: {len(brands)}")
        
        print("\n📋 Catégories disponibles:")
        for cat in categories:
            print(f"   • {cat.nom} (ID: {cat.id})")
        
        print("\n🏷️ Marques disponibles:")
        for brand in brands:
            print(f"   • {brand.nom} (ID: {brand.id})")
            
    except Exception as e:
        print(f"❌ Erreur lors de la création: {e}")
        return False
    
    return True

if __name__ == '__main__':
    main()
