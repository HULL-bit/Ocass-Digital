"""
Modèles pour la gamification et engagement utilisateur.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.core.models import BaseModel


class Badge(BaseModel):
    """Badges pour gamification."""
    nom = models.CharField(max_length=100, unique=True, verbose_name=_("Nom"))
    description = models.TextField(verbose_name=_("Description"))
    icone = models.CharField(max_length=50, verbose_name=_("Icône"))
    couleur = models.CharField(max_length=7, default='#3B82F6', verbose_name=_("Couleur"))
    
    # Conditions d'obtention
    conditions = models.JSONField(
        default=dict,
        help_text=_("Conditions pour obtenir le badge"),
        verbose_name=_("Conditions")
    )
    
    # Récompenses
    points_bonus = models.PositiveIntegerField(default=0, verbose_name=_("Points bonus"))
    
    # Métadonnées
    rare = models.BooleanField(default=False, verbose_name=_("Badge rare"))
    actif = models.BooleanField(default=True, verbose_name=_("Actif"))
    ordre_affichage = models.PositiveIntegerField(default=0, verbose_name=_("Ordre d'affichage"))
    
    class Meta:
        verbose_name = _("Badge")
        verbose_name_plural = _("Badges")
        ordering = ['ordre_affichage', 'nom']
    
    def __str__(self):
        return self.nom


class UtilisateurBadge(BaseModel):
    """Association utilisateur-badge."""
    utilisateur = models.ForeignKey(
        'users.UtilisateurPersonnalise',
        on_delete=models.CASCADE,
        verbose_name=_("Utilisateur")
    )
    badge = models.ForeignKey(
        Badge,
        on_delete=models.CASCADE,
        verbose_name=_("Badge")
    )
    
    # Obtention
    date_obtention = models.DateTimeField(auto_now_add=True, verbose_name=_("Date d'obtention"))
    raison = models.TextField(blank=True, verbose_name=_("Raison d'obtention"))
    
    # Métadonnées
    visible = models.BooleanField(default=True, verbose_name=_("Visible sur le profil"))
    
    class Meta:
        verbose_name = _("Badge utilisateur")
        verbose_name_plural = _("Badges utilisateur")
        unique_together = ['utilisateur', 'badge']
        ordering = ['-date_obtention']
    
    def __str__(self):
        return f"{self.utilisateur} - {self.badge.nom}"


class Defi(BaseModel):
    """Défis pour engagement utilisateur."""
    STATUT_CHOICES = [
        ('actif', _('Actif')),
        ('termine', _('Terminé')),
        ('suspendu', _('Suspendu')),
        ('annule', _('Annulé')),
    ]
    
    TYPE_DEFI_CHOICES = [
        ('quotidien', _('Quotidien')),
        ('hebdomadaire', _('Hebdomadaire')),
        ('mensuel', _('Mensuel')),
        ('special', _('Spécial')),
        ('saisonnier', _('Saisonnier')),
    ]
    
    # Informations de base
    nom = models.CharField(max_length=200, verbose_name=_("Nom"))
    description = models.TextField(verbose_name=_("Description"))
    type_defi = models.CharField(
        max_length=20,
        choices=TYPE_DEFI_CHOICES,
        verbose_name=_("Type de défi")
    )
    
    # Objectifs
    objectif = models.JSONField(
        default=dict,
        help_text=_("Objectif à atteindre"),
        verbose_name=_("Objectif")
    )
    
    # Récompenses
    points_recompense = models.PositiveIntegerField(verbose_name=_("Points de récompense"))
    badge_recompense = models.ForeignKey(
        Badge,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_("Badge récompense")
    )
    
    # Dates
    date_debut = models.DateTimeField(verbose_name=_("Date de début"))
    date_fin = models.DateTimeField(verbose_name=_("Date de fin"))
    
    # Statut
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='actif',
        verbose_name=_("Statut")
    )
    
    # Participants
    participants = models.ManyToManyField(
        'users.UtilisateurPersonnalise',
        through='ParticipationDefi',
        through_fields=('defi', 'utilisateur'),
        verbose_name=_("Participants")
    )
    
    class Meta:
        verbose_name = _("Défi")
        verbose_name_plural = _("Défis")
        ordering = ['-date_creation']
    
    def __str__(self):
        return self.nom


class ParticipationDefi(BaseModel):
    """Participation d'un utilisateur à un défi."""
    STATUT_CHOICES = [
        ('en_cours', _('En cours')),
        ('termine', _('Terminé')),
        ('echoue', _('Échoué')),
        ('abandonne', _('Abandonné')),
    ]
    
    utilisateur = models.ForeignKey(
        'users.UtilisateurPersonnalise',
        on_delete=models.CASCADE,
        verbose_name=_("Utilisateur")
    )
    defi = models.ForeignKey(
        Defi,
        on_delete=models.CASCADE,
        verbose_name=_("Défi")
    )
    
    # Progression
    progression = models.JSONField(
        default=dict,
        verbose_name=_("Progression")
    )
    pourcentage_completion = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Pourcentage de completion")
    )
    
    # Dates
    date_inscription = models.DateTimeField(auto_now_add=True, verbose_name=_("Date d'inscription"))
    date_completion = models.DateTimeField(null=True, blank=True, verbose_name=_("Date de completion"))
    
    # Statut
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='en_cours',
        verbose_name=_("Statut")
    )
    
    # Récompense
    recompense_recue = models.BooleanField(default=False, verbose_name=_("Récompense reçue"))
    
    class Meta:
        verbose_name = _("Participation défi")
        verbose_name_plural = _("Participations défi")
        unique_together = ['utilisateur', 'defi']
        ordering = ['-date_inscription']
    
    def __str__(self):
        return f"{self.utilisateur} - {self.defi.nom}"


class Classement(BaseModel):
    """Classements pour compétition."""
    TYPE_CLASSEMENT_CHOICES = [
        ('ventes_mois', _('Ventes du mois')),
        ('points_experience', _('Points d\'expérience')),
        ('badges_obtenus', _('Badges obtenus')),
        ('projets_termines', _('Projets terminés')),
        ('satisfaction_client', _('Satisfaction client')),
    ]
    
    # Configuration
    nom = models.CharField(max_length=100, verbose_name=_("Nom"))
    type_classement = models.CharField(
        max_length=30,
        choices=TYPE_CLASSEMENT_CHOICES,
        verbose_name=_("Type de classement")
    )
    
    # Période
    date_debut = models.DateField(verbose_name=_("Date de début"))
    date_fin = models.DateField(verbose_name=_("Date de fin"))
    
    # Participants
    participants = models.ManyToManyField(
        'users.UtilisateurPersonnalise',
        through='PositionClassement',
        through_fields=('classement', 'utilisateur'),
        verbose_name=_("Participants")
    )
    
    # Récompenses
    recompenses = models.JSONField(
        default=dict,
        help_text=_("Récompenses par position"),
        verbose_name=_("Récompenses")
    )
    
    # Métadonnées
    actif = models.BooleanField(default=True, verbose_name=_("Actif"))
    public = models.BooleanField(default=True, verbose_name=_("Public"))
    
    class Meta:
        verbose_name = _("Classement")
        verbose_name_plural = _("Classements")
        ordering = ['-date_creation']
    
    def __str__(self):
        return f"{self.nom} - {self.date_debut} à {self.date_fin}"


class PositionClassement(BaseModel):
    """Position d'un utilisateur dans un classement."""
    classement = models.ForeignKey(
        Classement,
        on_delete=models.CASCADE,
        verbose_name=_("Classement")
    )
    utilisateur = models.ForeignKey(
        'users.UtilisateurPersonnalise',
        on_delete=models.CASCADE,
        verbose_name=_("Utilisateur")
    )
    
    # Position
    position = models.PositiveIntegerField(verbose_name=_("Position"))
    score = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        verbose_name=_("Score")
    )
    
    # Évolution
    position_precedente = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name=_("Position précédente")
    )
    evolution = models.IntegerField(default=0, verbose_name=_("Évolution"))
    
    class Meta:
        verbose_name = _("Position classement")
        verbose_name_plural = _("Positions classement")
        unique_together = ['classement', 'utilisateur']
        ordering = ['position']
    
    def __str__(self):
        return f"{self.utilisateur} - Position {self.position}"