#!/usr/bin/env python3
"""
Script pour corriger le stock des produits en utilisant SQL direct
"""

import os
import sys
import django
import random

# Configuration Django
sys.path.append('/home/suleimaan/Téléchargements/Mm/project/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.db import connection
from apps.products.models import Produit

def fix_product_stock_sql():
    """Corrige le stock des produits en utilisant SQL direct"""
    print("📦 Correction du stock des produits via SQL...")
    
    produits = Produit.objects.all()
    print(f"📦 Nombre de produits à traiter: {produits.count()}")
    
    if produits.count() == 0:
        print("❌ Aucun produit trouvé. Créez d'abord des produits.")
        return
    
    updated_count = 0
    
    with connection.cursor() as cursor:
        for produit in produits:
            try:
                # Générer un stock aléatoire entre 10 et 500
                nouveau_stock = random.randint(10, 500)
                
                # Mettre à jour le statut selon le stock
                if nouveau_stock > (produit.stock_minimum or 5):
                    statut = 'actif'
                elif nouveau_stock > 0:
                    statut = 'stock_faible'
                else:
                    statut = 'rupture'
                
                # Mettre à jour le produit directement avec SQL
                cursor.execute("""
                    UPDATE products_produit 
                    SET statut = %s, 
                        visible_catalogue = true, 
                        vendable = true, 
                        achetable = true,
                        stock_minimum = %s
                    WHERE id = %s
                """, [statut, max(5, nouveau_stock // 10), str(produit.id)])
                
                print(f"  ✅ Produit mis à jour: {produit.nom} (statut: {statut})")
                updated_count += 1
                
            except Exception as e:
                print(f"❌ Erreur lors de la mise à jour de {produit.nom}: {e}")
    
    print(f"✅ {updated_count} produits mis à jour")

def create_stock_entries():
    """Crée des entrées de stock pour tous les produits"""
    print("📦 Création des entrées de stock...")
    
    # Récupérer une entreprise pour créer un entrepôt
    from apps.companies.models import Entreprise
    from apps.core.models import Adresse
    from apps.inventory.models import Entrepot, Stock
    
    entreprise = Entreprise.objects.first()
    if not entreprise:
        print("❌ Aucune entreprise trouvée.")
        return
    
    # Créer une adresse par défaut
    adresse, created = Adresse.objects.get_or_create(
        adresse_ligne1="Rue de l'Entrepôt, 1",
        ville="Dakar",
        pays="Sénégal",
        code_postal="10000",
        defaults={
            'nom': 'Entrepôt principal',
            'region': 'Dakar',
            'adresse_ligne2': 'Entrepôt principal'
        }
    )
    
    # Créer un entrepôt par défaut
    entrepot, created = Entrepot.objects.get_or_create(
        entreprise=entreprise,
        code='PRINCIPAL',
        defaults={
            'nom': f'Entrepôt principal - {entreprise.nom}',
            'description': 'Entrepôt principal de l\'entreprise',
            'adresse': adresse,
            'principal': True,
            'actif': True
        }
    )
    
    if created:
        print(f"  ✅ Entrepôt créé: {entrepot.nom}")
    else:
        print(f"  📦 Entrepôt existant: {entrepot.nom}")
    
    # Créer des entrées de stock pour tous les produits
    produits = Produit.objects.all()
    updated_count = 0
    
    for produit in produits:
        try:
            # Supprimer les anciens stocks
            Stock.objects.filter(produit=produit).delete()
            
            # Générer un stock aléatoire
            nouveau_stock = random.randint(10, 500)
            
            # Créer une entrée de stock
            stock = Stock.objects.create(
                produit=produit,
                entrepot=entrepot,
                quantite_physique=nouveau_stock,
                quantite_reservee=0,
                quantite_en_commande=0,
                cout_unitaire_moyen=float(produit.prix_achat) if produit.prix_achat else 0,
                emplacement=f"A{random.randint(1,10)}-{random.randint(1,20)}",
                zone=random.choice(['A', 'B', 'C']),
                allee=str(random.randint(1, 10)),
                etagere=str(random.randint(1, 5))
            )
            
            print(f"  ✅ Stock créé pour {produit.nom}: {nouveau_stock} unités")
            updated_count += 1
            
        except Exception as e:
            print(f"❌ Erreur lors de la création du stock pour {produit.nom}: {e}")
    
    print(f"✅ {updated_count} entrées de stock créées")

def check_stock_status():
    """Vérifie l'état final du stock"""
    print("🔍 Vérification de l'état final du stock...")
    
    produits = Produit.objects.all()
    print(f"📦 Nombre total de produits: {produits.count()}")
    
    # Calculer les métriques
    total_value = 0
    active_products = 0
    out_of_stock = 0
    low_stock = 0
    
    for produit in produits:
        # Utiliser les propriétés calculées
        stock_total = produit.stock_actuel
        stock_disponible = produit.stock_disponible
        
        # Valeur du stock (prix d'achat * quantité)
        prix_achat = float(produit.prix_achat) if produit.prix_achat else 0
        valeur_stock = prix_achat * stock_total
        total_value += valeur_stock
        
        # Déterminer le statut
        if stock_disponible <= 0:
            out_of_stock += 1
        elif stock_disponible <= (produit.stock_minimum or 5):
            low_stock += 1
        else:
            active_products += 1
    
    print(f"\n📊 Métriques finales:")
    print(f"  💰 Valeur totale du stock: {total_value:,.0f} XOF")
    print(f"  ✅ Produits actifs: {active_products}")
    print(f"  ❌ Produits en rupture: {out_of_stock}")
    print(f"  ⚠️  Stock bas: {low_stock}")

def main():
    """Fonction principale"""
    print("🚀 Début de la correction complète du stock...")
    
    try:
        # 1. Corriger les produits
        fix_product_stock_sql()
        
        # 2. Créer les entrées de stock
        create_stock_entries()
        
        # 3. Vérifier l'état final
        check_stock_status()
        
        print("\n✅ Correction complète terminée avec succès!")
        print("🎯 Les produits devraient maintenant s'afficher correctement dans l'interface.")
        
    except Exception as e:
        print(f"❌ Erreur générale: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
