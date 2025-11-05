# Generated manually for performance optimization

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
        ('products', '0008_alter_imageproduit_image'),
        ('users', '0004_remove_utilisateurpersonnalise_entreprise_id_and_more'),
        ('sales', '0002_remove_devis_cree_par_remove_devis_modifie_par_and_more'),
        ('customers', '0002_remove_campagnemarketing_cree_par_and_more'),
        ('companies', '0003_alter_entreprise_plan_abonnement_and_more'),
    ]

    operations = [
        # === INDEX POUR LES PRODUITS ===
        # Index pour les recherches fréquentes par nom et description
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_produit_nom_search ON products_produit USING gin(to_tsvector('french', nom || ' ' || coalesce(description_courte, '')));",
            reverse_sql="DROP INDEX IF EXISTS idx_produit_nom_search;"
        ),
        
        # Index pour les recherches par prix (range queries)
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_produit_prix_range ON products_produit (prix_vente, prix_promotion) WHERE statut = 'actif';",
            reverse_sql="DROP INDEX IF EXISTS idx_produit_prix_range;"
        ),
        
        # Index pour les produits visibles dans le catalogue
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_produit_catalogue ON products_produit (visible_catalogue, statut, date_creation DESC) WHERE visible_catalogue = true AND statut = 'actif';",
            reverse_sql="DROP INDEX IF EXISTS idx_produit_catalogue;"
        ),
        
        # Index pour les produits en promotion avec dates
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_produit_promotion_dates ON products_produit (en_promotion, date_debut_promotion, date_fin_promotion) WHERE en_promotion = true;",
            reverse_sql="DROP INDEX IF EXISTS idx_produit_promotion_dates;"
        ),
        
        # Index pour les recherches par stock
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_produit_stock ON products_produit (stock, statut) WHERE stock <= 10;",
            reverse_sql="DROP INDEX IF EXISTS idx_produit_stock;"
        ),
        
        # === INDEX POUR LES UTILISATEURS ===
        # Index pour les recherches par email (très fréquent)
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_user_email_lower ON users_utilisateurpersonnalise (lower(email));",
            reverse_sql="DROP INDEX IF EXISTS idx_user_email_lower;"
        ),
        
        # Index pour les recherches par téléphone
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_user_telephone ON users_utilisateurpersonnalise (telephone) WHERE telephone IS NOT NULL AND telephone != '';",
            reverse_sql="DROP INDEX IF EXISTS idx_user_telephone;"
        ),
        
        # Index pour les utilisateurs actifs par entreprise
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_user_entreprise_actif ON users_utilisateurpersonnalise (entreprise_id, is_active, statut) WHERE is_active = true AND statut = 'actif';",
            reverse_sql="DROP INDEX IF EXISTS idx_user_entreprise_actif;"
        ),
        
        # Index pour les connexions récentes
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_user_last_login ON users_utilisateurpersonnalise (date_derniere_connexion DESC) WHERE date_derniere_connexion IS NOT NULL;",
            reverse_sql="DROP INDEX IF EXISTS idx_user_last_login;"
        ),
        
        # === INDEX POUR LES VENTES ===
        # Index pour les ventes par période (très fréquent dans les rapports)
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_vente_periode ON sales_vente (date_creation, statut, total_ttc) WHERE statut IN ('confirmee', 'terminee');",
            reverse_sql="DROP INDEX IF EXISTS idx_vente_periode;"
        ),
        
        # Index pour les ventes par mode de paiement
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_vente_paiement ON sales_vente (mode_paiement, statut_paiement, date_creation) WHERE statut_paiement = 'completed';",
            reverse_sql="DROP INDEX IF EXISTS idx_vente_paiement;"
        ),
        
        # Index pour les ventes par client (historique client)
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_vente_client_historique ON sales_vente (client_id, date_creation DESC, total_ttc);",
            reverse_sql="DROP INDEX IF EXISTS idx_vente_client_historique;"
        ),
        
        # === INDEX POUR LES CLIENTS ===
        # Index pour les recherches par email client
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_client_email_lower ON customers_client (lower(email));",
            reverse_sql="DROP INDEX IF EXISTS idx_client_email_lower;"
        ),
        
        # Index pour les recherches par téléphone client
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_client_telephone ON customers_client (telephone) WHERE telephone IS NOT NULL AND telephone != '';",
            reverse_sql="DROP INDEX IF EXISTS idx_client_telephone;"
        ),
        
        # Index pour les clients par segment et fidélité
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_client_segment ON customers_client (segment, score_fidelite DESC, total_achats DESC);",
            reverse_sql="DROP INDEX IF EXISTS idx_client_segment;"
        ),
        
        # Index pour les clients par entrepreneur et activité
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_client_entrepreneur_actif ON customers_client (entrepreneur_id, statut, date_derniere_commande DESC) WHERE statut = 'actif';",
            reverse_sql="DROP INDEX IF EXISTS idx_client_entrepreneur_actif;"
        ),
        
        # === INDEX POUR LES ENTREPRISES ===
        # Index pour les entreprises par secteur et statut
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_entreprise_secteur ON companies_entreprise (secteur_activite, statut, ville) WHERE statut = 'actif';",
            reverse_sql="DROP INDEX IF EXISTS idx_entreprise_secteur;"
        ),
        
        # Index pour les recherches par SIRET
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_entreprise_siret ON companies_entreprise (siret) WHERE siret IS NOT NULL AND siret != '';",
            reverse_sql="DROP INDEX IF EXISTS idx_entreprise_siret;"
        ),
        
        # === INDEX POUR LES CATÉGORIES ===
        # Index pour les catégories visibles avec hiérarchie
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_categorie_hierarchie ON products_categorie (parent_id, visible, ordre_affichage) WHERE visible = true;",
            reverse_sql="DROP INDEX IF EXISTS idx_categorie_hierarchie;"
        ),
        
        # === INDEX POUR LES IMAGES DE PRODUITS ===
        # Index pour les images principales par produit
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_image_principale ON products_imageproduit (produit_id, principale, ordre_affichage) WHERE principale = true;",
            reverse_sql="DROP INDEX IF EXISTS idx_image_principale;"
        ),
        
        # === INDEX POUR LES FOURNISSEURS ===
        # Index pour les fournisseurs par évaluation
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_fournisseur_evaluation ON products_fournisseur (evaluation DESC, nombre_evaluations DESC) WHERE statut = 'actif';",
            reverse_sql="DROP INDEX IF EXISTS idx_fournisseur_evaluation;"
        ),
        
        # === INDEX POUR LES DEVIS ===
        # Index pour les devis par statut et date
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_devis_statut_date ON sales_devis (statut, date_creation DESC, date_validite);",
            reverse_sql="DROP INDEX IF EXISTS idx_devis_statut_date;"
        ),
        
        # === INDEX POUR LES INTERACTIONS CLIENT ===
        # Index pour les interactions par client et type
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_interaction_client ON customers_interactionclient (client_id, type_interaction, date_creation DESC);",
            reverse_sql="DROP INDEX IF EXISTS idx_interaction_client;"
        ),
        
        # === INDEX POUR LES SESSIONS UTILISATEUR ===
        # Index pour les sessions actives
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_session_active ON users_sessionutilisateur (utilisateur_id, derniere_activite DESC) WHERE date_fin IS NULL;",
            reverse_sql="DROP INDEX IF EXISTS idx_session_active;"
        ),
        
        # === INDEX POUR LES BUNDLES ===
        # Index pour les bundles actifs par entreprise
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_bundle_actif ON products_bundle (entreprise_id, actif, en_promotion) WHERE actif = true;",
            reverse_sql="DROP INDEX IF EXISTS idx_bundle_actif;"
        ),
        
        # === INDEX POUR LES VARIANTES DE PRODUITS ===
        # Index pour les variantes actives par produit
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_variante_active ON products_varianteproduit (produit_id, active, couleur, taille) WHERE active = true;",
            reverse_sql="DROP INDEX IF EXISTS idx_variante_active;"
        ),
        
        # === INDEX POUR LES LIGNES DE VENTE ===
        # Index pour les lignes de vente par produit (analytics)
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_ligne_vente_produit ON sales_lignevente (produit_id, date_creation DESC, quantite);",
            reverse_sql="DROP INDEX IF EXISTS idx_ligne_vente_produit;"
        ),
        
        # === INDEX POUR LES CAMPAGNES MARKETING ===
        # Index pour les campagnes par statut et date
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_campagne_statut ON customers_campagnemarketing (statut, date_envoi_prevue, entrepreneur_id);",
            reverse_sql="DROP INDEX IF EXISTS idx_campagne_statut;"
        ),
    ]
