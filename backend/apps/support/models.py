"""
Modèles pour le système de support client.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.core.models import BaseModel, PRIORITES


class TicketSupport(BaseModel):
    """Tickets de support client."""
    STATUT_CHOICES = [
        ('ouvert', _('Ouvert')),
        ('en_cours', _('En cours')),
        ('en_attente_client', _('En attente client')),
        ('resolu', _('Résolu')),
        ('ferme', _('Fermé')),
        ('escalade', _('Escaladé')),
    ]
    
    CATEGORIE_CHOICES = [
        ('technique', _('Technique')),
        ('facturation', _('Facturation')),
        ('produit', _('Produit')),
        ('livraison', _('Livraison')),
        ('compte', _('Compte')),
        ('autre', _('Autre')),
    ]
    
    # Identification
    numero_ticket = models.CharField(max_length=20, unique=True, verbose_name=_("Numéro de ticket"))
    
    # Demandeur
    utilisateur = models.ForeignKey(
        'users.UtilisateurPersonnalise',
        on_delete=models.CASCADE,
        related_name='tickets_crees',
        verbose_name=_("Utilisateur")
    )
    
    # Assignation
    assigne_a = models.ForeignKey(
        'users.UtilisateurPersonnalise',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tickets_assignes',
        verbose_name=_("Assigné à")
    )
    
    # Contenu
    sujet = models.CharField(max_length=200, verbose_name=_("Sujet"))
    description = models.TextField(verbose_name=_("Description"))
    categorie = models.CharField(
        max_length=20,
        choices=CATEGORIE_CHOICES,
        verbose_name=_("Catégorie")
    )
    
    # Statut et priorité
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='ouvert',
        verbose_name=_("Statut")
    )
    priorite = models.CharField(
        max_length=20,
        choices=PRIORITES,
        default='medium',
        verbose_name=_("Priorité")
    )
    
    # Dates
    date_resolution = models.DateTimeField(null=True, blank=True, verbose_name=_("Date de résolution"))
    date_fermeture = models.DateTimeField(null=True, blank=True, verbose_name=_("Date de fermeture"))
    
    # Satisfaction
    note_satisfaction = models.PositiveIntegerField(
        null=True,
        blank=True,
        choices=[(i, i) for i in range(1, 6)],
        verbose_name=_("Note de satisfaction")
    )
    commentaire_satisfaction = models.TextField(blank=True, verbose_name=_("Commentaire satisfaction"))
    
    # Métadonnées
    tags = models.JSONField(default=list, verbose_name=_("Tags"))
    temps_resolution = models.DurationField(null=True, blank=True, verbose_name=_("Temps de résolution"))
    
    class Meta:
        verbose_name = _("Ticket de support")
        verbose_name_plural = _("Tickets de support")
        ordering = ['-date_creation']
        indexes = [
            models.Index(fields=['utilisateur', 'statut']),
            models.Index(fields=['assigne_a', 'statut']),
            models.Index(fields=['priorite', 'date_creation']),
        ]
    
    def __str__(self):
        return f"Ticket {self.numero_ticket} - {self.sujet}"
    
    def save(self, *args, **kwargs):
        # Générer numéro de ticket automatiquement
        if not self.numero_ticket:
            import uuid
            self.numero_ticket = f"SUP{str(uuid.uuid4())[:8].upper()}"
        super().save(*args, **kwargs)


class ReponseTicket(BaseModel):
    """Réponses aux tickets de support."""
    ticket = models.ForeignKey(
        TicketSupport,
        on_delete=models.CASCADE,
        related_name='reponses',
        verbose_name=_("Ticket")
    )
    auteur = models.ForeignKey(
        'users.UtilisateurPersonnalise',
        on_delete=models.CASCADE,
        verbose_name=_("Auteur")
    )
    
    # Contenu
    message = models.TextField(verbose_name=_("Message"))
    
    # Type
    type_reponse = models.CharField(
        max_length=20,
        choices=[
            ('reponse', _('Réponse')),
            ('note_interne', _('Note interne')),
            ('solution', _('Solution')),
        ],
        default='reponse',
        verbose_name=_("Type de réponse")
    )
    
    # Métadonnées
    visible_client = models.BooleanField(default=True, verbose_name=_("Visible par le client"))
    
    class Meta:
        verbose_name = _("Réponse ticket")
        verbose_name_plural = _("Réponses ticket")
        ordering = ['date_creation']
    
    def __str__(self):
        return f"Réponse {self.ticket.numero_ticket} - {self.auteur}"


class BaseConnaissance(BaseModel):
    """Base de connaissances pour support."""
    titre = models.CharField(max_length=200, verbose_name=_("Titre"))
    contenu = models.TextField(verbose_name=_("Contenu"))
    contenu_html = models.TextField(blank=True, verbose_name=_("Contenu HTML"))
    
    # Classification
    categorie = models.CharField(
        max_length=50,
        choices=[
            ('faq', _('FAQ')),
            ('guide', _('Guide')),
            ('tutoriel', _('Tutoriel')),
            ('troubleshooting', _('Dépannage')),
            ('api', _('Documentation API')),
        ],
        verbose_name=_("Catégorie")
    )
    
    # Métadonnées
    mots_cles = models.JSONField(default=list, verbose_name=_("Mots-clés"))
    public = models.BooleanField(default=True, verbose_name=_("Public"))
    
    # Statistiques
    nombre_vues = models.PositiveIntegerField(default=0, verbose_name=_("Nombre de vues"))
    nombre_likes = models.PositiveIntegerField(default=0, verbose_name=_("Nombre de likes"))
    utile_count = models.PositiveIntegerField(default=0, verbose_name=_("Votes utiles"))
    
    class Meta:
        verbose_name = _("Article base de connaissances")
        verbose_name_plural = _("Articles base de connaissances")
        indexes = [
            models.Index(fields=['categorie', 'public']),
        ]
    
    def __str__(self):
        return self.titre


class FAQ(BaseModel):
    """Questions fréquemment posées."""
    question = models.CharField(max_length=300, verbose_name=_("Question"))
    reponse = models.TextField(verbose_name=_("Réponse"))
    
    # Classification
    categorie = models.CharField(max_length=50, verbose_name=_("Catégorie"))
    
    # Métadonnées
    ordre_affichage = models.PositiveIntegerField(default=0, verbose_name=_("Ordre d'affichage"))
    active = models.BooleanField(default=True, verbose_name=_("Active"))
    
    # Statistiques
    nombre_consultations = models.PositiveIntegerField(default=0, verbose_name=_("Nombre de consultations"))
    
    class Meta:
        verbose_name = _("FAQ")
        verbose_name_plural = _("FAQ")
        ordering = ['ordre_affichage', 'question']
    
    def __str__(self):
        return self.question


class FeedbackClient(BaseModel):
    """Feedback et évaluations clients."""
    TYPE_FEEDBACK_CHOICES = [
        ('bug', _('Bug')),
        ('suggestion', _('Suggestion')),
        ('plainte', _('Plainte')),
        ('compliment', _('Compliment')),
        ('autre', _('Autre')),
    ]
    
    utilisateur = models.ForeignKey(
        'users.UtilisateurPersonnalise',
        on_delete=models.CASCADE,
        verbose_name=_("Utilisateur")
    )
    
    # Contenu
    type_feedback = models.CharField(
        max_length=20,
        choices=TYPE_FEEDBACK_CHOICES,
        verbose_name=_("Type de feedback")
    )
    titre = models.CharField(max_length=200, verbose_name=_("Titre"))
    description = models.TextField(verbose_name=_("Description"))
    
    # Évaluation
    note_globale = models.PositiveIntegerField(
        choices=[(i, i) for i in range(1, 6)],
        verbose_name=_("Note globale")
    )
    
    # Traitement
    traite = models.BooleanField(default=False, verbose_name=_("Traité"))
    traite_par = models.ForeignKey(
        'users.UtilisateurPersonnalise',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='feedbacks_traites',
        verbose_name=_("Traité par")
    )
    date_traitement = models.DateTimeField(null=True, blank=True, verbose_name=_("Date de traitement"))
    reponse = models.TextField(blank=True, verbose_name=_("Réponse"))
    
    class Meta:
        verbose_name = _("Feedback client")
        verbose_name_plural = _("Feedbacks client")
        ordering = ['-date_creation']
    
    def __str__(self):
        return f"{self.get_type_feedback_display()} - {self.titre}"