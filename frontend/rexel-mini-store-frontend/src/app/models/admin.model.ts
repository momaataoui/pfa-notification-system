export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
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
