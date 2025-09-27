"""
Sérialiseurs pour la gestion du support.
"""
from rest_framework import serializers
from .models import TicketSupport


class TicketSupportSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketSupport
        fields = '__all__'
