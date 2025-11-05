"""
Modèles pour la gestion des clients et CRM.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
from apps.core.models import BaseModel, STATUTS_GENERIQUES


class Client(BaseModel):
    """Modèle client CRM ultra-complet."""
    TYPE_CLIENT_CHOICES = [
        ('particulier', _('Particulier')),
        ('professionnel', _('Professionnel')),
        ('entreprise', _('Entreprise')),
    ]
    
    # Identification
    code_client = models.CharField(max_length=20, unique=True, blank=True, verbose_name=_("Code client"))
    type_client = models.CharField(
        max_length=20,
        choices=TYPE_CLIENT_CHOICES,
        default='particulier',
        verbose_name=_("Type de client")
    )
    
    # Informations personnelles
    nom = models.CharField(max_length=100, verbose_name=_("Nom"))
    prenom = models.CharField(max_length=100, blank=True, verbose_name=_("Prénom"))
    email = models.EmailField(verbose_name=_("Email"))
    telephone = models.CharField(max_length=20, verbose_name=_("Téléphone"))
    telephone_secondaire = models.CharField(max_length=20, blank=True, verbose_name=_("Téléphone secondaire"))
    
    # Informations professionnelles
    entreprise_nom = models.CharField(max_length=200, blank=True, verbose_name=_("Nom de l'entreprise"))
    fonction = models.CharField(max_length=100, blank=True, verbose_name=_("Fonction"))
    secteur_activite = models.CharField(max_length=100, blank=True, verbose_name=_("Secteur d'activité"))
    
    # Adresses
    adresse_facturation = models.TextField(verbose_name=_("Adresse de facturation"))
    adresse_livraison = models.TextField(blank=True, verbose_name=_("Adresse de livraison"))
    
    # Géolocalisation
    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=8,
        null=True,
        blank=True,
        verbose_name=_("Latitude")
    )
    longitude = models.DecimalField(
        max_digits=11,
        decimal_places=8,
        null=True,
        blank=True,
        verbose_name=_("Longitude")
    )
    
    # Statistiques
    date_derniere_commande = models.DateTimeField(null=True, blank=True, verbose_name=_("Dernière commande"))
    total_achats = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name=_("Total des achats")
    )
    nombre_commandes = models.PositiveIntegerField(default=0, verbose_name=_("Nombre de commandes"))
    panier_moyen = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name=_("Panier moyen")
    )
    
    # Segmentation
    segment = models.CharField(
        max_length=50,
        choices=[
            ('nouveau', _('Nouveau')),
            ('regulier', _('Régulier')),
            ('vip', _('VIP')),
            ('inactif', _('Inactif')),
            ('risque', _('À risque')),
        ],
        default='nouveau',
        verbose_name=_("Segment")
    )
    score_fidelite = models.PositiveIntegerField(default=0, verbose_name=_("Score de fidélité"))
    
    # Acquisition
    source_acquisition = models.CharField(
        max_length=50,
        choices=[
            ('referencement', _('Référencement')),
            ('publicite', _('Publicité')),
            ('reseaux_sociaux', _('Réseaux sociaux')),
            ('bouche_a_oreille', _('Bouche à oreille')),
            ('partenaire', _('Partenaire')),
            ('autre', _('Autre')),
        ],
        blank=True,
        verbose_name=_("Source d'acquisition")
    )
    date_acquisition = models.DateTimeField(auto_now_add=True, verbose_name=_("Date d'acquisition"))
    
    # Préférences
    preferences = models.JSONField(default=dict, verbose_name=_("Préférences"))
    preferences_communication = models.JSONField(
        default=dict,
        help_text=_("Préférences de communication (email, SMS, etc.)"),
        verbose_name=_("Préférences de communication")
    )
    
    # Métadonnées
    entrepreneur = models.ForeignKey(
        'users.UtilisateurPersonnalise',
        on_delete=models.CASCADE,
        related_name='clients',
        verbose_name=_("Entrepreneur")
    )
    statut = models.CharField(max_length=20, choices=STATUTS_GENERIQUES, default='actif', verbose_name=_("Statut"))
    notes = models.TextField(blank=True, verbose_name=_("Notes"))
    
    # Programme fidélité
    points_fidelite = models.PositiveIntegerField(default=0, verbose_name=_("Points de fidélité"))
    niveau_fidelite = models.CharField(
        max_length=20,
        choices=[
            ('bronze', _('Bronze')),
            ('argent', _('Argent')),
            ('or', _('Or')),
            ('platine', _('Platine')),
            ('diamant', _('Diamant')),
        ],
        default='bronze',
        verbose_name=_("Niveau de fidélité")
    )
    
    class Meta:
        verbose_name = _("Client")
        verbose_name_plural = _("Clients")
        indexes = [
            models.Index(fields=['entrepreneur', 'statut']),
            models.Index(fields=['segment', 'score_fidelite']),
            models.Index(fields=['email']),
            models.Index(fields=['telephone']),
        ]
        unique_together = ['entrepreneur', 'email']
    
    def __str__(self):
        if self.prenom:
            return f"{self.prenom} {self.nom}"
        return self.nom
    
    def save(self, *args, **kwargs):
        """Générer automatiquement le code_client s'il n'est pas fourni."""
        if not self.code_client:
            import uuid
            # Générer un code unique basé sur l'UUID
            code_base = str(uuid.uuid4())[:8].upper()
            self.code_client = f"CLI-{code_base}"
            # Vérifier l'unicité et régénérer si nécessaire
            while Client.objects.filter(code_client=self.code_client).exists():
                code_base = str(uuid.uuid4())[:8].upper()
                self.code_client = f"CLI-{code_base}"
        super().save(*args, **kwargs)
    
    def calculer_panier_moyen(self):
        """Calcule le panier moyen du client."""
        if self.nombre_commandes > 0:
            self.panier_moyen = self.total_achats / self.nombre_commandes
            self.save(update_fields=['panier_moyen'])
    
    def ajouter_points_fidelite(self, points):
        """Ajoute des points de fidélité."""
        self.points_fidelite += points
        
        # Mise à jour du niveau
        if self.points_fidelite >= 10000:
            self.niveau_fidelite = 'diamant'
        elif self.points_fidelite >= 5000:
            self.niveau_fidelite = 'platine'
        elif self.points_fidelite >= 2000:
            self.niveau_fidelite = 'or'
        elif self.points_fidelite >= 500:
            self.niveau_fidelite = 'argent'
        
        self.save(update_fields=['points_fidelite', 'niveau_fidelite'])


class InteractionClient(BaseModel):
    """Historique des interactions avec les clients."""
    TYPE_INTERACTION_CHOICES = [
        ('appel', _('Appel téléphonique')),
        ('email', _('Email')),
        ('sms', _('SMS')),
        ('visite', _('Visite en magasin')),
        ('chat', _('Chat en ligne')),
        ('reseaux_sociaux', _('Réseaux sociaux')),
        ('courrier', _('Courrier')),
        ('autre', _('Autre')),
    ]
    
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name='interactions',
        verbose_name=_("Client")
    )
    type_interaction = models.CharField(
        max_length=20,
        choices=TYPE_INTERACTION_CHOICES,
        verbose_name=_("Type d'interaction")
    )
    
    # Contenu
    sujet = models.CharField(max_length=200, verbose_name=_("Sujet"))
    description = models.TextField(verbose_name=_("Description"))
    
    # Métadonnées
    utilisateur = models.ForeignKey(
        'users.UtilisateurPersonnalise',
        on_delete=models.PROTECT,
        verbose_name=_("Utilisateur")
    )
    duree_minutes = models.PositiveIntegerField(null=True, blank=True, verbose_name=_("Durée (minutes)"))
    
    # Suivi
    action_requise = models.BooleanField(default=False, verbose_name=_("Action requise"))
    date_action_prevue = models.DateTimeField(null=True, blank=True, verbose_name=_("Date d'action prévue"))
    action_terminee = models.BooleanField(default=False, verbose_name=_("Action terminée"))
    
    class Meta:
        verbose_name = _("Interaction client")
        verbose_name_plural = _("Interactions client")
        ordering = ['-date_creation']
        indexes = [
            models.Index(fields=['client', 'date_creation']),
            models.Index(fields=['type_interaction', 'date_creation']),
        ]
    
    def __str__(self):
        return f"{self.get_type_interaction_display()} - {self.client.nom} - {self.sujet}"


class CampagneMarketing(BaseModel):
    """Campagnes marketing pour clients."""
    TYPE_CAMPAGNE_CHOICES = [
        ('email', _('Email')),
        ('sms', _('SMS')),
        ('push', _('Notification push')),
        ('courrier', _('Courrier')),
        ('mixte', _('Mixte')),
    ]
    
    STATUT_CHOICES = [
        ('brouillon', _('Brouillon')),
        ('planifiee', _('Planifiée')),
        ('en_cours', _('En cours')),
        ('terminee', _('Terminée')),
        ('suspendue', _('Suspendue')),
        ('annulee', _('Annulée')),
    ]
    
    nom = models.CharField(max_length=200, verbose_name=_("Nom de la campagne"))
    description = models.TextField(verbose_name=_("Description"))
    type_campagne = models.CharField(
        max_length=20,
        choices=TYPE_CAMPAGNE_CHOICES,
        verbose_name=_("Type de campagne")
    )
    
    # Contenu
    sujet = models.CharField(max_length=200, verbose_name=_("Sujet"))
    contenu = models.TextField(verbose_name=_("Contenu"))
    contenu_html = models.TextField(blank=True, verbose_name=_("Contenu HTML"))
    
    # Ciblage
    segment_cible = models.CharField(
        max_length=50,
        choices=[
            ('tous', _('Tous les clients')),
            ('nouveau', _('Nouveaux clients')),
            ('regulier', _('Clients réguliers')),
            ('vip', _('Clients VIP')),
            ('inactif', _('Clients inactifs')),
            ('personnalise', _('Segment personnalisé')),
        ],
        default='tous',
        verbose_name=_("Segment cible")
    )
    criteres_ciblage = models.JSONField(default=dict, verbose_name=_("Critères de ciblage"))
    
    # Planification
    date_envoi_prevue = models.DateTimeField(verbose_name=_("Date d'envoi prévue"))
    date_envoi_reelle = models.DateTimeField(null=True, blank=True, verbose_name=_("Date d'envoi réelle"))
    
    # Statut
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='brouillon', verbose_name=_("Statut"))
    
    # Statistiques
    nombre_destinataires = models.PositiveIntegerField(default=0, verbose_name=_("Nombre de destinataires"))
    nombre_envoyes = models.PositiveIntegerField(default=0, verbose_name=_("Nombre envoyés"))
    nombre_ouverts = models.PositiveIntegerField(default=0, verbose_name=_("Nombre ouverts"))
    nombre_clics = models.PositiveIntegerField(default=0, verbose_name=_("Nombre de clics"))
    nombre_conversions = models.PositiveIntegerField(default=0, verbose_name=_("Nombre de conversions"))
    
    # Métadonnées
    entrepreneur = models.ForeignKey(
        'users.UtilisateurPersonnalise',
        on_delete=models.CASCADE,
        related_name='campagnes',
        verbose_name=_("Entrepreneur")
    )
    
    class Meta:
        verbose_name = _("Campagne marketing")
        verbose_name_plural = _("Campagnes marketing")
        ordering = ['-date_creation']
    
    def __str__(self):
        return self.nom
    
    @property
    def taux_ouverture(self):
        """Calcule le taux d'ouverture."""
        if self.nombre_envoyes > 0:
            return (self.nombre_ouverts / self.nombre_envoyes) * 100
        return 0
    
    @property
    def taux_clic(self):
        """Calcule le taux de clic."""
        if self.nombre_ouverts > 0:
            return (self.nombre_clics / self.nombre_ouverts) * 100
        return 0
    
    @property
    def taux_conversion(self):
        """Calcule le taux de conversion."""
        if self.nombre_clics > 0:
            return (self.nombre_conversions / self.nombre_clics) * 100
        return 0