import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StoreUser } from '../../models/store-user.model';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {

  currentUser: StoreUser | null = null;
  searchTerm = '';
  menuOpen = false;

  constructor(
    protected authService: AuthService,
    protected themeService: ThemeService,
    private router: Router
  ) {
    this.authService.currentUser$.subscribe(user => this.currentUser = user);
  }

  get initials(): string {
    if (!this.currentUser) {
      return '';
    }
    return (this.currentUser.firstName[0] ?? '') + (this.currentUser.lastName[0] ?? '');
  }

  onSearchSubmit(): void {
    this.router.navigate(['/products'], { queryParams: { q: this.searchTerm || null } });
  }

  onProfileIconClick(): void {
    if (this.currentUser) {
      this.menuOpen = !this.menuOpen;
    } else {
      this.authService.requestLogin();
    }
  }

  logout(): void {
    this.menuOpen = false;
    this.authService.logout();
  }
}
