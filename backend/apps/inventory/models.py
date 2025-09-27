"""
Modèles pour la gestion des stocks et entrepôts.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator
from decimal import Decimal
from apps.core.models import BaseModel, STATUTS_GENERIQUES


class Entrepot(BaseModel):
    """Entrepôts pour gestion multi-sites."""
    nom = models.CharField(max_length=100, verbose_name=_("Nom de l'entrepôt"))
    code = models.CharField(max_length=20, unique=True, verbose_name=_("Code"))
    description = models.TextField(blank=True, verbose_name=_("Description"))
    
    # Adresse
    adresse = models.ForeignKey(
        'core.Adresse',
        on_delete=models.PROTECT,
        verbose_name=_("Adresse")
    )
    
    # Métadonnées
    entreprise = models.ForeignKey(
        'companies.Entreprise',
        on_delete=models.CASCADE,
        related_name='entrepots',
        verbose_name=_("Entreprise")
    )
    responsable = models.ForeignKey(
        'users.UtilisateurPersonnalise',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_("Responsable")
    )
    
    # Configuration
    principal = models.BooleanField(default=False, verbose_name=_("Entrepôt principal"))
    actif = models.BooleanField(default=True, verbose_name=_("Actif"))
    
    class Meta:
        verbose_name = _("Entrepôt")
        verbose_name_plural = _("Entrepôts")
        unique_together = ['entreprise', 'code']
    
    def __str__(self):
        return f"{self.nom} ({self.code})"


class Stock(BaseModel):
    """Stock multi-entrepôts avec tracking avancé."""
    produit = models.ForeignKey(
        'products.Produit',
        on_delete=models.CASCADE,
        related_name='stocks',
        verbose_name=_("Produit")
    )
    entrepot = models.ForeignKey(
        Entrepot,
        on_delete=models.CASCADE,
        related_name='stocks',
        verbose_name=_("Entrepôt")
    )
    
    # Quantités
    quantite_physique = models.PositiveIntegerField(default=0, verbose_name=_("Quantité physique"))
    quantite_reservee = models.PositiveIntegerField(default=0, verbose_name=_("Quantité réservée"))
    quantite_en_commande = models.PositiveIntegerField(default=0, verbose_name=_("Quantité en commande"))
    
    # Coûts
    cout_unitaire_moyen = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(0)],
        verbose_name=_("Coût unitaire moyen")
    )
    
    # Tracking
    date_derniere_entree = models.DateTimeField(null=True, blank=True, verbose_name=_("Dernière entrée"))
    date_derniere_sortie = models.DateTimeField(null=True, blank=True, verbose_name=_("Dernière sortie"))
    
    # Emplacement
    emplacement = models.CharField(max_length=100, blank=True, verbose_name=_("Emplacement"))
    zone = models.CharField(max_length=50, blank=True, verbose_name=_("Zone"))
    allee = models.CharField(max_length=20, blank=True, verbose_name=_("Allée"))
    etagere = models.CharField(max_length=20, blank=True, verbose_name=_("Étagère"))
    
    class Meta:
        verbose_name = _("Stock")
        verbose_name_plural = _("Stocks")
        unique_together = ['produit', 'entrepot']
        indexes = [
            models.Index(fields=['produit', 'entrepot']),
            models.Index(fields=['quantite_physique']),
        ]
    
    def __str__(self):
        return f"{self.produit.nom} - {self.entrepot.nom} ({self.quantite_disponible})"
    
    @property
    def quantite_disponible(self):
        """Calcule la quantité disponible."""
        return max(0, self.quantite_physique - self.quantite_reservee)
    
    @property
    def valeur_stock(self):
        """Calcule la valeur du stock."""
        return self.quantite_physique * self.cout_unitaire_moyen
    
    def reserver_stock(self, quantite):
        """Réserve une quantité de stock."""
        if quantite <= self.quantite_disponible:
            self.quantite_reservee += quantite
            self.save()
            return True
        return False
    
    def liberer_stock(self, quantite):
        """Libère une quantité de stock réservé."""
        if quantite <= self.quantite_reservee:
            self.quantite_reservee -= quantite
            self.save()
            return True
        return False


class MouvementStock(BaseModel):
    """Historique des mouvements de stock."""
    TYPE_MOUVEMENT_CHOICES = [
        ('entree', _('Entrée')),
        ('sortie', _('Sortie')),
        ('transfert', _('Transfert')),
        ('ajustement', _('Ajustement')),
        ('reservation', _('Réservation')),
        ('liberation', _('Libération')),
    ]
    
    stock = models.ForeignKey(
        Stock,
        on_delete=models.CASCADE,
        related_name='mouvements',
        verbose_name=_("Stock")
    )
    type_mouvement = models.CharField(
        max_length=20,
        choices=TYPE_MOUVEMENT_CHOICES,
        verbose_name=_("Type de mouvement")
    )
    quantite = models.IntegerField(verbose_name=_("Quantité"))
    quantite_avant = models.PositiveIntegerField(verbose_name=_("Quantité avant"))
    quantite_apres = models.PositiveIntegerField(verbose_name=_("Quantité après"))
    
    # Référence
    reference_document = models.CharField(max_length=100, blank=True, verbose_name=_("Référence document"))
    
    # Coût
    cout_unitaire = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_("Coût unitaire")
    )
    
    # Métadonnées
    motif = models.TextField(blank=True, verbose_name=_("Motif"))
    
    class Meta:
        verbose_name = _("Mouvement de stock")
        verbose_name_plural = _("Mouvements de stock")
        ordering = ['-date_creation']
        indexes = [
            models.Index(fields=['stock', 'date_creation']),
            models.Index(fields=['type_mouvement', 'date_creation']),
        ]
    
    def __str__(self):
        return f"{self.get_type_mouvement_display()} - {self.stock.produit.nom} ({self.quantite})"


class TransfertStock(BaseModel):
    """Transferts entre entrepôts."""
    STATUT_CHOICES = [
        ('en_attente', _('En attente')),
        ('en_cours', _('En cours')),
        ('termine', _('Terminé')),
        ('annule', _('Annulé')),
    ]
    
    numero_transfert = models.CharField(max_length=50, unique=True, verbose_name=_("Numéro de transfert"))
    
    # Entrepôts
    entrepot_source = models.ForeignKey(
        Entrepot,
        on_delete=models.PROTECT,
        related_name='transferts_sortants',
        verbose_name=_("Entrepôt source")
    )
    entrepot_destination = models.ForeignKey(
        Entrepot,
        on_delete=models.PROTECT,
        related_name='transferts_entrants',
        verbose_name=_("Entrepôt destination")
    )
    
    # Dates
    date_expedition = models.DateTimeField(null=True, blank=True, verbose_name=_("Date d'expédition"))
    date_reception = models.DateTimeField(null=True, blank=True, verbose_name=_("Date de réception"))
    
    # Statut
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='en_attente', verbose_name=_("Statut"))
    
    # Métadonnées
    notes = models.TextField(blank=True, verbose_name=_("Notes"))
    
    class Meta:
        verbose_name = _("Transfert de stock")
        verbose_name_plural = _("Transferts de stock")
        ordering = ['-date_creation']
    
    def __str__(self):
        return f"Transfert {self.numero_transfert} - {self.entrepot_source} → {self.entrepot_destination}"


class LigneTransfert(BaseModel):
    """Lignes de transfert de stock."""
    transfert = models.ForeignKey(
        TransfertStock,
        on_delete=models.CASCADE,
        related_name='lignes',
        verbose_name=_("Transfert")
    )
    produit = models.ForeignKey(
        'products.Produit',
        on_delete=models.CASCADE,
        verbose_name=_("Produit")
    )
    quantite_demandee = models.PositiveIntegerField(verbose_name=_("Quantité demandée"))
    quantite_expediee = models.PositiveIntegerField(default=0, verbose_name=_("Quantité expédiée"))
    quantite_recue = models.PositiveIntegerField(default=0, verbose_name=_("Quantité reçue"))
    
    class Meta:
        verbose_name = _("Ligne de transfert")
        verbose_name_plural = _("Lignes de transfert")
        unique_together = ['transfert', 'produit']
    
    def __str__(self):
        return f"{self.produit.nom} - {self.quantite_demandee}"


class InventairePhysique(BaseModel):
    """Inventaires physiques périodiques."""
    STATUT_CHOICES = [
        ('planifie', _('Planifié')),
        ('en_cours', _('En cours')),
        ('termine', _('Terminé')),
        ('valide', _('Validé')),
        ('annule', _('Annulé')),
    ]
    
    numero_inventaire = models.CharField(max_length=50, unique=True, verbose_name=_("Numéro d'inventaire"))
    entrepot = models.ForeignKey(
        Entrepot,
        on_delete=models.CASCADE,
        related_name='inventaires',
        verbose_name=_("Entrepôt")
    )
    
    # Dates
    date_planifiee = models.DateTimeField(verbose_name=_("Date planifiée"))
    date_debut = models.DateTimeField(null=True, blank=True, verbose_name=_("Date de début"))
    date_fin = models.DateTimeField(null=True, blank=True, verbose_name=_("Date de fin"))
    
    # Statut
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='planifie', verbose_name=_("Statut"))
    
    # Équipe
    responsable = models.ForeignKey(
        'users.UtilisateurPersonnalise',
        on_delete=models.PROTECT,
        verbose_name=_("Responsable")
    )
    equipe = models.ManyToManyField(
        'users.UtilisateurPersonnalise',
        related_name='inventaires_equipe',
        blank=True,
        verbose_name=_("Équipe")
    )
    
    # Métadonnées
    notes = models.TextField(blank=True, verbose_name=_("Notes"))
    
    class Meta:
        verbose_name = _("Inventaire physique")
        verbose_name_plural = _("Inventaires physiques")
        ordering = ['-date_creation']
    
    def __str__(self):
        return f"Inventaire {self.numero_inventaire} - {self.entrepot.nom}"


class LigneInventaire(BaseModel):
    """Lignes d'inventaire physique."""
    inventaire = models.ForeignKey(
        InventairePhysique,
        on_delete=models.CASCADE,
        related_name='lignes',
        verbose_name=_("Inventaire")
    )
    produit = models.ForeignKey(
        'products.Produit',
        on_delete=models.CASCADE,
        verbose_name=_("Produit")
    )
    
    # Quantités
    quantite_theorique = models.PositiveIntegerField(verbose_name=_("Quantité théorique"))
    quantite_comptee = models.PositiveIntegerField(null=True, blank=True, verbose_name=_("Quantité comptée"))
    
    # Écart
    ecart = models.IntegerField(default=0, verbose_name=_("Écart"))
    
    # Validation
    verifie = models.BooleanField(default=False, verbose_name=_("Vérifié"))
    verifie_par = models.ForeignKey(
        'users.UtilisateurPersonnalise',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_("Vérifié par")
    )
    date_verification = models.DateTimeField(null=True, blank=True, verbose_name=_("Date de vérification"))
    
    # Métadonnées
    notes = models.TextField(blank=True, verbose_name=_("Notes"))
    
    class Meta:
        verbose_name = _("Ligne d'inventaire")
        verbose_name_plural = _("Lignes d'inventaire")
        unique_together = ['inventaire', 'produit']
    
    def save(self, *args, **kwargs):
        # Calculer l'écart automatiquement
        if self.quantite_comptee is not None:
            self.ecart = self.quantite_comptee - self.quantite_theorique
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.produit.nom} - Écart: {self.ecart}"


class CommandeFournisseur(BaseModel):
    """Commandes aux fournisseurs."""
    STATUT_CHOICES = [
        ('brouillon', _('Brouillon')),
        ('envoyee', _('Envoyée')),
        ('confirmee', _('Confirmée')),
        ('partiellement_livree', _('Partiellement livrée')),
        ('livree', _('Livrée')),
        ('annulee', _('Annulée')),
    ]
    
    numero_commande = models.CharField(max_length=50, unique=True, verbose_name=_("Numéro de commande"))
    fournisseur = models.ForeignKey(
        'products.Fournisseur',
        on_delete=models.PROTECT,
        related_name='commandes',
        verbose_name=_("Fournisseur")
    )
    entrepot_livraison = models.ForeignKey(
        Entrepot,
        on_delete=models.PROTECT,
        verbose_name=_("Entrepôt de livraison")
    )
    
    # Dates
    date_commande = models.DateTimeField(auto_now_add=True, verbose_name=_("Date de commande"))
    date_livraison_prevue = models.DateField(verbose_name=_("Date de livraison prévue"))
    date_livraison_reelle = models.DateField(null=True, blank=True, verbose_name=_("Date de livraison réelle"))
    
    # Statut
    statut = models.CharField(max_length=30, choices=STATUT_CHOICES, default='brouillon', verbose_name=_("Statut"))
    
    # Montants
    sous_total = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'), verbose_name=_("Sous-total"))
    tva_montant = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'), verbose_name=_("Montant TVA"))
    total_ttc = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'), verbose_name=_("Total TTC"))
    
    # Métadonnées
    notes = models.TextField(blank=True, verbose_name=_("Notes"))
    reference_fournisseur = models.CharField(max_length=100, blank=True, verbose_name=_("Référence fournisseur"))
    
    # Évaluation
    evaluation = models.PositiveIntegerField(
        null=True,
        blank=True,
        choices=[(i, i) for i in range(1, 6)],
        verbose_name=_("Évaluation")
    )
    commentaire_evaluation = models.TextField(blank=True, verbose_name=_("Commentaire évaluation"))
    
    class Meta:
        verbose_name = _("Commande fournisseur")
        verbose_name_plural = _("Commandes fournisseur")
        ordering = ['-date_creation']
        indexes = [
            models.Index(fields=['fournisseur', 'statut']),
            models.Index(fields=['date_livraison_prevue']),
        ]
    
    def __str__(self):
        return f"Commande {self.numero_commande} - {self.fournisseur.nom}"


class LigneCommandeFournisseur(BaseModel):
    """Lignes de commande fournisseur."""
    commande = models.ForeignKey(
        CommandeFournisseur,
        on_delete=models.CASCADE,
        related_name='lignes',
        verbose_name=_("Commande")
    )
    produit = models.ForeignKey(
        'products.Produit',
        on_delete=models.CASCADE,
        verbose_name=_("Produit")
    )
    
    # Quantités
    quantite_commandee = models.PositiveIntegerField(verbose_name=_("Quantité commandée"))
    quantite_livree = models.PositiveIntegerField(default=0, verbose_name=_("Quantité livrée"))
    
    # Prix
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
        validators=[MinValueValidator(0)],
        verbose_name=_("Remise (%)")
    )
    
    class Meta:
        verbose_name = _("Ligne commande fournisseur")
        verbose_name_plural = _("Lignes commande fournisseur")
        unique_together = ['commande', 'produit']
    
    @property
    def total_ligne(self):
        """Calcule le total de la ligne."""
        prix_avec_remise = self.prix_unitaire * (1 - self.remise_pourcentage / 100)
        return self.quantite_commandee * prix_avec_remise
    
    def __str__(self):
        return f"{self.produit.nom} x{self.quantite_commandee}"