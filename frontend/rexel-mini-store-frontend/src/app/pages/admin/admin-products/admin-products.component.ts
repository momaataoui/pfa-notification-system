import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from '../../../models/product.model';
import { StoreService } from '../../../services/store.service';
import { AdminService } from '../../../services/admin.service';
import { ToastService } from '../../../services/toast.service';
import { SpinnerComponent } from '../../../components/spinner/spinner.component';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';
import { getProductIcon } from '../../../utils/product-icon';

const PAGE_SIZE = 6;

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent, ConfirmDialogComponent],
  templateUrl: './admin-products.component.html'
})
export class AdminProductsComponent implements OnInit {

  private fb = inject(FormBuilder);
  private storeService = inject(StoreService);
  private adminService = inject(AdminService);
  private toastService = inject(ToastService);

  products: Product[] = [];
  loading = true;
  currentPage = 1;

  showForm = false;
  editingProduct: Product | null = null;
  productToDelete: Product | null = null;
  saving = false;

  readonly getProductIcon = getProductIcon;

  form = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    originalPrice: [0],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
    imageUrl: [''],
    category: ['']
  });

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.storeService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.products.length / PAGE_SIZE));
  }

  get pagedProducts(): Product[] {
    const start = (this.currentPage - 1) * PAGE_SIZE;
    return this.products.slice(start, start + PAGE_SIZE);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  openCreateForm(): void {
    this.editingProduct = null;
    this.form.reset({ name: '', description: '', price: 0, originalPrice: 0, stockQuantity: 0, imageUrl: '', category: '' });
    this.showForm = true;
  }

  openEditForm(product: Product): void {
    this.editingProduct = product;
    this.form.setValue({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice ?? 0,
      stockQuantity: product.stockQuantity,
      imageUrl: product.imageUrl ?? '',
      category: product.category ?? ''
    });
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
  }

  submitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request = this.form.getRawValue() as {
      name: string; description: string; price: number; originalPrice: number; stockQuantity: number; imageUrl: string; category: string;
    };
    const payload = {
      ...request,
      imageUrl: request.imageUrl || null,
      category: request.category || null,
      originalPrice: request.originalPrice || null
    };

    this.saving = true;
    const request$ = this.editingProduct
      ? this.adminService.updateProduct(this.editingProduct.id, payload)
      : this.adminService.createProduct(payload);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.showForm = false;
        this.toastService.success(this.editingProduct ? 'Produit modifie.' : 'Produit ajoute.');
        this.loadProducts();
      },
      error: (err) => {
        this.saving = false;
        this.toastService.error(err?.error?.error ?? 'Une erreur est survenue.');
      }
    });
  }

  askDelete(product: Product): void {
    this.productToDelete = product;
  }

  confirmDelete(): void {
    const product = this.productToDelete;
    if (!product) {
      return;
    }

    this.adminService.deleteProduct(product.id).subscribe({
      next: () => {
        this.productToDelete = null;
        this.toastService.success('Produit supprime.');
        this.loadProducts();
      },
      error: (err) => {
        this.productToDelete = null;
        this.toastService.error(err?.error?.error ?? 'Une erreur est survenue.');
      }
    });
  }
}
