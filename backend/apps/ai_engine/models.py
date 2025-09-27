"""
Modèles pour l'intelligence artificielle et machine learning.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from decimal import Decimal
from apps.core.models import BaseModel


class ModeleIA(BaseModel):
    """Modèles d'intelligence artificielle."""
    TYPE_MODELE_CHOICES = [
        ('recommendation', _('Recommandation')),
        ('prediction_ventes', _('Prédiction ventes')),
        ('detection_anomalies', _('Détection anomalies')),
        ('segmentation_clients', _('Segmentation clients')),
        ('optimisation_prix', _('Optimisation prix')),
        ('chatbot', _('Chatbot')),
        ('ocr', _('OCR')),
        ('reconnaissance_vocale', _('Reconnaissance vocale')),
    ]
    
    STATUT_CHOICES = [
        ('entrainement', _('En entraînement')),
        ('actif', _('Actif')),
        ('inactif', _('Inactif')),
        ('erreur', _('Erreur')),
        ('obsolete', _('Obsolète')),
    ]
    
    # Identification
    nom = models.CharField(max_length=100, verbose_name=_("Nom"))
    description = models.TextField(verbose_name=_("Description"))
    type_modele = models.CharField(
        max_length=30,
        choices=TYPE_MODELE_CHOICES,
        verbose_name=_("Type de modèle")
    )
    version = models.CharField(max_length=20, default='1.0', verbose_name=_("Version"))
    
    # Configuration
    parametres = models.JSONField(default=dict, verbose_name=_("Paramètres"))
    hyperparametres = models.JSONField(default=dict, verbose_name=_("Hyperparamètres"))
    
    # Performance
    precision = models.DecimalField(
        max_digits=5,
        decimal_places=4,
        null=True,
        blank=True,
        verbose_name=_("Précision")
    )
    rappel = models.DecimalField(
        max_digits=5,
        decimal_places=4,
        null=True,
        blank=True,
        verbose_name=_("Rappel")
    )
    f1_score = models.DecimalField(
        max_digits=5,
        decimal_places=4,
        null=True,
        blank=True,
        verbose_name=_("F1 Score")
    )
    
    # Entraînement
    date_entrainement = models.DateTimeField(null=True, blank=True, verbose_name=_("Date d'entraînement"))
    taille_dataset = models.PositiveIntegerField(default=0, verbose_name=_("Taille du dataset"))
    duree_entrainement = models.DurationField(null=True, blank=True, verbose_name=_("Durée d'entraînement"))
    
    # Statut
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='inactif',
        verbose_name=_("Statut")
    )
    
    # Utilisation
    nombre_predictions = models.PositiveIntegerField(default=0, verbose_name=_("Nombre de prédictions"))
    derniere_utilisation = models.DateTimeField(null=True, blank=True, verbose_name=_("Dernière utilisation"))
    
    class Meta:
        verbose_name = _("Modèle IA")
        verbose_name_plural = _("Modèles IA")
        unique_together = ['nom', 'version']
    
    def __str__(self):
        return f"{self.nom} v{self.version}"


class PredictionVente(BaseModel):
    """Prédictions de ventes générées par IA."""
    entrepreneur = models.ForeignKey(
        'users.UtilisateurPersonnalise',
        on_delete=models.CASCADE,
        verbose_name=_("Entrepreneur")
    )
    modele = models.ForeignKey(
        ModeleIA,
        on_delete=models.CASCADE,
        verbose_name=_("Modèle utilisé")
    )
    
    # Période de prédiction
    date_debut = models.DateField(verbose_name=_("Date de début"))
    date_fin = models.DateField(verbose_name=_("Date de fin"))
    
    # Prédictions
    ventes_predites = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        verbose_name=_("Ventes prédites")
    )
    confiance = models.DecimalField(
        max_digits=5,
        decimal_places=4,
        verbose_name=_("Niveau de confiance")
    )
    
    # Détails par produit
    predictions_produits = models.JSONField(
        default=dict,
        verbose_name=_("Prédictions par produit")
    )
    
    # Facteurs influents
    facteurs_cles = models.JSONField(
        default=list,
        verbose_name=_("Facteurs clés")
    )
    
    # Validation
    ventes_reelles = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_("Ventes réelles")
    )
    precision_prediction = models.DecimalField(
        max_digits=5,
        decimal_places=4,
        null=True,
        blank=True,
        verbose_name=_("Précision de la prédiction")
    )
    
    class Meta:
        verbose_name = _("Prédiction de vente")
        verbose_name_plural = _("Prédictions de vente")
        ordering = ['-date_creation']
    
    def __str__(self):
        return f"Prédiction {self.entrepreneur} - {self.date_debut} à {self.date_fin}"


class RecommandationProduit(BaseModel):
    """Recommandations de produits personnalisées."""
    TYPE_RECOMMENDATION_CHOICES = [
        ('similaires', _('Produits similaires')),
        ('complementaires', _('Produits complémentaires')),
        ('upsell', _('Upsell')),
        ('cross_sell', _('Cross-sell')),
        ('personnalisees', _('Recommandations personnalisées')),
    ]
    
    # Utilisateur cible
    utilisateur = models.ForeignKey(
        'users.UtilisateurPersonnalise',
        on_delete=models.CASCADE,
        verbose_name=_("Utilisateur")
    )
    
    # Produit source (optionnel)
    produit_source = models.ForeignKey(
        'products.Produit',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='recommendations_source',
        verbose_name=_("Produit source")
    )
    
    # Produits recommandés
    produits_recommandes = models.ManyToManyField(
        'products.Produit',
        through='RecommandationScore',
        verbose_name=_("Produits recommandés")
    )
    
    # Type et contexte
    type_recommendation = models.CharField(
        max_length=20,
        choices=TYPE_RECOMMENDATION_CHOICES,
        verbose_name=_("Type de recommandation")
    )
    contexte = models.JSONField(
        default=dict,
        verbose_name=_("Contexte de la recommandation")
    )
    
    # Performance
    nombre_vues = models.PositiveIntegerField(default=0, verbose_name=_("Nombre de vues"))
    nombre_clics = models.PositiveIntegerField(default=0, verbose_name=_("Nombre de clics"))
    nombre_conversions = models.PositiveIntegerField(default=0, verbose_name=_("Nombre de conversions"))
    
    # Validité
    date_expiration = models.DateTimeField(verbose_name=_("Date d'expiration"))
    active = models.BooleanField(default=True, verbose_name=_("Active"))
    
    class Meta:
        verbose_name = _("Recommandation produit")
        verbose_name_plural = _("Recommandations produit")
        ordering = ['-date_creation']
    
    def __str__(self):
        return f"Recommandation {self.get_type_recommendation_display()} - {self.utilisateur}"
    
    @property
    def taux_clic(self):
        """Calcule le taux de clic."""
        if self.nombre_vues > 0:
            return (self.nombre_clics / self.nombre_vues) * 100
        return 0
    
    @property
    def taux_conversion(self):
        """Calcule le taux de conversion."""
        if self.nombre_clics > 0:
            return (self.nombre_conversions / self.nombre_clics) * 100
        return 0


class RecommandationScore(BaseModel):
    """Score de recommandation pour chaque produit."""
    recommendation = models.ForeignKey(
        RecommandationProduit,
        on_delete=models.CASCADE,
        verbose_name=_("Recommandation")
    )
    produit = models.ForeignKey(
        'products.Produit',
        on_delete=models.CASCADE,
        verbose_name=_("Produit")
    )
    
    # Score
    score = models.DecimalField(
        max_digits=5,
        decimal_places=4,
        verbose_name=_("Score de recommandation")
    )
    rang = models.PositiveIntegerField(verbose_name=_("Rang"))
    
    # Raisons
    raisons = models.JSONField(
        default=list,
        verbose_name=_("Raisons de la recommandation")
    )
    
    class Meta:
        verbose_name = _("Score de recommandation")
        verbose_name_plural = _("Scores de recommandation")
        unique_together = ['recommendation', 'produit']
        ordering = ['rang']
    
    def __str__(self):
        return f"{self.produit.nom} - Score: {self.score}"


class AnalyseComportement(BaseModel):
    """Analyse du comportement utilisateur."""
    utilisateur = models.ForeignKey(
        'users.UtilisateurPersonnalise',
        on_delete=models.CASCADE,
        verbose_name=_("Utilisateur")
    )
    
    # Données comportementales
    pages_visitees = models.JSONField(default=list, verbose_name=_("Pages visitées"))
    produits_vus = models.JSONField(default=list, verbose_name=_("Produits vus"))
    temps_session = models.DurationField(verbose_name=_("Temps de session"))
    actions_effectuees = models.JSONField(default=list, verbose_name=_("Actions effectuées"))
    
    # Analyse
    segment_comportemental = models.CharField(
        max_length=50,
        choices=[
            ('explorateur', _('Explorateur')),
            ('decideur_rapide', _('Décideur rapide')),
            ('comparateur', _('Comparateur')),
            ('fidele', _('Fidèle')),
            ('occasionnel', _('Occasionnel')),
        ],
        blank=True,
        verbose_name=_("Segment comportemental")
    )
    
    # Scores
    score_engagement = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name=_("Score d'engagement")
    )
    probabilite_achat = models.DecimalField(
        max_digits=5,
        decimal_places=4,
        default=Decimal('0.00'),
        verbose_name=_("Probabilité d'achat")
    )
    
    class Meta:
        verbose_name = _("Analyse comportement")
        verbose_name_plural = _("Analyses comportement")
        ordering = ['-date_creation']
    
    def __str__(self):
        return f"Analyse {self.utilisateur} - {self.date_creation.date()}"


class ChatbotConversation(BaseModel):
    """Conversations avec le chatbot IA."""
    utilisateur = models.ForeignKey(
        'users.UtilisateurPersonnalise',
        on_delete=models.CASCADE,
        verbose_name=_("Utilisateur")
    )
    
    # Session
    session_id = models.CharField(max_length=100, verbose_name=_("ID de session"))
    
    # Messages
    messages = models.JSONField(
        default=list,
        verbose_name=_("Messages de la conversation")
    )
    
    # Analyse
    intention_detectee = models.CharField(
        max_length=50,
        choices=[
            ('question_produit', _('Question produit')),
            ('statut_commande', _('Statut commande')),
            ('probleme_paiement', _('Problème paiement')),
            ('support_technique', _('Support technique')),
            ('demande_generale', _('Demande générale')),
        ],
        blank=True,
        verbose_name=_("Intention détectée")
    )
    sentiment = models.CharField(
        max_length=20,
        choices=[
            ('positif', _('Positif')),
            ('neutre', _('Neutre')),
            ('negatif', _('Négatif')),
        ],
        blank=True,
        verbose_name=_("Sentiment")
    )
    
    # Résolution
    resolu = models.BooleanField(default=False, verbose_name=_("Résolu"))
    transfere_humain = models.BooleanField(default=False, verbose_name=_("Transféré à un humain"))
    satisfaction = models.PositiveIntegerField(
        null=True,
        blank=True,
        choices=[(i, i) for i in range(1, 6)],
        verbose_name=_("Satisfaction")
    )
    
    class Meta:
        verbose_name = _("Conversation chatbot")
        verbose_name_plural = _("Conversations chatbot")
        ordering = ['-date_creation']
    
    def __str__(self):
        return f"Conversation {self.utilisateur} - {self.session_id}"