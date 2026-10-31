import { api } from './api';

export interface Order {
  id: number;
  productId: number;
  productTitle: string;
  productImageUrl?: string;
  buyerId: number;
  buyerUsername?: string;
  buyerEmail?: string;
  buyerFullName?: string;
  sellerId: number | null;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'cancelled';
  note?: string;
  createdAt: string;
}

function mapOrder(o: any): Order {
  return {
    id: o.id,
    productId: o.product_id,
    productTitle: o.product_title,
    productImageUrl: o.product_image_url,
    buyerId: o.buyer_id,
    buyerUsername: o.buyer_username,
    buyerEmail: o.buyer_email,
    buyerFullName: o.buyer_full_name,
    sellerId: o.seller_id,
    quantity: Number(o.quantity),
    unitPrice: Number(o.unit_price),
    totalAmount: Number(o.total_amount),
    status: o.status,
    note: o.note,
    createdAt: o.created_at,
  };
}

/** ผู้ซื้อ: ดูคำสั่งซื้อของตัวเอง */
export async function fetchMyOrders(): Promise<Order[]> {
  const res = await api.get('/orders/my');
  return (res.data?.data || []).map(mapOrder);
}

/** ผู้ขาย/แอดมิน: ดูคำสั่งซื้อที่เข้ามา (ผู้ขายเห็นเฉพาะของตัวเอง, แอดมินเห็นทั้งหมด) */
export async function fetchSellerOrders(): Promise<Order[]> {
  const res = await api.get('/orders/');
  return (res.data?.data || []).map(mapOrder);
}

/** ผู้ซื้อ: สร้างคำสั่งซื้อใหม่ */
export async function createOrder(productId: number, quantity: number, note?: string): Promise<Order> {
  const res = await api.post('/orders/', { product_id: productId, quantity, note });
  return mapOrder(res.data.data);
}

export async function updateOrderStatus(
  orderId: number,
  status: Order['status']
): Promise<Order> {
  const res = await api.put(`/orders/${orderId}`, { status });
  return mapOrder(res.data.data);
}

/** ผู้ซื้อยกเลิกคำสั่งซื้อของตัวเอง (ได้เฉพาะตอนยังเป็น pending) */
export async function cancelOrder(orderId: number): Promise<Order> {
  return updateOrderStatus(orderId, 'cancelled');
}
