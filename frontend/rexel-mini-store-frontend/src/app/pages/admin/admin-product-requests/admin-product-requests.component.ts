import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductRequestResponse, ProductRequestStatus } from '../../../models/product-request.model';
import { AdminService } from '../../../services/admin.service';
import { ToastService } from '../../../services/toast.service';
import { SpinnerComponent } from '../../../components/spinner/spinner.component';

const PAGE_SIZE = 6;

@Component({
  selector: 'app-admin-product-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent],
  templateUrl: './admin-product-requests.component.html'
})
export class AdminProductRequestsComponent implements OnInit {

  requests: ProductRequestResponse[] = [];
  loading = true;
  currentPage = 1;
  statusFilter: ProductRequestStatus | '' = '';

  readonly statuses: ProductRequestStatus[] = ['PENDING', 'APPROVED', 'REJECTED'];

  constructor(
    private adminService: AdminService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading = true;
    this.currentPage = 1;
    this.adminService.getProductRequests(this.statusFilter).subscribe({
      next: (requests) => {
        this.requests = requests;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.requests.length / PAGE_SIZE));
  }

  get pagedRequests(): ProductRequestResponse[] {
    const start = (this.currentPage - 1) * PAGE_SIZE;
    return this.requests.slice(start, start + PAGE_SIZE);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  approve(request: ProductRequestResponse): void {
    this.adminService.approveProductRequest(request.id).subscribe({
      next: (updated) => this.applyUpdate(updated),
      error: (err) => this.toastService.error(err?.error?.error ?? 'Une erreur est survenue.')
    });
  }

  reject(request: ProductRequestResponse): void {
    this.adminService.rejectProductRequest(request.id).subscribe({
      next: (updated) => this.applyUpdate(updated),
      error: (err) => this.toastService.error(err?.error?.error ?? 'Une erreur est survenue.')
    });
  }

  private applyUpdate(updated: ProductRequestResponse): void {
    const index = this.requests.findIndex(r => r.id === updated.id);
    if (index !== -1) {
      this.requests[index] = updated;
    }
    this.toastService.success(`Demande #${updated.id} mise a jour.`);
  }
}
