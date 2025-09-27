"""
Configuration de l'interface d'administration pour les clients.
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import Client, InteractionClient, CampagneMarketing


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    """Administration des clients."""
    list_display = [
        'code_client', 'nom_complet', 'email', 'telephone', 
        'entrepreneur', 'statut', 'date_creation'
    ]
    list_filter = [
        'statut', 'date_creation', 'entrepreneur__email'
    ]
    search_fields = [
        'code_client', 'nom', 'prenom', 'email', 'telephone',
        'entrepreneur__email'
    ]
    readonly_fields = [
        'id', 'code_client', 'date_creation', 'date_modification'
    ]
    # Pas d'inlines pour l'instant
    ordering = ['-date_creation']
    
    fieldsets = (
        ('Informations générales', {
            'fields': (
                'id', 'code_client', 'nom', 'prenom', 'email', 
                'telephone', 'date_naissance', 'genre'
            )
        }),
        ('Entrepreneur', {
            'fields': ('entrepreneur',)
        }),
        ('Adresse de facturation', {
            'fields': ('adresse_facturation',)
        }),
        ('Préférences', {
            'fields': (
                'langue_preferee', 'devise_preferee', 
                'preferences_notifications_json'
            )
        }),
        ('Statut', {
            'fields': ('statut',)
        }),
        ('Timestamps', {
            'fields': ('date_creation', 'date_modification'),
            'classes': ('collapse',)
        })
    )
    
    def nom_complet(self, obj):
        """Affiche le nom complet du client."""
        return f"{obj.prenom} {obj.nom}"
    nom_complet.short_description = 'Nom complet'
    nom_complet.admin_order_field = 'nom'
    
    def get_queryset(self, request):
        """Optimise les requêtes pour l'admin."""
        return super().get_queryset(request).select_related('entrepreneur')


@admin.register(InteractionClient)
class InteractionClientAdmin(admin.ModelAdmin):
    """Administration des interactions clients."""
    list_display = [
        'client', 'type_interaction', 'description', 
        'date_creation', 'utilisateur'
    ]
    list_filter = ['type_interaction', 'date_creation']
    search_fields = [
        'client__nom', 'client__prenom', 'description',
        'utilisateur__email'
    ]
    readonly_fields = ['id', 'date_creation']
    ordering = ['-date_creation']


@admin.register(CampagneMarketing)
class CampagneMarketingAdmin(admin.ModelAdmin):
    """Administration des campagnes marketing."""
    list_display = [
        'nom', 'type_campagne', 'statut', 'date_creation'
    ]
    list_filter = ['type_campagne', 'statut', 'date_creation']
    search_fields = ['nom', 'description']
    readonly_fields = ['id', 'date_creation', 'date_modification']
    ordering = ['-date_creation']
