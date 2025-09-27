"""
Configuration de l'interface d'administration pour les entreprises.
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import Entreprise, PlanAbonnement


@admin.register(PlanAbonnement)
class PlanAbonnementAdmin(admin.ModelAdmin):
    """Administration des plans d'abonnement."""
    list_display = ['nom', 'prix_mensuel', 'devise', 'date_creation']
    list_filter = ['devise', 'date_creation']
    search_fields = ['nom', 'description']
    ordering = ['-date_creation']


@admin.register(Entreprise)
class EntrepriseAdmin(admin.ModelAdmin):
    """Administration des entreprises."""
    list_display = [
        'nom', 
        'secteur_activite', 
        'forme_juridique', 
        'statut', 
        'plan_abonnement',
        'nombre_employes',
        'date_creation'
    ]
    list_filter = [
        'secteur_activite', 
        'forme_juridique', 
        'statut', 
        'plan_abonnement',
        'date_creation'
    ]
    search_fields = [
        'nom', 
        'nom_commercial', 
        'email', 
        'telephone',
        'siret'
    ]
    readonly_fields = ['id', 'date_creation', 'date_modification']
    ordering = ['-date_creation']
    
    fieldsets = (
        ('Informations générales', {
            'fields': (
                'id', 'nom', 'nom_commercial', 'description', 
                'secteur_activite', 'forme_juridique', 'statut'
            )
        }),
        ('Informations légales', {
            'fields': ('siret', 'tva_intracommunautaire')
        }),
        ('Contact', {
            'fields': ('email', 'telephone', 'site_web')
        }),
        ('Adresse', {
            'fields': (
                'adresse_complete', 'ville', 'region', 'pays', 
                'code_postal'
            )
        }),
        ('Préférences', {
            'fields': (
                'couleur_primaire', 'couleur_secondaire', 
                'devise_principale', 'fuseau_horaire'
            )
        }),
        ('Abonnement', {
            'fields': (
                'plan_abonnement', 'date_debut_abonnement', 
                'date_fin_abonnement'
            )
        }),
        ('Métriques', {
            'fields': (
                'nombre_employes', 'chiffre_affaires_annuel'
            )
        }),
        ('Timestamps', {
            'fields': ('date_creation', 'date_modification'),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        """Optimise les requêtes pour l'admin."""
        return super().get_queryset(request).select_related(
            'plan_abonnement'
        )
    
    def colored_name(self, obj):
        """Affiche le nom avec la couleur primaire."""
        if obj.couleur_primaire:
            return format_html(
                '<span style="color: {};">{}</span>',
                obj.couleur_primaire,
                obj.nom
            )
        return obj.nom
    colored_name.short_description = 'Nom'
