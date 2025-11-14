"""
Modèles produits ultra-avancés avec toutes les fonctionnalités.
"""
import uuid
import qrcode
from io import BytesIO
from django.core.files import File
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from decimal import Decimal
from apps.core.models import BaseModel, UNITES_MESURE, STATUTS_GENERIQUES


class Categorie(BaseModel):
    """Catégories de produits avec hiérarchie."""
    nom = models.CharField(max_length=100, verbose_name=_("Nom"))
    description = models.TextField(blank=True, verbose_name=_("Description"))
    slug = models.SlugField(unique=True, verbose_name=_("Slug"))
    
    # Hiérarchie
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='sous_categories',
        verbose_name=_("Catégorie parent")
    )
    
    # Visuel
    image = models.ImageField(upload_to='categories/', blank=True, verbose_name=_("Image"))
    icone = models.CharField(max_length=50, blank=True, verbose_name=_("Icône"))
    couleur = models.CharField(max_length=7, default='#6B7280', verbose_name=_("Couleur"))
    
    # Métadonnées
    ordre_affichage = models.PositiveIntegerField(default=0, verbose_name=_("Ordre d'affichage"))
    visible = models.BooleanField(default=True, verbose_name=_("Visible"))
    
    # SEO
    meta_titre = models.CharField(max_length=200, blank=True, verbose_name=_("Meta titre"))
    meta_description = models.TextField(blank=True, verbose_name=_("Meta description"))
    
    class Meta:
        verbose_name = _("Catégorie")
        verbose_name_plural = _("Catégories")
        ordering = ['ordre_affichage', 'nom']
        indexes = [
            models.Index(fields=['parent', 'visible']),
            models.Index(fields=['slug']),
        ]
    
    def __str__(self):
        if self.parent:
            return f"{self.parent.nom} > {self.nom}"
        return self.nom
    
    @property
    def niveau(self):
        """Retourne le niveau dans la hiérarchie."""
        niveau = 0
        parent = self.parent
        while parent:
            niveau += 1
            parent = parent.parent
        return niveau
    
    def get_descendants(self):
        """Retourne tous les descendants."""
        descendants = []
        for enfant in self.sous_categories.all():
            descendants.append(enfant)
            descendants.extend(enfant.get_descendants())
        return descendants


class Marque(BaseModel):
    """Marques de produits."""
    nom = models.CharField(max_length=100, unique=True, verbose_name=_("Nom"))
    description = models.TextField(blank=True, verbose_name=_("Description"))
    logo = models.ImageField(upload_to='marques/', blank=True, verbose_name=_("Logo"))
    site_web = models.URLField(blank=True, verbose_name=_("Site web"))
    
    # Métadonnées
    pays_origine = models.CharField(max_length=100, blank=True, verbose_name=_("Pays d'origine"))
    
    class Meta:
        verbose_name = _("Marque")
        verbose_name_plural = _("Marques")
        ordering = ['nom']
    
    def __str__(self):
        return self.nom


class Fournisseur(BaseModel):
    """Fournisseurs avec évaluation."""
    # Informations de base
    nom = models.CharField(max_length=200, verbose_name=_("Nom"))
    contact_nom = models.CharField(max_length=100, verbose_name=_("Nom du contact"))
    contact_fonction = models.CharField(max_length=100, blank=True, verbose_name=_("Fonction du contact"))
    
    # Coordonnées
    email = models.EmailField(verbose_name=_("Email"))
    telephone = models.CharField(max_length=20, verbose_name=_("Téléphone"))
    telephone_secondaire = models.CharField(max_length=20, blank=True, verbose_name=_("Téléphone secondaire"))
    
    # Adresse
    adresse = models.ForeignKey(
        'core.Adresse',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_("Adresse")
    )
    
    # Informations commerciales
    conditions_paiement = models.CharField(max_length=200, verbose_name=_("Conditions de paiement"))
    delai_livraison = models.PositiveIntegerField(verbose_name=_("Délai de livraison (jours)"))
    montant_minimum_commande = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name=_("Montant minimum de commande")
    )
    
    # Évaluation
    evaluation = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name=_("Évaluation")
    )
    nombre_evaluations = models.PositiveIntegerField(default=0, verbose_name=_("Nombre d'évaluations"))
    
    # Métadonnées
    entreprise = models.ForeignKey(
        'companies.Entreprise',
        on_delete=models.CASCADE,
        verbose_name=_("Entreprise")
    )
    statut = models.CharField(max_length=20, choices=STATUTS_GENERIQUES, default='actif', verbose_name=_("Statut"))
    
    # Statistiques
    nombre_commandes = models.PositiveIntegerField(default=0, verbose_name=_("Nombre de commandes"))
    montant_total_commandes = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name=_("Montant total des commandes")
    )
    
    class Meta:
        verbose_name = _("Fournisseur")
        verbose_name_plural = _("Fournisseurs")
        indexes = [
            models.Index(fields=['entreprise', 'statut']),
            models.Index(fields=['evaluation']),
        ]
    
    def __str__(self):
        return self.nom
    
    def calculer_evaluation_moyenne(self):
        """Calcule l'évaluation moyenne basée sur les commandes."""
        from apps.inventory.models import CommandeFournisseur
        commandes = CommandeFournisseur.objects.filter(
            fournisseur=self,
            evaluation__isnull=False
        )
        
        if commandes.exists():
            moyenne = commandes.aggregate(
                models.Avg('evaluation')
            )['evaluation__avg']
            self.evaluation = round(moyenne, 2)
            self.nombre_evaluations = commandes.count()
            self.save()


class Produit(BaseModel):
    """Modèle produit ultra-complet avec toutes les fonctionnalités."""
    # Informations de base
    nom = models.CharField(max_length=200, verbose_name=_("Nom"))
    description_courte = models.CharField(max_length=500, verbose_name=_("Description courte"))
    description_longue = models.TextField(blank=True, verbose_name=_("Description longue"))
    
    # Classification
    categorie = models.ForeignKey(
        Categorie,
        on_delete=models.PROTECT,
        related_name='produits',
        verbose_name=_("Catégorie")
    )
    sous_categorie = models.ForeignKey(
        Categorie,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='produits_sous_categorie',
        verbose_name=_("Sous-catégorie")
    )
    marque = models.ForeignKey(
        Marque,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_("Marque")
    )
    
    # Identification
    sku = models.CharField(max_length=100, unique=True, verbose_name=_("SKU"))
    code_barre = models.CharField(max_length=50, unique=True, null=True, blank=True, verbose_name=_("Code-barres"))
    qr_code = models.ImageField(upload_to='qr_codes/', blank=True, verbose_name=_("QR Code"))
    
    # Prix
    prix_achat = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name=_("Prix d'achat")
    )
    prix_vente = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name=_("Prix de vente")
    )
    prix_promotion = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        verbose_name=_("Prix promotionnel")
    )
    
    # TVA
    tva_taux = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('18.00'),
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name=_("Taux de TVA (%)")
    )
    
    # Mesures - Simplifié
    unite_mesure = models.CharField(
        max_length=20,
        choices=UNITES_MESURE,
        default='piece',
        verbose_name=_("Unité de mesure")
    )
    
    # Variantes
    couleurs_disponibles = models.JSONField(
        default=list,
        help_text=_("Liste des couleurs disponibles"),
        verbose_name=_("Couleurs disponibles")
    )
    tailles_disponibles = models.JSONField(
        default=list,
        help_text=_("Liste des tailles disponibles"),
        verbose_name=_("Tailles disponibles")
    )
    
    # Stock - Simplifié
    stock = models.PositiveIntegerField(default=0, verbose_name=_("Stock"))
    
    # Gestion des péremptions
    date_peremption = models.DateField(null=True, blank=True, verbose_name=_("Date de péremption"))
    duree_conservation = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text=_("Durée de conservation en jours"),
        verbose_name=_("Durée de conservation")
    )
    
    # Fournisseurs
    fournisseurs = models.ManyToManyField(
        Fournisseur,
        through='ProduitFournisseur',
        verbose_name=_("Fournisseurs")
    )
    
    # Métadonnées
    entreprise = models.ForeignKey(
        'companies.Entreprise',
        on_delete=models.CASCADE,
        verbose_name=_("Entreprise")
    )
    statut = models.CharField(
        max_length=20,
        choices=[
            ('actif', _('Actif')),
            ('inactif', _('Inactif')),
            ('rupture', _('Rupture de stock')),
            ('discontinue', _('Discontinué')),
        ],
        default='actif',
        verbose_name=_("Statut")
    )
    
    # Analytics
    popularite_score = models.PositiveIntegerField(default=0, verbose_name=_("Score de popularité"))
    nombre_vues = models.PositiveIntegerField(default=0, verbose_name=_("Nombre de vues"))
    nombre_ventes = models.PositiveIntegerField(default=0, verbose_name=_("Nombre de ventes"))
    
    # SEO
    slug = models.SlugField(unique=True, verbose_name=_("Slug"))
    meta_titre = models.CharField(max_length=200, blank=True, verbose_name=_("Meta titre"))
    meta_description = models.TextField(blank=True, verbose_name=_("Meta description"))
    
    # Promotion
    en_promotion = models.BooleanField(default=False, verbose_name=_("En promotion"))
    date_debut_promotion = models.DateTimeField(null=True, blank=True, verbose_name=_("Début promotion"))
    date_fin_promotion = models.DateTimeField(null=True, blank=True, verbose_name=_("Fin promotion"))
    
    # Configuration
    vendable = models.BooleanField(default=True, verbose_name=_("Vendable"))
    achetable = models.BooleanField(default=True, verbose_name=_("Achetable"))
    visible_catalogue = models.BooleanField(default=True, verbose_name=_("Visible dans le catalogue"))
    
    class Meta:
        verbose_name = _("Produit")
        verbose_name_plural = _("Produits")
        indexes = [
            models.Index(fields=['entreprise', 'statut']),
            models.Index(fields=['categorie', 'statut']),
            models.Index(fields=['sku']),
            models.Index(fields=['code_barre']),
            models.Index(fields=['popularite_score']),
            models.Index(fields=['en_promotion', 'date_fin_promotion']),
            # Index composite pour ultra_fast_list (requête la plus fréquente)
            models.Index(fields=['visible_catalogue', 'statut', 'date_creation']),
        ]
        ordering = ['-date_creation']
    
    def __str__(self):
        return f"{self.nom} ({self.sku})"
    
    def save(self, *args, **kwargs):
        # Générer le slug automatiquement s'il n'existe pas
        if not self.slug and self.nom:
            from django.utils.text import slugify
            base_slug = slugify(self.nom)
            slug = base_slug
            counter = 1
            while Produit.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        
        # Générer le QR code automatiquement
        if not self.qr_code and self.sku:
            self.generer_qr_code()
        super().save(*args, **kwargs)
    
    def generer_qr_code(self):
        """Génère automatiquement le QR code du produit."""
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(f"PRODUCT:{self.sku}")
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        filename = f"qr_{self.sku}.png"
        self.qr_code.save(filename, File(buffer), save=False)
    
    @property
    def marge_beneficiaire(self):
        """Calcule la marge bénéficiaire."""
        if self.prix_achat > 0:
            return ((self.prix_vente - self.prix_achat) / self.prix_achat) * 100
        return 0
    
    @property
    def prix_ttc(self):
        """Calcule le prix TTC."""
        prix = self.prix_promotion if self.en_promotion and self.prix_promotion else self.prix_vente
        return prix * (1 + self.tva_taux / 100)
    
    @property
    def stock_actuel(self):
        """Retourne le stock actuel."""
        return self.stock
    
    @property
    def stock_disponible(self):
        """Retourne le stock disponible."""
        return self.stock
    
    @property
    def en_rupture(self):
        """Vérifie si le produit est en rupture de stock."""
        return self.stock <= 0
    
    def incrementer_vues(self):
        """Incrémente le nombre de vues."""
        self.nombre_vues += 1
        self.save(update_fields=['nombre_vues'])
    
    def incrementer_ventes(self):
        """Incrémente le nombre de ventes."""
        self.nombre_ventes += 1
        # Mise à jour du score de popularité
        self.popularite_score = self.nombre_vues + (self.nombre_ventes * 10)
        self.save(update_fields=['nombre_ventes', 'popularite_score'])


class ProduitFournisseur(BaseModel):
    """Relation produit-fournisseur avec prix et délais."""
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE, verbose_name=_("Produit"))
    fournisseur = models.ForeignKey(Fournisseur, on_delete=models.CASCADE, verbose_name=_("Fournisseur"))
    
    # Prix et conditions
    prix_achat = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name=_("Prix d'achat")
    )
    quantite_minimum = models.PositiveIntegerField(default=1, verbose_name=_("Quantité minimum"))
    delai_livraison = models.PositiveIntegerField(verbose_name=_("Délai de livraison (jours)"))
    
    # Référence fournisseur
    reference_fournisseur = models.CharField(max_length=100, blank=True, verbose_name=_("Référence fournisseur"))
    
    # Métadonnées
    principal = models.BooleanField(default=False, verbose_name=_("Fournisseur principal"))
    
    class Meta:
        verbose_name = _("Produit-Fournisseur")
        verbose_name_plural = _("Produits-Fournisseurs")
        unique_together = ['produit', 'fournisseur']
    
    def __str__(self):
        return f"{self.produit.nom} - {self.fournisseur.nom}"


class ImageProduit(BaseModel):
    """Images des produits avec métadonnées."""
    produit = models.ForeignKey(
        Produit,
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name=_("Produit")
    )
    image = models.ImageField(upload_to='produits/', verbose_name=_("Image"))
    alt_text = models.CharField(max_length=200, blank=True, verbose_name=_("Texte alternatif"))
    
    # Métadonnées
    principale = models.BooleanField(default=False, verbose_name=_("Image principale"))
    ordre_affichage = models.PositiveIntegerField(default=0, verbose_name=_("Ordre d'affichage"))
    
    # Variante
    couleur = models.CharField(max_length=50, blank=True, verbose_name=_("Couleur"))
    taille = models.CharField(max_length=50, blank=True, verbose_name=_("Taille"))
    
    class Meta:
        verbose_name = _("Image produit")
        verbose_name_plural = _("Images produit")
        ordering = ['ordre_affichage']
        indexes = [
            models.Index(fields=['produit', 'principale']),
        ]
    
    def __str__(self):
        return f"Image de {self.produit.nom}"


class VarianteProduit(BaseModel):
    """Variantes de produits (couleur, taille, etc.)."""
    produit = models.ForeignKey(
        Produit,
        on_delete=models.CASCADE,
        related_name='variantes',
        verbose_name=_("Produit")
    )
    
    # Attributs de variante
    couleur = models.CharField(max_length=50, blank=True, verbose_name=_("Couleur"))
    taille = models.CharField(max_length=50, blank=True, verbose_name=_("Taille"))
    materiau = models.CharField(max_length=100, blank=True, verbose_name=_("Matériau"))
    
    # Prix spécifique
    prix_supplement = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name=_("Supplément de prix")
    )
    
    # Stock spécifique
    sku_variante = models.CharField(max_length=100, unique=True, verbose_name=_("SKU variante"))
    
    # Métadonnées
    active = models.BooleanField(default=True, verbose_name=_("Active"))
    
    class Meta:
        verbose_name = _("Variante produit")
        verbose_name_plural = _("Variantes produit")
        unique_together = ['produit', 'couleur', 'taille']
    
    def __str__(self):
        variante = []
        if self.couleur:
            variante.append(self.couleur)
        if self.taille:
            variante.append(self.taille)
        return f"{self.produit.nom} - {' / '.join(variante)}"
    
    @property
    def prix_final(self):
        """Calcule le prix final avec supplément."""
        return self.produit.prix_vente + self.prix_supplement


class Bundle(BaseModel):
    """Packs/bundles de produits."""
    nom = models.CharField(max_length=200, verbose_name=_("Nom du bundle"))
    description = models.TextField(verbose_name=_("Description"))
    
    # Prix
    prix_bundle = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name=_("Prix du bundle")
    )
    
    # Métadonnées
    entreprise = models.ForeignKey(
        'companies.Entreprise',
        on_delete=models.CASCADE,
        verbose_name=_("Entreprise")
    )
    actif = models.BooleanField(default=True, verbose_name=_("Actif"))
    
    # Promotion
    en_promotion = models.BooleanField(default=False, verbose_name=_("En promotion"))
    date_debut_promotion = models.DateTimeField(null=True, blank=True, verbose_name=_("Début promotion"))
    date_fin_promotion = models.DateTimeField(null=True, blank=True, verbose_name=_("Fin promotion"))
    
    class Meta:
        verbose_name = _("Bundle")
        verbose_name_plural = _("Bundles")
        indexes = [
            models.Index(fields=['entreprise', 'actif']),
        ]
    
    def __str__(self):
        return self.nom
    
    @property
    def prix_total_produits(self):
        """Calcule le prix total des produits individuels."""
        return sum(
            item.produit.prix_vente * item.quantite
            for item in self.items.all()
        )
    
    @property
    def economie(self):
        """Calcule l'économie réalisée."""
        return self.prix_total_produits - self.prix_bundle


class BundleItem(BaseModel):
    """Items d'un bundle."""
    bundle = models.ForeignKey(
        Bundle,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name=_("Bundle")
    )
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE, verbose_name=_("Produit"))
    quantite = models.PositiveIntegerField(default=1, verbose_name=_("Quantité"))
    
    class Meta:
        verbose_name = _("Item de bundle")
        verbose_name_plural = _("Items de bundle")
        unique_together = ['bundle', 'produit']
    
    def __str__(self):
        return f"{self.bundle.nom} - {self.produit.nom} (x{self.quantite})"