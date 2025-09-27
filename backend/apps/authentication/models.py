"""
Modèles pour l'authentification avancée.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.core.models import BaseModel


class SessionUtilisateur(BaseModel):
    """Sessions utilisateur avec tracking avancé."""
    utilisateur = models.ForeignKey(
        'users.UtilisateurPersonnalise',
        on_delete=models.CASCADE,
        related_name='sessions_auth',
        verbose_name=_("Utilisateur")
    )
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


class TokenAPI(BaseModel):
    """Tokens API pour intégrations."""
    utilisateur = models.ForeignKey(
        'users.UtilisateurPersonnalise',
        on_delete=models.CASCADE,
        verbose_name=_("Utilisateur")
    )
    nom = models.CharField(max_length=100, verbose_name=_("Nom du token"))
    token = models.CharField(max_length=255, unique=True, verbose_name=_("Token"))
    permissions = models.JSONField(default=list, verbose_name=_("Permissions"))
    actif = models.BooleanField(default=True, verbose_name=_("Actif"))
    date_expiration = models.DateTimeField(null=True, blank=True, verbose_name=_("Date d'expiration"))
    derniere_utilisation = models.DateTimeField(null=True, blank=True, verbose_name=_("Dernière utilisation"))
    
    class Meta:
        verbose_name = _("Token API")
        verbose_name_plural = _("Tokens API")
    
    def __str__(self):
        return f"{self.nom} - {self.utilisateur}"