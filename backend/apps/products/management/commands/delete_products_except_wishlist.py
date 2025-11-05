"""
Commande Django pour supprimer tous les produits sauf ceux de la wishlist.
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from apps.products.models import Produit, ImageProduit


class Command(BaseCommand):
    help = 'Supprime tous les produits (y compris ceux de la wishlist)'

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
                    '⚠️  ATTENTION: Cette commande va supprimer tous les produits sauf ceux de la wishlist!\n'
                    'Pour confirmer, ajoutez --confirm'
                )
            )
            return

        self.stdout.write(self.style.WARNING('🗑️  Suppression de TOUS les produits...'))
        
        try:
            with transaction.atomic():
                # Compter les produits avant suppression
                total_products = Produit.objects.count()
                total_images = ImageProduit.objects.count()
                
                self.stdout.write(f'📊 Avant suppression:')
                self.stdout.write(f'   - Produits totaux: {total_products}')
                self.stdout.write(f'   - Images: {total_images}')
                
                if total_products <= 0:
                    self.stdout.write(self.style.SUCCESS('✅ Aucun produit à supprimer'))
                    return
                
                # Supprimer toutes les images
                product_ids_all = list(Produit.objects.values_list('id', flat=True))
                
                if product_ids_all:
                    self.stdout.write('\n🖼️  Suppression de toutes les images...')
                    deleted_images = ImageProduit.objects.all().delete()
                    self.stdout.write(
                        self.style.SUCCESS(f'   ✅ {deleted_images[0]} image(s) supprimée(s)')
                    )
                
                # Supprimer tous les produits
                self.stdout.write('\n📦 Suppression de tous les produits...')
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
                
                if remaining_products == 0:
                    self.stdout.write(self.style.SUCCESS('\n✅ Tous les produits ont été supprimés avec succès !'))
                else:
                    self.stdout.write(self.style.WARNING(f'\n⚠️  Il reste {remaining_products} produits'))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\n❌ Erreur lors de la suppression: {str(e)}'))
            import traceback
            self.stdout.write(self.style.ERROR(traceback.format_exc()))
            raise

