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