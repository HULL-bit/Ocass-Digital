"""
Commande Django pour créer des catégories par défaut.
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify
from apps.products.models import Categorie


class Command(BaseCommand):
    help = 'Crée des catégories par défaut dans la base de données'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('📦 Création des catégories par défaut...'))
        
        # Liste des catégories à créer
        default_categories = [
            {
                'nom': 'Électronique',
                'description': 'Produits électroniques et informatiques',
                'icone': '💻',
                'couleur': '#3B82F6',
                'ordre_affichage': 1
            },
            {
                'nom': 'Vêtements & Mode',
                'description': 'Vêtements, accessoires et articles de mode',
                'icone': '👕',
                'couleur': '#EC4899',
                'ordre_affichage': 2
            },
            {
                'nom': 'Maison & Jardin',
                'description': 'Articles pour la maison et le jardin',
                'icone': '🏠',
                'couleur': '#10B981',
                'ordre_affichage': 3
            },
            {
                'nom': 'Sport & Loisirs',
                'description': 'Équipements sportifs et articles de loisirs',
                'icone': '⚽',
                'couleur': '#F59E0B',
                'ordre_affichage': 4
            },
            {
                'nom': 'Beauté & Santé',
                'description': 'Produits de beauté, santé et bien-être',
                'icone': '💄',
                'couleur': '#8B5CF6',
                'ordre_affichage': 5
            },
            {
                'nom': 'Alimentation',
                'description': 'Produits alimentaires et boissons',
                'icone': '🍔',
                'couleur': '#EF4444',
                'ordre_affichage': 6
            },
            {
                'nom': 'Automobile',
                'description': 'Pièces et accessoires automobiles',
                'icone': '🚗',
                'couleur': '#6366F1',
                'ordre_affichage': 7
            },
            {
                'nom': 'Livres & Médias',
                'description': 'Livres, films, musique et médias',
                'icone': '📚',
                'couleur': '#14B8A6',
                'ordre_affichage': 8
            },
            {
                'nom': 'Pharmacie',
                'description': 'Produits pharmaceutiques et médicaments',
                'icone': '💊',
                'couleur': '#06B6D4',
                'ordre_affichage': 9
            },
            {
                'nom': 'Autre',
                'description': 'Autres catégories de produits',
                'icone': '📦',
                'couleur': '#6B7280',
                'ordre_affichage': 10
            },
        ]
        
        try:
            with transaction.atomic():
                created_count = 0
                updated_count = 0
                
                for cat_data in default_categories:
                    slug = slugify(cat_data['nom'])
                    
                    # Vérifier si la catégorie existe déjà
                    category, created = Categorie.objects.get_or_create(
                        slug=slug,
                        defaults={
                            'nom': cat_data['nom'],
                            'description': cat_data['description'],
                            'icone': cat_data['icone'],
                            'couleur': cat_data['couleur'],
                            'ordre_affichage': cat_data['ordre_affichage'],
                            'visible': True
                        }
                    )
                    
                    if created:
                        created_count += 1
                        self.stdout.write(
                            self.style.SUCCESS(f'   ✅ Créée: {category.nom}')
                        )
                    else:
                        # Mettre à jour les informations si elles ont changé
                        updated = False
                        if category.nom != cat_data['nom']:
                            category.nom = cat_data['nom']
                            updated = True
                        if category.description != cat_data['description']:
                            category.description = cat_data['description']
                            updated = True
                        if category.icone != cat_data['icone']:
                            category.icone = cat_data['icone']
                            updated = True
                        if category.couleur != cat_data['couleur']:
                            category.couleur = cat_data['couleur']
                            updated = True
                        if category.ordre_affichage != cat_data['ordre_affichage']:
                            category.ordre_affichage = cat_data['ordre_affichage']
                            updated = True
                        if updated:
                            category.save()
                            updated_count += 1
                            self.stdout.write(
                                self.style.WARNING(f'   🔄 Mise à jour: {category.nom}')
                            )
                        else:
                            self.stdout.write(
                                self.style.SUCCESS(f'   ℹ️  Déjà existante: {category.nom}')
                            )
                
                # Résumé
                total_categories = Categorie.objects.count()
                self.stdout.write('')
                self.stdout.write(self.style.SUCCESS('📊 Résumé:'))
                self.stdout.write(f'   - Catégories créées: {created_count}')
                self.stdout.write(f'   - Catégories mises à jour: {updated_count}')
                self.stdout.write(f'   - Total de catégories: {total_categories}')
                self.stdout.write('')
                self.stdout.write(
                    self.style.SUCCESS('✅ Catégories par défaut créées avec succès!')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'\n❌ Erreur lors de la création des catégories: {str(e)}')
            )
            raise

