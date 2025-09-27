"""
Modèles pour le système de notifications.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.core.models import BaseModel, TYPES_NOTIFICATIONS


class Notification(BaseModel):
    """Notifications système avancées."""
    CANAL_CHOICES = [
        ('app', _('Application')),
        ('email', _('Email')),
        ('sms', _('SMS')),
        ('push', _('Push')),
        ('webhook', _('Webhook')),
    ]
    
    # Destinataire
    utilisateur = models.ForeignKey(
        'users.UtilisateurPersonnalise',
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name=_("Utilisateur")
    )
    
    # Contenu
    titre = models.CharField(max_length=200, verbose_name=_("Titre"))
    message = models.TextField(verbose_name=_("Message"))
    type = models.CharField(
        max_length=20,
        choices=TYPES_NOTIFICATIONS,
        default='info',
        verbose_name=_("Type")
    )
    
    # Canal
    canal = models.CharField(
        max_length=20,
        choices=CANAL_CHOICES,
        default='app',
        verbose_name=_("Canal")
    )
    
    # Statut
    lue = models.BooleanField(default=False, verbose_name=_("Lue"))
    date_lecture = models.DateTimeField(null=True, blank=True, verbose_name=_("Date de lecture"))
    
    # Action
    action_url = models.URLField(blank=True, verbose_name=_("URL d'action"))
    action_label = models.CharField(max_length=100, blank=True, verbose_name=_("Label d'action"))
    
    # Métadonnées
    metadata = models.JSONField(default=dict, verbose_name=_("Métadonnées"))
    
    # Expiration
    date_expiration = models.DateTimeField(null=True, blank=True, verbose_name=_("Date d'expiration"))
    
    # Groupement
    groupe = models.CharField(max_length=100, blank=True, verbose_name=_("Groupe"))
    
    class Meta:
        verbose_name = _("Notification")
        verbose_name_plural = _("Notifications")
        ordering = ['-date_creation']
        indexes = [
            models.Index(fields=['utilisateur', 'lue', 'date_creation']),
            models.Index(fields=['type', 'date_creation']),
            models.Index(fields=['groupe', 'date_creation']),
        ]
    
    def __str__(self):
        return f"{self.titre} - {self.utilisateur.nom_complet}"
    
    def marquer_comme_lue(self):
        """Marque la notification comme lue."""
        if not self.lue:
            from django.utils import timezone
            self.lue = True
            self.date_lecture = timezone.now()
            self.save(update_fields=['lue', 'date_lecture'])


class TemplateNotification(BaseModel):
    """Templates pour notifications automatiques."""
    nom = models.CharField(max_length=100, unique=True, verbose_name=_("Nom"))
    description = models.TextField(verbose_name=_("Description"))
    
    # Contenu
    titre_template = models.CharField(max_length=200, verbose_name=_("Template titre"))
    message_template = models.TextField(verbose_name=_("Template message"))
    
    # Configuration
    type_notification = models.CharField(
        max_length=20,
        choices=TYPES_NOTIFICATIONS,
        verbose_name=_("Type de notification")
    )
    canaux_actifs = models.JSONField(
        default=list,
        help_text=_("Liste des canaux actifs pour ce template"),
        verbose_name=_("Canaux actifs")
    )
    
    # Déclencheurs
    evenement_declencheur = models.CharField(
        max_length=100,
        choices=[
            ('vente_creee', _('Vente créée')),
            ('paiement_recu', _('Paiement reçu')),
            ('stock_bas', _('Stock bas')),
            ('projet_termine', _('Projet terminé')),
            ('client_inactif', _('Client inactif')),
            ('facture_impayee', _('Facture impayée')),
            ('nouveau_client', _('Nouveau client')),
            ('anniversaire_client', _('Anniversaire client')),
        ],
        verbose_name=_("Événement déclencheur")
    )
    
    # Conditions
    conditions = models.JSONField(
        default=dict,
        help_text=_("Conditions pour déclencher la notification"),
        verbose_name=_("Conditions")
    )
    
    # Métadonnées
    actif = models.BooleanField(default=True, verbose_name=_("Actif"))
    
    class Meta:
        verbose_name = _("Template de notification")
        verbose_name_plural = _("Templates de notification")
    
    def __str__(self):
        return self.nom
    
    def generer_notification(self, utilisateur, contexte=None):
        """Génère une notification à partir du template."""
        contexte = contexte or {}
        
        # Remplacer les variables dans le template
        titre = self.titre_template.format(**contexte)
        message = self.message_template.format(**contexte)
        
        return Notification.objects.create(
            utilisateur_id=utilisateur.id,
            titre=titre,
            message=message,
            type=self.type_notification,
            metadata=contexte
        )


class PreferenceNotification(BaseModel):
    """Préférences de notification par utilisateur."""
    utilisateur = models.OneToOneField(
        'users.UtilisateurPersonnalise',
        on_delete=models.CASCADE,
        related_name='preferences_notifications',
        verbose_name=_("Utilisateur")
    )
    
    # Canaux activés
    notifications_app = models.BooleanField(default=True, verbose_name=_("Notifications app"))
    notifications_email = models.BooleanField(default=True, verbose_name=_("Notifications email"))
    notifications_sms = models.BooleanField(default=False, verbose_name=_("Notifications SMS"))
    notifications_push = models.BooleanField(default=True, verbose_name=_("Notifications push"))
    
    # Types de notifications
    alertes_stock = models.BooleanField(default=True, verbose_name=_("Alertes stock"))
    nouvelles_ventes = models.BooleanField(default=True, verbose_name=_("Nouvelles ventes"))
    paiements_recus = models.BooleanField(default=True, verbose_name=_("Paiements reçus"))
    projets_updates = models.BooleanField(default=True, verbose_name=_("Mises à jour projets"))
    marketing = models.BooleanField(default=False, verbose_name=_("Marketing"))
    
    # Horaires
    heure_debut = models.TimeField(default='08:00', verbose_name=_("Heure de début"))
    heure_fin = models.TimeField(default='20:00', verbose_name=_("Heure de fin"))
    jours_actifs = models.JSONField(
        default=list,
        help_text=_("Jours de la semaine actifs (0=lundi, 6=dimanche)"),
        verbose_name=_("Jours actifs")
    )
    
    # Fréquence
    frequence_resume = models.CharField(
        max_length=20,
        choices=[
            ('jamais', _('Jamais')),
            ('quotidien', _('Quotidien')),
            ('hebdomadaire', _('Hebdomadaire')),
            ('mensuel', _('Mensuel')),
        ],
        default='quotidien',
        verbose_name=_("Fréquence du résumé")
    )
    
    class Meta:
        verbose_name = _("Préférence de notification")
        verbose_name_plural = _("Préférences de notification")
    
    def __str__(self):
        return f"Préférences - {self.utilisateur.nom_complet}"