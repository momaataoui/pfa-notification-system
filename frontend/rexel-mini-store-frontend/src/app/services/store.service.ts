import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { OrderRequest, OrderResponse } from '../models/order.model';
import { ProductRequestCreate, ProductRequestResponse } from '../models/product-request.model';

@Injectable({ providedIn: 'root' })
export class StoreService {

  private readonly apiUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products`);
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  placeOrder(order: OrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.apiUrl}/orders`, order);
  }

  getMyOrders(email: string): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(`${this.apiUrl}/orders/my`, { params: { email } });
  }

  cancelOrder(orderId: number): Observable<OrderResponse> {
    return this.http.patch<OrderResponse>(`${this.apiUrl}/orders/${orderId}/cancel`, {});
  }

  requestProduct(request: ProductRequestCreate): Observable<ProductRequestResponse> {
    return this.http.post<ProductRequestResponse>(`${this.apiUrl}/product-requests`, request);
  }
}
