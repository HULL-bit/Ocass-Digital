"""
Modèles pour les intégrations externes.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.core.models import BaseModel


class IntegrationExterne(BaseModel):
    """Intégrations avec services externes."""
    TYPE_INTEGRATION_CHOICES = [
        ('wave_money', _('Wave Money')),
        ('orange_money', _('Orange Money')),
        ('whatsapp_business', _('WhatsApp Business')),
        ('sage_comptabilite', _('Sage Comptabilité')),
        ('quickbooks', _('QuickBooks')),
        ('jumia', _('Jumia')),
        ('facebook', _('Facebook')),
        ('instagram', _('Instagram')),
        ('google_analytics', _('Google Analytics')),
        ('mailchimp', _('MailChimp')),
        ('twilio', _('Twilio')),
    ]
    
    STATUT_CHOICES = [
        ('active', _('Active')),
        ('inactive', _('Inactive')),
        ('erreur', _('Erreur')),
        ('configuration', _('En configuration')),
        ('suspendue', _('Suspendue')),
    ]
    
    # Identification
    nom = models.CharField(max_length=100, verbose_name=_("Nom"))
    type_integration = models.CharField(
        max_length=30,
        choices=TYPE_INTEGRATION_CHOICES,
        verbose_name=_("Type d'intégration")
    )
    
    # Configuration
    configuration = models.JSONField(
        default=dict,
        verbose_name=_("Configuration")
    )
    credentials = models.JSONField(
        default=dict,
        verbose_name=_("Identifiants")
    )
    
    # Endpoints
    url_api = models.URLField(blank=True, verbose_name=_("URL API"))
    webhook_url = models.URLField(blank=True, verbose_name=_("URL Webhook"))
    
    # Statut
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='inactive',
        verbose_name=_("Statut")
    )
    
    # Métadonnées
    entreprise = models.ForeignKey(
        'companies.Entreprise',
        on_delete=models.CASCADE,
        verbose_name=_("Entreprise")
    )
    
    # Monitoring
    derniere_synchronisation = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Dernière synchronisation")
    )
    nombre_erreurs = models.PositiveIntegerField(default=0, verbose_name=_("Nombre d'erreurs"))
    derniere_erreur = models.TextField(blank=True, verbose_name=_("Dernière erreur"))
    
    class Meta:
        verbose_name = _("Intégration externe")
        verbose_name_plural = _("Intégrations externes")
        unique_together = ['entreprise', 'type_integration']
    
    def __str__(self):
        return f"{self.nom} - {self.get_type_integration_display()}"


class LogIntegration(BaseModel):
    """Logs des intégrations externes."""
    TYPE_ACTION_CHOICES = [
        ('sync', _('Synchronisation')),
        ('webhook', _('Webhook')),
        ('api_call', _('Appel API')),
        ('error', _('Erreur')),
        ('config', _('Configuration')),
    ]
    
    integration = models.ForeignKey(
        IntegrationExterne,
        on_delete=models.CASCADE,
        related_name='logs',
        verbose_name=_("Intégration")
    )
    
    # Action
    type_action = models.CharField(
        max_length=20,
        choices=TYPE_ACTION_CHOICES,
        verbose_name=_("Type d'action")
    )
    action = models.CharField(max_length=100, verbose_name=_("Action"))
    
    # Données
    donnees_envoyees = models.JSONField(
        null=True,
        blank=True,
        verbose_name=_("Données envoyées")
    )
    donnees_recues = models.JSONField(
        null=True,
        blank=True,
        verbose_name=_("Données reçues")
    )
    
    # Résultat
    succes = models.BooleanField(default=True, verbose_name=_("Succès"))
    code_reponse = models.CharField(max_length=10, blank=True, verbose_name=_("Code de réponse"))
    message_erreur = models.TextField(blank=True, verbose_name=_("Message d'erreur"))
    
    # Performance
    duree_execution = models.DurationField(null=True, blank=True, verbose_name=_("Durée d'exécution"))
    
    class Meta:
        verbose_name = _("Log intégration")
        verbose_name_plural = _("Logs intégration")
        ordering = ['-date_creation']
        indexes = [
            models.Index(fields=['integration', 'date_creation']),
            models.Index(fields=['type_action', 'succes']),
        ]
    
    def __str__(self):
        return f"{self.integration.nom} - {self.action}"


class SynchronisationDonnees(BaseModel):
    """Synchronisation de données entre systèmes."""
    STATUT_CHOICES = [
        ('en_attente', _('En attente')),
        ('en_cours', _('En cours')),
        ('terminee', _('Terminée')),
        ('erreur', _('Erreur')),
        ('annulee', _('Annulée')),
    ]
    
    integration = models.ForeignKey(
        IntegrationExterne,
        on_delete=models.CASCADE,
        verbose_name=_("Intégration")
    )
    
    # Configuration
    type_donnees = models.CharField(
        max_length=50,
        choices=[
            ('produits', _('Produits')),
            ('clients', _('Clients')),
            ('ventes', _('Ventes')),
            ('stock', _('Stock')),
            ('commandes', _('Commandes')),
            ('paiements', _('Paiements')),
        ],
        verbose_name=_("Type de données")
    )
    direction = models.CharField(
        max_length=20,
        choices=[
            ('import', _('Import')),
            ('export', _('Export')),
            ('bidirectionnel', _('Bidirectionnel')),
        ],
        verbose_name=_("Direction")
    )
    
    # Exécution
    date_planifiee = models.DateTimeField(verbose_name=_("Date planifiée"))
    date_execution = models.DateTimeField(null=True, blank=True, verbose_name=_("Date d'exécution"))
    date_fin = models.DateTimeField(null=True, blank=True, verbose_name=_("Date de fin"))
    
    # Statut
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='en_attente',
        verbose_name=_("Statut")
    )
    
    # Résultats
    nombre_enregistrements = models.PositiveIntegerField(default=0, verbose_name=_("Nombre d'enregistrements"))
    nombre_succes = models.PositiveIntegerField(default=0, verbose_name=_("Nombre de succès"))
    nombre_erreurs = models.PositiveIntegerField(default=0, verbose_name=_("Nombre d'erreurs"))
    
    # Logs
    log_execution = models.TextField(blank=True, verbose_name=_("Log d'exécution"))
    erreurs_details = models.JSONField(default=list, verbose_name=_("Détails des erreurs"))
    
    class Meta:
        verbose_name = _("Synchronisation données")
        verbose_name_plural = _("Synchronisations données")
        ordering = ['-date_creation']
    
    def __str__(self):
        return f"Sync {self.type_donnees} - {self.integration.nom}"


class WebhookEndpoint(BaseModel):
    """Endpoints webhook pour intégrations."""
    integration = models.ForeignKey(
        IntegrationExterne,
        on_delete=models.CASCADE,
        related_name='webhooks',
        verbose_name=_("Intégration")
    )
    
    # Configuration
    nom = models.CharField(max_length=100, verbose_name=_("Nom"))
    url = models.URLField(verbose_name=_("URL"))
    secret = models.CharField(max_length=255, verbose_name=_("Secret"))
    
    # Événements
    evenements = models.JSONField(
        default=list,
        help_text=_("Liste des événements à écouter"),
        verbose_name=_("Événements")
    )
    
    # Configuration
    actif = models.BooleanField(default=True, verbose_name=_("Actif"))
    timeout = models.PositiveIntegerField(default=30, verbose_name=_("Timeout (secondes)"))
    retry_count = models.PositiveIntegerField(default=3, verbose_name=_("Nombre de tentatives"))
    
    # Statistiques
    nombre_appels = models.PositiveIntegerField(default=0, verbose_name=_("Nombre d'appels"))
    nombre_succes = models.PositiveIntegerField(default=0, verbose_name=_("Nombre de succès"))
    nombre_echecs = models.PositiveIntegerField(default=0, verbose_name=_("Nombre d'échecs"))
    
    class Meta:
        verbose_name = _("Webhook endpoint")
        verbose_name_plural = _("Webhook endpoints")
    
    def __str__(self):
        return f"{self.nom} - {self.url}"