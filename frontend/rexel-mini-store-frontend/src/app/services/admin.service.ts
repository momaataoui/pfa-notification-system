import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product, ProductRequest } from '../models/product.model';
import { OrderResponse, OrderStatus } from '../models/order.model';
import { AdminStats, Customer } from '../models/admin.model';
import { ProductRequestResponse, ProductRequestStatus } from '../models/product-request.model';

@Injectable({ providedIn: 'root' })
export class AdminService {

  private readonly apiUrl = 'http://localhost:8081/api/admin';

  constructor(private http: HttpClient) {}

  createProduct(request: ProductRequest): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products`, request);
  }

  updateProduct(id: number, request: ProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/products/${id}`, request);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}`);
  }

  getAllOrders(status?: OrderStatus | ''): Observable<OrderResponse[]> {
    return status
      ? this.http.get<OrderResponse[]>(`${this.apiUrl}/orders`, { params: { status } })
      : this.http.get<OrderResponse[]>(`${this.apiUrl}/orders`);
  }

  updateOrderStatus(id: number, status: OrderStatus): Observable<OrderResponse> {
    return this.http.patch<OrderResponse>(`${this.apiUrl}/orders/${id}/status`, { status });
  }

  markOrderAsRead(id: number): Observable<OrderResponse> {
    return this.http.patch<OrderResponse>(`${this.apiUrl}/orders/${id}/read`, {});
  }

  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}/customers`);
  }

  updateCustomerPhone(id: string, phone: string): Observable<Customer> {
    return this.http.patch<Customer>(`${this.apiUrl}/customers/${id}/phone`, { phone });
  }

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/stats`);
  }

  getProductRequests(status?: ProductRequestStatus | ''): Observable<ProductRequestResponse[]> {
    return status
      ? this.http.get<ProductRequestResponse[]>(`${this.apiUrl}/product-requests`, { params: { status } })
      : this.http.get<ProductRequestResponse[]>(`${this.apiUrl}/product-requests`);
  }

  approveProductRequest(id: number): Observable<ProductRequestResponse> {
    return this.http.patch<ProductRequestResponse>(`${this.apiUrl}/product-requests/${id}/approve`, {});
  }

  rejectProductRequest(id: number): Observable<ProductRequestResponse> {
    return this.http.patch<ProductRequestResponse>(`${this.apiUrl}/product-requests/${id}/reject`, {});
  }
}
