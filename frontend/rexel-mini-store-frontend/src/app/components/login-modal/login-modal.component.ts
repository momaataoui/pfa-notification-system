import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-modal.component.html'
})
export class LoginModalComponent {

  @Output() close = new EventEmitter<void>();

  email = '';
  password = '';
  errorMessage: string | null = null;

  constructor(private authService: AuthService) {}

  submit(): void {
    this.errorMessage = null;

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.close.emit(),
      error: (err) => {
        this.errorMessage = err?.error?.error ?? 'Une erreur est survenue.';
      }
    });
  }
}
