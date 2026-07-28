import { Injectable, inject } from '@angular/core';
import { Client } from '@stomp/stompjs';
import { AppNotification } from '../models/notification.model';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import { NotificationStoreService } from './notification-store.service';

@Injectable({ providedIn: 'root' })
export class PushNotificationService {

  private readonly wsUrl = 'ws://localhost:8080/ws';

  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private notificationStore = inject(NotificationStoreService);

  private client: Client | null = null;

  connect(): void {
    if (this.client?.active) {
      return;
    }

    this.notificationStore.loadHistory();

    this.client = new Client({
      brokerURL: this.wsUrl,
      connectHeaders: {
        Authorization: `Bearer ${this.authService.keycloak.token}`
      },
      reconnectDelay: 5000,
      onConnect: () => {
        this.client!.subscribe('/user/queue/notifications', (message) => {
          this.handleNotification(JSON.parse(message.body));
        });

        this.client!.subscribe('/topic/notifications', (message) => {
          this.handleNotification(JSON.parse(message.body));
        });
      }
    });

    this.client.activate();
  }

  disconnect(): void {
    this.client?.deactivate();
    this.client = null;
    this.notificationStore.clear();
  }

  private handleNotification(notification: AppNotification): void {
    this.notificationStore.addIncoming(notification);
    this.toastService.show(`${notification.title} : ${notification.message}`);
  }
}
