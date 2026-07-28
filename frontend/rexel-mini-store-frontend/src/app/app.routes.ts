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
import { AdminNotificationsComponent } from './pages/admin/admin-notifications/admin-notifications.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { notAdminGuard } from './guards/not-admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [notAdminGuard] },
  { path: 'products', component: ProductsComponent, canActivate: [notAdminGuard] },
  { path: 'products/:id', component: ProductDetailComponent, canActivate: [notAdminGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'my-orders', component: MyOrdersComponent, canActivate: [authGuard, notAdminGuard] },
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
      { path: 'notifications', component: AdminNotificationsComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
