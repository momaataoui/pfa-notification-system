export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice: number | null;
  stockQuantity: number;
  imageUrl: string | null;
  category: string | null;
  rating: number | null;
  reviewCount: number | null;
  voltage: string | null;
  amperage: string | null;
  productType: string | null;
  certifications: string | null;
}

export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  originalPrice: number | null;
  stockQuantity: number;
  imageUrl: string | null;
  category: string | null;
}
