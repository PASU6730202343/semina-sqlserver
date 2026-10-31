'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, ArrowPathIcon, ClipboardDocumentListIcon, TruckIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { fetchSellerOrders, updateOrderStatus, Order } from '@/lib/orders';
import { formatCurrency } from '@/lib/products';
import { TopBar } from '@/components/TopBar';

const STATUS_LABEL: Record<Order['status'], string> = { pending: 'รอยืนยัน', confirmed: 'ยืนยันแล้ว', shipped: 'จัดส่งแล้ว', cancelled: 'ยกเลิกแล้ว' };
const STATUS_CLASS: Record<Order['status'], string> = { pending: 'bg-amber-50 text-amber-700 border-amber-200', confirmed: 'bg-blue-50 text-blue-700 border-blue-200', shipped: 'bg-emerald-50 text-emerald-700 border-emerald-200', cancelled: 'bg-slate-100 text-slate-500 border-slate-200' };

function formatDate(value: string) {
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default function IncomingOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try { setOrders(await fetchSellerOrders()); }
    catch (error: any) { setNotice({ type: 'error', text: error?.response?.data?.detail || 'โหลดรายการคำสั่งซื้อไม่สำเร็จ' }); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadOrders(); }, []);

  const summary = useMemo(() => ({ pending: orders.filter(o => o.status === 'pending').length, total: orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.totalAmount, 0) }), [orders]);

  const changeStatus = async (order: Order, status: Order['status']) => {
    setUpdatingId(order.id); setNotice(null);
    try {
      const updated = await updateOrderStatus(order.id, status);
      setOrders(current => current.map(item => item.id === updated.id ? updated : item));
      setNotice({ type: 'success', text: `อัปเดตคำสั่งซื้อ #${order.id} เป็น “${STATUS_LABEL[status]}” แล้ว` });
    } catch (error: any) { setNotice({ type: 'error', text: error?.response?.data?.detail || 'อัปเดตสถานะไม่สำเร็จ' }); }
    finally { setUpdatingId(null); }
  };

  return <div className="min-h-screen"><TopBar /><main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><Link href="/" className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"><ArrowLeftIcon className="h-5 w-5" /></Link><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Seller dashboard</p><h1 className="text-2xl font-extrabold text-slate-800">คำสั่งซื้อที่เข้ามา</h1><p className="mt-1 text-sm text-slate-500">รายการสินค้าที่ลูกค้าสั่งซื้อจากร้านของคุณ</p></div></div><button onClick={loadOrders} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"><ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> รีเฟรช</button></div>
    <div className="grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border border-amber-100 bg-amber-50 p-5"><p className="text-sm font-medium text-amber-700">รอการยืนยัน</p><p className="mt-1 text-3xl font-black text-amber-800">{summary.pending} <span className="text-base font-bold">รายการ</span></p></div><div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5"><p className="text-sm font-medium text-emerald-700">ยอดรวมคำสั่งซื้อที่ยังไม่ยกเลิก</p><p className="mt-1 text-3xl font-black text-emerald-800">{formatCurrency(summary.total)}</p></div></div>
    {notice && <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${notice.type === 'success' ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-rose-100 bg-rose-50 text-rose-700'}`}>{notice.text}</div>}
    <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm"><div className="border-b border-slate-100 bg-slate-50/60 p-5"><h2 className="flex items-center gap-2 font-bold text-slate-800"><ClipboardDocumentListIcon className="h-5 w-5 text-emerald-600" /> รายการทั้งหมด <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs text-emerald-800">{orders.length}</span></h2></div>
      {loading ? <div className="p-14 text-center text-sm text-slate-400">กำลังโหลดรายการคำสั่งซื้อ...</div> : orders.length === 0 ? <div className="p-14 text-center text-slate-400"><ClipboardDocumentListIcon className="mx-auto mb-3 h-12 w-12 text-slate-200" /><p>ยังไม่มีลูกค้าสั่งซื้อสินค้า</p></div> : <div className="divide-y divide-slate-100">{orders.map(order => <article key={order.id} className="p-5 sm:p-6"><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div className="flex min-w-0 flex-1 gap-4"><div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-xs text-slate-400">{order.productImageUrl ? <img src={order.productImageUrl} alt={order.productTitle} className="h-full w-full object-cover" /> : <ClipboardDocumentListIcon className="h-7 w-7" />}</div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-bold text-slate-800">{order.productTitle}</h3><span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${STATUS_CLASS[order.status]}`}>{STATUS_LABEL[order.status]}</span></div><p className="mt-1 text-xs text-slate-400">คำสั่งซื้อ #{order.id} · {formatDate(order.createdAt)}</p><p className="mt-2 text-sm text-slate-600">จำนวน <b>{order.quantity} กก.</b> × {formatCurrency(order.unitPrice)} = <b className="text-emerald-700">{formatCurrency(order.totalAmount)}</b></p><div className="mt-2 text-sm text-slate-500">ผู้สั่งซื้อ: <span className="font-semibold text-slate-700">{order.buyerFullName || order.buyerUsername || `ผู้ซื้อ #${order.buyerId}`}</span>{order.buyerEmail && <span className="ml-2 text-xs">({order.buyerEmail})</span>}</div>{order.note && <p className="mt-1 text-xs text-slate-400">หมายเหตุ: {order.note}</p>}</div></div><div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">{order.status === 'pending' && <button onClick={() => changeStatus(order, 'confirmed')} disabled={updatingId === order.id} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60"><CheckCircleIcon className="h-4 w-4" /> ยืนยันคำสั่งซื้อ</button>}{order.status === 'confirmed' && <button onClick={() => changeStatus(order, 'shipped')} disabled={updatingId === order.id} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"><TruckIcon className="h-4 w-4" /> จัดส่งแล้ว</button>}{(order.status === 'pending' || order.status === 'confirmed') && <button onClick={() => changeStatus(order, 'cancelled')} disabled={updatingId === order.id} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-60">ยกเลิก</button>}</div></div></article>)}</div>}
    </section>
  </main></div>;
}
