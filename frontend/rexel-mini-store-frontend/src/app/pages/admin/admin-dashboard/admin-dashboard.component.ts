import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminStats } from '../../../models/admin.model';
import { AppNotification, NotificationStatsResponse } from '../../../models/notification.model';
import { AdminService } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';
import { ThemeService } from '../../../services/theme.service';
import { NotificationStoreService } from '../../../services/notification-store.service';
import { SpinnerComponent } from '../../../components/spinner/spinner.component';
import { LineChartComponent, LineChartSeries } from '../../../components/charts/line-chart/line-chart.component';
import { DonutChartComponent, DonutSegment } from '../../../components/charts/donut-chart/donut-chart.component';
import { MeterComponent } from '../../../components/charts/meter/meter.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent, LineChartComponent, DonutChartComponent, MeterComponent],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {

  stats: AdminStats | null = null;
  notifStats: NotificationStatsResponse | null = null;
  recentNotifications: AppNotification[] = [];
  loading = true;
  loadingNotifStats = true;
  isDark = false;

  constructor(
    private adminService: AdminService,
    protected authService: AuthService,
    private themeService: ThemeService,
    private notificationStore: NotificationStoreService
  ) {
    this.themeService.theme$.subscribe(theme => this.isDark = theme === 'dark');
  }

  ngOnInit(): void {
    this.adminService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: () => this.loading = false
    });

    this.notificationStore.getStats().subscribe({
      next: (stats) => {
        this.notifStats = stats;
        this.loadingNotifStats = false;
      },
      error: () => this.loadingNotifStats = false
    });

    this.notificationStore.getAllNotifications().subscribe({
      next: (notifications) => this.recentNotifications = notifications.slice(0, 5),
      error: () => this.recentNotifications = []
    });
  }

  get channelColors() {
    return this.isDark
      ? { push: '#3987e5', email: '#d95926', sms: '#199e70' }
      : { push: '#2a78d6', email: '#eb6834', sms: '#1baf7a' };
  }

  get notifDays(): string[] {
    return this.notifStats?.timeline.map(d => d.date) ?? [];
  }

  get notifSeries(): LineChartSeries[] {
    if (!this.notifStats) {
      return [];
    }
    return [
      { name: 'Push', color: this.channelColors.push, values: this.notifStats.timeline.map(d => d.push) },
      { name: 'Email', color: this.channelColors.email, values: this.notifStats.timeline.map(d => d.email) },
      { name: 'SMS', color: this.channelColors.sms, values: this.notifStats.timeline.map(d => d.sms) }
    ];
  }

  get channelDonutSegments(): DonutSegment[] {
    if (!this.notifStats) {
      return [];
    }
    const counts = this.notifStats.channelCounts;
    return [
      { label: 'Push', value: counts.PUSH ?? 0, color: this.channelColors.push },
      { label: 'Email', value: counts.EMAIL ?? 0, color: this.channelColors.email },
      { label: 'SMS', value: counts.SMS ?? 0, color: this.channelColors.sms }
    ];
  }

  get deliveryRate(): number {
    const total = this.deliveryTotal;
    return total === 0 ? 0 : Math.round((this.notifStats!.delivery.delivered / total) * 100);
  }

  get deliveryTotal(): number {
    if (!this.notifStats) {
      return 0;
    }
    const { delivered, failed, pending } = this.notifStats.delivery;
    return delivered + failed + pending;
  }

  get meterColor(): string {
    return '#0ca30c';
  }

  get meterTrackColor(): string {
    return this.isDark ? '#123d17' : '#d7f0d7';
  }
}
