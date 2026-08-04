export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
}

export interface AdminStats {
  productCount: number;
  orderCount: number;
  customerCount: number;
  deliveredCount: number;
  pendingCount: number;
  cancelledCount: number;
  totalRevenue: number;
  unreadOrderCount: number;
}
