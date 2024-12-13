import { auth } from '../config/firebase';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { authService } from './authService';
import api from './api';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
}

class NotificationService {
  private messaging: any;
  private notificationCallback?: (notification: Notification) => void;
  private mockNotifications: Notification[] = [];

  async init() {
    try {
      if (!auth.currentUser) return;

      this.messaging = getMessaging();
      
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Obter token do FCM
        const token = await getToken(this.messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
        });

        console.log('Token FCM obtido:', token);

        // Configurar listener para mensagens em primeiro plano
        onMessage(this.messaging, (payload) => {
          console.log('Mensagem recebida:', payload);
          if (this.notificationCallback && payload.notification) {
            const notification: Notification = {
              id: payload.messageId || Date.now().toString(),
              title: payload.notification.title || '',
              message: payload.notification.body || '',
              type: 'info',
              read: false,
              createdAt: new Date()
            };
            
            this.mockNotifications.push(notification);
            this.notificationCallback(notification);
          }
        });
      }
    } catch (error) {
      console.error('Erro ao inicializar notificações:', error);
    }
  }

  async getNotifications(): Promise<Notification[]> {
    return this.mockNotifications;
  }

  async markAsRead(notificationId: string): Promise<void> {
    const notification = this.mockNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  async markAllAsRead(): Promise<void> {
    this.mockNotifications.forEach(notification => {
      notification.read = true;
    });
  }

  onNotification(callback: (notification: Notification) => void) {
    this.notificationCallback = callback;
  }

  async updateNotificationPreferences(preferences: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  }): Promise<void> {
    console.log('Preferências de notificação atualizadas:', preferences);
  }
}

export const notificationService = new NotificationService();
