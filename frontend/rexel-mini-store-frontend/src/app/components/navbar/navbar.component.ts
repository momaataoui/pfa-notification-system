import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { StoreUser } from '../../models/store-user.model';
import { AppNotification, NotificationPriority } from '../../models/notification.model';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { NotificationStoreService } from '../../services/notification-store.service';
import { LogoMarkComponent } from '../logo-mark/logo-mark.component';
import { timeAgo } from '../../utils/time-ago';

type NotifFilter = 'all' | 'unread';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LogoMarkComponent],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {

  currentUser: StoreUser | null = null;
  searchTerm = '';
  menuOpen = false;
  notifMenuOpen = false;

  readonly timeAgo = timeAgo;

  private notifFilterSubject = new BehaviorSubject<NotifFilter>('all');
  readonly filteredNotifications$;

  constructor(
    protected authService: AuthService,
    protected themeService: ThemeService,
    protected notificationStore: NotificationStoreService,
    private router: Router
  ) {
    this.authService.currentUser$.subscribe(user => this.currentUser = user);

    this.filteredNotifications$ = combineLatest([
      this.notificationStore.notifications$,
      this.notifFilterSubject
    ]).pipe(
      map(([notifications, filter]) => filter === 'unread' ? notifications.filter(n => !n.read) : notifications)
    );
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  get initials(): string {
    if (!this.currentUser) {
      return '';
    }
    return (this.currentUser.firstName[0] ?? '') + (this.currentUser.lastName[0] ?? '');
  }

  onSearchSubmit(): void {
    this.router.navigate(['/products'], { queryParams: { q: this.searchTerm || null } });
  }

  onProfileIconClick(): void {
    if (this.currentUser) {
      this.notifMenuOpen = false;
      this.menuOpen = !this.menuOpen;
    } else {
      this.authService.requestLogin();
    }
  }

  onNotificationIconClick(): void {
    this.menuOpen = false;
    this.notifMenuOpen = !this.notifMenuOpen;
  }

  onNotificationClick(notification: AppNotification): void {
    this.notificationStore.markAsRead(notification);

    const target = this.notificationTarget(notification);
    if (target) {
      this.notifMenuOpen = false;
      this.router.navigate([target]);
    }
  }

  private notificationTarget(notification: AppNotification): string | null {
    if (this.isAdmin) {
      switch (notification.sourceEventType) {
        case 'PRODUCT_REQUEST_CREATED': return '/admin/product-requests';
        case 'ADMIN_NEW_ORDER': return '/admin/orders';
        case 'LOW_STOCK_ALERT': return '/admin/products';
        default: return null;
      }
    }

    switch (notification.sourceEventType) {
      case 'ORDER_CREATED':
      case 'ORDER_SHIPPED':
      case 'ORDER_DELIVERED':
      case 'ORDER_CANCELLED':
        return '/my-orders';
      case 'PRODUCT_REQUEST_APPROVED':
      case 'PRODUCT_REQUEST_REJECTED':
        return '/products';
      default:
        return null;
    }
  }

  notificationRowClass(notification: AppNotification): string {
    return notification.read ? '' : 'bg-blue-50 dark:bg-blue-950/20';
  }

  priorityAvatarClass(priority: NotificationPriority): string {
    if (priority === 'HIGH') {
      return 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400';
    }
    if (priority === 'LOW') {
      return 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-300';
    }
    return 'bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400';
  }

  get currentNotifFilter(): NotifFilter {
    return this.notifFilterSubject.value;
  }

  setNotifFilter(filter: NotifFilter): void {
    this.notifFilterSubject.next(filter);
  }

  markAllAsRead(): void {
    this.notificationStore.markAllAsRead();
  }

  logout(): void {
    this.menuOpen = false;
    this.authService.logout();
  }
}
