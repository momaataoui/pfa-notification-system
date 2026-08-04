import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Product } from '../../models/product.model';
import { StoreUser } from '../../models/store-user.model';
import { StoreService } from '../../services/store.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { getProductIcon } from '../../utils/product-icon';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SpinnerComponent],
  templateUrl: './products.component.html'
})
export class ProductsComponent implements OnInit {

  products: Product[] = [];
  loading = true;
  currentUser: StoreUser | null = null;

  searchTerm = '';
  selectedCategory = '';
  minPrice = 0;
  maxPrice = 500;

  productToConfirm: Product | null = null;
  quantity = 1;

  requestingProduct = false;
  requestProductName = '';
  requestDescription = '';

  readonly getProductIcon = getProductIcon;

  constructor(
    private storeService: StoreService,
    private authService: AuthService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => this.currentUser = user);

    this.route.queryParamMap.subscribe(params => {
      this.searchTerm = params.get('q') ?? '';
    });

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

  get categories(): string[] {
    const set = new Set(this.products.map(p => p.category).filter((c): c is string => !!c));
    return Array.from(set).sort();
  }

  get filteredProducts(): Product[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.products.filter(p => {
      const matchesSearch = !term || p.name.toLowerCase().includes(term);
      const matchesCategory = !this.selectedCategory || p.category === this.selectedCategory;
      const matchesPrice = p.price >= this.minPrice && p.price <= this.maxPrice;
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
  }

  imageFor(product: Product): string {
    return product.imageUrl || this.getProductIcon(product.name);
  }

  onImageError(event: Event, product: Product): void {
    (event.target as HTMLImageElement).src = this.getProductIcon(product.name);
  }

  onAddToCart(product: Product): void {
    if (!this.currentUser) {
      this.authService.requestLogin();
      return;
    }
    this.productToConfirm = product;
    this.quantity = 1;
  }

  closeConfirm(): void {
    this.productToConfirm = null;
  }

  openProductRequest(): void {
    if (!this.currentUser) {
      this.authService.requestLogin();
      return;
    }
    this.requestProductName = this.searchTerm;
    this.requestDescription = '';
    this.requestingProduct = true;
  }

  closeProductRequest(): void {
    this.requestingProduct = false;
  }

  submitProductRequest(): void {
    const user = this.currentUser;
    if (!user || !this.requestProductName.trim()) {
      return;
    }

    this.storeService.requestProduct({
      productName: this.requestProductName.trim(),
      description: this.requestDescription.trim(),
      customerFirstName: user.firstName,
      customerLastName: user.lastName,
      customerEmail: user.email
    }).subscribe({
      next: () => {
        this.requestingProduct = false;
        this.toastService.success('Demande envoyee, nous vous tiendrons informe.');
      },
      error: (err) => {
        this.toastService.error(err?.error?.error ?? 'Une erreur est survenue.');
      }
    });
  }

  get totalForConfirmation(): number {
    return this.productToConfirm ? this.productToConfirm.price * this.quantity : 0;
  }

  confirmOrder(): void {
    const product = this.productToConfirm;
    const user = this.currentUser;
    if (!product || !user) {
      return;
    }

    this.storeService.placeOrder({
      productId: product.id,
      quantity: this.quantity,
      customerFirstName: user.firstName,
      customerLastName: user.lastName,
      customerEmail: user.email
    }).subscribe({
      next: (order) => {
        const index = this.products.findIndex(p => p.id === order.product.id);
        if (index !== -1) {
          this.products[index] = order.product;
        }
        this.productToConfirm = null;
        this.toastService.success(`Commande confirmee : ${order.product.name}`);
      },
      error: (err) => {
        this.toastService.error(err?.error?.error ?? 'Une erreur est survenue.');
      }
    });
  }
}
