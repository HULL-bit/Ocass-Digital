import { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { addNotification } from '../store/slices/uiSlice';
import toast from 'react-hot-toast';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export const useWebSocket = (userId: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const dispatch = useDispatch();

  const connect = useCallback(() => {
    if (!userId) return;

    // Simulate WebSocket connection for demo
    const mockSocket = {
      send: (data: string) => {
        console.log('Mock WebSocket send:', data);
      },
      close: () => {
        setIsConnected(false);
      },
    } as WebSocket;

    setSocket(mockSocket);
    setIsConnected(true);
    setReconnectAttempts(0);

    // Simulate receiving messages
    const simulateMessages = () => {
      const messages = [
        {
          type: 'stock_alert',
          data: { product_name: 'iPhone 14', current_stock: 2, minimum_stock: 5 },
          timestamp: new Date().toISOString(),
        },
        {
          type: 'new_sale',
          data: { amount: 150000, customer: 'Marie Diallo', product: 'MacBook Air' },
          timestamp: new Date().toISOString(),
        },
        {
          type: 'payment_received',
          data: { amount: 75000, method: 'Wave Money', reference: 'WV123456' },
          timestamp: new Date().toISOString(),
        },
      ];

      let messageIndex = 0;
      const interval = setInterval(() => {
        if (messageIndex < messages.length && isConnected) {
          handleMessage(messages[messageIndex]);
          messageIndex++;
        } else {
          clearInterval(interval);
        }
      }, 10000); // Send a message every 10 seconds

      return interval;
    };

    const interval = simulateMessages();

    return () => {
      clearInterval(interval);
      mockSocket.close();
    };
  }, [userId, isConnected]);

  const handleMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'stock_alert':
        toast.error(`Stock faible: ${message.data.product_name} (${message.data.current_stock} restants)`, {
          duration: 6000,
          icon: '⚠️',
        });
        dispatch(addNotification({
          type: 'warning',
          title: 'Alerte Stock',
          message: `${message.data.product_name} - Stock faible: ${message.data.current_stock} unités`,
        }));
        break;

      case 'new_sale':
        toast.success(`Nouvelle vente: ${message.data.amount.toLocaleString()} XOF`, {
          duration: 4000,
          icon: '💰',
        });
        dispatch(addNotification({
          type: 'success',
          title: 'Nouvelle Vente',
          message: `${message.data.product} vendu à ${message.data.customer}`,
        }));
        break;

      case 'payment_received':
        toast.success(`Paiement reçu: ${message.data.amount.toLocaleString()} XOF`, {
          duration: 4000,
          icon: '✅',
        });
        dispatch(addNotification({
          type: 'success',
          title: 'Paiement Reçu',
          message: `${message.data.method} - ${message.data.reference}`,
        }));
        break;

      case 'system_maintenance':
        toast('Maintenance programmée dans 30 minutes', {
          duration: 10000,
          icon: '🔧',
        });
        dispatch(addNotification({
          type: 'info',
          title: 'Maintenance Système',
          message: 'Maintenance programmée dans 30 minutes',
        }));
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  };

  const sendMessage = useCallback((message: any) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(message));
    }
  }, [socket, isConnected]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.close();
    }
  }, [socket]);

  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);

  // Auto-reconnect logic
  useEffect(() => {
    if (!isConnected && reconnectAttempts < 5) {
      const timeout = setTimeout(() => {
        setReconnectAttempts(prev => prev + 1);
        connect();
      }, Math.pow(2, reconnectAttempts) * 1000); // Exponential backoff

      return () => clearTimeout(timeout);
    }
  }, [isConnected, reconnectAttempts, connect]);

  return {
    socket,
    isConnected,
    sendMessage,
    disconnect,
    reconnectAttempts,
  };
};