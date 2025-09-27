"""
Sérialiseurs pour la gestion des paiements.
"""
from rest_framework import serializers
from .models import PaiementMobile, LienPaiement, Remboursement


class PaiementMobileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaiementMobile
        fields = '__all__'


class LienPaiementSerializer(serializers.ModelSerializer):
    class Meta:
        model = LienPaiement
        fields = '__all__'


class RemboursementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Remboursement
        fields = '__all__'
