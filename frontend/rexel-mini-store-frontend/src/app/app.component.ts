import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './components/toast/toast.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';
import { PushNotificationService } from './services/push-notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, ToastComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {

  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    private pushNotificationService: PushNotificationService
  ) {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.pushNotificationService.connect();
      } else {
        this.pushNotificationService.disconnect();
      }
    });
  }
}
