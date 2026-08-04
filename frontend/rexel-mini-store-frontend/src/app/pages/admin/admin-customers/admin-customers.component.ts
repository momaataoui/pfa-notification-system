import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Customer } from '../../../models/admin.model';
import { AdminService } from '../../../services/admin.service';
import { SpinnerComponent } from '../../../components/spinner/spinner.component';
import { ToastService } from '../../../services/toast.service';

const PAGE_SIZE = 8;

@Component({
  selector: 'app-admin-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent],
  templateUrl: './admin-customers.component.html'
})
export class AdminCustomersComponent implements OnInit {

  customers: Customer[] = [];
  loading = true;
  currentPage = 1;

  editingCustomerId: string | null = null;
  editPhoneValue = '';
  savingPhone = false;

  constructor(private adminService: AdminService, private toast: ToastService) {}

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

  startEditPhone(customer: Customer): void {
    this.editingCustomerId = customer.id;
    this.editPhoneValue = customer.phone ?? '';
  }

  cancelEditPhone(): void {
    this.editingCustomerId = null;
  }

  savePhone(customer: Customer): void {
    this.savingPhone = true;
    this.adminService.updateCustomerPhone(customer.id, this.editPhoneValue.trim()).subscribe({
      next: (updated) => {
        customer.phone = updated.phone;
        this.editingCustomerId = null;
        this.savingPhone = false;
        this.toast.success('Telephone mis a jour.');
      },
      error: () => {
        this.savingPhone = false;
        this.toast.error('Impossible de mettre a jour le telephone.');
      }
    });
  }
}
