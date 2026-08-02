import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNotification } from '../../../models/notification.model';
import { NotificationStoreService } from '../../../services/notification-store.service';
import { SpinnerComponent } from '../../../components/spinner/spinner.component';

@Component({
  selector: 'app-admin-notification-failures',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  templateUrl: './admin-notification-failures.component.html'
})
export class AdminNotificationFailuresComponent implements OnInit {

  loading = true;
  failures: AppNotification[] = [];

  constructor(private notificationStore: NotificationStoreService) {}

  ngOnInit(): void {
    this.notificationStore.getAllNotifications('FAILED').subscribe({
      next: (notifications) => {
        this.failures = notifications;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  recipientLabel(notification: AppNotification): string {
    if (notification.recipientEmail) {
      return notification.recipientEmail;
    }
    return notification.recipientType === 'BROADCAST' ? 'Diffusion (tous)' : 'Groupe';
  }
}
