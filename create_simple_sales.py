#!/usr/bin/env python3
"""
Script simple pour créer des ventes de test via l'API Django.
"""

import os
import sys
import django

# Configuration Django
sys.path.append('/home/suleimaan/Téléchargements/Mm/project/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.users.models import User
from apps.customers.models import Client
from apps.products.models import Produit
from apps.sales.models import Vente, LigneVente
from decimal import Decimal
import random

def create_simple_test_sales():
    """Créer quelques ventes de test simples."""
    
    print("🛒 Création de ventes de test simples...")
    
    try:
        # Récupérer les données
        entrepreneur = User.objects.filter(type_utilisateur='entrepreneur').first()
        client = Client.objects.first()
        produits = Produit.objects.filter(statut='actif')[:3]
        
        if not entrepreneur or not client or not produits.exists():
            print("❌ Données manquantes pour créer les ventes")
            return
        
        print(f"✅ Utilisation de l'entrepreneur: {entrepreneur.email}")
        print(f"✅ Utilisation du client: {client.nom}")
        print(f"✅ Utilisation de {produits.count()} produits")
        
        # Créer 3 ventes de test
        for i in range(3):
            # Créer la vente
            vente = Vente.objects.create(
                client=client,
                entrepreneur=entrepreneur,
                vendeur=entrepreneur,
                sous_total=Decimal('0.00'),
                taxe_montant=Decimal('0.00'),
                remise_montant=Decimal('0.00'),
                total_ttc=Decimal('0.00'),
                mode_paiement='especes',
                statut_paiement='paid' if i < 2 else 'pending',
                source_vente='pos',
                notes=f"Vente de test #{i+1}"
            )
            
            # Ajouter une ligne de vente
            produit = produits[i % len(produits)]
            quantite = random.randint(1, 3)
            prix_unitaire = Decimal('1000.00')
            
            ligne = LigneVente.objects.create(
                vente=vente,
                produit=produit,
                quantite=quantite,
                prix_unitaire=prix_unitaire,
                remise_pourcentage=Decimal('0.00')
            )
            
            # Calculer les totaux
            vente.sous_total = ligne.total_ht
            vente.taxe_montant = ligne.total_tva
            vente.total_ttc = ligne.total_ttc
            vente.save()
            
            print(f"✅ Vente créée: {vente.numero_facture} - {vente.total_ttc} XOF")
        
        print(f"\n🎉 3 ventes de test créées avec succès!")
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_simple_test_sales()
