import { Component, Input } from '@angular/core';
import { OrderStatus } from '../../models/order.model';

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300',
  PAID: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
  SHIPPED: 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400',
  DELIVERED: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400'
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'En attente',
  PAID: 'Payee',
  SHIPPED: 'Expediee',
  DELIVERED: 'Livree',
  CANCELLED: 'Annulee'
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    <span class="inline-block rounded-full px-3 py-1 text-xs font-semibold" [class]="styleClass">
      {{ label }}
    </span>
  `
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: OrderStatus;

  get styleClass(): string {
    return STATUS_STYLES[this.status];
  }

  get label(): string {
    return STATUS_LABELS[this.status];
  }
}
