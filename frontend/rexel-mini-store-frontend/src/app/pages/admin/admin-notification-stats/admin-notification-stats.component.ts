import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../services/theme.service';
import { NotificationStoreService } from '../../../services/notification-store.service';
import { NotificationStatsResponse } from '../../../models/notification.model';
import { SpinnerComponent } from '../../../components/spinner/spinner.component';
import { LineChartComponent, LineChartSeries } from '../../../components/charts/line-chart/line-chart.component';
import { DonutChartComponent, DonutSegment } from '../../../components/charts/donut-chart/donut-chart.component';

@Component({
  selector: 'app-admin-notification-stats',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, LineChartComponent, DonutChartComponent],
  templateUrl: './admin-notification-stats.component.html'
})
export class AdminNotificationStatsComponent implements OnInit {

  isDark = false;
  loading = true;
  stats: NotificationStatsResponse | null = null;

  constructor(
    private themeService: ThemeService,
    private notificationStore: NotificationStoreService
  ) {
    this.themeService.theme$.subscribe(theme => this.isDark = theme === 'dark');
  }

  ngOnInit(): void {
    this.notificationStore.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  get channelColors() {
    return this.isDark
      ? { push: '#3987e5', email: '#d95926', sms: '#199e70' }
      : { push: '#2a78d6', email: '#eb6834', sms: '#1baf7a' };
  }

  get days(): string[] {
    return this.stats?.timeline.map(d => d.date) ?? [];
  }

  get series(): LineChartSeries[] {
    if (!this.stats) {
      return [];
    }
    return [
      { name: 'Push', color: this.channelColors.push, values: this.stats.timeline.map(d => d.push) },
      { name: 'Email', color: this.channelColors.email, values: this.stats.timeline.map(d => d.email) },
      { name: 'SMS', color: this.channelColors.sms, values: this.stats.timeline.map(d => d.sms) }
    ];
  }

  get channelDonutSegments(): DonutSegment[] {
    if (!this.stats) {
      return [];
    }
    const counts = this.stats.channelCounts;
    return [
      { label: 'Push', value: counts.PUSH ?? 0, color: this.channelColors.push },
      { label: 'Email', value: counts.EMAIL ?? 0, color: this.channelColors.email },
      { label: 'SMS', value: counts.SMS ?? 0, color: this.channelColors.sms }
    ];
  }

  get totalSent(): number {
    return this.stats?.totalSent ?? 0;
  }

  get averagePerDay(): number {
    if (!this.stats) {
      return 0;
    }
    const totalInWindow = this.stats.timeline.reduce((sum, d) => sum + d.push + d.email + d.sms, 0);
    return Math.round(totalInWindow / this.stats.timeline.length);
  }

  get topChannel(): string {
    if (!this.stats) {
      return '—';
    }
    const entries = Object.entries(this.stats.channelCounts) as [string, number][];
    if (entries.every(([, count]) => count === 0)) {
      return '—';
    }
    return entries.sort((a, b) => b[1] - a[1])[0][0];
  }
}
