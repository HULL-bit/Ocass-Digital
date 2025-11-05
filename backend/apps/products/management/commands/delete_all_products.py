"""
Commande Django pour supprimer tous les produits de toutes les entreprises.
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from apps.products.models import Produit, ImageProduit


class Command(BaseCommand):
    help = 'Supprime tous les produits de toutes les entreprises'

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Confirmer la suppression (obligatoire)',
        )

    def handle(self, *args, **options):
        if not options['confirm']:
            self.stdout.write(
                self.style.WARNING(
                    '⚠️  ATTENTION: Cette commande va supprimer TOUS les produits de TOUTES les entreprises!\n'
                    'Pour confirmer, ajoutez --confirm'
                )
            )
            return

        self.stdout.write(self.style.WARNING('🗑️  Suppression de tous les produits...'))
        
        try:
            with transaction.atomic():
                # Compter les produits avant suppression
                total_products = Produit.objects.count()
                total_images = ImageProduit.objects.count()
                
                self.stdout.write(f'📊 Avant suppression:')
                self.stdout.write(f'   - Produits: {total_products}')
                self.stdout.write(f'   - Images: {total_images}')
                
                # Supprimer toutes les images associées
                self.stdout.write('\n🖼️  Suppression des images...')
                deleted_images = ImageProduit.objects.all().delete()
                self.stdout.write(
                    self.style.SUCCESS(f'   ✅ {deleted_images[0]} image(s) supprimée(s)')
                )
                
                # Supprimer tous les produits
                self.stdout.write('\n📦 Suppression des produits...')
                deleted_products = Produit.objects.all().delete()
                self.stdout.write(
                    self.style.SUCCESS(f'   ✅ {deleted_products[0]} produit(s) supprimé(s)')
                )
                
                # Vérification après suppression
                remaining_products = Produit.objects.count()
                remaining_images = ImageProduit.objects.count()
                
                self.stdout.write(f'\n📊 Après suppression:')
                self.stdout.write(f'   - Produits restants: {remaining_products}')
                self.stdout.write(f'   - Images restantes: {remaining_images}')
                
                if remaining_products == 0 and remaining_images == 0:
                    self.stdout.write(
                        self.style.SUCCESS('\n✅ Tous les produits et images ont été supprimés avec succès!')
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING(
                            f'\n⚠️  Il reste {remaining_products} produits et {remaining_images} images'
                        )
                    )
                    
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'\n❌ Erreur lors de la suppression: {str(e)}')
            )
            raise

