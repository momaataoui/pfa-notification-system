import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-admin-notification-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-notification-settings.component.html'
})
export class AdminNotificationSettingsComponent {

  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  form = this.fb.group({
    pushEnabled: [true],
    emailEnabled: [true],
    smsEnabled: [false],
    lowStockThreshold: [10],
    digestFrequency: ['instant' as 'instant' | 'daily' | 'weekly']
  });

  save(): void {
    this.toastService.success("Apercu uniquement : ces parametres ne sont pas encore enregistres cote serveur.");
  }
}
