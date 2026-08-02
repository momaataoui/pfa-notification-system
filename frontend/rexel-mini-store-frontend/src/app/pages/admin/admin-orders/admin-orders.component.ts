import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderResponse, OrderStatus } from '../../../models/order.model';
import { AdminService } from '../../../services/admin.service';
import { ToastService } from '../../../services/toast.service';
import { StatusBadgeComponent } from '../../../components/status-badge/status-badge.component';
import { SpinnerComponent } from '../../../components/spinner/spinner.component';

const PAGE_SIZE = 6;

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent, SpinnerComponent],
  templateUrl: './admin-orders.component.html'
})
export class AdminOrdersComponent implements OnInit {

  orders: OrderResponse[] = [];
  loading = true;
  currentPage = 1;
  statusFilter: OrderStatus | '' = '';

  readonly statuses: OrderStatus[] = ['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  constructor(
    private adminService: AdminService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.currentPage = 1;
    this.adminService.getAllOrders(this.statusFilter).subscribe({
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

  changeStatus(order: OrderResponse, status: string): void {
    this.adminService.updateOrderStatus(order.id, status as OrderStatus).subscribe({
      next: (updated) => {
        const index = this.orders.findIndex(o => o.id === updated.id);
        if (index !== -1) {
          this.orders[index] = updated;
        }
        this.toastService.success(`Commande #${updated.id} mise a jour.`);
      },
      error: (err) => this.toastService.error(err?.error?.error ?? 'Une erreur est survenue.')
    });
  }

  markAsRead(order: OrderResponse): void {
    this.adminService.markOrderAsRead(order.id).subscribe({
      next: (updated) => {
        const index = this.orders.findIndex(o => o.id === updated.id);
        if (index !== -1) {
          this.orders[index] = updated;
        }
      },
      error: (err) => this.toastService.error(err?.error?.error ?? 'Une erreur est survenue.')
    });
  }
}
