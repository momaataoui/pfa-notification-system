import { Product } from './product.model';

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderRequest {
  productId: number;
  quantity: number;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
}

export interface OrderResponse {
  id: number;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  product: Product;
  quantity: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}
