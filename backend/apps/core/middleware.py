"""
Middleware personnalisés pour audit et performance.
"""
import time
import json
from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth import get_user_model
from .models import JournalAudit

User = get_user_model()


class AuditLogMiddleware(MiddlewareMixin):
    """Middleware pour l'audit trail automatique."""
    
    def process_request(self, request):
        request.start_time = time.time()
        return None
    
    def process_response(self, request, response):
        # Log des actions importantes
        if hasattr(request, 'user') and request.user.is_authenticated:
            if request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
                self.log_action(request, response)
        
        return response
    
    def log_action(self, request, response):
        """Enregistre l'action dans le journal d'audit."""
        try:
            user_ip = self.get_client_ip(request)
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            
            # Déterminer le niveau de risque
            niveau_risque = 'low'
            if request.method == 'DELETE':
                niveau_risque = 'high'
            elif request.method in ['PUT', 'PATCH']:
                niveau_risque = 'medium'
            
            JournalAudit.objects.create(
                utilisateur_id=request.user.id,
                adresse_ip=user_ip,
                user_agent=user_agent,
                action=request.method,
                modele=request.resolver_match.url_name if request.resolver_match else 'unknown',
                objet_id=request.resolver_match.kwargs.get('pk', ''),
                niveau_risque=niveau_risque,
                session_id=request.session.session_key or ''
            )
        except Exception as e:
            # Ne pas faire échouer la requête pour un problème d'audit
            print(f"Erreur audit log: {e}")
    
    def get_client_ip(self, request):
        """Récupère l'IP réelle du client."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class PerformanceMiddleware(MiddlewareMixin):
    """Middleware pour monitoring des performances."""
    
    def process_response(self, request, response):
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
            
            # Log des requêtes lentes (> 1 seconde)
            if duration > 1.0:
                print(f"Requête lente détectée: {request.path} - {duration:.2f}s")
            
            # Ajouter le temps de réponse dans les headers
            response['X-Response-Time'] = f"{duration:.3f}s"
        
        return response