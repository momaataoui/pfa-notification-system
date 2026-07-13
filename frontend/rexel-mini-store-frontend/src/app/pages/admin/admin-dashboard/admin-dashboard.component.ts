import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminStats } from '../../../models/admin.model';
import { AdminService } from '../../../services/admin.service';
import { SpinnerComponent } from '../../../components/spinner/spinner.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {

  stats: AdminStats | null = null;
  loading = true;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}
