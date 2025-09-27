"""
Modèles pour la gestion des paiements mobiles.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from decimal import Decimal
from apps.core.models import BaseModel, MODES_PAIEMENT, STATUTS_PAIEMENT


class PaiementMobile(BaseModel):
    """Paiements mobiles (Wave, Orange Money, etc.)."""
    OPERATEUR_CHOICES = [
        ('wave', _('Wave Money')),
        ('orange_money', _('Orange Money')),
        ('free_money', _('Free Money')),
        ('wizall', _('Wizall')),
        ('joni_joni', _('Joni Joni')),
    ]
    
    # Référence
    vente = models.ForeignKey(
        'sales.Vente',
        on_delete=models.CASCADE,
        related_name='paiements_mobiles',
        verbose_name=_("Vente")
    )
    reference_interne = models.CharField(max_length=100, unique=True, verbose_name=_("Référence interne"))
    
    # Opérateur
    operateur = models.CharField(
        max_length=20,
        choices=OPERATEUR_CHOICES,
        verbose_name=_("Opérateur")
    )
    numero_telephone = models.CharField(max_length=20, verbose_name=_("Numéro de téléphone"))
    
    # Montant
    montant = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        verbose_name=_("Montant")
    )
    devise = models.CharField(max_length=3, default='XOF', verbose_name=_("Devise"))
    
    # Transaction
    reference_transaction = models.CharField(max_length=100, blank=True, verbose_name=_("Référence transaction"))
    statut = models.CharField(
        max_length=20,
        choices=STATUTS_PAIEMENT,
        default='pending',
        verbose_name=_("Statut")
    )
    
    # Dates
    date_initiation = models.DateTimeField(auto_now_add=True, verbose_name=_("Date d'initiation"))
    date_confirmation = models.DateTimeField(null=True, blank=True, verbose_name=_("Date de confirmation"))
    date_expiration = models.DateTimeField(null=True, blank=True, verbose_name=_("Date d'expiration"))
    
    # Codes
    code_confirmation = models.CharField(max_length=20, blank=True, verbose_name=_("Code de confirmation"))
    code_erreur = models.CharField(max_length=20, blank=True, verbose_name=_("Code d'erreur"))
    message_erreur = models.TextField(blank=True, verbose_name=_("Message d'erreur"))
    
    # Webhook
    webhook_payload = models.JSONField(default=dict, verbose_name=_("Payload webhook"))
    webhook_signature = models.CharField(max_length=255, blank=True, verbose_name=_("Signature webhook"))
    
    # Frais
    frais_operateur = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name=_("Frais opérateur")
    )
    frais_plateforme = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name=_("Frais plateforme")
    )
    
    class Meta:
        verbose_name = _("Paiement mobile")
        verbose_name_plural = _("Paiements mobiles")
        ordering = ['-date_creation']
        indexes = [
            models.Index(fields=['vente', 'statut']),
            models.Index(fields=['operateur', 'statut']),
            models.Index(fields=['reference_transaction']),
        ]
    
    def __str__(self):
        return f"{self.get_operateur_display()} - {self.montant} {self.devise} - {self.get_statut_display()}"


class LienPaiement(BaseModel):
    """Liens de paiement sécurisés."""
    STATUT_CHOICES = [
        ('actif', _('Actif')),
        ('utilise', _('Utilisé')),
        ('expire', _('Expiré')),
        ('annule', _('Annulé')),
    ]
    
    # Identification
    token = models.CharField(max_length=100, unique=True, verbose_name=_("Token"))
    nom = models.CharField(max_length=200, verbose_name=_("Nom du lien"))
    description = models.TextField(blank=True, verbose_name=_("Description"))
    
    # Montant
    montant = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        verbose_name=_("Montant")
    )
    devise = models.CharField(max_length=3, default='XOF', verbose_name=_("Devise"))
    
    # Configuration
    operateurs_autorises = models.JSONField(
        default=list,
        help_text=_("Liste des opérateurs autorisés"),
        verbose_name=_("Opérateurs autorisés")
    )
    
    # Dates
    date_expiration = models.DateTimeField(verbose_name=_("Date d'expiration"))
    date_utilisation = models.DateTimeField(null=True, blank=True, verbose_name=_("Date d'utilisation"))
    
    # Statut
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='actif', verbose_name=_("Statut"))
    
    # Utilisation
    nombre_utilisations = models.PositiveIntegerField(default=0, verbose_name=_("Nombre d'utilisations"))
    max_utilisations = models.PositiveIntegerField(default=1, verbose_name=_("Nombre max d'utilisations"))
    
    # Métadonnées
    entrepreneur = models.ForeignKey(
        'users.UtilisateurPersonnalise',
        on_delete=models.CASCADE,
        related_name='liens_paiement',
        verbose_name=_("Entrepreneur")
    )
    client = models.ForeignKey(
        'customers.Client',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_("Client")
    )
    
    # URLs
    url_succes = models.URLField(blank=True, verbose_name=_("URL de succès"))
    url_echec = models.URLField(blank=True, verbose_name=_("URL d'échec"))
    url_annulation = models.URLField(blank=True, verbose_name=_("URL d'annulation"))
    
    class Meta:
        verbose_name = _("Lien de paiement")
        verbose_name_plural = _("Liens de paiement")
        ordering = ['-date_creation']
    
    def __str__(self):
        return f"Lien {self.nom} - {self.montant} {self.devise}"
    
    def save(self, *args, **kwargs):
        # Générer le token automatiquement
        if not self.token:
            import secrets
            self.token = secrets.token_urlsafe(32)
        super().save(*args, **kwargs)


class Remboursement(BaseModel):
    """Gestion des remboursements."""
    STATUT_CHOICES = [
        ('demande', _('Demandé')),
        ('en_cours', _('En cours')),
        ('termine', _('Terminé')),
        ('refuse', _('Refusé')),
        ('annule', _('Annulé')),
    ]
    
    MOTIF_CHOICES = [
        ('defaut_produit', _('Défaut produit')),
        ('erreur_commande', _('Erreur de commande')),
        ('retard_livraison', _('Retard de livraison')),
        ('insatisfaction', _('Insatisfaction client')),
        ('erreur_paiement', _('Erreur de paiement')),
        ('autre', _('Autre')),
    ]
    
    # Référence
    numero_remboursement = models.CharField(max_length=50, unique=True, verbose_name=_("Numéro de remboursement"))
    paiement_mobile = models.ForeignKey(
        PaiementMobile,
        on_delete=models.CASCADE,
        related_name='remboursements',
        verbose_name=_("Paiement mobile")
    )
    
    # Montant
    montant_demande = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        verbose_name=_("Montant demandé")
    )
    montant_approuve = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_("Montant approuvé")
    )
    
    # Motif
    motif = models.CharField(max_length=30, choices=MOTIF_CHOICES, verbose_name=_("Motif"))
    description = models.TextField(verbose_name=_("Description"))
    
    # Statut
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='demande', verbose_name=_("Statut"))
    
    # Dates
    date_demande = models.DateTimeField(auto_now_add=True, verbose_name=_("Date de demande"))
    date_traitement = models.DateTimeField(null=True, blank=True, verbose_name=_("Date de traitement"))
    date_remboursement = models.DateTimeField(null=True, blank=True, verbose_name=_("Date de remboursement"))
    
    # Traitement
    traite_par = models.ForeignKey(
        'users.UtilisateurPersonnalise',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_("Traité par")
    )
    notes_traitement = models.TextField(blank=True, verbose_name=_("Notes de traitement"))
    
    class Meta:
        verbose_name = _("Remboursement")
        verbose_name_plural = _("Remboursements")
        ordering = ['-date_creation']
    
    def __str__(self):
        return f"Remboursement {self.numero_remboursement} - {self.montant_demande}"