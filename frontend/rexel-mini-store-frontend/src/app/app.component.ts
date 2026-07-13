import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LoginModalComponent } from './components/login-modal/login-modal.component';
import { ToastComponent } from './components/toast/toast.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, LoginModalComponent, ToastComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {

  showLoginModal = false;

  constructor(
    private authService: AuthService,
    private themeService: ThemeService
  ) {
    this.authService.loginModalRequested$.subscribe(() => this.showLoginModal = true);
  }
}
