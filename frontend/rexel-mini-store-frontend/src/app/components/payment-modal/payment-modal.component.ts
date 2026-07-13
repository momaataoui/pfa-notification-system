import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrderResponse } from '../../models/order.model';
import { StoreService } from '../../services/store.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment-modal.component.html'
})
export class PaymentModalComponent {

  @Input({ required: true }) order!: OrderResponse;
  @Output() paid = new EventEmitter<OrderResponse>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private storeService = inject(StoreService);
  private toastService = inject(ToastService);

  processing = false;

  form = this.fb.group({
    cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
    expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.processing = true;

    // Simulation : aucun vrai traitement de paiement, juste un delai simule
    // avant de marquer la commande comme payee cote backend.
    setTimeout(() => {
      this.storeService.payOrder(this.order.id).subscribe({
        next: (updated) => {
          this.processing = false;
          this.toastService.success('Paiement simule avec succes.');
          this.paid.emit(updated);
        },
        error: (err) => {
          this.processing = false;
          this.toastService.error(err?.error?.error ?? 'Une erreur est survenue.');
        }
      });
    }, 900);
  }
}
