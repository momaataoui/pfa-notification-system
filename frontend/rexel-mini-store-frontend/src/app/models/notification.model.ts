export type NotificationChannel = 'PUSH' | 'EMAIL' | 'SMS';
export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH';
export type NotificationRecipientType = 'USER' | 'GROUP' | 'BROADCAST';

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
}

export interface AdminNotificationRequest {
  recipientType: NotificationRecipientType;
  recipientEmail: string | null;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  title: string;
  message: string;
}
