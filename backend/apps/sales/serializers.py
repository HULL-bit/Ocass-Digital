"""
Serializers pour les ventes.
"""
from rest_framework import serializers
from django.utils import timezone
from .models import Vente, LigneVente, Devis, LigneDevis


class LigneVenteSerializer(serializers.ModelSerializer):
    """Serializer pour les lignes de vente."""
    produit_nom = serializers.CharField(source='produit.nom', read_only=True)
    produit_sku = serializers.CharField(source='produit.sku', read_only=True)
    total_ht = serializers.ReadOnlyField()
    total_tva = serializers.ReadOnlyField()
    total_ttc = serializers.ReadOnlyField()
    
    class Meta:
        model = LigneVente
        fields = [
            'id', 'produit', 'produit_nom', 'produit_sku', 'variante',
            'quantite', 'prix_unitaire', 'remise_pourcentage', 'tva_taux',
            'total_ht', 'total_tva', 'total_ttc', 'notes'
        ]


class LigneVenteWriteSerializer(serializers.ModelSerializer):
    """Serializer pour créer des lignes de vente (écriture)."""
    class Meta:
        model = LigneVente
        fields = [
            'produit', 'variante', 'quantite', 'prix_unitaire', 
            'remise_pourcentage', 'tva_taux', 'notes'
        ]


class VenteSerializer(serializers.ModelSerializer):
    """Serializer pour les ventes."""
    client_nom = serializers.CharField(source='client.nom', read_only=True)
    client_email = serializers.CharField(source='client.email', read_only=True)
    entrepreneur_nom = serializers.CharField(source='entrepreneur.get_full_name', read_only=True)
    lignes = LigneVenteSerializer(many=True, read_only=True)
    lignes_data = LigneVenteWriteSerializer(many=True, write_only=True, required=False)
    # Rendre numero_facture optionnel car il sera généré automatiquement
    numero_facture = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    class Meta:
        model = Vente
        fields = [
            'id', 'numero_facture', 'numero_commande', 'client', 'client_nom',
            'client_email', 'entrepreneur', 'entrepreneur_nom', 'vendeur',
            'date_creation', 'date_livraison_prevue', 'date_livraison_reelle',
            'statut', 'sous_total', 'taxe_montant', 'remise_montant',
            'frais_livraison', 'total_ttc', 'mode_paiement', 'statut_paiement',
            'date_paiement', 'reference_paiement', 'notes', 'signature_client',
            'adresse_livraison', 'transporteur', 'numero_suivi', 'source_vente',
            'lignes', 'lignes_data'
        ]
        read_only_fields = ['entrepreneur', 'vendeur']
        extra_kwargs = {
            'numero_facture': {'required': False, 'allow_blank': True}
        }
    
    def create(self, validated_data):
        """Créer une vente avec ses lignes et décrémenter les stocks."""
        from django.db import transaction
        from apps.core.utils import generate_invoice_number
        
        # Extraire les lignes de vente
        lignes_data = validated_data.pop('lignes_data', [])
        
        # Valider qu'il y a au moins une ligne de vente
        if not lignes_data:
            raise serializers.ValidationError({
                'lignes_data': 'Au moins une ligne de vente est requise.'
            })
        
        # Utiliser une transaction pour garantir la cohérence
        with transaction.atomic():
            # Générer le numéro de facture AVANT la création dans la même transaction
            # pour éviter les doublons en cas de requêtes simultanées
            # TOUJOURS générer un numéro, même si un est fourni (pour éviter les doublons)
            numero_facture_existant = validated_data.get('numero_facture')
            
            # Récupérer l'entrepreneur depuis le contexte de la requête
            # (l'entrepreneur sera ajouté dans perform_create, mais on en a besoin maintenant)
            entrepreneur = None
            if hasattr(self, 'context') and self.context and 'request' in self.context:
                entrepreneur = self.context['request'].user
            elif 'entrepreneur' in validated_data:
                entrepreneur = validated_data.get('entrepreneur')
            
            entreprise_id = None
            if entrepreneur:
                # Essayer d'accéder à l'entreprise via différentes méthodes
                try:
                    if hasattr(entrepreneur, 'entreprise') and entrepreneur.entreprise:
                        entreprise_id = entrepreneur.entreprise.id
                    elif hasattr(entrepreneur, 'entreprise_id') and entrepreneur.entreprise_id:
                        entreprise_id = entrepreneur.entreprise_id
                except Exception:
                    # En cas d'erreur, entreprise_id reste None
                    pass
            
            # Générer le numéro de facture dans la transaction (utilise select_for_update)
            # Toujours générer un nouveau numéro pour garantir l'unicité
            try:
                validated_data['numero_facture'] = generate_invoice_number(entreprise_id)
            except Exception as e:
                # Si la génération échoue, utiliser un fallback avec timestamp
                import time
                validated_data['numero_facture'] = f"FAC{timezone.now().year}{timezone.now().month:02d}{int(time.time()) % 100000:05d}"
            
            # S'assurer que le numéro de facture est toujours présent et valide
            if 'numero_facture' not in validated_data or not validated_data.get('numero_facture'):
                # Fallback absolu si la génération a échoué
                import time
                import random
                validated_data['numero_facture'] = f"FAC{timezone.now().year}{timezone.now().month:02d}{int(time.time()) % 100000:05d}{random.randint(0, 99):02d}"
            
            # Créer la vente
            try:
                vente = super().create(validated_data)
            except Exception as e:
                raise serializers.ValidationError({
                    'non_field_errors': [f'Erreur lors de la création de la vente: {str(e)}']
                })
            
            # Créer les lignes de vente et décrémenter les stocks
            lignes_errors = []
            stock_errors = []
            
            # Vérifier si la vente est complétée pour décrémenter le stock
            statut_paiement = validated_data.get('statut_paiement') or vente.statut_paiement
            should_decrement_stock = statut_paiement == 'completed'
            
            for index, ligne_data in enumerate(lignes_data):
                try:
                    # Créer la ligne de vente
                    ligne = LigneVente.objects.create(
                        vente=vente,
                        **ligne_data
                    )
                    
                    # Décrémenter le stock si la vente est complétée
                    if should_decrement_stock:
                        produit = ligne.produit
                        quantite = ligne.quantite
                        
                        # Vérifier que le stock est suffisant
                        if produit.stock < quantite:
                            stock_errors.append({
                                'produit': produit.nom,
                                'stock_disponible': produit.stock,
                                'quantite_demandee': quantite
                            })
                        else:
                            # Décrémenter le stock
                            produit.stock = max(0, produit.stock - quantite)
                            produit.save(update_fields=['stock'])
                            
                            # Mettre à jour le statut si le stock atteint 0
                            if produit.stock == 0:
                                produit.statut = 'rupture'
                                produit.save(update_fields=['statut'])
                            
                except Exception as e:
                    lignes_errors.append({
                        'ligne': index,
                        'erreur': str(e)
                    })
            
            # Si des erreurs sont survenues, annuler la transaction
            if lignes_errors or stock_errors:
                if stock_errors:
                    raise serializers.ValidationError({
                        'stock_insuffisant': stock_errors,
                        'message': 'Stock insuffisant pour certains produits'
                    })
                else:
                    raise serializers.ValidationError({
                        'lignes_data': lignes_errors
                    })
        
        return vente


class LigneDevisSerializer(serializers.ModelSerializer):
    """Serializer pour les lignes de devis."""
    produit_nom = serializers.CharField(source='produit.nom', read_only=True)
    total_ligne = serializers.ReadOnlyField()
    
    class Meta:
        model = LigneDevis
        fields = [
            'id', 'produit', 'produit_nom', 'quantite', 'prix_unitaire',
            'remise_pourcentage', 'total_ligne'
        ]


class DevisSerializer(serializers.ModelSerializer):
    """Serializer pour les devis."""
    client_nom = serializers.CharField(source='client.nom', read_only=True)
    entrepreneur_nom = serializers.CharField(source='entrepreneur.get_full_name', read_only=True)
    lignes = LigneDevisSerializer(many=True, read_only=True)
    
    class Meta:
        model = Devis
        fields = [
            'id', 'numero_devis', 'client', 'client_nom', 'entrepreneur',
            'entrepreneur_nom', 'date_creation', 'date_validite', 'date_acceptation',
            'statut', 'sous_total', 'taxe_montant', 'remise_montant', 'total_ttc',
            'vente_associee', 'notes', 'conditions_particulieres', 'lignes'
        ]
        read_only_fields = ['numero_devis', 'entrepreneur']