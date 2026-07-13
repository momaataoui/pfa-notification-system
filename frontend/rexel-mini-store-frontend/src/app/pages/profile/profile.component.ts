import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required]
  });

  saving = false;

  ngOnInit(): void {
    const user = this.authService.currentUser;
    if (user) {
      this.form.setValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone
      });
    }
  }

  submit(): void {
    const user = this.authService.currentUser;
    if (!user || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.authService.updateProfile(user.id, this.form.getRawValue() as {
      firstName: string; lastName: string; email: string; phone: string;
    }).subscribe({
      next: () => {
        this.saving = false;
        this.toastService.success('Profil mis a jour.');
      },
      error: (err) => {
        this.saving = false;
        this.toastService.error(err?.error?.error ?? 'Une erreur est survenue.');
      }
    });
  }
}
