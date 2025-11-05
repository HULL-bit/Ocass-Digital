#!/usr/bin/env python3
"""
Script de test pour créer des ventes de test dans la base de données.
"""
import os
import sys
import django
from datetime import datetime, timedelta
from decimal import Decimal

# Configuration Django
sys.path.append('/home/suleimaan/Téléchargements/Mm/project/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.sales.models import Vente, LigneVente
from apps.products.models import Produit
from apps.customers.models import Client
from apps.users.models import UtilisateurPersonnalise

def create_test_sales():
    """Créer des ventes de test pour vérifier les métriques."""
    
    print("🔍 Recherche des données existantes...")
    
    # Récupérer un entrepreneur
    entrepreneur = UtilisateurPersonnalise.objects.filter(type_utilisateur='entrepreneur').first()
    if not entrepreneur:
        print("❌ Aucun entrepreneur trouvé. Créez d'abord un utilisateur entrepreneur.")
        return
    
    print(f"✅ Entrepreneur trouvé: {entrepreneur.get_full_name()}")
    
    # Récupérer un client
    client = Client.objects.first()
    if not client:
        print("❌ Aucun client trouvé. Créez d'abord un client.")
        return
    
    print(f"✅ Client trouvé: {client.nom}")
    
    # Récupérer des produits
    produits = Produit.objects.filter(entreprise=entrepreneur.entreprise)[:3]
    if not produits:
        print("❌ Aucun produit trouvé. Créez d'abord des produits.")
        return
    
    print(f"✅ {len(produits)} produit(s) trouvé(s)")
    
    # Créer des ventes de test pour différents mois
    now = datetime.now()
    
    # Ventes du mois actuel
    print("\n📅 Création des ventes du mois actuel...")
    for i in range(3):
        vente = Vente.objects.create(
            client=client,
            entrepreneur=entrepreneur,
            vendeur=entrepreneur,
            sous_total=Decimal('10000.00'),
            taxe_montant=Decimal('1800.00'),
            total_ttc=Decimal('11800.00'),
            mode_paiement='cash',
            statut_paiement='paid',
            source_vente='pos',
            notes=f'Vente de test {i+1} - Mois actuel'
        )
        
        # Ajouter une ligne de vente
        produit = produits[i % len(produits)]
        LigneVente.objects.create(
            vente=vente,
            produit=produit,
            quantite=1,
            prix_unitaire=Decimal('10000.00'),
            remise_pourcentage=Decimal('0.00'),
            tva_taux=Decimal('18.00')
        )
        
        print(f"✅ Vente créée: {vente.numero_facture} - {vente.total_ttc} XOF")
    
    # Ventes du mois précédent
    print("\n📅 Création des ventes du mois précédent...")
    last_month = now - timedelta(days=30)
    for i in range(2):
        vente = Vente.objects.create(
            client=client,
            entrepreneur=entrepreneur,
            vendeur=entrepreneur,
            sous_total=Decimal('15000.00'),
            taxe_montant=Decimal('2700.00'),
            total_ttc=Decimal('17700.00'),
            mode_paiement='wave',
            statut_paiement='paid',
            source_vente='pos',
            notes=f'Vente de test {i+1} - Mois précédent',
            date_creation=last_month
        )
        
        # Ajouter une ligne de vente
        produit = produits[i % len(produits)]
        LigneVente.objects.create(
            vente=vente,
            produit=produit,
            quantite=2,
            prix_unitaire=Decimal('7500.00'),
            remise_pourcentage=Decimal('0.00'),
            tva_taux=Decimal('18.00')
        )
        
        print(f"✅ Vente créée: {vente.numero_facture} - {vente.total_ttc} XOF")
    
    # Vente en attente
    print("\n⏳ Création d'une vente en attente...")
    vente_pending = Vente.objects.create(
        client=client,
        entrepreneur=entrepreneur,
        vendeur=entrepreneur,
        sous_total=Decimal('20000.00'),
        taxe_montant=Decimal('3600.00'),
        total_ttc=Decimal('23600.00'),
        mode_paiement='virement',
        statut_paiement='pending',
        source_vente='pos',
        notes='Vente en attente de paiement'
    )
    
    # Ajouter une ligne de vente
    produit = produits[0]
    LigneVente.objects.create(
        vente=vente_pending,
        produit=produit,
        quantite=1,
        prix_unitaire=Decimal('20000.00'),
        remise_pourcentage=Decimal('0.00'),
        tva_taux=Decimal('18.00')
    )
    
    print(f"✅ Vente en attente créée: {vente_pending.numero_facture} - {vente_pending.total_ttc} XOF")
    
    # Résumé
    print("\n📊 Résumé des ventes créées:")
    total_ventes = Vente.objects.filter(entrepreneur=entrepreneur).count()
    ventes_mois = Vente.objects.filter(
        entrepreneur=entrepreneur,
        date_creation__gte=datetime.now().replace(day=1)
    ).count()
    ventes_pending = Vente.objects.filter(
        entrepreneur=entrepreneur,
        statut_paiement='pending'
    ).count()
    
    print(f"   - Total des ventes: {total_ventes}")
    print(f"   - Ventes du mois: {ventes_mois}")
    print(f"   - Ventes en attente: {ventes_pending}")
    
    print("\n🎉 Ventes de test créées avec succès!")
    print("   Vous pouvez maintenant tester la page de facturation.")

if __name__ == '__main__':
    create_test_sales()
