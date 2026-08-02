import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppNotification, NotificationChannel } from '../../../models/notification.model';
import { NotificationStoreService } from '../../../services/notification-store.service';
import { SpinnerComponent } from '../../../components/spinner/spinner.component';

const PAGE_SIZE = 8;

@Component({
  selector: 'app-admin-notification-history',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent],
  templateUrl: './admin-notification-history.component.html'
})
export class AdminNotificationHistoryComponent implements OnInit {

  loading = true;
  notifications: AppNotification[] = [];

  searchTerm = '';
  channelFilter: NotificationChannel | '' = '';
  currentPage = 1;

  constructor(private notificationStore: NotificationStoreService) {}

  ngOnInit(): void {
    this.notificationStore.getAllNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  get filteredNotifications(): AppNotification[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.notifications.filter(n =>
      (!this.channelFilter || n.channels.includes(this.channelFilter)) &&
      (!term || n.title.toLowerCase().includes(term) || (n.recipientEmail ?? '').toLowerCase().includes(term))
    );
  }

  onFilterChange(): void {
    this.currentPage = 1;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredNotifications.length / PAGE_SIZE));
  }

  get pagedNotifications(): AppNotification[] {
    const start = (this.currentPage - 1) * PAGE_SIZE;
    return this.filteredNotifications.slice(start, start + PAGE_SIZE);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  recipientLabel(notification: AppNotification): string {
    if (notification.recipientEmail) {
      return notification.recipientEmail;
    }
    return notification.recipientType === 'BROADCAST' ? 'Diffusion (tous)' : 'Groupe';
  }
}
