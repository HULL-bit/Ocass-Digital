"""
Modèles pour la gestion des ventes et facturation.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
from apps.core.models import BaseModel, MODES_PAIEMENT, STATUTS_PAIEMENT


class Vente(BaseModel):
    """Ventes avec gestion complète."""
    STATUT_CHOICES = [
        ('brouillon', _('Brouillon')),
        ('en_attente', _('En attente')),
        ('confirmee', _('Confirmée')),
        ('expediee', _('Expédiée')),
        ('livree', _('Livrée')),
        ('terminee', _('Terminée')),
        ('annulee', _('Annulée')),
        ('retournee', _('Retournée')),
    ]
    
    # Identification
    numero_facture = models.CharField(max_length=50, unique=True, verbose_name=_("Numéro de facture"))
    numero_commande = models.CharField(max_length=50, blank=True, verbose_name=_("Numéro de commande"))
    
    # Parties
    client = models.ForeignKey(
        'customers.Client',
        on_delete=models.PROTECT,
        related_name='ventes',
        verbose_name=_("Client")
    )
    entrepreneur = models.ForeignKey(
        'users.UtilisateurPersonnalise',
        on_delete=models.PROTECT,
        related_name='ventes_realisees',
        verbose_name=_("Entrepreneur")
    )
    vendeur = models.ForeignKey(
        'users.UtilisateurPersonnalise',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ventes_vendeur',
        verbose_name=_("Vendeur")
    )
    
    # Dates
    date_creation = models.DateTimeField(auto_now_add=True, verbose_name=_("Date de création"))
    date_livraison_prevue = models.DateField(null=True, blank=True, verbose_name=_("Date de livraison prévue"))
    date_livraison_reelle = models.DateField(null=True, blank=True, verbose_name=_("Date de livraison réelle"))
    
    # Statut
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='brouillon', verbose_name=_("Statut"))
    
    # Montants
    sous_total = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name=_("Sous-total")
    )
    taxe_montant = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name=_("Montant des taxes")
    )
    remise_montant = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name=_("Montant de la remise")
    )
    frais_livraison = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name=_("Frais de livraison")
    )
    total_ttc = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name=_("Total TTC")
    )
    
    # Paiement
    mode_paiement = models.CharField(
        max_length=20,
        choices=MODES_PAIEMENT,
        default='cash',
        verbose_name=_("Mode de paiement")
    )
    statut_paiement = models.CharField(
        max_length=20,
        choices=STATUTS_PAIEMENT,
        default='pending',
        verbose_name=_("Statut du paiement")
    )
    date_paiement = models.DateTimeField(null=True, blank=True, verbose_name=_("Date de paiement"))
    reference_paiement = models.CharField(max_length=100, blank=True, verbose_name=_("Référence de paiement"))
    
    # Métadonnées
    notes = models.TextField(blank=True, verbose_name=_("Notes"))
    notes_internes = models.TextField(blank=True, verbose_name=_("Notes internes"))
    signature_client = models.TextField(blank=True, verbose_name=_("Signature client (base64)"))
    
    # Livraison
    adresse_livraison = models.TextField(blank=True, verbose_name=_("Adresse de livraison"))
    transporteur = models.CharField(max_length=100, blank=True, verbose_name=_("Transporteur"))
    numero_suivi = models.CharField(max_length=100, blank=True, verbose_name=_("Numéro de suivi"))
    
    # Analytics
    source_vente = models.CharField(
        max_length=50,
        choices=[
            ('pos', _('Point de vente')),
            ('online', _('En ligne')),
            ('telephone', _('Téléphone')),
            ('email', _('Email')),
            ('visite', _('Visite')),
            ('autre', _('Autre')),
        ],
        default='pos',
        verbose_name=_("Source de la vente")
    )
    
    class Meta:
        verbose_name = _("Vente")
        verbose_name_plural = _("Ventes")
        ordering = ['-date_creation']
        indexes = [
            models.Index(fields=['entrepreneur', 'date_creation']),
            models.Index(fields=['client', 'date_creation']),
            models.Index(fields=['statut', 'date_creation']),
            models.Index(fields=['statut_paiement']),
        ]
    
    def __str__(self):
        return f"Vente {self.numero_facture} - {self.client.nom}"
    
    def save(self, *args, **kwargs):
        # Générer le numéro de facture automatiquement
        if not self.numero_facture:
            from apps.core.utils import generate_invoice_number
            self.numero_facture = generate_invoice_number(self.entrepreneur.entreprise_id)
        super().save(*args, **kwargs)


class LigneVente(BaseModel):
    """Lignes de vente détaillées."""
    vente = models.ForeignKey(
        Vente,
        on_delete=models.CASCADE,
        related_name='lignes',
        verbose_name=_("Vente")
    )
    produit = models.ForeignKey(
        'products.Produit',
        on_delete=models.PROTECT,
        verbose_name=_("Produit")
    )
    variante = models.ForeignKey(
        'products.VarianteProduit',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_("Variante")
    )
    
    # Quantité et prix
    quantite = models.PositiveIntegerField(verbose_name=_("Quantité"))
    prix_unitaire = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name=_("Prix unitaire")
    )
    remise_pourcentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name=_("Remise (%)")
    )
    tva_taux = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('18.00'),
        verbose_name=_("Taux TVA (%)")
    )
    
    # Métadonnées
    notes = models.TextField(blank=True, verbose_name=_("Notes"))
    
    class Meta:
        verbose_name = _("Ligne de vente")
        verbose_name_plural = _("Lignes de vente")
        unique_together = ['vente', 'produit', 'variante']
    
    @property
    def prix_avec_remise(self):
        """Calcule le prix avec remise."""
        return self.prix_unitaire * (1 - self.remise_pourcentage / 100)
    
    @property
    def total_ht(self):
        """Calcule le total HT de la ligne."""
        return self.quantite * self.prix_avec_remise
    
    @property
    def total_tva(self):
        """Calcule le montant de TVA."""
        return self.total_ht * (self.tva_taux / 100)
    
    @property
    def total_ttc(self):
        """Calcule le total TTC de la ligne."""
        return self.total_ht + self.total_tva
    
    def __str__(self):
        return f"{self.produit.nom} x{self.quantite}"


class Devis(BaseModel):
    """Devis avec conversion en vente."""
    STATUT_CHOICES = [
        ('brouillon', _('Brouillon')),
        ('envoye', _('Envoyé')),
        ('accepte', _('Accepté')),
        ('refuse', _('Refusé')),
        ('expire', _('Expiré')),
        ('converti', _('Converti')),
    ]
    
    numero_devis = models.CharField(max_length=50, unique=True, verbose_name=_("Numéro de devis"))
    client = models.ForeignKey(
        'customers.Client',
        on_delete=models.PROTECT,
        related_name='devis',
        verbose_name=_("Client")
    )
    entrepreneur = models.ForeignKey(
        'users.UtilisateurPersonnalise',
        on_delete=models.PROTECT,
        verbose_name=_("Entrepreneur")
    )
    
    # Dates
    date_creation = models.DateTimeField(auto_now_add=True, verbose_name=_("Date de création"))
    date_validite = models.DateField(verbose_name=_("Date de validité"))
    date_acceptation = models.DateTimeField(null=True, blank=True, verbose_name=_("Date d'acceptation"))
    
    # Statut
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='brouillon', verbose_name=_("Statut"))
    
    # Montants
    sous_total = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'), verbose_name=_("Sous-total"))
    taxe_montant = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'), verbose_name=_("Montant des taxes"))
    remise_montant = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'), verbose_name=_("Montant de la remise"))
    total_ttc = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'), verbose_name=_("Total TTC"))
    
    # Conversion
    vente_associee = models.OneToOneField(
        Vente,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='devis_origine',
        verbose_name=_("Vente associée")
    )
    
    # Métadonnées
    notes = models.TextField(blank=True, verbose_name=_("Notes"))
    conditions_particulieres = models.TextField(blank=True, verbose_name=_("Conditions particulières"))
    
    class Meta:
        verbose_name = _("Devis")
        verbose_name_plural = _("Devis")
        ordering = ['-date_creation']
    
    def __str__(self):
        return f"Devis {self.numero_devis} - {self.client.nom}"


class LigneDevis(BaseModel):
    """Lignes de devis."""
    devis = models.ForeignKey(
        Devis,
        on_delete=models.CASCADE,
        related_name='lignes',
        verbose_name=_("Devis")
    )
    produit = models.ForeignKey(
        'products.Produit',
        on_delete=models.PROTECT,
        verbose_name=_("Produit")
    )
    
    # Quantité et prix
    quantite = models.PositiveIntegerField(verbose_name=_("Quantité"))
    prix_unitaire = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name=_("Prix unitaire")
    )
    remise_pourcentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name=_("Remise (%)")
    )
    
    class Meta:
        verbose_name = _("Ligne de devis")
        verbose_name_plural = _("Lignes de devis")
        unique_together = ['devis', 'produit']
    
    @property
    def total_ligne(self):
        """Calcule le total de la ligne."""
        prix_avec_remise = self.prix_unitaire * (1 - self.remise_pourcentage / 100)
        return self.quantite * prix_avec_remise
    
    def __str__(self):
        return f"{self.produit.nom} x{self.quantite}"