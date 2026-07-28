import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationChannel, NotificationPriority, NotificationRecipientType } from '../../../models/notification.model';
import { NotificationStoreService } from '../../../services/notification-store.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-notifications.component.html'
})
export class AdminNotificationsComponent {

  private fb = inject(FormBuilder);
  private notificationStore = inject(NotificationStoreService);
  private toastService = inject(ToastService);

  readonly recipientTypes: NotificationRecipientType[] = ['USER', 'GROUP', 'BROADCAST'];
  readonly priorities: NotificationPriority[] = ['LOW', 'NORMAL', 'HIGH'];
  readonly channels: NotificationChannel[] = ['PUSH', 'EMAIL', 'SMS'];

  sending = false;

  form = this.fb.group({
    recipientType: ['USER' as NotificationRecipientType, Validators.required],
    recipientEmail: ['', Validators.email],
    priority: ['NORMAL' as NotificationPriority, Validators.required],
    channels: this.fb.group(
      this.channels.reduce((acc, channel) => ({ ...acc, [channel]: channel === 'PUSH' }), {} as Record<NotificationChannel, boolean>)
    ),
    title: ['', Validators.required],
    message: ['', Validators.required]
  });

  get isUserRecipient(): boolean {
    return this.form.controls.recipientType.value === 'USER';
  }

  submit(): void {
    if (this.isUserRecipient) {
      this.form.controls.recipientEmail.addValidators(Validators.required);
    } else {
      this.form.controls.recipientEmail.clearValidators();
    }
    this.form.controls.recipientEmail.updateValueAndValidity();

    const selectedChannels = this.channels.filter(channel => this.form.controls.channels.value[channel]);

    if (this.form.invalid || selectedChannels.length === 0) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    this.sending = true;
    this.notificationStore.sendManual({
      recipientType: raw.recipientType!,
      recipientEmail: raw.recipientType === 'USER' ? raw.recipientEmail || null : null,
      priority: raw.priority!,
      channels: selectedChannels,
      title: raw.title!,
      message: raw.message!
    }).subscribe({
      next: () => {
        this.sending = false;
        this.toastService.success('Notification envoyee.');
        this.form.reset({
          recipientType: 'USER',
          recipientEmail: '',
          priority: 'NORMAL',
          channels: { PUSH: true, EMAIL: false, SMS: false },
          title: '',
          message: ''
        });
      },
      error: (err) => {
        this.sending = false;
        this.toastService.error(err?.error?.error ?? 'Une erreur est survenue.');
      }
    });
  }
}
