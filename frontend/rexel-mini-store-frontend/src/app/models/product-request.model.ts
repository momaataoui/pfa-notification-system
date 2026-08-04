export type ProductRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ProductRequestCreate {
  productName: string;
  description: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
}

export interface ProductRequestResponse {
  id: number;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  productName: string;
  description: string;
  status: ProductRequestStatus;
  createdAt: string;
}
