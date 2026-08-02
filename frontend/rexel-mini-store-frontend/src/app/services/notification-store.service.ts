import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, map, Observable } from 'rxjs';
import {
  AdminNotificationRequest,
  AppNotification,
  DeliveryStatus,
  NotificationStatsResponse
} from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationStoreService {

  private readonly apiUrl = 'http://localhost:8080/api/notifications';
  private readonly adminApiUrl = 'http://localhost:8080/api/admin/notifications';

  private readonly notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  readonly notifications$ = this.notificationsSubject.asObservable();

  readonly unreadCount$ = this.notifications$.pipe(
    map(notifications => notifications.filter(n => !n.read).length)
  );

  constructor(private http: HttpClient) {}

  loadHistory(): void {
    this.http.get<AppNotification[]>(`${this.apiUrl}/me`).subscribe({
      next: notifications => this.notificationsSubject.next(notifications),
      error: () => this.notificationsSubject.next([])
    });
  }

  clear(): void {
    this.notificationsSubject.next([]);
  }

  addIncoming(notification: AppNotification): void {
    this.notificationsSubject.next([notification, ...this.notificationsSubject.value]);
  }

  sendManual(request: AdminNotificationRequest): Observable<AppNotification> {
    return this.http.post<AppNotification>(this.adminApiUrl, request);
  }

  getAllNotifications(status?: DeliveryStatus): Observable<AppNotification[]> {
    return status
      ? this.http.get<AppNotification[]>(this.adminApiUrl, { params: { status } })
      : this.http.get<AppNotification[]>(this.adminApiUrl);
  }

  getStats(): Observable<NotificationStatsResponse> {
    return this.http.get<NotificationStatsResponse>(`${this.adminApiUrl}/stats`);
  }

  markAsRead(notification: AppNotification): void {
    if (notification.read) {
      return;
    }

    this.http.patch<void>(`${this.apiUrl}/${notification.id}/read`, {}).subscribe(() => {
      const updated = this.notificationsSubject.value.map(n =>
        n.id === notification.id ? { ...n, read: true } : n
      );
      this.notificationsSubject.next(updated);
    });
  }

  markAllAsRead(): void {
    const unread = this.notificationsSubject.value.filter(n => !n.read);
    if (unread.length === 0) {
      return;
    }

    forkJoin(unread.map(n => this.http.patch<void>(`${this.apiUrl}/${n.id}/read`, {}))).subscribe(() => {
      const updated = this.notificationsSubject.value.map(n => ({ ...n, read: true }));
      this.notificationsSubject.next(updated);
    });
  }
}
