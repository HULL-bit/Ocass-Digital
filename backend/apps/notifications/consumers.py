"""
WebSocket consumers pour notifications temps réel.
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()


class NotificationConsumer(AsyncWebsocketConsumer):
    """Consumer pour notifications temps réel."""
    
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.group_name = f'notifications_{self.user_id}'
        
        # Rejoindre le groupe
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Envoyer les notifications non lues
        await self.send_unread_notifications()
    
    async def disconnect(self, close_code):
        # Quitter le groupe
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Recevoir des messages du client."""
        data = json.loads(text_data)
        message_type = data.get('type')
        
        if message_type == 'mark_read':
            notification_id = data.get('notification_id')
            await self.mark_notification_read(notification_id)
        elif message_type == 'ping':
            await self.send(text_data=json.dumps({
                'type': 'pong',
                'timestamp': data.get('timestamp')
            }))
    
    async def notification_message(self, event):
        """Envoyer une notification au client."""
        await self.send(text_data=json.dumps(event['message']))
    
    async def send_unread_notifications(self):
        """Envoyer les notifications non lues."""
        notifications = await self.get_unread_notifications()
        for notification in notifications:
            await self.send(text_data=json.dumps({
                'type': 'notification',
                'data': {
                    'id': str(notification.id),
                    'titre': notification.titre,
                    'message': notification.message,
                    'type': notification.type,
                    'date_creation': notification.date_creation.isoformat(),
                    'action_url': notification.action_url,
                    'metadata': notification.metadata
                }
            }))
    
    @database_sync_to_async
    def get_unread_notifications(self):
        """Récupérer les notifications non lues."""
        from .models import Notification
        return list(Notification.objects.filter(
            utilisateur_id=self.user_id,
            lue=False
        ).order_by('-date_creation')[:10])
    
    @database_sync_to_async
    def mark_notification_read(self, notification_id):
        """Marquer une notification comme lue."""
        from .models import Notification
        try:
            notification = Notification.objects.get(
                id=notification_id,
                utilisateur_id=self.user_id
            )
            notification.marquer_comme_lue()
            return True
        except Notification.DoesNotExist:
            return False


class DashboardConsumer(AsyncWebsocketConsumer):
    """Consumer pour métriques dashboard temps réel."""
    
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.group_name = f'dashboard_{self.user_id}'
        
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Recevoir des demandes de métriques."""
        data = json.loads(text_data)
        message_type = data.get('type')
        
        if message_type == 'get_metrics':
            metrics = await self.get_dashboard_metrics()
            await self.send(text_data=json.dumps({
                'type': 'metrics_update',
                'data': metrics
            }))
    
    async def metrics_update(self, event):
        """Envoyer mise à jour des métriques."""
        await self.send(text_data=json.dumps(event))
    
    @database_sync_to_async
    def get_dashboard_metrics(self):
        """Récupérer les métriques du dashboard."""
        # Simulation de métriques temps réel
        import random
        from datetime import datetime
        
        return {
            'ventes_jour': random.randint(50000, 200000),
            'clients_actifs': random.randint(10, 50),
            'produits_stock': random.randint(100, 500),
            'commandes_attente': random.randint(0, 20),
            'timestamp': datetime.now().isoformat()
        }


class ChatConsumer(AsyncWebsocketConsumer):
    """Consumer pour chat en direct."""
    
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Recevoir un message de chat."""
        data = json.loads(text_data)
        message = data['message']
        user_id = data['user_id']
        
        # Sauvegarder le message
        await self.save_chat_message(user_id, message)
        
        # Diffuser le message
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'user_id': user_id,
                'timestamp': data.get('timestamp')
            }
        )
    
    async def chat_message(self, event):
        """Envoyer un message de chat."""
        await self.send(text_data=json.dumps(event))
    
    @database_sync_to_async
    def save_chat_message(self, user_id, message):
        """Sauvegarder un message de chat."""
        # Implémentation de sauvegarde
        pass