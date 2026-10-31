'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon, PhotoIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { getStoredProducts, updateStoredProduct, Product } from '@/lib/products';
import { api } from '@/lib/api';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const [product, setProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ title: '', description: '', price: '', stock: '', riceStandard: 'general' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        if (res.status === 200 && res.data?.success && res.data.data) {
          const p = res.data.data;
          const mappedProduct: Product = {
            id: p.id,
            title: p.title,
            description: p.description || '',
            price: Number(p.price),
            stock: p.stock !== undefined ? p.stock : (p.quantity ?? 0),
            riceStandard: p.rice_standard || p.riceStandard || 'general',
            imageUrl: p.image_url || p.thumbnail || p.imageUrl,
          };
          setProduct(mappedProduct);
          setForm({
            title: mappedProduct.title,
            description: mappedProduct.description,
            price: String(mappedProduct.price),
            stock: String(mappedProduct.stock),
            riceStandard: mappedProduct.riceStandard,
          });
          setImagePreview(mappedProduct.imageUrl || null);
          return;
        }
      } catch (error) {
        console.warn('Could not load product from server, falling back to local storage cache.');
      }
      
      const current = getStoredProducts().find((item) => item.id === id);
      if (current) {
        setProduct(current);
        setForm({
          title: current.title,
          description: current.description,
          price: String(current.price),
          stock: String(current.stock),
          riceStandard: current.riceStandard,
        });
        setImagePreview(current.imageUrl ?? null);
      } else {
        setMessage({ type: 'error', text: 'ไม่พบสินค้าชิ้นนี้ในระบบ' });
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title || !form.price || !form.stock) {
      setMessage({ type: 'error', text: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' });
      return;
    }
    setLoading(true);
    setMessage(null);

    const priceNum = Number(form.price);
    const stockNum = Number(form.stock);

    try {
      await api.put(`/products/${id}`, {
        title: form.title,
        description: form.description,
        price: priceNum,
        stock: stockNum,
        rice_standard: form.riceStandard,
        image_url: imagePreview || undefined,
      });

      updateStoredProduct({
        id,
        title: form.title,
        description: form.description,
        price: priceNum,
        stock: stockNum,
        riceStandard: form.riceStandard,
        imageUrl: imagePreview || undefined,
      });

      setMessage({ type: 'success', text: 'อัปเดตข้อมูลสินค้าสำเร็จแล้ว!' });

      setTimeout(() => {
        router.push('/products/manage');
      }, 1500);
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err?.response?.data?.detail || 'อัปเดตสินค้าไม่สำเร็จ กรุณาลองใหม่',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!product && !message) {
    return <div className="p-8 text-center text-sm text-slate-500">กำลังโหลดข้อมูลสินค้า...</div>;
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/products/manage" className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">หน้าจัดการสินค้า</p>
            <h1 className="text-xl font-extrabold text-slate-800">แก้ไขข้อมูลสินค้า</h1>
          </div>
        </div>

        {message && message.type === 'error' && (
          <div className="mb-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {message.text}
          </div>
        )}

        {product && (
          <form onSubmit={handleSubmit} className="card overflow-hidden">
            <div className="grid gap-8 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-slate-700">ชื่อสายพันธุ์ข้าว</label>
                  <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm bg-slate-50/50" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">รายละเอียดสินค้า</label>
                  <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={5} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm bg-slate-50/50 resize-none" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">มาตรฐานข้าว</label>
                  <select value={form.riceStandard} onChange={(event) => setForm({ ...form, riceStandard: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm bg-slate-50/50">
                    <option value="general">ทั่วไป (ไม่มีมาตรฐาน)</option>
                    <option value="GI">GI (สิ่งบ่งชี้ทางภูมิศาสตร์)</option>
                    <option value="Organic">Organic (เกษตรอินทรีย์)</option>
                    <option value="GAP">GAP</option>
                  </select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">ราคาต่อกิโลกรัม</label>
                    <input type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm bg-slate-50/50" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">จำนวนสต็อก (กิโลกรัม)</label>
                    <input type="number" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm bg-slate-50/50" />
                  </div>
                </div>
              </div>

              <div className="space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-slate-500">รูปภาพสินค้าปัจจุบัน</p>
                    {imagePreview ? (
                      <img src={imagePreview} alt={product.title} className="mt-4 h-48 w-full rounded-2xl object-cover" />
                    ) : (
                      <div className="mt-4 flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white">
                        <PhotoIcon className="h-12 w-12 text-slate-300" />
                      </div>
                    )}
                  </div>
                  
                  <input id="edit-product-image" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  <label htmlFor="edit-product-image" className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm">
                    <ArrowUpTrayIcon className="h-4 w-4 text-slate-500" />
                    อัปโหลดรูปภาพใหม่
                  </label>
                </div>

                <div className="space-y-3">
                  {message && message.type === 'success' && (
                    <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700 border border-emerald-150 leading-relaxed">
                      {message.text}
                    </div>
                  )}
                  
                  <button type="submit" className="btn-primary w-full shadow-lg" disabled={loading}>
                    {loading ? 'กำลังบันทึกการแก้ไข...' : 'ยืนยันการแก้ไขสินค้า'}
                  </button>
                  <Link href="/products/manage" className="btn-secondary w-full justify-center">
                    ยกเลิก
                  </Link>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
