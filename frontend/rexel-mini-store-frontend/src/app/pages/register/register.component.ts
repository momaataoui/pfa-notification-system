import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  submitting = false;
  errorMessage: string | null = null;

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = null;

    this.authService.register(this.form.getRawValue() as {
      firstName: string; lastName: string; email: string; phone: string; password: string;
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.toastService.success('Compte cree avec succes. Vous pouvez vous connecter.');
        this.router.navigateByUrl('/');
        this.authService.requestLogin();
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err?.error?.error ?? 'Une erreur est survenue.';
      }
    });
  }
}
