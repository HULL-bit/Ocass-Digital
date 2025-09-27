"""
Modèles utilisateurs ultra-avancés avec toutes les fonctionnalités.
"""
import uuid
import pyotp
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _
from apps.core.models import BaseModel, SECTEURS_ACTIVITE, STATUTS_GENERIQUES, DEVISES, LANGUES, THEMES, FUSEAUX_HORAIRES


class UtilisateurPersonnalise(AbstractUser):
    """Utilisateur personnalisé ultra-avancé."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Utiliser l'email comme champ d'authentification
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    # Redéfinir l'email comme unique
    email = models.EmailField(unique=True, verbose_name=_("Email"))
    
    # Type d'utilisateur
    TYPE_UTILISATEUR_CHOICES = [
        ('admin', _('Administrateur')),
        ('entrepreneur', _('Entrepreneur')),
        ('client', _('Client')),
        ('employe', _('Employé')),
        ('support', _('Support')),
    ]
    type_utilisateur = models.CharField(
        max_length=20, 
        choices=TYPE_UTILISATEUR_CHOICES,
        verbose_name=_("Type d'utilisateur")
    )
    
    # Entreprise (optionnel pour les clients)
    entreprise_id = models.UUIDField(
        null=True,
        blank=True,
        verbose_name=_("ID de l'entreprise")
    )
    
    # Informations personnelles étendues
    telephone = models.CharField(
        max_length=20,
        validators=[RegexValidator(r'^\+?1?\d{9,15}$')],
        blank=True,
        verbose_name=_("Téléphone")
    )
    avatar = models.ImageField(upload_to='avatars/', blank=True, verbose_name=_("Avatar"))
    date_naissance = models.DateField(null=True, blank=True, verbose_name=_("Date de naissance"))
    genre = models.CharField(
        max_length=10,
        choices=[
            ('M', _('Masculin')),
            ('F', _('Féminin')),
            ('autre', _('Autre')),
        ],
        blank=True,
        verbose_name=_("Genre")
    )
    
    # Adresse
    adresse = models.ForeignKey(
        'core.Adresse',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_("Adresse")
    )
    
    # Connexion et sécurité
    date_derniere_connexion = models.DateTimeField(null=True, blank=True, verbose_name=_("Dernière connexion"))
    nombre_connexions = models.PositiveIntegerField(default=0, verbose_name=_("Nombre de connexions"))
    adresse_ip_derniere = models.GenericIPAddressField(null=True, blank=True, verbose_name=_("Dernière adresse IP"))
    
    # Authentification à deux facteurs
    mfa_actif = models.BooleanField(default=False, verbose_name=_("MFA activé"))
    secret_mfa = models.CharField(max_length=32, blank=True, verbose_name=_("Secret MFA"))
    codes_recuperation = models.JSONField(default=list, verbose_name=_("Codes de récupération"))
    
    # Préférences utilisateur
    theme_interface = models.CharField(max_length=10, choices=THEMES, default='light', verbose_name=_("Thème"))
    langue = models.CharField(max_length=2, choices=LANGUES, default='fr', verbose_name=_("Langue"))
    fuseau_horaire = models.CharField(max_length=50, choices=FUSEAUX_HORAIRES, default='Africa/Dakar', verbose_name=_("Fuseau horaire"))
    
    # Notifications
    preferences_notifications_json = models.JSONField(
        default=dict,
        verbose_name=_("Préférences de notifications")
    )
    notifications_email = models.BooleanField(default=True, verbose_name=_("Notifications par email"))
    notifications_sms = models.BooleanField(default=False, verbose_name=_("Notifications par SMS"))
    notifications_push = models.BooleanField(default=True, verbose_name=_("Notifications push"))
    
    # Métadonnées
    bio = models.TextField(blank=True, verbose_name=_("Biographie"))
    competences = models.JSONField(default=list, verbose_name=_("Compétences"))
    reseaux_sociaux = models.JSONField(default=dict, verbose_name=_("Réseaux sociaux"))
    
    # Gamification
    points_experience = models.PositiveIntegerField(default=0, verbose_name=_("Points d'expérience"))
    niveau = models.PositiveIntegerField(default=1, verbose_name=_("Niveau"))
    badges = models.JSONField(default=list, verbose_name=_("Badges obtenus"))
    
    # Statut et validation
    statut = models.CharField(max_length=20, choices=STATUTS_GENERIQUES, default='actif', verbose_name=_("Statut"))
    email_verifie = models.BooleanField(default=False, verbose_name=_("Email vérifié"))
    telephone_verifie = models.BooleanField(default=False, verbose_name=_("Téléphone vérifié"))
    
    # Timestamps
    date_creation = models.DateTimeField(auto_now_add=True, verbose_name=_("Date de création"))
    date_modification = models.DateTimeField(auto_now=True, verbose_name=_("Date de modification"))
    
    class Meta:
        verbose_name = _("Utilisateur")
        verbose_name_plural = _("Utilisateurs")
        indexes = [
            models.Index(fields=['type_utilisateur', 'statut']),
            models.Index(fields=['entreprise_id', 'type_utilisateur']),
            models.Index(fields=['email_verifie', 'statut']),
        ]
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.get_type_utilisateur_display()})"
    
    def save(self, *args, **kwargs):
        # Générer le secret MFA si activé et pas encore défini
        if self.mfa_actif and not self.secret_mfa:
            self.secret_mfa = pyotp.random_base32()
        super().save(*args, **kwargs)
    
    @property
    def nom_complet(self):
        """Retourne le nom complet de l'utilisateur."""
        return self.get_full_name() or self.username
    
    @property
    def initiales(self):
        """Retourne les initiales de l'utilisateur."""
        if self.first_name and self.last_name:
            return f"{self.first_name[0]}{self.last_name[0]}".upper()
        return self.username[:2].upper()
    
    def generer_qr_code_mfa(self):
        """Génère le QR code pour l'authentification à deux facteurs."""
        if not self.secret_mfa:
            self.secret_mfa = pyotp.random_base32()
            self.save()
        
        totp = pyotp.TOTP(self.secret_mfa)
        return totp.provisioning_uri(
            name=self.email,
            issuer_name="Commercial Platform"
        )
    
    def verifier_code_mfa(self, code):
        """Vérifie un code MFA."""
        if not self.mfa_actif or not self.secret_mfa:
            return False
        
        totp = pyotp.TOTP(self.secret_mfa)
        return totp.verify(code, valid_window=1)
    
    def generer_codes_recuperation(self):
        """Génère des codes de récupération pour le MFA."""
        import secrets
        import string
        
        codes = []
        for _ in range(10):
            code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
            codes.append(code)
        
        self.codes_recuperation = codes
        self.save()
        return codes
    
    def utiliser_code_recuperation(self, code):
        """Utilise un code de récupération."""
        if code in self.codes_recuperation:
            self.codes_recuperation.remove(code)
            self.save()
            return True
        return False
    
    def ajouter_points_experience(self, points):
        """Ajoute des points d'expérience et calcule le niveau."""
        self.points_experience += points
        
        # Calcul du niveau (1000 points par niveau)
        nouveau_niveau = (self.points_experience // 1000) + 1
        if nouveau_niveau > self.niveau:
            self.niveau = nouveau_niveau
            # Déclencher une notification de niveau supérieur
            from apps.notifications.models import Notification
            Notification.objects.create(
                utilisateur_id=self.id,
                titre=f"Niveau {nouveau_niveau} atteint !",
                message=f"Félicitations ! Vous avez atteint le niveau {nouveau_niveau}.",
                type='success'
            )
        
        self.save()
    
    def ajouter_badge(self, badge_id, nom_badge):
        """Ajoute un badge à l'utilisateur."""
        if badge_id not in [b['id'] for b in self.badges]:
            self.badges.append({
                'id': badge_id,
                'nom': nom_badge,
                'date_obtention': timezone.now().isoformat()
            })
            self.save()
            
            # Notification de nouveau badge
            from apps.notifications.models import Notification
            Notification.objects.create(
                utilisateur_id=self.id,
                titre=f"Nouveau badge : {nom_badge}",
                message=f"Vous avez obtenu le badge '{nom_badge}' !",
                type='success'
            )


class Permission(BaseModel):
    """Permissions granulaires pour le système."""
    nom = models.CharField(max_length=100, unique=True, verbose_name=_("Nom"))
    code = models.CharField(max_length=100, unique=True, verbose_name=_("Code"))
    description = models.TextField(verbose_name=_("Description"))
    module = models.CharField(max_length=50, verbose_name=_("Module"))
    
    class Meta:
        verbose_name = _("Permission")
        verbose_name_plural = _("Permissions")
        ordering = ['module', 'nom']
    
    def __str__(self):
        return f"{self.module}.{self.nom}"


class Role(BaseModel):
    """Rôles avec permissions associées."""
    nom = models.CharField(max_length=100, unique=True, verbose_name=_("Nom"))
    description = models.TextField(verbose_name=_("Description"))
    permissions = models.ManyToManyField(Permission, blank=True, verbose_name=_("Permissions"))
    
    # Métadonnées
    systeme = models.BooleanField(default=False, verbose_name=_("Rôle système"))
    couleur = models.CharField(max_length=7, default='#6B7280', verbose_name=_("Couleur"))
    
    class Meta:
        verbose_name = _("Rôle")
        verbose_name_plural = _("Rôles")
        ordering = ['nom']
    
    def __str__(self):
        return self.nom


class UtilisateurRole(BaseModel):
    """Association utilisateur-rôle avec contexte."""
    utilisateur = models.ForeignKey(
        UtilisateurPersonnalise,
        on_delete=models.CASCADE,
        verbose_name=_("Utilisateur")
    )
    role = models.ForeignKey(Role, on_delete=models.CASCADE, verbose_name=_("Rôle"))
    
    # Contexte
    entreprise_id = models.UUIDField(
        null=True,
        blank=True,
        verbose_name=_("ID de l'entreprise")
    )
    
    # Validité
    date_debut = models.DateTimeField(auto_now_add=True, verbose_name=_("Date de début"))
    date_fin = models.DateTimeField(null=True, blank=True, verbose_name=_("Date de fin"))
    
    class Meta:
        verbose_name = _("Utilisateur-Rôle")
        verbose_name_plural = _("Utilisateurs-Rôles")
        unique_together = ['utilisateur', 'role', 'entreprise_id']
    
    def __str__(self):
        return f"{self.utilisateur} - {self.role}"


class SessionUtilisateur(models.Model):
    """Sessions utilisateur pour tracking avancé."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    utilisateur = models.ForeignKey(
        UtilisateurPersonnalise,
        on_delete=models.CASCADE,
        verbose_name=_("Utilisateur")
    )
    
    # Informations de session
    session_key = models.CharField(max_length=40, verbose_name=_("Clé de session"))
    adresse_ip = models.GenericIPAddressField(verbose_name=_("Adresse IP"))
    user_agent = models.TextField(verbose_name=_("User Agent"))
    
    # Géolocalisation
    pays = models.CharField(max_length=100, blank=True, verbose_name=_("Pays"))
    ville = models.CharField(max_length=100, blank=True, verbose_name=_("Ville"))
    
    # Timestamps
    date_debut = models.DateTimeField(auto_now_add=True, verbose_name=_("Début de session"))
    date_fin = models.DateTimeField(null=True, blank=True, verbose_name=_("Fin de session"))
    derniere_activite = models.DateTimeField(auto_now=True, verbose_name=_("Dernière activité"))
    
    # Métadonnées
    appareil = models.CharField(max_length=100, blank=True, verbose_name=_("Appareil"))
    navigateur = models.CharField(max_length=100, blank=True, verbose_name=_("Navigateur"))
    
    class Meta:
        verbose_name = _("Session utilisateur")
        verbose_name_plural = _("Sessions utilisateur")
        indexes = [
            models.Index(fields=['utilisateur', 'date_debut']),
            models.Index(fields=['session_key']),
        ]
        ordering = ['-date_debut']
    
    def __str__(self):
        return f"{self.utilisateur} - {self.date_debut}"
    
    @property
    def duree_session(self):
        """Calcule la durée de la session."""
        fin = self.date_fin or self.derniere_activite
        return fin - self.date_debut
    
    @property
    def est_active(self):
        """Vérifie si la session est active."""
        if self.date_fin:
            return False
        
        from django.utils import timezone
        from datetime import timedelta
        
        # Session inactive après 30 minutes d'inactivité
        return timezone.now() - self.derniere_activite < timedelta(minutes=30)