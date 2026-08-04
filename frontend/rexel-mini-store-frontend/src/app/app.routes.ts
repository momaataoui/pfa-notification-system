import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProductsComponent } from './pages/products/products.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { MyOrdersComponent } from './pages/my-orders/my-orders.component';
import { AdminLayoutComponent } from './pages/admin/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard/admin-dashboard.component';
import { AdminProductsComponent } from './pages/admin/admin-products/admin-products.component';
import { AdminOrdersComponent } from './pages/admin/admin-orders/admin-orders.component';
import { AdminCustomersComponent } from './pages/admin/admin-customers/admin-customers.component';
import { AdminProductRequestsComponent } from './pages/admin/admin-product-requests/admin-product-requests.component';
import { AdminNotificationsComponent } from './pages/admin/admin-notifications/admin-notifications.component';
import { AdminNotificationHistoryComponent } from './pages/admin/admin-notification-history/admin-notification-history.component';
import { AdminNotificationStatsComponent } from './pages/admin/admin-notification-stats/admin-notification-stats.component';
import { AdminNotificationFailuresComponent } from './pages/admin/admin-notification-failures/admin-notification-failures.component';
import { AdminNotificationSettingsComponent } from './pages/admin/admin-notification-settings/admin-notification-settings.component';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { notAdminGuard } from './guards/not-admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [notAdminGuard] },
  { path: 'products', component: ProductsComponent, canActivate: [notAdminGuard] },
  { path: 'products/:id', component: ProductDetailComponent, canActivate: [notAdminGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'my-orders', component: MyOrdersComponent, canActivate: [authGuard, notAdminGuard] },
  { path: 'admin/login', component: AdminLoginComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'products', component: AdminProductsComponent },
      { path: 'orders', component: AdminOrdersComponent },
      { path: 'customers', component: AdminCustomersComponent },
      { path: 'product-requests', component: AdminProductRequestsComponent },
      { path: 'notifications', component: AdminNotificationsComponent },
      { path: 'notifications/history', component: AdminNotificationHistoryComponent },
      { path: 'notifications/stats', component: AdminNotificationStatsComponent },
      { path: 'notifications/failures', component: AdminNotificationFailuresComponent },
      { path: 'notifications/settings', component: AdminNotificationSettingsComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
