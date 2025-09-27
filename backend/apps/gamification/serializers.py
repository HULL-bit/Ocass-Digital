"""
Sérialiseurs pour la gestion de la gamification.
"""
from rest_framework import serializers
from .models import Badge, UtilisateurBadge, Defi


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = '__all__'


class UtilisateurBadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = UtilisateurBadge
        fields = '__all__'


class DefiSerializer(serializers.ModelSerializer):
    class Meta:
        model = Defi
        fields = '__all__'
