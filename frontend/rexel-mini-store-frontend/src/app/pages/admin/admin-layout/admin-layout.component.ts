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
  pendingProductRequestCount = 0;

  constructor(
    private router: Router,
    private adminService: AdminService,
    private notificationStore: NotificationStoreService
  ) {
    this.notifExpanded = this.router.url.includes('/admin/notifications');
  }

  ngOnInit(): void {
    this.refreshUnreadOrderCount();
    this.refreshPendingProductRequestCount();
    // Une notif push (nouvelle commande, demande de produit, etc.) arrive en
    // direct -> on en profite pour rafraichir les badges sans polling dedie.
    this.notificationStore.notifications$.subscribe(() => {
      this.refreshUnreadOrderCount();
      this.refreshPendingProductRequestCount();
    });
  }

  private refreshUnreadOrderCount(): void {
    this.adminService.getStats().subscribe({
      next: (stats) => this.unreadOrderCount = stats.unreadOrderCount,
      error: () => {}
    });
  }

  private refreshPendingProductRequestCount(): void {
    this.adminService.getProductRequests('PENDING').subscribe({
      next: (requests) => this.pendingProductRequestCount = requests.length,
      error: () => {}
    });
  }

  toggleNotifMenu(): void {
    this.notifExpanded = !this.notifExpanded;
  }
}
