"""
Permissions personnalisées pour l'API.
"""
from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Permission pour propriétaire ou lecture seule."""
    
    def has_object_permission(self, request, view, obj):
        # Lecture pour tous les utilisateurs authentifiés
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Écriture seulement pour le propriétaire
        return obj.cree_par == request.user


class IsEntrepreneurOrAdmin(permissions.BasePermission):
    """Permission pour entrepreneurs et admins."""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        return request.user.type_utilisateur in ['admin', 'entrepreneur']


class IsAdminOnly(permissions.BasePermission):
    """Permission pour admins seulement."""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        return request.user.type_utilisateur == 'admin'


class IsClientOrEntrepreneur(permissions.BasePermission):
    """Permission pour clients et entrepreneurs."""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        return request.user.type_utilisateur in ['client', 'entrepreneur']


class CanCreateSale(permissions.BasePermission):
    """Permission pour créer et voir des ventes : clients et entrepreneurs."""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Permettre la création pour les clients et entrepreneurs
        if request.method == 'POST':
            return request.user.type_utilisateur in ['client', 'entrepreneur', 'admin']
        
        # Permettre la lecture (GET, HEAD, OPTIONS) pour les clients, entrepreneurs et admins
        if request.method in permissions.SAFE_METHODS:
            return request.user.type_utilisateur in ['client', 'entrepreneur', 'admin']
        
        # Pour les autres méthodes (PUT, PATCH, DELETE), seuls les entrepreneurs et admins
        return request.user.type_utilisateur in ['admin', 'entrepreneur']
    
    def has_object_permission(self, request, view, obj):
        # Les clients peuvent voir leurs propres commandes
        if request.method in permissions.SAFE_METHODS:
            if request.user.type_utilisateur == 'client':
                # Vérifier que le client de la commande correspond à l'utilisateur
                # en comparant les emails (normalisés)
                if obj.client:
                    user_email = request.user.email.lower().strip() if request.user.email else ''
                    client_email = obj.client.email.lower().strip() if obj.client.email else ''
                    return user_email == client_email
                return False
            return True
        
        # Seuls les entrepreneurs et admins peuvent modifier/supprimer
        return request.user.type_utilisateur in ['admin', 'entrepreneur']