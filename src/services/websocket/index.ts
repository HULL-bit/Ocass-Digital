/**
 * Service WebSocket pour communications temps réel
 */

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export interface NotificationMessage {
  id: string;
  titre: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  action_url?: string;
  metadata?: any;
}

export class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private listeners: Map<string, Function[]> = new Map();

  constructor(private userId: string, private baseUrl: string = 'ws://localhost:8000') {}

  connect(endpoint: string = 'notifications') {
    const url = `${this.baseUrl}/ws/${endpoint}/${this.userId}/`;
    
    try {
      this.socket = new WebSocket(url);
      
      this.socket.onopen = () => {
        console.log(`WebSocket connecté: ${endpoint}`);
        this.reconnectAttempts = 0;
        this.emit('connected', { endpoint });
      };
      
      this.socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Erreur parsing message WebSocket:', error);
        }
      };
      
      this.socket.onclose = (event) => {
        console.log('WebSocket fermé:', event.code, event.reason);
        this.emit('disconnected', { code: event.code, reason: event.reason });
        
        // Reconnexion automatique
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.reconnectAttempts++;
            this.connect(endpoint);
          }, this.reconnectInterval * Math.pow(2, this.reconnectAttempts));
        }
      };
      
      this.socket.onerror = (error) => {
        console.error('Erreur WebSocket:', error);
        this.emit('error', { error });
      };
      
    } catch (error) {
      console.error('Erreur connexion WebSocket:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  send(message: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket non connecté');
    }
  }

  private handleMessage(message: WebSocketMessage) {
    this.emit(message.type, message.data);
    
    // Gestion spécifique par type
    switch (message.type) {
      case 'notification':
        this.handleNotification(message.data);
        break;
      case 'metrics_update':
        this.handleMetricsUpdate(message.data);
        break;
      case 'stock_alert':
        this.handleStockAlert(message.data);
        break;
      case 'payment_received':
        this.handlePaymentReceived(message.data);
        break;
      case 'new_sale':
        this.handleNewSale(message.data);
        break;
    }
  }

  private handleNotification(data: NotificationMessage) {
    // Afficher notification toast
    this.emit('show_toast', {
      type: data.type,
      title: data.titre,
      message: data.message,
      action: data.action_url ? () => window.location.href = data.action_url! : undefined
    });
  }

  private handleMetricsUpdate(data: any) {
    this.emit('metrics_updated', data);
  }

  private handleStockAlert(data: any) {
    this.emit('show_toast', {
      type: 'warning',
      title: 'Alerte Stock',
      message: `Stock faible: ${data.product_name} (${data.current_stock} restants)`,
      duration: 8000
    });
  }

  private handlePaymentReceived(data: any) {
    this.emit('show_toast', {
      type: 'success',
      title: 'Paiement Reçu',
      message: `${data.amount.toLocaleString()} XOF via ${data.method}`,
      duration: 5000
    });
  }

  private handleNewSale(data: any) {
    this.emit('show_toast', {
      type: 'success',
      title: 'Nouvelle Vente',
      message: `${data.product} vendu à ${data.customer} - ${data.amount.toLocaleString()} XOF`,
      duration: 5000
    });
  }

  // Système d'événements
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Méthodes utilitaires
  markNotificationRead(notificationId: string) {
    this.send({
      type: 'mark_read',
      notification_id: notificationId
    });
  }

  requestMetrics() {
    this.send({
      type: 'get_metrics'
    });
  }

  ping() {
    this.send({
      type: 'ping',
      timestamp: new Date().toISOString()
    });
  }

  // État de connexion
  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  get connectionState(): string {
    if (!this.socket) return 'disconnected';
    
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'disconnected';
      default: return 'unknown';
    }
  }
}

// Instance singleton
let wsService: WebSocketService | null = null;

export const getWebSocketService = (userId: string): WebSocketService => {
  if (!wsService || wsService['userId'] !== userId) {
    wsService = new WebSocketService(userId);
  }
  return wsService;
};

export const disconnectWebSocket = () => {
  if (wsService) {
    wsService.disconnect();
    wsService = null;
  }
};