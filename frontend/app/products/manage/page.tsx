'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, PencilSquareIcon, TrashIcon, PlusIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { getStoredProducts, deleteStoredProduct, Product, formatCurrency } from '@/lib/products';
import { api } from '@/lib/api';

export default function ProductManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [role, setRole] = useState('');
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem('agrimatch_role') || '');
    const storedId = localStorage.getItem('agrimatch_user_id');
    setUserId(storedId ? Number(storedId) : null);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products/');
        if (res.status === 200 && res.data?.success && Array.isArray(res.data.data)) {
          const mapped: Product[] = res.data.data.map((p: any) => ({
            id: p.id,
            title: p.title,
            description: p.description || '',
            price: Number(p.price),
            stock: p.stock !== undefined ? p.stock : (p.quantity ?? 0),
            riceStandard: p.rice_standard || p.riceStandard || 'general',
            imageUrl: p.image_url || p.thumbnail || p.imageUrl,
            ownerId: p.owner_id ?? null,
          }));
          if (mapped.length > 0) {
            const stored = getStoredProducts();
            const remoteIds = mapped.map((p) => p.id);
            const userAdded = stored.filter((p) => !remoteIds.includes(p.id));
            setProducts([...userAdded, ...mapped]);
            return;
          }
        }
      } catch (error) {
        console.warn('Backend connection failed, falling back to local cache');
      }

      setProducts(getStoredProducts());
    };
    fetchProducts();
  }, []);

  const visibleProducts = useMemo(() => {
    if (role === 'seller') {
      return products.filter((item) => item.ownerId === userId);
    }
    return products;
  }, [products, role, userId]);

  const canEdit = (product: Product) => role === 'admin' || (role === 'seller' && product.ownerId === userId);
  const canDelete = (product: Product) => role === 'admin' || (role === 'seller' && product.ownerId === userId);

  const totalValue = useMemo(() => visibleProducts.reduce((sum, item) => sum + item.price * item.stock, 0), [visibleProducts]);

  const requestDelete = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;

    try {
      await api.delete(`/products/${selectedProduct.id}`);
      deleteStoredProduct(selectedProduct.id);
      setProducts((current) => current.filter((item) => item.id !== selectedProduct.id));

      setToast({ type: 'success', message: 'ลบสินค้าสำเร็จเรียบร้อยแล้ว' });
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      setToast({ type: 'error', message: err?.response?.data?.detail || 'ลบสินค้าไม่สำเร็จ กรุณาลองใหม่' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setShowDeleteModal(false);
      setSelectedProduct(null);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Dashboard เกษตรกร</p>
              <h1 className="text-xl font-extrabold text-slate-800">รายการสินค้าและการจัดการ</h1>
            </div>
          </div>
          <Link href="/ai-grading" className="btn-primary shadow-md">
            <PlusIcon className="h-4 w-4" /> เพิ่มสินค้าใหม่
          </Link>
        </div>

        {toast && (
          <div className={`rounded-2xl px-4 py-3 text-xs font-semibold border ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' : 'bg-rose-50 text-rose-700 border-rose-150'}`}>
            {toast.message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="card p-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">รายการสินค้าของคุณ</p>
                <p className="text-sm text-slate-500 mt-0.5">จัดการข้อมูลและอัปเดตสต็อกข้าวได้ทันที</p>
              </div>
              <div className="rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                {visibleProducts.length} รายการ
              </div>
            </div>

            {/* Mobile card list */}
            <div className="mt-5 space-y-3 md:hidden">
              {visibleProducts.map((product) => (
                <div key={product.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-800">{product.title}</p>
                      <span className="mt-1.5 inline-block text-xs font-medium text-slate-500 bg-slate-50 border border-slate-100 rounded-md px-1.5 py-0.5">{product.riceStandard}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-emerald-600">{formatCurrency(product.price)}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{product.stock.toLocaleString('th-TH')} กก.</p>
                    </div>
                  </div>
                  {(canEdit(product) || canDelete(product)) && (
                    <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                      {canEdit(product) && (
                        <Link href={`/products/edit/${product.id}`} className="flex-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition inline-flex items-center justify-center gap-1">
                          <PencilSquareIcon className="h-3.5 w-3.5" /> แก้ไข
                        </Link>
                      )}
                      {canDelete(product) && (
                        <button className="flex-1 rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition inline-flex items-center justify-center gap-1 border border-rose-150" onClick={() => requestDelete(product)}>
                          <TrashIcon className="h-3.5 w-3.5" /> ลบ
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {visibleProducts.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
                  ยังไม่มีสินค้าในระบบ เริ่มต้นโดยการเพิ่มสินค้าใหม่
                </div>
              )}
            </div>

            {/* Desktop table */}
            <div className="mt-5 hidden overflow-hidden rounded-2xl border border-slate-200 shadow-sm md:block">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 bg-white text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">สินค้า</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">ราคา</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">สต็อก</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">ดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {visibleProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-4 py-4">
                          <div className="font-bold text-slate-800">{product.title}</div>
                          <div className="text-xs text-slate-500 font-medium bg-slate-50 border border-slate-100 rounded-md inline-block px-1.5 py-0.5 mt-1.5">{product.riceStandard}</div>
                        </td>
                        <td className="px-4 py-4 font-semibold text-slate-700">{formatCurrency(product.price)}</td>
                        <td className="px-4 py-4 font-semibold text-slate-700">{product.stock.toLocaleString('th-TH')} กก.</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            {canEdit(product) && (
                              <Link href={`/products/edit/${product.id}`} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition inline-flex items-center gap-1">
                                <PencilSquareIcon className="h-3.5 w-3.5" /> แก้ไข
                              </Link>
                            )}
                            {canDelete(product) && (
                              <button className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition inline-flex items-center gap-1 border border-rose-150" onClick={() => requestDelete(product)}>
                                <TrashIcon className="h-3.5 w-3.5" /> ลบ
                              </button>
                            )}
                            {!canEdit(product) && !canDelete(product) && (
                              <span className="text-xs text-slate-400">ไม่มีสิทธิ์แก้ไข</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {visibleProducts.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                          ยังไม่มีสินค้าในระบบ เริ่มต้นโดยการเพิ่มสินค้าใหม่
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card p-6 h-fit">
            <div className="flex items-center gap-2 text-emerald-700 border-b border-slate-100 pb-4 mb-4">
              <ShieldCheckIcon className="h-5 w-5" />
              <h2 className="font-bold text-slate-800">สรุปภาพรวมบัญชี</h2>
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 shadow-inner">
                <p className="text-xs text-slate-500 font-medium">มูลค่าข้าวในคลังรวม</p>
                <p className="text-2xl font-extrabold text-emerald-600 mt-1">{formatCurrency(totalValue)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 shadow-inner">
                <p className="text-xs text-slate-500 font-medium">จำนวนสินค้าที่มีสินค้าพร้อมส่ง</p>
                <p className="text-xl font-bold text-slate-800 mt-1">{visibleProducts.filter((item) => item.stock > 0).length} รายการ</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-fade-in-up border border-slate-100">
            <h3 className="text-base font-bold text-slate-800">ยืนยันการลบสินค้า</h3>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              คุณแน่ใจหรือไม่ว่าต้องการลบสินค้าพันธุ์ข้าว <span className="font-bold text-slate-800">"{selectedProduct.title}"</span> ออกจากระบบ AgriMatch AI?
              การทำรายการนี้จะไม่สามารถกู้คืนข้อมูลกลับมาได้
            </p>
            <div className="mt-6 flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => { setShowDeleteModal(false); setSelectedProduct(null); }}>ยกเลิก</button>
              <button className="flex-1 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-700 transition shadow-md" onClick={confirmDelete}>ยืนยันลบ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
