import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Customer } from '../../../models/admin.model';
import { AdminService } from '../../../services/admin.service';
import { SpinnerComponent } from '../../../components/spinner/spinner.component';

const PAGE_SIZE = 8;

@Component({
  selector: 'app-admin-customers',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  templateUrl: './admin-customers.component.html'
})
export class AdminCustomersComponent implements OnInit {

  customers: Customer[] = [];
  loading = true;
  currentPage = 1;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.customers.length / PAGE_SIZE));
  }

  get pagedCustomers(): Customer[] {
    const start = (this.currentPage - 1) * PAGE_SIZE;
    return this.customers.slice(start, start + PAGE_SIZE);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
