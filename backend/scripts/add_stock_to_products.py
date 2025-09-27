#!/usr/bin/env python3
"""
Script pour ajouter du stock aux produits existants
"""

import os
import sys
import django
from django.conf import settings

# Configuration Django
sys.path.append('/home/suleimaan/Téléchargements/Mm/project/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.products.models import Produit
from apps.inventory.models import Stock, Entrepot
from apps.companies.models import Entreprise
from apps.core.models import Adresse

def add_stock_to_products():
    """Ajoute du stock aux produits existants"""
    print("📦 Ajout de stock aux produits...")
    
    # Récupérer l'entreprise admin
    try:
        entreprise = Entreprise.objects.get(nom="Administration Platform")
        print(f"🏢 Entreprise trouvée: {entreprise.nom}")
    except Entreprise.DoesNotExist:
        print("❌ Entreprise 'Administration Platform' non trouvée")
        return
    
    # Créer une adresse pour l'entrepôt
    adresse, created = Adresse.objects.get_or_create(
        adresse_ligne1="15 Avenue Bourguiba",
        ville="Dakar",
        pays="Sénégal",
        defaults={
            'code_postal': '10000',
            'region': 'Dakar',
            'type_adresse': 'entrepot'
        }
    )
    if created:
        print(f"📍 Adresse créée: {adresse.adresse_ligne1}, {adresse.ville}")
    
    # Récupérer ou créer un entrepôt
    entrepot, created = Entrepot.objects.get_or_create(
        nom="Entrepôt Principal",
        entreprise=entreprise,
        defaults={
            'code': 'ENT001',
            'description': 'Entrepôt principal de l\'entreprise',
            'adresse': adresse,
            'principal': True,
            'actif': True
        }
    )
    if created:
        print(f"🏭 Entrepôt créé: {entrepot.nom}")
    else:
        print(f"🏭 Entrepôt existant: {entrepot.nom}")
    
    # Données de stock pour différents produits
    stock_data = [
        {"nom": "Écouteurs Bluetooth AirPods", "quantite": 25, "stock_min": 5},
        {"nom": "Ordinateur Portable Dell XPS", "quantite": 3, "stock_min": 2},
        {"nom": "Smartphone Galaxy S24", "quantite": 8, "stock_min": 3},
        {"nom": "Riz Parfumé Premium", "quantite": 150, "stock_min": 20},
        {"nom": "Paracétamol 500mg", "quantite": 0, "stock_min": 10},  # En rupture
        {"nom": "Robe Élégante Africaine", "quantite": 12, "stock_min": 5},
        {"nom": "MacBook Air M3", "quantite": 2, "stock_min": 1},  # Stock bas
        {"nom": "iPhone 15 Pro", "quantite": 6, "stock_min": 3},
    ]
    
    for data in stock_data:
        try:
            produit = Produit.objects.get(nom=data["nom"])
            
            # Mettre à jour le stock minimum
            produit.stock_minimum = data["stock_min"]
            produit.save()
            
            # Créer ou mettre à jour le stock
            stock, created = Stock.objects.get_or_create(
                produit=produit,
                entrepot=entrepot,
                defaults={
                    'quantite_physique': data["quantite"],
                    'quantite_reservee': 0,
                    'quantite_en_commande': 0,
                    'emplacement': 'A1-01',
                    'cout_unitaire_moyen': float(produit.prix_achat) if produit.prix_achat else 0
                }
            )
            
            if not created:
                stock.quantite_physique = data["quantite"]
                stock.quantite_reservee = 0
                stock.quantite_en_commande = 0
                stock.cout_unitaire_moyen = float(produit.prix_achat) if produit.prix_achat else 0
                stock.save()
            
            status = "✅ Créé" if created else "🔄 Mis à jour"
            print(f"  {status} {produit.nom}: {data['quantite']} unités (min: {data['stock_min']})")
            
        except Produit.DoesNotExist:
            print(f"  ❌ Produit non trouvé: {data['nom']}")
    
    print(f"\n✅ Stock ajouté avec succès!")
    
    # Afficher un résumé
    total_stock = sum(data["quantite"] for data in stock_data)
    produits_actifs = sum(1 for data in stock_data if data["quantite"] > 0)
    produits_rupture = sum(1 for data in stock_data if data["quantite"] == 0)
    produits_stock_bas = sum(1 for data in stock_data if 0 < data["quantite"] <= data["stock_min"])
    
    print(f"\n📊 Résumé:")
    print(f"  📦 Total stock: {total_stock} unités")
    print(f"  ✅ Produits actifs: {produits_actifs}")
    print(f"  ❌ Produits en rupture: {produits_rupture}")
    print(f"  ⚠️  Stock bas: {produits_stock_bas}")

if __name__ == '__main__':
    try:
        add_stock_to_products()
    except Exception as e:
        print(f"❌ Erreur: {e}")
        sys.exit(1)
