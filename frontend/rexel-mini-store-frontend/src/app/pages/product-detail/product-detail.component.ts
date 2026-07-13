import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Product } from '../../models/product.model';
import { StoreUser } from '../../models/store-user.model';
import { StoreService } from '../../services/store.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { getProductIcon } from '../../utils/product-icon';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SpinnerComponent],
  templateUrl: './product-detail.component.html'
})
export class ProductDetailComponent implements OnInit {

  product: Product | null = null;
  relatedProducts: Product[] = [];
  loading = true;
  currentUser: StoreUser | null = null;
  quantity = 1;
  showConfirm = false;

  readonly getProductIcon = getProductIcon;

  constructor(
    private route: ActivatedRoute,
    private storeService: StoreService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => this.currentUser = user);

    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.loadProduct(id);
      }
    });
  }

  loadProduct(id: number): void {
    this.loading = true;
    this.quantity = 1;
    this.storeService.getProduct(id).subscribe({
      next: (product) => {
        this.product = product;
        this.loading = false;
        this.loadRelated(product);
      },
      error: () => this.loading = false
    });
  }

  loadRelated(product: Product): void {
    this.storeService.getProducts().subscribe(products => {
      this.relatedProducts = products
        .filter(p => p.id !== product.id && p.category === product.category)
        .slice(0, 3);
    });
  }

  imageFor(product: Product): string {
    return product.imageUrl || this.getProductIcon(product.name);
  }

  onImageError(event: Event, product: Product): void {
    (event.target as HTMLImageElement).src = this.getProductIcon(product.name);
  }

  get hasSpecs(): boolean {
    const p = this.product;
    return !!(p && (p.voltage || p.amperage || p.productType || p.certifications));
  }

  incrementQuantity(): void {
    if (this.product && this.quantity < this.product.stockQuantity) {
      this.quantity++;
    }
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  onAddToCart(): void {
    if (!this.currentUser) {
      this.authService.requestLogin();
      return;
    }
    this.showConfirm = true;
  }

  closeConfirm(): void {
    this.showConfirm = false;
  }

  get total(): number {
    return this.product ? this.product.price * this.quantity : 0;
  }

  confirmOrder(): void {
    const product = this.product;
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
        this.product = order.product;
        this.showConfirm = false;
        this.toastService.success(`Commande confirmee : ${order.product.name}`);
      },
      error: (err) => {
        this.toastService.error(err?.error?.error ?? 'Une erreur est survenue.');
      }
    });
  }
}
