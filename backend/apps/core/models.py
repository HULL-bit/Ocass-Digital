"""
Modèles de base ultra-avancés pour la plateforme commerciale.
"""
import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.gis.db import models as gis_models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from decimal import Decimal


class TimeStampedModel(models.Model):
    """Modèle de base avec timestamps automatiques."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date_creation = models.DateTimeField(auto_now_add=True, verbose_name=_("Date de création"))
    date_modification = models.DateTimeField(auto_now=True, verbose_name=_("Date de modification"))
    
    class Meta:
        abstract = True


class SoftDeleteModel(models.Model):
    """Modèle avec suppression logique."""
    supprime = models.BooleanField(default=False, verbose_name=_("Supprimé"))
    date_suppression = models.DateTimeField(null=True, blank=True, verbose_name=_("Date de suppression"))
    
    class Meta:
        abstract = True


class AuditModel(models.Model):
    """Modèle avec audit trail complet."""
    cree_par_id = models.UUIDField(
        null=True,
        blank=True,
        verbose_name=_("ID du créateur")
    )
    modifie_par_id = models.UUIDField(
        null=True,
        blank=True,
        verbose_name=_("ID du modificateur")
    )
    
    class Meta:
        abstract = True


class BaseModel(TimeStampedModel, SoftDeleteModel, AuditModel):
    """Modèle de base complet avec toutes les fonctionnalités."""
    
    class Meta:
        abstract = True


# Choix pour les secteurs d'activité - Focus Commerce
SECTEURS_ACTIVITE = [
    ('commerce_general', _('Commerce Général')),
    ('commerce_alimentaire', _('Commerce Alimentaire')),
    ('commerce_textile', _('Commerce Textile & Vêtements')),
    ('commerce_electronique', _('Commerce Électronique & High-Tech')),
    ('commerce_pharmaceutique', _('Commerce Pharmaceutique')),
    ('commerce_automobile', _('Commerce Automobile')),
    ('commerce_immobilier', _('Commerce Immobilier')),
    ('commerce_artisanat', _('Commerce Artisanal')),
    ('commerce_import_export', _('Commerce Import/Export')),
    ('commerce_retail', _('Commerce de Détail')),
    ('commerce_wholesale', _('Commerce de Gros')),
    ('commerce_online', _('Commerce en Ligne')),
    ('autre', _('Autre')),
]

# Choix pour les statuts
STATUTS_GENERIQUES = [
    ('actif', _('Actif')),
    ('inactif', _('Inactif')),
    ('suspendu', _('Suspendu')),
    ('archive', _('Archivé')),
]

# Choix pour les devises
DEVISES = [
    ('XOF', _('Franc CFA (XOF)')),
    ('EUR', _('Euro (EUR)')),
    ('USD', _('Dollar US (USD)')),
    ('GBP', _('Livre Sterling (GBP)')),
]

# Choix pour les langues
LANGUES = [
    ('fr', _('Français')),
    ('en', _('Anglais')),
    ('ar', _('Arabe')),
    ('wo', _('Wolof')),
]

# Choix pour les thèmes
THEMES = [
    ('light', _('Clair')),
    ('dark', _('Sombre')),
    ('auto', _('Automatique')),
]

# Choix pour les fuseaux horaires
FUSEAUX_HORAIRES = [
    ('Africa/Dakar', _('Dakar (GMT+0)')),
    ('Africa/Casablanca', _('Casablanca (GMT+1)')),
    ('Europe/Paris', _('Paris (GMT+1)')),
    ('America/New_York', _('New York (GMT-5)')),
]

# Choix pour les modes de paiement
MODES_PAIEMENT = [
    ('cash', _('Espèces')),
    ('card', _('Carte bancaire')),
    ('wave', _('Wave Money')),
    ('orange_money', _('Orange Money')),
    ('free_money', _('Free Money')),
    ('virement', _('Virement bancaire')),
    ('cheque', _('Chèque')),
]

# Choix pour les statuts de paiement
STATUTS_PAIEMENT = [
    ('pending', _('En attente')),
    ('processing', _('En cours')),
    ('completed', _('Terminé')),
    ('failed', _('Échoué')),
    ('cancelled', _('Annulé')),
    ('refunded', _('Remboursé')),
]

# Choix pour les priorités
PRIORITES = [
    ('low', _('Basse')),
    ('medium', _('Moyenne')),
    ('high', _('Haute')),
    ('urgent', _('Urgente')),
]

# Choix pour les types de notifications
TYPES_NOTIFICATIONS = [
    ('info', _('Information')),
    ('success', _('Succès')),
    ('warning', _('Avertissement')),
    ('error', _('Erreur')),
    ('system', _('Système')),
    ('marketing', _('Marketing')),
]

# Choix pour les unités de mesure
UNITES_MESURE = [
    ('piece', _('Pièce')),
    ('kg', _('Kilogramme')),
    ('g', _('Gramme')),
    ('l', _('Litre')),
    ('ml', _('Millilitre')),
    ('m', _('Mètre')),
    ('cm', _('Centimètre')),
    ('m2', _('Mètre carré')),
    ('m3', _('Mètre cube')),
    ('pack', _('Pack')),
    ('carton', _('Carton')),
    ('palette', _('Palette')),
]


class Adresse(BaseModel):
    """Modèle pour les adresses avec géolocalisation."""
    nom = models.CharField(max_length=100, verbose_name=_("Nom de l'adresse"))
    adresse_ligne1 = models.CharField(max_length=255, verbose_name=_("Adresse ligne 1"))
    adresse_ligne2 = models.CharField(max_length=255, blank=True, verbose_name=_("Adresse ligne 2"))
    ville = models.CharField(max_length=100, verbose_name=_("Ville"))
    code_postal = models.CharField(max_length=20, blank=True, verbose_name=_("Code postal"))
    region = models.CharField(max_length=100, verbose_name=_("Région"))
    pays = models.CharField(max_length=100, default='Sénégal', verbose_name=_("Pays"))
    
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
    point = gis_models.PointField(null=True, blank=True, verbose_name=_("Point géographique"))
    
    # Métadonnées
    type_adresse = models.CharField(
        max_length=20,
        choices=[
            ('domicile', _('Domicile')),
            ('travail', _('Travail')),
            ('facturation', _('Facturation')),
            ('livraison', _('Livraison')),
            ('autre', _('Autre')),
        ],
        default='domicile',
        verbose_name=_("Type d'adresse")
    )
    principale = models.BooleanField(default=False, verbose_name=_("Adresse principale"))
    
    class Meta:
        verbose_name = _("Adresse")
        verbose_name_plural = _("Adresses")
        indexes = [
            models.Index(fields=['ville', 'region']),
            models.Index(fields=['latitude', 'longitude']),
        ]
    
    def __str__(self):
        return f"{self.nom} - {self.ville}, {self.region}"
    
    @property
    def adresse_complete(self):
        """Retourne l'adresse complète formatée."""
        adresse = self.adresse_ligne1
        if self.adresse_ligne2:
            adresse += f", {self.adresse_ligne2}"
        adresse += f", {self.ville}"
        if self.code_postal:
            adresse += f" {self.code_postal}"
        adresse += f", {self.region}, {self.pays}"
        return adresse


class Document(BaseModel):
    """Modèle pour la gestion des documents."""
    nom = models.CharField(max_length=255, verbose_name=_("Nom du document"))
    description = models.TextField(blank=True, verbose_name=_("Description"))
    fichier = models.FileField(upload_to='documents/%Y/%m/', verbose_name=_("Fichier"))
    type_mime = models.CharField(max_length=100, blank=True, verbose_name=_("Type MIME"))
    taille = models.PositiveIntegerField(default=0, verbose_name=_("Taille en octets"))
    
    # Métadonnées
    type_document = models.CharField(
        max_length=50,
        choices=[
            ('facture', _('Facture')),
            ('devis', _('Devis')),
            ('contrat', _('Contrat')),
            ('rapport', _('Rapport')),
            ('image', _('Image')),
            ('video', _('Vidéo')),
            ('audio', _('Audio')),
            ('autre', _('Autre')),
        ],
        default='autre',
        verbose_name=_("Type de document")
    )
    
    # Sécurité
    public = models.BooleanField(default=False, verbose_name=_("Public"))
    mot_de_passe = models.CharField(max_length=255, blank=True, verbose_name=_("Mot de passe"))
    
    # Versioning
    version = models.CharField(max_length=20, default='1.0', verbose_name=_("Version"))
    document_parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='versions',
        verbose_name=_("Document parent")
    )
    
    class Meta:
        verbose_name = _("Document")
        verbose_name_plural = _("Documents")
        indexes = [
            models.Index(fields=['type_document', 'date_creation']),
            models.Index(fields=['public', 'supprime']),
        ]
    
    def __str__(self):
        return f"{self.nom} (v{self.version})"
    
    def save(self, *args, **kwargs):
        if self.fichier:
            self.taille = self.fichier.size
        super().save(*args, **kwargs)


class ParametreSysteme(BaseModel):
    """Modèle pour les paramètres système configurables."""
    cle = models.CharField(max_length=100, unique=True, verbose_name=_("Clé"))
    valeur = models.TextField(verbose_name=_("Valeur"))
    type_valeur = models.CharField(
        max_length=20,
        choices=[
            ('string', _('Chaîne')),
            ('integer', _('Entier')),
            ('float', _('Décimal')),
            ('boolean', _('Booléen')),
            ('json', _('JSON')),
        ],
        default='string',
        verbose_name=_("Type de valeur")
    )
    description = models.TextField(blank=True, verbose_name=_("Description"))
    categorie = models.CharField(max_length=50, verbose_name=_("Catégorie"))
    
    # Métadonnées
    modifiable = models.BooleanField(default=True, verbose_name=_("Modifiable"))
    sensible = models.BooleanField(default=False, verbose_name=_("Sensible"))
    
    class Meta:
        verbose_name = _("Paramètre système")
        verbose_name_plural = _("Paramètres système")
        indexes = [
            models.Index(fields=['categorie', 'cle']),
        ]
    
    def __str__(self):
        return f"{self.cle} = {self.valeur}"
    
    def get_valeur_typee(self):
        """Retourne la valeur avec le bon type."""
        if self.type_valeur == 'integer':
            return int(self.valeur)
        elif self.type_valeur == 'float':
            return float(self.valeur)
        elif self.type_valeur == 'boolean':
            return self.valeur.lower() in ('true', '1', 'yes', 'on')
        elif self.type_valeur == 'json':
            import json
            return json.loads(self.valeur)
        return self.valeur


class JournalAudit(models.Model):
    """Journal d'audit pour tracer toutes les actions."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Qui
    utilisateur_id = models.UUIDField(
        null=True,
        blank=True,
        verbose_name=_("ID de l'utilisateur")
    )
    adresse_ip = models.GenericIPAddressField(verbose_name=_("Adresse IP"))
    user_agent = models.TextField(blank=True, verbose_name=_("User Agent"))
    
    # Quoi
    action = models.CharField(max_length=50, verbose_name=_("Action"))
    modele = models.CharField(max_length=100, verbose_name=_("Modèle"))
    objet_id = models.CharField(max_length=100, verbose_name=_("ID de l'objet"))
    
    # Détails
    donnees_avant = models.JSONField(null=True, blank=True, verbose_name=_("Données avant"))
    donnees_apres = models.JSONField(null=True, blank=True, verbose_name=_("Données après"))
    
    # Quand
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name=_("Horodatage"))
    
    # Métadonnées
    session_id = models.CharField(max_length=100, blank=True, verbose_name=_("ID de session"))
    niveau_risque = models.CharField(
        max_length=20,
        choices=[
            ('low', _('Faible')),
            ('medium', _('Moyen')),
            ('high', _('Élevé')),
            ('critical', _('Critique')),
        ],
        default='low',
        verbose_name=_("Niveau de risque")
    )
    
    class Meta:
        verbose_name = _("Journal d'audit")
        verbose_name_plural = _("Journaux d'audit")
        indexes = [
            models.Index(fields=['utilisateur_id', 'timestamp']),
            models.Index(fields=['modele', 'objet_id']),
            models.Index(fields=['action', 'timestamp']),
            models.Index(fields=['niveau_risque', 'timestamp']),
        ]
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.utilisateur_id} - {self.action} - {self.modele} - {self.timestamp}"