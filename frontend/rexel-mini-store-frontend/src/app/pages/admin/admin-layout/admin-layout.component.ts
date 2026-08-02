import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { NotificationStoreService } from '../../../services/notification-store.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-layout.component.html'
})
export class AdminLayoutComponent implements OnInit {

  notifExpanded = false;
  unreadOrderCount = 0;

  constructor(
    private router: Router,
    private adminService: AdminService,
    private notificationStore: NotificationStoreService
  ) {
    this.notifExpanded = this.router.url.includes('/admin/notifications');
  }

  ngOnInit(): void {
    this.refreshUnreadOrderCount();
    // Une notif push (nouvelle commande, etc.) arrive en direct -> on en profite
    // pour rafraichir le badge sans avoir a sondage/polling dedie.
    this.notificationStore.notifications$.subscribe(() => this.refreshUnreadOrderCount());
  }

  private refreshUnreadOrderCount(): void {
    this.adminService.getStats().subscribe({
      next: (stats) => this.unreadOrderCount = stats.unreadOrderCount,
      error: () => {}
    });
  }

  toggleNotifMenu(): void {
    this.notifExpanded = !this.notifExpanded;
  }
}
