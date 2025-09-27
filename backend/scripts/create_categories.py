#!/usr/bin/env python
"""
Script pour créer des catégories de base.
"""
import os
import sys
import django

# Configuration Django
sys.path.append('/home/suleimaan/Téléchargements/Mm/project/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.products.models import Categorie

def create_basic_categories():
    """Créer des catégories de base."""
    print("🏷️ Création des catégories de base...")
    
    categories_data = [
        {
            'nom': 'Électronique',
            'description': 'Appareils électroniques et gadgets',
            'slug': 'electronique',
            'icone': '📱',
            'couleur': '#3B82F6',
            'visible': True
        },
        {
            'nom': 'Vêtements',
            'description': 'Vêtements et accessoires',
            'slug': 'vetements',
            'icone': '👕',
            'couleur': '#EF4444',
            'visible': True
        },
        {
            'nom': 'Alimentation',
            'description': 'Produits alimentaires',
            'slug': 'alimentation',
            'icone': '🍎',
            'couleur': '#10B981',
            'visible': True
        },
        {
            'nom': 'Maison & Jardin',
            'description': 'Articles pour la maison et le jardin',
            'slug': 'maison-jardin',
            'icone': '🏠',
            'couleur': '#8B5CF6',
            'visible': True
        },
        {
            'nom': 'Sports & Loisirs',
            'description': 'Équipements sportifs et loisirs',
            'slug': 'sports-loisirs',
            'icone': '⚽',
            'couleur': '#F59E0B',
            'visible': True
        }
    ]
    
    created_count = 0
    for cat_data in categories_data:
        categorie, created = Categorie.objects.get_or_create(
            nom=cat_data['nom'],
            defaults=cat_data
        )
        if created:
            created_count += 1
            print(f"✅ Catégorie créée: {categorie.nom}")
        else:
            print(f"ℹ️ Catégorie existante: {categorie.nom}")
    
    print(f"\n📊 Résumé: {created_count} nouvelles catégories créées")
    print(f"📊 Total: {Categorie.objects.count()} catégories au total")

if __name__ == '__main__':
    create_basic_categories()
