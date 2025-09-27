"""
Modèles pour la gestion des entreprises.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.core.models import BaseModel, SECTEURS_ACTIVITE, STATUTS_GENERIQUES, DEVISES, FUSEAUX_HORAIRES


class PlanAbonnement(BaseModel):
    """Plans d'abonnement pour les entreprises."""
    nom = models.CharField(max_length=100, verbose_name=_("Nom du plan"))
    description = models.TextField(verbose_name=_("Description"))
    prix_mensuel = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_("Prix mensuel"))
    prix_annuel = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_("Prix annuel"))
    devise = models.CharField(max_length=3, choices=DEVISES, default='XOF', verbose_name=_("Devise"))
    
    # Limites
    max_utilisateurs = models.PositiveIntegerField(verbose_name=_("Nombre max d'utilisateurs"))
    max_produits = models.PositiveIntegerField(verbose_name=_("Nombre max de produits"))
    max_ventes_mensuelles = models.PositiveIntegerField(verbose_name=_("Nombre max de ventes mensuelles"))
    stockage_gb = models.PositiveIntegerField(verbose_name=_("Stockage en GB"))
    
    # Fonctionnalités
    fonctionnalites = models.JSONField(default=dict, verbose_name=_("Fonctionnalités incluses"))
    
    # Métadonnées
    populaire = models.BooleanField(default=False, verbose_name=_("Plan populaire"))
    ordre_affichage = models.PositiveIntegerField(default=0, verbose_name=_("Ordre d'affichage"))
    
    class Meta:
        verbose_name = _("Plan d'abonnement")
        verbose_name_plural = _("Plans d'abonnement")
        ordering = ['ordre_affichage', 'prix_mensuel']
    
    def __str__(self):
        return f"{self.nom} - {self.prix_mensuel} {self.devise}/mois"


class Entreprise(BaseModel):
    """Modèle entreprise ultra-complet."""
    # Informations de base
    nom = models.CharField(max_length=200, verbose_name=_("Nom de l'entreprise"))
    nom_commercial = models.CharField(max_length=200, blank=True, verbose_name=_("Nom commercial"))
    secteur_activite = models.CharField(
        max_length=50, 
        choices=SECTEURS_ACTIVITE, 
        verbose_name=_("Secteur d'activité")
    )
    description = models.TextField(blank=True, verbose_name=_("Description"))
    
    # Coordonnées
    telephone = models.CharField(max_length=20, verbose_name=_("Téléphone"))
    email = models.EmailField(verbose_name=_("Email"))
    site_web = models.URLField(blank=True, verbose_name=_("Site web"))
    
    # Adresse
    adresse_complete = models.TextField(verbose_name=_("Adresse complète"))
    ville = models.CharField(max_length=100, verbose_name=_("Ville"))
    region = models.CharField(max_length=100, verbose_name=_("Région"))
    pays = models.CharField(max_length=100, default='Sénégal', verbose_name=_("Pays"))
    code_postal = models.CharField(max_length=20, blank=True, verbose_name=_("Code postal"))
    
    # Informations légales
    siret = models.CharField(max_length=50, unique=True, blank=True, verbose_name=_("SIRET/NINEA"))
    tva_intracommunautaire = models.CharField(max_length=50, blank=True, verbose_name=_("TVA intracommunautaire"))
    forme_juridique = models.CharField(
        max_length=50,
        choices=[
            ('sarl', _('SARL')),
            ('sa', _('SA')),
            ('sas', _('SAS')),
            ('eurl', _('EURL')),
            ('ei', _('Entreprise Individuelle')),
            ('auto_entrepreneur', _('Auto-entrepreneur')),
            ('association', _('Association')),
            ('autre', _('Autre')),
        ],
        blank=True,
        verbose_name=_("Forme juridique")
    )
    
    # Branding
    logo = models.ImageField(upload_to='entreprises/logos/', blank=True, verbose_name=_("Logo"))
    couleur_primaire = models.CharField(max_length=7, default='#3B82F6', verbose_name=_("Couleur primaire"))
    couleur_secondaire = models.CharField(max_length=7, default='#10B981', verbose_name=_("Couleur secondaire"))
    
    # Configuration
    devise_principale = models.CharField(max_length=3, choices=DEVISES, default='XOF', verbose_name=_("Devise principale"))
    fuseau_horaire = models.CharField(max_length=50, choices=FUSEAUX_HORAIRES, default='Africa/Dakar', verbose_name=_("Fuseau horaire"))
    
    # Abonnement
    plan_abonnement = models.ForeignKey(
        PlanAbonnement,
        on_delete=models.PROTECT,
        verbose_name=_("Plan d'abonnement")
    )
    date_debut_abonnement = models.DateTimeField(auto_now_add=True, verbose_name=_("Début d'abonnement"))
    date_fin_abonnement = models.DateTimeField(null=True, blank=True, verbose_name=_("Fin d'abonnement"))
    
    # Statut
    statut = models.CharField(max_length=20, choices=STATUTS_GENERIQUES, default='actif', verbose_name=_("Statut"))
    
    # Métriques
    nombre_employes = models.PositiveIntegerField(default=1, verbose_name=_("Nombre d'employés"))
    chiffre_affaires_annuel = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        null=True, 
        blank=True,
        verbose_name=_("Chiffre d'affaires annuel")
    )
    
    # Préférences
    preferences = models.JSONField(default=dict, verbose_name=_("Préférences"))
    
    class Meta:
        verbose_name = _("Entreprise")
        verbose_name_plural = _("Entreprises")
        indexes = [
            models.Index(fields=['secteur_activite', 'statut']),
            models.Index(fields=['ville', 'region']),
        ]
    
    def __str__(self):
        return self.nom