#!/usr/bin/env python
"""
Script pour mettre à jour les secteurs d'activité des entreprises existantes.
"""
import os
import sys
import django

# Configuration Django
sys.path.append('/home/suleimaan/Téléchargements/Mm/project/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.companies.models import Entreprise

def update_company_sectors():
    """Mettre à jour les secteurs d'activité des entreprises existantes."""
    print("🏢 MISE À JOUR DES SECTEURS D'ACTIVITÉ")
    print("=" * 50)
    
    # Mapping des anciens secteurs vers les nouveaux
    sector_mapping = {
        'commerce': 'commerce_general',
        'services': 'commerce_general',  # Rediriger vers commerce général
        'industrie': 'commerce_general',
        'agriculture': 'commerce_alimentaire',
        'technologie': 'commerce_electronique',
        'sante': 'commerce_pharmaceutique',
        'education': 'commerce_general',
        'transport': 'commerce_automobile',
        'immobilier': 'commerce_immobilier',
        'finance': 'commerce_general',
        'tourisme': 'commerce_general',
        'artisanat': 'commerce_artisanat',
        'autre': 'autre'
    }
    
    updated_count = 0
    
    for entreprise in Entreprise.objects.all():
        old_sector = entreprise.secteur_activite
        new_sector = sector_mapping.get(old_sector, 'commerce_general')
        
        if old_sector != new_sector:
            entreprise.secteur_activite = new_sector
            entreprise.save()
            updated_count += 1
            print(f"✅ {entreprise.nom}: {old_sector} → {new_sector}")
        else:
            print(f"ℹ️ {entreprise.nom}: {old_sector} (déjà correct)")
    
    print(f"\n📊 Résumé: {updated_count} entreprises mises à jour")
    print(f"📊 Total: {Entreprise.objects.count()} entreprises au total")
    
    # Afficher la répartition par secteur
    print("\n📈 RÉPARTITION PAR SECTEUR:")
    from django.db.models import Count
    sectors = Entreprise.objects.values('secteur_activite').annotate(count=Count('secteur_activite')).order_by('-count')
    
    for sector in sectors:
        print(f"  {sector['secteur_activite']}: {sector['count']} entreprises")

if __name__ == '__main__':
    update_company_sectors()

