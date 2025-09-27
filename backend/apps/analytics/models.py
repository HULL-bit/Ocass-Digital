"""
Modèles pour analytics et business intelligence.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from decimal import Decimal
from apps.core.models import BaseModel


class MetriquePerformance(BaseModel):
    """Métriques de performance calculées."""
    TYPE_METRIQUE_CHOICES = [
        ('ventes_jour', _('Ventes du jour')),
        ('ventes_semaine', _('Ventes de la semaine')),
        ('ventes_mois', _('Ventes du mois')),
        ('clients_actifs', _('Clients actifs')),
        ('produits_populaires', _('Produits populaires')),
        ('marge_moyenne', _('Marge moyenne')),
        ('taux_conversion', _('Taux de conversion')),
        ('panier_moyen', _('Panier moyen')),
    ]
    
    # Identification
    type_metrique = models.CharField(
        max_length=30,
        choices=TYPE_METRIQUE_CHOICES,
        verbose_name=_("Type de métrique")
    )
    
    # Scope
    entrepreneur = models.ForeignKey(
        'users.UtilisateurPersonnalise',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name=_("Entrepreneur")
    )
    entreprise = models.ForeignKey(
        'companies.Entreprise',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name=_("Entreprise")
    )
    
    # Valeurs
    valeur_numerique = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_("Valeur numérique")
    )
    valeur_pourcentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_("Valeur pourcentage")
    )
    valeur_json = models.JSONField(
        null=True,
        blank=True,
        verbose_name=_("Valeur JSON")
    )
    
    # Période
    date_debut = models.DateField(verbose_name=_("Date de début"))
    date_fin = models.DateField(verbose_name=_("Date de fin"))
    
    # Comparaison
    valeur_precedente = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_("Valeur précédente")
    )
    evolution_pourcentage = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_("Évolution (%)")
    )
    
    class Meta:
        verbose_name = _("Métrique de performance")
        verbose_name_plural = _("Métriques de performance")
        unique_together = ['type_metrique', 'entrepreneur', 'date_debut', 'date_fin']
        ordering = ['-date_creation']
    
    def __str__(self):
        return f"{self.get_type_metrique_display()} - {self.date_debut}"


class RapportPersonnalise(BaseModel):
    """Rapports personnalisés avec builder visuel."""
    TYPE_RAPPORT_CHOICES = [
        ('ventes', _('Ventes')),
        ('stock', _('Stock')),
        ('clients', _('Clients')),
        ('financier', _('Financier')),
        ('projets', _('Projets')),
        ('performance', _('Performance')),
        ('marketing', _('Marketing')),
    ]
    
    FREQUENCE_CHOICES = [
        ('manuel', _('Manuel')),
        ('quotidien', _('Quotidien')),
        ('hebdomadaire', _('Hebdomadaire')),
        ('mensuel', _('Mensuel')),
        ('trimestriel', _('Trimestriel')),
        ('annuel', _('Annuel')),
    ]
    
    # Informations de base
    nom = models.CharField(max_length=200, verbose_name=_("Nom"))
    description = models.TextField(blank=True, verbose_name=_("Description"))
    type_rapport = models.CharField(
        max_length=20,
        choices=TYPE_RAPPORT_CHOICES,
        verbose_name=_("Type de rapport")
    )
    
    # Propriétaire
    utilisateur = models.ForeignKey(
        'users.UtilisateurPersonnalise',
        on_delete=models.CASCADE,
        related_name='rapports',
        verbose_name=_("Utilisateur")
    )
    
    # Configuration
    configuration = models.JSONField(
        default=dict,
        help_text=_("Configuration du rapport (filtres, colonnes, etc.)"),
        verbose_name=_("Configuration")
    )
    
    # Planification
    frequence = models.CharField(
        max_length=20,
        choices=FREQUENCE_CHOICES,
        default='manuel',
        verbose_name=_("Fréquence")
    )
    planification = models.JSONField(
        default=dict,
        help_text=_("Configuration de la planification"),
        verbose_name=_("Planification")
    )
    
    # Exécution
    derniere_execution = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Dernière exécution")
    )
    prochaine_execution = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Prochaine exécution")
    )
    
    # Statut
    actif = models.BooleanField(default=True, verbose_name=_("Actif"))
    
    # Partage
    partage = models.JSONField(
        default=dict,
        help_text=_("Configuration du partage"),
        verbose_name=_("Partage")
    )
    
    class Meta:
        verbose_name = _("Rapport personnalisé")
        verbose_name_plural = _("Rapports personnalisés")
        ordering = ['-date_creation']
    
    def __str__(self):
        return self.nom


class ExecutionRapport(BaseModel):
    """Exécutions de rapports."""
    STATUT_CHOICES = [
        ('en_cours', _('En cours')),
        ('termine', _('Terminé')),
        ('erreur', _('Erreur')),
        ('annule', _('Annulé')),
    ]
    
    rapport = models.ForeignKey(
        RapportPersonnalise,
        on_delete=models.CASCADE,
        related_name='executions',
        verbose_name=_("Rapport")
    )
    
    # Exécution
    date_debut = models.DateTimeField(auto_now_add=True, verbose_name=_("Date de début"))
    date_fin = models.DateTimeField(null=True, blank=True, verbose_name=_("Date de fin"))
    duree = models.DurationField(null=True, blank=True, verbose_name=_("Durée"))
    
    # Statut
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='en_cours',
        verbose_name=_("Statut")
    )
    
    # Résultats
    nombre_lignes = models.PositiveIntegerField(default=0, verbose_name=_("Nombre de lignes"))
    taille_fichier = models.PositiveIntegerField(default=0, verbose_name=_("Taille du fichier"))
    chemin_fichier = models.CharField(max_length=500, blank=True, verbose_name=_("Chemin du fichier"))
    
    # Erreurs
    message_erreur = models.TextField(blank=True, verbose_name=_("Message d'erreur"))
    
    class Meta:
        verbose_name = _("Exécution rapport")
        verbose_name_plural = _("Exécutions rapport")
        ordering = ['-date_creation']
    
    def __str__(self):
        return f"Exécution {self.rapport.nom} - {self.date_debut}"


class Sauvegarde(BaseModel):
    """Sauvegardes automatiques du système."""
    TYPE_SAUVEGARDE_CHOICES = [
        ('complete', _('Complète')),
        ('incrementale', _('Incrémentale')),
        ('differentielle', _('Différentielle')),
        ('donnees_seules', _('Données seules')),
        ('configuration', _('Configuration')),
    ]
    
    STATUT_CHOICES = [
        ('en_cours', _('En cours')),
        ('terminee', _('Terminée')),
        ('erreur', _('Erreur')),
        ('corrompue', _('Corrompue')),
    ]
    
    # Identification
    nom_fichier = models.CharField(max_length=255, verbose_name=_("Nom du fichier"))
    type_sauvegarde = models.CharField(
        max_length=20,
        choices=TYPE_SAUVEGARDE_CHOICES,
        verbose_name=_("Type de sauvegarde")
    )
    
    # Fichier
    chemin_fichier = models.CharField(max_length=500, verbose_name=_("Chemin du fichier"))
    taille_fichier = models.BigIntegerField(verbose_name=_("Taille du fichier"))
    checksum = models.CharField(max_length=64, verbose_name=_("Checksum"))
    
    # Dates
    date_debut = models.DateTimeField(auto_now_add=True, verbose_name=_("Date de début"))
    date_fin = models.DateTimeField(null=True, blank=True, verbose_name=_("Date de fin"))
    duree = models.DurationField(null=True, blank=True, verbose_name=_("Durée"))
    
    # Statut
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='en_cours',
        verbose_name=_("Statut")
    )
    
    # Métadonnées
    entreprise = models.ForeignKey(
        'companies.Entreprise',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name=_("Entreprise")
    )
    automatique = models.BooleanField(default=True, verbose_name=_("Automatique"))
    
    # Restauration
    restaurable = models.BooleanField(default=True, verbose_name=_("Restaurable"))
    date_expiration = models.DateTimeField(null=True, blank=True, verbose_name=_("Date d'expiration"))
    
    class Meta:
        verbose_name = _("Sauvegarde")
        verbose_name_plural = _("Sauvegardes")
        ordering = ['-date_creation']
        indexes = [
            models.Index(fields=['entreprise', 'type_sauvegarde']),
            models.Index(fields=['statut', 'date_creation']),
        ]
    
    def __str__(self):
        return f"Sauvegarde {self.nom_fichier} - {self.date_creation.date()}"