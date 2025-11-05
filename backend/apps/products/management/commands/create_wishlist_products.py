"""
Commande Django pour créer les produits de la wishlist (WishlistPage.tsx).
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify
from decimal import Decimal
from apps.products.models import Categorie, Marque, Produit
from apps.companies.models import Entreprise, PlanAbonnement


class Command(BaseCommand):
    help = 'Crée les produits de la wishlist avec leurs entreprises correspondantes'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('📦 Création des produits de la wishlist...'))
        
        # Créer ou récupérer le plan d'abonnement par défaut
        plan_default, _ = PlanAbonnement.objects.get_or_create(
            nom='Plan Gratuit',
            defaults={
                'description': 'Plan gratuit pour les nouvelles entreprises',
                'prix_mensuel': 0,
                'prix_annuel': 0,
                'devise': 'XOF',
                'max_utilisateurs': 5,
                'max_produits': 100,
                'max_ventes_mensuelles': 1000,
                'stockage_gb': 1,
                'fonctionnalites': {'basic': True},
                'populaire': False,
                'ordre_affichage': 0
            }
        )
        
        try:
            with transaction.atomic():
                # 1. Récupérer les entreprises existantes
                try:
                    entreprise_tech = Entreprise.objects.get(nom='TechSolutions Sénégal')
                    self.stdout.write(self.style.SUCCESS(f'  ✅ Entreprise trouvée: {entreprise_tech.nom}'))
                except Entreprise.DoesNotExist:
                    self.stdout.write(self.style.ERROR('  ❌ TechSolutions Sénégal n\'existe pas. Exécutez d\'abord: python manage.py create_landing_products'))
                    return
                
                try:
                    entreprise_boutique = Entreprise.objects.get(nom='Boutique Marie Diallo')
                    self.stdout.write(self.style.SUCCESS(f'  ✅ Entreprise trouvée: {entreprise_boutique.nom}'))
                except Entreprise.DoesNotExist:
                    self.stdout.write(self.style.ERROR('  ❌ Boutique Marie Diallo n\'existe pas. Exécutez d\'abord: python manage.py create_landing_products'))
                    return
                
                # 2. Produits de la wishlist avec leurs entreprises et catégories
                wishlist_products = [
                    {
                        'nom': 'Smartphone Samsung Galaxy S24',
                        'description_courte': 'Smartphone haut de gamme Samsung Galaxy S24 avec écran AMOLED et processeur puissant',
                        'description_longue': 'Smartphone Samsung Galaxy S24 avec écran Dynamic AMOLED 2X 6.2", processeur Exynos 2400, 8GB RAM, 256GB stockage, triple caméra 50MP, batterie 4000mAh, Android 14.',
                        'prix_vente': Decimal('450000'),
                        'prix_achat': Decimal('360000'),  # 80% du prix de vente
                        'stock': 15,
                        'categorie_nom': 'Électronique',
                        'marque_nom': 'Samsung',
                        'entreprise': entreprise_tech,
                        'image_url': 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2',
                        'rating': 4.5,
                        'reviews': 128,
                        'in_stock': True
                    },
                    {
                        'nom': 'Casque Audio Sony WH-1000XM4',
                        'description_courte': 'Casque audio sans fil premium avec réduction de bruit active',
                        'description_longue': 'Casque audio Sony WH-1000XM4 avec réduction de bruit active (ANC), Bluetooth 5.0, autonomie 30h, qualité audio Hi-Res, commandes tactiles, microphone intégré.',
                        'prix_vente': Decimal('180000'),
                        'prix_achat': Decimal('144000'),  # 80% du prix de vente
                        'stock': 25,
                        'categorie_nom': 'Électronique',
                        'marque_nom': 'Sony',
                        'entreprise': entreprise_tech,
                        'image_url': 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2',
                        'rating': 4.8,
                        'reviews': 89,
                        'in_stock': True
                    },
                    {
                        'nom': 'Laptop HP Pavilion 15',
                        'description_courte': 'Ordinateur portable HP Pavilion 15 pouces performant',
                        'description_longue': 'Laptop HP Pavilion 15 avec processeur Intel Core i5, 8GB RAM, 512GB SSD, écran 15.6" Full HD, Windows 11, carte graphique intégrée, autonomie jusqu\'à 8h.',
                        'prix_vente': Decimal('650000'),
                        'prix_achat': Decimal('520000'),  # 80% du prix de vente
                        'stock': 0,  # Rupture de stock
                        'categorie_nom': 'Électronique',
                        'marque_nom': 'HP',
                        'entreprise': entreprise_tech,
                        'image_url': 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2',
                        'rating': 4.2,
                        'reviews': 45,
                        'in_stock': False
                    },
                    {
                        'nom': 'Montre Connectée Apple Watch',
                        'description_courte': 'Montre connectée Apple Watch avec suivi de santé avancé',
                        'description_longue': 'Apple Watch Series avec écran Retina toujours actif, GPS intégré, suivi cardiaque, notification ECG, étanchéité jusqu\'à 50m, autonomie 18h, compatibilité iPhone.',
                        'prix_vente': Decimal('320000'),
                        'prix_achat': Decimal('256000'),  # 80% du prix de vente
                        'stock': 12,
                        'categorie_nom': 'Électronique',
                        'marque_nom': 'Apple',
                        'entreprise': entreprise_tech,
                        'image_url': 'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2',
                        'rating': 4.7,
                        'reviews': 203,
                        'in_stock': True
                    },
                    {
                        'nom': 'Sac à Dos Nike Heritage',
                        'description_courte': 'Sac à dos Nike Heritage classique et résistant',
                        'description_longue': 'Sac à dos Nike Heritage avec compartiments multiples, bretelles rembourrées, poches latérales, matériau résistant, design classique, idéal pour le sport et le quotidien.',
                        'prix_vente': Decimal('45000'),
                        'prix_achat': Decimal('36000'),  # 80% du prix de vente
                        'stock': 40,
                        'categorie_nom': 'Sport & Loisirs',
                        'marque_nom': 'Nike',
                        'entreprise': entreprise_boutique,
                        'image_url': 'https://images.pexels.com/photos/1552617/pexels-photo-1552617.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2',
                        'rating': 4.3,
                        'reviews': 67,
                        'in_stock': True
                    },
                    {
                        'nom': 'Parfum Chanel No. 5',
                        'description_courte': 'Parfum emblématique Chanel No. 5 pour femme',
                        'description_longue': 'Parfum Chanel No. 5 Eau de Parfum 50ml, fragrance florale-aldéhydée emblématique, notes de ylang-ylang, jasmin, rose et vanille, flacon élégant, parfum intemporel.',
                        'prix_vente': Decimal('120000'),
                        'prix_achat': Decimal('96000'),  # 80% du prix de vente
                        'stock': 18,
                        'categorie_nom': 'Beauté & Santé',
                        'marque_nom': 'Chanel',
                        'entreprise': entreprise_boutique,
                        'image_url': 'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2',
                        'rating': 4.9,
                        'reviews': 156,
                        'in_stock': True
                    }
                ]
                
                products_created = 0
                products_updated = 0
                
                # 3. Créer ou mettre à jour les produits
                for product_data in wishlist_products:
                    # Récupérer ou créer la catégorie
                    category_name = product_data['categorie_nom']
                    categorie, _ = Categorie.objects.get_or_create(
                        slug=slugify(category_name),
                        defaults={
                            'nom': category_name,
                            'description': f"Catégorie {category_name}",
                            'visible': True
                        }
                    )
                    
                    # Récupérer ou créer la marque
                    brand_name = product_data['marque_nom']
                    marque, _ = Marque.objects.get_or_create(
                        nom=brand_name,
                        defaults={'description': f"Marque {brand_name}"}
                    )
                    
                    # Générer un SKU unique
                    base_sku = slugify(product_data['nom']).upper().replace('-', '')
                    sku = base_sku
                    counter = 1
                    while Produit.objects.filter(sku=sku).exists():
                        sku = f"{base_sku}-{counter}"
                        counter += 1
                    
                    # Déterminer le statut selon le stock
                    statut = 'actif' if product_data['in_stock'] else 'actif'  # Même en rupture, on garde actif
                    
                    # Créer ou mettre à jour le produit
                    product, created = Produit.objects.get_or_create(
                        nom=product_data['nom'],
                        entreprise=product_data['entreprise'],
                        defaults={
                            'description_courte': product_data['description_courte'],
                            'description_longue': product_data['description_longue'],
                            'categorie': categorie,
                            'marque': marque,
                            'sku': sku,
                            'prix_achat': product_data['prix_achat'],
                            'prix_vente': product_data['prix_vente'],
                            'stock': product_data['stock'],
                            'unite_mesure': 'piece',
                            'statut': statut,
                            'visible_catalogue': True,
                            'vendable': True,
                            'achetable': True,
                            'slug': slugify(product_data['nom']),
                        }
                    )
                    
                    if created:
                        products_created += 1
                        self.stdout.write(self.style.SUCCESS(f'  ✅ Produit créé: {product.nom} ({product_data["entreprise"].nom})'))
                        
                        # Ajouter l'image si disponible (note: l'image sera à télécharger manuellement ou via un autre processus)
                        if product_data.get('image_url'):
                            self.stdout.write(self.style.WARNING(f'     ℹ️  Image URL: {product_data["image_url"]} (à télécharger manuellement)'))
                    else:
                        # Mettre à jour les champs si le produit existe
                        product.description_courte = product_data['description_courte']
                        product.description_longue = product_data['description_longue']
                        product.categorie = categorie
                        product.marque = marque
                        product.prix_achat = product_data['prix_achat']
                        product.prix_vente = product_data['prix_vente']
                        product.stock = product_data['stock']
                        product.statut = statut
                        product.visible_catalogue = True
                        product.save()
                        products_updated += 1
                        self.stdout.write(self.style.WARNING(f'  🔄 Produit mis à jour: {product.nom} ({product_data["entreprise"].nom})'))
                
                self.stdout.write(self.style.SUCCESS(
                    f'\n🎉 Opération terminée: {products_created} produits créés, {products_updated} produits mis à jour.'
                ))
                self.stdout.write(self.style.SUCCESS(f'📊 Total: {products_created + products_updated} produits de la wishlist'))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\n❌ Erreur lors de la création des produits: {str(e)}'))
            import traceback
            self.stdout.write(self.style.ERROR(traceback.format_exc()))
            raise

