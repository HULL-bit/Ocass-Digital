#!/usr/bin/env python3
"""
Script pour créer des ventes de test pour vérifier le système de facturation.
"""

import os
import sys
import django
from decimal import Decimal
from datetime import datetime, timedelta
import random

# Configuration Django
sys.path.append('/home/suleimaan/Téléchargements/Mm/project/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.users.models import User
from apps.companies.models import Entreprise
from apps.customers.models import Client
from apps.products.models import Produit
from apps.sales.models import Vente, LigneVente

def create_test_sales():
    """Créer des ventes de test avec différents statuts."""
    
    print("🛒 Création de ventes de test...")
    
    # Récupérer les données nécessaires
    try:
        # Entrepreneurs
        entrepreneurs = User.objects.filter(type_utilisateur='entrepreneur')[:3]
        if not entrepreneurs.exists():
            print("❌ Aucun entrepreneur trouvé")
            return
        
        # Clients
        clients = Client.objects.all()[:5]
        if not clients.exists():
            print("❌ Aucun client trouvé")
            return
            
        # Produits
        produits = Produit.objects.filter(statut='actif')[:10]
        if not produits.exists():
            print("❌ Aucun produit trouvé")
            return
            
        print(f"✅ Trouvé {entrepreneurs.count()} entrepreneurs, {clients.count()} clients, {produits.count()} produits")
        
    except Exception as e:
        print(f"❌ Erreur lors de la récupération des données: {e}")
        return
    
    # Créer des ventes de test
    ventes_creees = 0
    
    for i in range(15):  # Créer 15 ventes de test
        try:
            # Sélectionner aléatoirement
            entrepreneur = random.choice(entrepreneurs)
            client = random.choice(clients)
            
            # Créer la vente
            vente = Vente.objects.create(
                client=client,
                entrepreneur=entrepreneur,
                vendeur=entrepreneur,
                sous_total=Decimal('0.00'),
                taxe_montant=Decimal('0.00'),
                remise_montant=Decimal('0.00'),
                total_ttc=Decimal('0.00'),
                mode_paiement=random.choice(['especes', 'carte', 'mobile_money', 'virement']),
                statut_paiement=random.choice(['paid', 'pending']),
                source_vente='pos',
                notes=f"Vente de test #{i+1} - {datetime.now().strftime('%d/%m/%Y %H:%M')}"
            )
            
            # Ajouter des lignes de vente
            nb_lignes = random.randint(1, 4)
            produits_vente = random.sample(list(produits), min(nb_lignes, len(produits)))
            
            sous_total = Decimal('0.00')
            
            for produit in produits_vente:
                quantite = random.randint(1, 5)
                prix_unitaire = Decimal(str(random.randint(100, 5000)))
                remise_pourcentage = Decimal(str(random.randint(0, 20)))
                
                ligne = LigneVente.objects.create(
                    vente=vente,
                    produit=produit,
                    quantite=quantite,
                    prix_unitaire=prix_unitaire,
                    remise_pourcentage=remise_pourcentage
                )
                
                # Calculer les totaux
                total_ht_ligne = ligne.total_ht
                sous_total += total_ht_ligne
            
            # Mettre à jour les totaux de la vente
            vente.sous_total = sous_total
            vente.taxe_montant = sous_total * Decimal('0.18')  # TVA 18%
            vente.total_ttc = vente.sous_total + vente.taxe_montant - vente.remise_montant
            vente.save()
            
            ventes_creees += 1
            print(f"✅ Vente créée: {vente.numero_facture} - {vente.total_ttc} XOF")
            
        except Exception as e:
            print(f"❌ Erreur lors de la création de la vente {i+1}: {e}")
            continue
    
    print(f"\n🎉 {ventes_creees} ventes de test créées avec succès!")
    
    # Afficher un résumé
    print("\n📊 Résumé des ventes créées:")
    ventes_recentes = Vente.objects.filter(notes__contains="Vente de test").order_by('-date_creation')[:5]
    
    for vente in ventes_recentes:
        statut_emoji = "✅" if vente.statut_paiement == 'paid' else "⏳"
        print(f"  {statut_emoji} {vente.numero_facture} - {vente.client.nom} - {vente.total_ttc} XOF - {vente.get_statut_paiement_display()}")

if __name__ == "__main__":
    create_test_sales()
