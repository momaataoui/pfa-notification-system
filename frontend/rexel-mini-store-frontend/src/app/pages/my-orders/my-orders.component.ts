import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderResponse } from '../../models/order.model';
import { StoreService } from '../../services/store.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

const PAGE_SIZE = 5;

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, SpinnerComponent, ConfirmDialogComponent],
  templateUrl: './my-orders.component.html'
})
export class MyOrdersComponent implements OnInit {

  orders: OrderResponse[] = [];
  loading = true;
  currentPage = 1;
  orderToCancel: OrderResponse | null = null;

  constructor(
    private storeService: StoreService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    const email = this.authService.currentUser?.email;
    if (!email) {
      this.loading = false;
      return;
    }

    this.loading = true;
    this.storeService.getMyOrders(email).subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.orders.length / PAGE_SIZE));
  }

  get pagedOrders(): OrderResponse[] {
    const start = (this.currentPage - 1) * PAGE_SIZE;
    return this.orders.slice(start, start + PAGE_SIZE);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  askCancel(order: OrderResponse): void {
    this.orderToCancel = order;
  }

  confirmCancel(): void {
    const order = this.orderToCancel;
    if (!order) {
      return;
    }

    this.storeService.cancelOrder(order.id).subscribe({
      next: (updated) => {
        const index = this.orders.findIndex(o => o.id === updated.id);
        if (index !== -1) {
          this.orders[index] = updated;
        }
        this.orderToCancel = null;
        this.toastService.success('Commande annulee.');
      },
      error: (err) => {
        this.orderToCancel = null;
        this.toastService.error(err?.error?.error ?? 'Une erreur est survenue.');
      }
    });
  }
}
