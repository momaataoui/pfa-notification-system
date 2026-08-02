import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LogoMarkComponent } from '../../components/logo-mark/logo-mark.component';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LogoMarkComponent],
  templateUrl: './admin-login.component.html'
})
export class AdminLoginComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly keycloakResetPasswordUrl =
    `${this.authService.keycloak.authServerUrl}/realms/${this.authService.keycloak.realm}/login-actions/reset-credentials?client_id=rexel-app`;

  showPassword = false;
  submitting = false;
  errorMessage: string | null = null;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    rememberMe: [false]
  });

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage = null;
    this.submitting = true;

    const { email, password } = this.form.getRawValue();

    this.authService.loginWithPassword(email!, password!).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        console.error('Echec de connexion admin :', err);
        this.submitting = false;
        this.errorMessage = 'Email ou mot de passe incorrect.';
      }
    });
  }
}
