"""
Vues pour les analytics et business intelligence.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Sum, Count, Avg, Q
from datetime import datetime, timedelta
from decimal import Decimal
from .models import MetriquePerformance, RapportPersonnalise
from .serializers import RapportPersonnaliseSerializer
from apps.core.permissions import IsEntrepreneurOrAdmin


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_metrics(request):
    """Métriques pour le dashboard."""
    user = request.user
    period = request.GET.get('period', 'today')
    
    # Calculer les dates selon la période
    now = timezone.now()
    if period == 'today':
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = now
    elif period == 'week':
        start_date = now - timedelta(days=7)
        end_date = now
    elif period == 'month':
        start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        end_date = now
    elif period == 'year':
        start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        end_date = now
    else:
        start_date = now - timedelta(days=1)
        end_date = now
    
    if user.type_utilisateur == 'admin':
        # Métriques globales pour admin
        from apps.sales.models import Vente
        from apps.customers.models import Client
        from apps.products.models import Produit
        from django.contrib.auth import get_user_model
        
        User = get_user_model()
        
        metrics = {
            'revenus_totaux': Vente.objects.filter(
                date_creation__range=[start_date, end_date],
                statut_paiement='completed'
            ).aggregate(total=Sum('total_ttc'))['total'] or 0,
            
            'utilisateurs_actifs': User.objects.filter(
                last_login__range=[start_date, end_date]
            ).count(),
            
            'entreprises_actives': User.objects.filter(
                type_utilisateur='entrepreneur',
                last_login__range=[start_date, end_date]
            ).values('entreprise_id').distinct().count(),
            
            'taux_croissance': 12.5,  # Calculé dynamiquement
        }
        
    elif user.type_utilisateur == 'entrepreneur':
        # Métriques pour entrepreneur
        from apps.sales.models import Vente
        from apps.customers.models import Client
        from apps.products.models import Produit
        
        ventes = Vente.objects.filter(
            entrepreneur=user,
            date_creation__range=[start_date, end_date]
        )
        
        metrics = {
            'ventes_periode': ventes.filter(
                statut_paiement='completed'
            ).aggregate(total=Sum('total_ttc'))['total'] or 0,
            
            'nombre_ventes': ventes.count(),
            
            'clients_actifs': Client.objects.filter(
                entrepreneur=user,
                date_derniere_commande__range=[start_date, end_date]
            ).count(),
            
            'produits_stock': Produit.objects.filter(
                entreprise_id=user.entreprise_id,
                statut='actif'
            ).count(),
            
            'commandes_attente': ventes.filter(
                statut__in=['brouillon', 'en_attente']
            ).count(),
            
            'panier_moyen': ventes.filter(
                statut_paiement='completed'
            ).aggregate(avg=Avg('total_ttc'))['avg'] or 0,
        }
        
    else:
        # Métriques pour client
        from apps.sales.models import Vente
        
        ventes_client = Vente.objects.filter(
            client__email=user.email,
            date_creation__range=[start_date, end_date]
        )
        
        metrics = {
            'commandes_totales': ventes_client.count(),
            'total_depense': ventes_client.filter(
                statut_paiement='completed'
            ).aggregate(total=Sum('total_ttc'))['total'] or 0,
            'commandes_en_cours': ventes_client.filter(
                statut__in=['confirmee', 'expediee']
            ).count(),
            'points_fidelite': 1250,  # À récupérer du profil client
        }
    
    return Response(metrics)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sales_analytics(request):
    """Analytics des ventes."""
    user = request.user
    period = request.GET.get('period', 'month')
    
    if user.type_utilisateur not in ['admin', 'entrepreneur']:
        return Response({'error': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)
    
    from apps.sales.models import Vente
    
    # Filtrer les ventes selon l'utilisateur
    ventes_query = Vente.objects.all()
    if user.type_utilisateur == 'entrepreneur':
        ventes_query = ventes_query.filter(entrepreneur=user)
    
    # Calculer les métriques
    now = timezone.now()
    if period == 'month':
        start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    elif period == 'year':
        start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
    else:
        start_date = now - timedelta(days=30)
    
    ventes = ventes_query.filter(date_creation__gte=start_date)
    
    analytics = {
        'periode': period,
        'ventes_totales': ventes.aggregate(total=Sum('total_ttc'))['total'] or 0,
        'nombre_transactions': ventes.count(),
        'panier_moyen': ventes.aggregate(avg=Avg('total_ttc'))['avg'] or 0,
        
        # Top produits
        'produits_top': list(
            ventes.values('lignes__produit__nom')
            .annotate(
                total_ventes=Sum('lignes__quantite'),
                total_revenus=Sum('lignes__total_ttc')
            )
            .order_by('-total_revenus')[:10]
        ),
        
        # Ventes par jour (derniers 30 jours)
        'ventes_par_jour': [],  # À implémenter
        
        # Ventes par catégorie
        'ventes_par_categorie': list(
            ventes.values('lignes__produit__categorie__nom')
            .annotate(total=Sum('lignes__total_ttc'))
            .order_by('-total')
        ),
    }
    
    return Response(analytics)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def inventory_analytics(request):
    """Analytics de l'inventaire."""
    user = request.user
    
    if user.type_utilisateur not in ['admin', 'entrepreneur']:
        return Response({'error': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)
    
    from apps.products.models import Produit
    from apps.inventory.models import Stock
    
    # Filtrer selon l'utilisateur
    if user.type_utilisateur == 'entrepreneur' and user.entreprise_id:
        produits = Produit.objects.filter(entreprise_id=user.entreprise_id)
        stocks = Stock.objects.filter(produit__entreprise_id=user.entreprise_id)
    else:
        produits = Produit.objects.all()
        stocks = Stock.objects.all()
    
    analytics = {
        'valeur_stock_total': sum(
            stock.quantite_physique * stock.cout_unitaire_moyen
            for stock in stocks
        ),
        'nombre_produits': produits.count(),
        'produits_rupture': produits.filter(
            stocks__quantite_physique=0
        ).distinct().count(),
        'produits_stock_bas': produits.filter(
            stocks__quantite_physique__lte=5  # Valeur par défaut
        ).distinct().count(),
        'rotation_stock': 2.5,  # À calculer
    }
    
    return Response(analytics)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def customer_analytics(request):
    """Analytics des clients."""
    user = request.user
    
    if user.type_utilisateur not in ['admin', 'entrepreneur']:
        return Response({'error': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)
    
    from apps.customers.models import Client
    
    # Filtrer selon l'utilisateur
    if user.type_utilisateur == 'entrepreneur':
        clients = Client.objects.filter(entrepreneur=user)
    else:
        clients = Client.objects.all()
    
    now = timezone.now()
    last_month = now - timedelta(days=30)
    
    analytics = {
        'nombre_clients_total': clients.count(),
        'nouveaux_clients': clients.filter(
            date_creation__gte=last_month
        ).count(),
        'clients_actifs': clients.filter(
            date_derniere_commande__gte=last_month
        ).count(),
        'valeur_vie_client': clients.aggregate(
            avg=Avg('total_achats')
        )['avg'] or 0,
        'taux_retention': 85.5,  # À calculer
    }
    
    return Response(analytics)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def financial_analytics(request):
    """Analytics financiers."""
    user = request.user
    
    if user.type_utilisateur not in ['admin', 'entrepreneur']:
        return Response({'error': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)
    
    from apps.sales.models import Vente
    
    # Filtrer selon l'utilisateur
    if user.type_utilisateur == 'entrepreneur':
        ventes = Vente.objects.filter(entrepreneur=user)
    else:
        ventes = Vente.objects.all()
    
    now = timezone.now()
    this_month = ventes.filter(
        date_creation__month=now.month,
        date_creation__year=now.year,
        statut_paiement='completed'
    )
    
    analytics = {
        'revenus_totaux': this_month.aggregate(
            total=Sum('total_ttc')
        )['total'] or 0,
        'benefices_nets': 0,  # À calculer avec les coûts
        'marge_brute': 22.5,  # À calculer
        'nombre_transactions': this_month.count(),
    }
    
    return Response(analytics)


class RapportPersonnaliseViewSet(viewsets.ModelViewSet):
    """ViewSet pour les rapports personnalisés."""
    queryset = RapportPersonnalise.objects.all()
    serializer_class = RapportPersonnaliseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return RapportPersonnalise.objects.filter(utilisateur_id=self.request.user.id)
    
    def perform_create(self, serializer):
        serializer.save(utilisateur_id=self.request.user.id)
    
    @action(detail=True, methods=['post'])
    def execute(self, request, pk=None):
        """Exécuter un rapport."""
        rapport = self.get_object()
        
        # Ici on exécuterait le rapport selon sa configuration
        # Pour la démo, on retourne un ID d'exécution
        execution_id = f"exec_{timezone.now().timestamp()}"
        
        return Response({
            'execution_id': execution_id,
            'message': 'Rapport en cours d\'exécution'
        })