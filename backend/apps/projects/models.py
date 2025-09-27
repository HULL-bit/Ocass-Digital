"""
Modèles pour la gestion des projets.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
from apps.core.models import BaseModel, PRIORITES


class Projet(BaseModel):
    """Projets avec gestion complète."""
    STATUT_CHOICES = [
        ('planifie', _('Planifié')),
        ('en_cours', _('En cours')),
        ('en_attente', _('En attente')),
        ('termine', _('Terminé')),
        ('annule', _('Annulé')),
        ('suspendu', _('Suspendu')),
    ]
    
    # Informations de base
    nom = models.CharField(max_length=200, verbose_name=_("Nom du projet"))
    description = models.TextField(verbose_name=_("Description"))
    code_projet = models.CharField(max_length=20, unique=True, verbose_name=_("Code projet"))
    
    # Parties prenantes
    entrepreneur = models.ForeignKey(
        'users.UtilisateurPersonnalise',
        on_delete=models.CASCADE,
        related_name='projets_entrepreneur',
        verbose_name=_("Entrepreneur")
    )
    client = models.ForeignKey(
        'customers.Client',
        on_delete=models.PROTECT,
        related_name='projets',
        verbose_name=_("Client")
    )
    responsable = models.ForeignKey(
        'users.UtilisateurPersonnalise',
        on_delete=models.PROTECT,
        related_name='projets_responsable',
        verbose_name=_("Responsable")
    )
    equipe = models.ManyToManyField(
        'users.UtilisateurPersonnalise',
        related_name='projets_equipe',
        blank=True,
        verbose_name=_("Équipe")
    )
    
    # Dates
    date_debut = models.DateField(verbose_name=_("Date de début"))
    date_fin_prevue = models.DateField(verbose_name=_("Date de fin prévue"))
    date_fin_reelle = models.DateField(null=True, blank=True, verbose_name=_("Date de fin réelle"))
    
    # Statut et priorité
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='planifie', verbose_name=_("Statut"))
    priorite = models.CharField(max_length=20, choices=PRIORITES, default='medium', verbose_name=_("Priorité"))
    
    # Budget
    budget_prevu = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name=_("Budget prévu")
    )
    budget_consomme = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name=_("Budget consommé")
    )
    
    # Marge
    marge_prevue = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name=_("Marge prévue")
    )
    marge_reelle = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name=_("Marge réelle")
    )
    
    # Progression
    pourcentage_completion = models.PositiveIntegerField(
        default=0,
        validators=[MaxValueValidator(100)],
        verbose_name=_("Pourcentage de completion")
    )
    
    # Documents
    documents = models.ManyToManyField(
        'core.Document',
        blank=True,
        verbose_name=_("Documents")
    )
    
    # Métadonnées
    notes = models.TextField(blank=True, verbose_name=_("Notes"))
    risques_identifies = models.JSONField(default=list, verbose_name=_("Risques identifiés"))
    
    class Meta:
        verbose_name = _("Projet")
        verbose_name_plural = _("Projets")
        ordering = ['-date_creation']
        indexes = [
            models.Index(fields=['entrepreneur', 'statut']),
            models.Index(fields=['client', 'statut']),
            models.Index(fields=['date_debut', 'date_fin_prevue']),
        ]
    
    def __str__(self):
        return f"{self.nom} ({self.code_projet})"
    
    @property
    def duree_prevue(self):
        """Calcule la durée prévue en jours."""
        return (self.date_fin_prevue - self.date_debut).days
    
    @property
    def duree_reelle(self):
        """Calcule la durée réelle en jours."""
        if self.date_fin_reelle:
            return (self.date_fin_reelle - self.date_debut).days
        return None
    
    @property
    def budget_restant(self):
        """Calcule le budget restant."""
        return self.budget_prevu - self.budget_consomme
    
    @property
    def est_en_retard(self):
        """Vérifie si le projet est en retard."""
        from django.utils import timezone
        if self.statut in ['termine', 'annule']:
            return False
        return timezone.now().date() > self.date_fin_prevue


class TacheProjet(BaseModel):
    """Tâches de projet avec dépendances."""
    STATUT_CHOICES = [
        ('a_faire', _('À faire')),
        ('en_cours', _('En cours')),
        ('en_attente', _('En attente')),
        ('terminee', _('Terminée')),
        ('annulee', _('Annulée')),
    ]
    
    projet = models.ForeignKey(
        Projet,
        on_delete=models.CASCADE,
        related_name='taches',
        verbose_name=_("Projet")
    )
    nom = models.CharField(max_length=200, verbose_name=_("Nom de la tâche"))
    description = models.TextField(blank=True, verbose_name=_("Description"))
    
    # Assignation
    assignee = models.ForeignKey(
        'users.UtilisateurPersonnalise',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='taches_assignees',
        verbose_name=_("Assigné à")
    )
    
    # Dates
    date_debut = models.DateTimeField(verbose_name=_("Date de début"))
    date_fin = models.DateTimeField(verbose_name=_("Date de fin"))
    date_completion = models.DateTimeField(null=True, blank=True, verbose_name=_("Date de completion"))
    
    # Statut et priorité
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='a_faire', verbose_name=_("Statut"))
    priorite = models.CharField(max_length=20, choices=PRIORITES, default='medium', verbose_name=_("Priorité"))
    
    # Temps et coût
    temps_estime = models.DurationField(verbose_name=_("Temps estimé"))
    temps_reel = models.DurationField(null=True, blank=True, verbose_name=_("Temps réel"))
    cout_prevu = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name=_("Coût prévu")
    )
    cout_reel = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name=_("Coût réel")
    )
    
    # Dépendances
    taches_prerequises = models.ManyToManyField(
        'self',
        symmetrical=False,
        blank=True,
        verbose_name=_("Tâches prérequises")
    )
    
    # Progression
    pourcentage_completion = models.PositiveIntegerField(
        default=0,
        validators=[MaxValueValidator(100)],
        verbose_name=_("Pourcentage de completion")
    )
    
    class Meta:
        verbose_name = _("Tâche de projet")
        verbose_name_plural = _("Tâches de projet")
        ordering = ['date_debut']
        indexes = [
            models.Index(fields=['projet', 'statut']),
            models.Index(fields=['assignee', 'statut']),
            models.Index(fields=['date_debut', 'date_fin']),
        ]
    
    def __str__(self):
        return f"{self.nom} - {self.projet.nom}"