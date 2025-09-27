#!/usr/bin/env python
"""
Script de test final pour vérifier toutes les fonctionnalités.
"""
import os
import sys
import django

# Configuration Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from apps.companies.models import Entreprise
from apps.products.models import Produit, Categorie, Marque

User = get_user_model()

def test_products_display():
    """Tester l'affichage des produits."""
    print("📦 Test d'affichage des produits...")
    
    # Récupérer tous les produits
    produits = Produit.objects.all()
    print(f"✅ {produits.count()} produits trouvés")
    
    for produit in produits[:5]:  # Afficher les 5 premiers
        print(f"  📦 {produit.nom}")
        print(f"     SKU: {produit.sku}")
        print(f"     Prix: {produit.prix_vente} XOF")
        print(f"     Entreprise: {produit.entreprise.nom if produit.entreprise else 'Aucune'}")
        print(f"     QR Code: {'✅' if produit.qr_code else '❌'}")
        print()

def test_categories_display():
    """Tester l'affichage des catégories."""
    print("📂 Test d'affichage des catégories...")
    
    categories = Categorie.objects.all()
    print(f"✅ {categories.count()} catégories trouvées")
    
    for categorie in categories[:3]:
        print(f"  📂 {categorie.nom}")
        print(f"     Slug: {categorie.slug}")
        print(f"     Produits: {categorie.produits.count()}")
        print()

def test_marques_display():
    """Tester l'affichage des marques."""
    print("🏷️ Test d'affichage des marques...")
    
    marques = Marque.objects.all()
    print(f"✅ {marques.count()} marques trouvées")
    
    for marque in marques[:3]:
        print(f"  🏷️ {marque.nom}")
        print(f"     Pays: {marque.pays_origine}")
        print()

def test_entreprises_display():
    """Tester l'affichage des entreprises."""
    print("🏢 Test d'affichage des entreprises...")
    
    entreprises = Entreprise.objects.all()
    print(f"✅ {entreprises.count()} entreprises trouvées")
    
    for entreprise in entreprises:
        print(f"  🏢 {entreprise.nom}")
        print(f"     Secteur: {entreprise.secteur_activite}")
        print(f"     Utilisateurs: {User.objects.filter(entreprise_id=entreprise.id).count()}")
        print()

def test_users_display():
    """Tester l'affichage des utilisateurs."""
    print("👥 Test d'affichage des utilisateurs...")
    
    users = User.objects.all()
    print(f"✅ {users.count()} utilisateurs trouvés")
    
    for user in users[:5]:
        print(f"  👤 {user.email}")
        print(f"     Type: {user.type_utilisateur}")
        print(f"     Entreprise: {user.entreprise.nom if hasattr(user, 'entreprise') and user.entreprise else 'Aucune'}")
        print(f"     Actif: {'✅' if user.is_active else '❌'}")
        print()

def main():
    """Fonction principale."""
    print("🚀 Test final de toutes les fonctionnalités...")
    print("=" * 50)
    
    test_products_display()
    print("-" * 30)
    
    test_categories_display()
    print("-" * 30)
    
    test_marques_display()
    print("-" * 30)
    
    test_entreprises_display()
    print("-" * 30)
    
    test_users_display()
    print("-" * 30)
    
    print("✅ Tests terminés !")
    print("\n🔐 Comptes de test disponibles:")
    print("   👑 Admin: admin4@platform.com / admin123")
    print("   💼 Entrepreneur: marie@boutiquemarie.sn / password")
    print("   🛍️ Client: client2@example.com / password")
    print("\n🌐 URLs:")
    print("   Frontend: http://localhost:5173")
    print("   Backend: http://localhost:8000/api/v1/")

if __name__ == '__main__':
    main()
