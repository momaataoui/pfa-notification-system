import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastMessage, ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="toast"
      class="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-md border-l-4 bg-white px-4 py-3 shadow-lg dark:border dark:border-l-4 dark:bg-neutral-900"
      [class.border-green-500]="toast.type === 'success'"
      [class.border-red-500]="toast.type === 'error'">
      <span class="text-lg" [class.text-green-500]="toast.type === 'success'" [class.text-red-500]="toast.type === 'error'">
        {{ toast.type === 'success' ? '✓' : '✕' }}
      </span>
      <span class="text-sm text-anthracite dark:text-white">{{ toast.text }}</span>
    </div>
  `
})
export class ToastComponent implements OnInit {

  toast: ToastMessage | null = null;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.message$.subscribe(toast => {
      this.toast = toast;
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }
      this.timeoutId = setTimeout(() => this.toast = null, 3500);
    });
  }
}
