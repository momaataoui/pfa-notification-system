export type NotificationChannel = 'PUSH' | 'EMAIL' | 'SMS';
export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH';
export type NotificationRecipientType = 'USER' | 'GROUP' | 'BROADCAST';
export type DeliveryStatus = 'PENDING' | 'DELIVERED' | 'FAILED';

export interface AppNotification {
  id: number;
  recipientType: NotificationRecipientType;
  recipientEmail: string | null;
  title: string;
  message: string;
  channels: NotificationChannel[];
  priority: NotificationPriority;
  sourceEventType: string | null;
  read: boolean;
  createdAt: string;
  deliveryStatus: DeliveryStatus;
  failureReason: string | null;
}

export interface DailyChannelCount {
  date: string;
  push: number;
  email: number;
  sms: number;
}

export interface DeliveryBreakdown {
  delivered: number;
  failed: number;
  pending: number;
}

export interface NotificationStatsResponse {
  totalSent: number;
  channelCounts: Record<NotificationChannel, number>;
  timeline: DailyChannelCount[];
  delivery: DeliveryBreakdown;
}

export interface AdminNotificationRequest {
  recipientType: NotificationRecipientType;
  recipientEmail: string | null;
  recipientPhone: string | null;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  title: string;
  message: string;
}
