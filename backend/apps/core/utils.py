"""
Utilitaires communs pour l'application.
"""
import uuid
import hashlib
import secrets
import string
from decimal import Decimal
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings


def generate_unique_code(prefix='', length=8):
    """Génère un code unique."""
    code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(length))
    return f"{prefix}{code}" if prefix else code


def calculate_tva(montant_ht, taux_tva):
    """Calcule la TVA."""
    return montant_ht * (taux_tva / 100)


def calculate_ttc(montant_ht, taux_tva):
    """Calcule le montant TTC."""
    return montant_ht + calculate_tva(montant_ht, taux_tva)


def format_currency(amount, currency='XOF'):
    """Formate un montant en devise."""
    return f"{amount:,.0f} {currency}"


def generate_invoice_number(entreprise_id):
    """
    Génère un numéro de facture unique avec protection contre les doublons.
    
    IMPORTANT: Cette fonction doit être appelée dans une transaction.atomic()
    pour que select_for_update() fonctionne correctement.
    """
    from django.db import transaction
    from apps.sales.models import Vente
    
    today = timezone.now()
    prefix = f"FAC{today.year}{today.month:02d}"
    
    # Vérifier si on est déjà dans une transaction
    # Si oui, utiliser la transaction existante, sinon créer une nouvelle
    if transaction.get_connection().in_atomic_block:
        # On est déjà dans une transaction, utiliser select_for_update directement
        use_transaction = False
    else:
        # Pas de transaction, en créer une
        use_transaction = True
    
    def _generate():
        # Verrouiller les lignes existantes pour cette entreprise/mois
        if entreprise_id:
            # Filtrer par entreprise et verrouiller
            queryset = Vente.objects.select_for_update().filter(
                numero_facture__startswith=prefix,
                entrepreneur__entreprise_id=entreprise_id
            )
            last_invoice = queryset.order_by('-numero_facture').first()
        else:
            # Pas d'entreprise, utiliser un compteur global
            queryset = Vente.objects.select_for_update().filter(
                numero_facture__startswith=prefix
            )
            last_invoice = queryset.order_by('-numero_facture').first()
        
        if last_invoice:
            # Extraire le numéro de séquence du dernier numéro
            try:
                last_number = int(last_invoice.numero_facture[-4:])
                count = last_number + 1
            except (ValueError, IndexError):
                # Si le format est incorrect, compter les factures
                if entreprise_id:
                    count = Vente.objects.filter(
                        numero_facture__startswith=prefix,
                        entrepreneur__entreprise_id=entreprise_id
                    ).count() + 1
                else:
                    count = Vente.objects.filter(
                        numero_facture__startswith=prefix
                    ).count() + 1
        else:
            count = 1
        
        # Générer le nouveau numéro
        new_number = f"{prefix}{count:04d}"
        
        # Vérifier que le numéro n'existe pas déjà (double sécurité)
        max_attempts = 100
        attempts = 0
        while Vente.objects.filter(numero_facture=new_number).exists() and attempts < max_attempts:
            count += 1
            new_number = f"{prefix}{count:04d}"
            attempts += 1
        
        if attempts >= max_attempts:
            # En dernier recours, utiliser un timestamp avec suffixe unique
            import time
            import random
            timestamp_suffix = int(time.time()) % 10000
            random_suffix = random.randint(0, 99)
            new_number = f"{prefix}{timestamp_suffix:04d}{random_suffix:02d}"
        
        return new_number
    
    if use_transaction:
        with transaction.atomic():
            return _generate()
    else:
        return _generate()


def send_notification_email(user, subject, message, html_message=None):
    """Envoie une notification par email."""
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Erreur envoi email: {e}")
        return False


def calculate_distance(lat1, lon1, lat2, lon2):
    """Calcule la distance entre deux points géographiques."""
    from math import radians, cos, sin, asin, sqrt
    
    # Convertir en radians
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    # Formule haversine
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    
    # Rayon de la Terre en kilomètres
    r = 6371
    
    return c * r


class CacheManager:
    """Gestionnaire de cache intelligent."""
    
    @staticmethod
    def get_cache_key(model_name, obj_id, suffix=''):
        """Génère une clé de cache standardisée."""
        key = f"{model_name}:{obj_id}"
        if suffix:
            key += f":{suffix}"
        return key
    
    @staticmethod
    def invalidate_related_cache(model_name, obj_id):
        """Invalide le cache lié à un objet."""
        from django.core.cache import cache
        
        patterns = [
            f"{model_name}:{obj_id}",
            f"{model_name}:{obj_id}:*",
            f"dashboard:*:{obj_id}",
        ]
        
        for pattern in patterns:
            cache.delete_pattern(pattern)


class SecurityUtils:
    """Utilitaires de sécurité."""
    
    @staticmethod
    def hash_sensitive_data(data):
        """Hash des données sensibles."""
        return hashlib.sha256(data.encode()).hexdigest()
    
    @staticmethod
    def generate_api_key():
        """Génère une clé API sécurisée."""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def validate_phone_number(phone):
        """Valide un numéro de téléphone."""
        import re
        pattern = r'^\+?[1-9]\d{1,14}$'
        return re.match(pattern, phone) is not None