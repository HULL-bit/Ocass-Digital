"""
Configuration de l'interface d'administration pour les utilisateurs.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import UtilisateurPersonnalise, Permission, Role, UtilisateurRole, SessionUtilisateur


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    """Administration des permissions."""
    list_display = ['nom', 'code', 'module', 'description']
    list_filter = ['module']
    search_fields = ['nom', 'code', 'description']
    ordering = ['module', 'nom']


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    """Administration des rôles."""
    list_display = ['nom', 'systeme', 'couleur', 'permissions_count']
    list_filter = ['systeme']
    search_fields = ['nom', 'description']
    filter_horizontal = ['permissions']
    
    def permissions_count(self, obj):
        """Compte le nombre de permissions."""
        return obj.permissions.count()
    permissions_count.short_description = 'Permissions'


@admin.register(UtilisateurRole)
class UtilisateurRoleAdmin(admin.ModelAdmin):
    """Administration des rôles utilisateur."""
    list_display = ['utilisateur', 'role', 'entreprise_id', 'date_debut', 'date_fin']
    list_filter = ['role', 'date_debut', 'date_fin']
    search_fields = ['utilisateur__email', 'utilisateur__first_name', 'utilisateur__last_name']


@admin.register(SessionUtilisateur)
class SessionUtilisateurAdmin(admin.ModelAdmin):
    """Administration des sessions utilisateur."""
    list_display = [
        'utilisateur', 'adresse_ip', 'pays', 'ville', 
        'date_debut', 'derniere_activite', 'est_active'
    ]
    list_filter = ['pays', 'date_debut', 'derniere_activite']
    search_fields = ['utilisateur__email', 'adresse_ip', 'pays', 'ville']
    readonly_fields = ['id', 'date_debut', 'derniere_activite']
    ordering = ['-date_debut']


@admin.register(UtilisateurPersonnalise)
class UtilisateurPersonnaliseAdmin(BaseUserAdmin):
    """Administration des utilisateurs personnalisés."""
    list_display = [
        'email', 'first_name', 'last_name', 'type_utilisateur', 
        'statut', 'email_verifie', 'date_creation', 'entreprise_link'
    ]
    list_filter = [
        'type_utilisateur', 'statut', 'email_verifie', 
        'date_creation', 'is_active', 'is_staff'
    ]
    search_fields = ['email', 'first_name', 'last_name', 'telephone']
    ordering = ['-date_creation']
    
    fieldsets = (
        ('Authentification', {
            'fields': ('email', 'password', 'username')
        }),
        ('Informations personnelles', {
            'fields': (
                'first_name', 'last_name', 'telephone', 'date_naissance', 
                'genre', 'avatar', 'bio'
            )
        }),
        ('Type et entreprise', {
            'fields': ('type_utilisateur', 'entreprise_id')
        }),
        ('Adresse', {
            'fields': ('adresse',)
        }),
        ('Préférences', {
            'fields': (
                'theme_interface', 'langue', 'fuseau_horaire',
                'preferences_notifications_json'
            )
        }),
        ('Notifications', {
            'fields': (
                'notifications_email', 'notifications_sms', 
                'notifications_push'
            )
        }),
        ('Sécurité', {
            'fields': (
                'mfa_actif', 'secret_mfa', 'codes_recuperation',
                'date_derniere_connexion', 'nombre_connexions', 
                'adresse_ip_derniere'
            )
        }),
        ('Gamification', {
            'fields': (
                'points_experience', 'niveau', 'badges', 'competences'
            )
        }),
        ('Statut', {
            'fields': (
                'statut', 'email_verifie', 'telephone_verifie', 
                'is_active', 'is_staff', 'is_superuser'
            )
        }),
        ('Permissions', {
            'fields': ('user_permissions', 'groups'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('date_creation', 'date_modification', 'last_login'),
            'classes': ('collapse',)
        })
    )
    
    add_fieldsets = (
        ('Informations de base', {
            'classes': ('wide',),
            'fields': (
                'email', 'first_name', 'last_name', 'type_utilisateur',
                'password1', 'password2'
            )
        }),
    )
    
    def entreprise_link(self, obj):
        """Affiche un lien vers l'entreprise si elle existe."""
        if obj.entreprise_id:
            from apps.companies.models import Entreprise
            try:
                entreprise = Entreprise.objects.get(id=obj.entreprise_id)
                return format_html(
                    '<a href="/admin/companies/entreprise/{}/change/">{}</a>',
                    entreprise.id,
                    entreprise.nom
                )
            except Entreprise.DoesNotExist:
                return f"Entreprise ID: {obj.entreprise_id}"
        return "Aucune"
    entreprise_link.short_description = 'Entreprise'
    entreprise_link.admin_order_field = 'entreprise_id'
    
    def get_queryset(self, request):
        """Optimise les requêtes pour l'admin."""
        return super().get_queryset(request).select_related('adresse')

