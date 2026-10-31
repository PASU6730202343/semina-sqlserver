'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, TrashIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { fetchMyOrders, cancelOrder, Order } from '@/lib/orders';
import { formatCurrency } from '@/lib/products';
import { TopBar } from '@/components/TopBar';

const STATUS_LABEL: Record<Order['status'], string> = {
  pending: 'รอผู้ขายยืนยัน',
  confirmed: 'ยืนยันแล้ว',
  shipped: 'จัดส่งแล้ว',
  cancelled: 'ยกเลิกแล้ว',
};

const STATUS_CLASS: Record<Order['status'], string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-150',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-150',
  shipped: 'bg-emerald-50 text-emerald-700 border-emerald-150',
  cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
};

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchMyOrders();
      setOrders(data);
    } catch (err) {
      setToast({ type: 'error', message: 'โหลดรายการสั่งซื้อไม่สำเร็จ กรุณาลองใหม่' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleCancel = async (order: Order) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำสั่งซื้อนี้?')) return;
    try {
      await cancelOrder(order.id);
      setToast({ type: 'success', message: 'ยกเลิกคำสั่งซื้อเรียบร้อยแล้ว' });
      await loadOrders();
    } catch (err: any) {
      setToast({ type: 'error', message: err?.response?.data?.detail || 'ยกเลิกคำสั่งซื้อไม่สำเร็จ' });
    } finally {
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/" className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Dashboard ผู้ซื้อ</p>
            <h1 className="text-2xl font-extrabold text-slate-800">รายการสั่งซื้อของฉัน</h1>
          </div>
        </div>

        {toast && (
          <div className={`rounded-2xl px-4 py-3 text-sm font-semibold border ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' : 'bg-rose-50 text-rose-700 border-rose-150'}`}>
            {toast.message}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <ShoppingBagIcon className="h-5 w-5 text-emerald-600" />
              คำสั่งซื้อทั้งหมด
            </h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
              {orders.length} รายการ
            </span>
          </div>

          <div className="p-0">
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm">กำลังโหลดรายการสั่งซื้อ...</div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <ShoppingBagIcon className="h-12 w-12 mx-auto mb-3 text-slate-200" />
                <p>ยังไม่มีรายการสั่งซื้อ</p>
                <Link href="/" className="text-emerald-600 font-bold hover:underline mt-2 inline-block">เลือกดูสินค้า</Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <div key={order.id} className="p-6 flex flex-col sm:flex-row gap-6 items-center hover:bg-slate-50/50 transition">
                    <div className="w-24 h-24 rounded-2xl bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200">
                      {order.productImageUrl ? (
                        <img src={order.productImageUrl} alt={order.productTitle} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">No Image</div>
                      )}
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                      <p className="text-xs font-bold text-slate-400 mb-1">รหัสสั่งซื้อ: #{order.id}</p>
                      <h3 className="font-bold text-slate-800 text-lg mb-1">{order.productTitle}</h3>
                      <p className="text-sm text-slate-500 font-medium mb-2">
                        ราคา: {formatCurrency(order.unitPrice)} &times; {order.quantity}
                      </p>
                      <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_CLASS[order.status]}`}>
                        {STATUS_LABEL[order.status]}
                      </span>
                    </div>

                    <div className="text-center sm:text-right">
                      <p className="text-xs font-bold text-slate-400 mb-1">ยอดรวม</p>
                      <p className="text-xl font-black text-emerald-600 mb-3">{formatCurrency(order.totalAmount)}</p>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleCancel(order)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold px-3 py-2 rounded-lg transition inline-flex items-center gap-1 border border-rose-150"
                        >
                          <TrashIcon className="h-4 w-4" /> ยกเลิก
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
