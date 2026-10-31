'use client';

import { useEffect, useMemo, useState } from 'react';
import { MagnifyingGlassIcon, SparklesIcon, TrashIcon, UserIcon, ShoppingCartIcon, CameraIcon, TagIcon, TruckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { TopBar } from '@/components/TopBar';
import { ProductCard } from '@/components/ProductCard';
import { getStoredProducts, saveStoredProducts, Product } from '@/lib/products';
import { getStats } from '@/lib/stats';
import { api } from '@/lib/api';

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ ordersCount: 3, membersCount: 7 });

  useEffect(() => {
    setStats(getStats());
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products/');
        if (res.status === 200 && res.data) {
          const data = res.data;
          if (data.success && data.data) {
            const mapped: Product[] = data.data.map((p: any) => ({
              id: p.id,
              title: p.title,
              description: p.description || '',
              price: Number(p.price),
              stock: p.stock !== undefined ? p.stock : (p.quantity ?? 0),
              riceStandard: p.rice_standard || p.riceStandard || 'general',
              imageUrl: p.image_url || p.thumbnail || p.imageUrl || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=80',
              sellerName: p.seller_name || p.sellerName,
              ownerId: p.owner_id ?? null,
            }));
            
            if (mapped.length > 0) {
              const stored = getStoredProducts();
              const remoteIds = mapped.map((p) => p.id);
              const userAdded = stored.filter((p) => !remoteIds.includes(p.id));
              const combined = [...userAdded, ...mapped];
              setProducts(combined);
              return;
            }
          }
        }
      } catch (error) {
        console.warn('API connection failed. Falling back to local storage cache.');
      }
      setProducts(getStoredProducts());
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return products.filter((product) => {
      return (
        (product.title || '').toLowerCase().includes(term) ||
        (product.description || '').toLowerCase().includes(term) ||
        (product.riceStandard || '').toLowerCase().includes(term)
      );
    });
  }, [products, searchTerm]);

  return (
    <div className="app-bg min-h-screen pb-24 md:pb-0">
      <TopBar />
      <main>
        {/* Bold green hero with rice-field backdrop */}
        <section className="hero-rice-bg mobile-home-hero relative overflow-hidden px-4 pb-8 pt-10 text-center text-white sm:pt-16 sm:pb-24">
          <div className="mx-auto max-w-4xl px-4 relative z-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/50 px-4 py-1.5 text-xs font-bold text-slate-700 shadow-sm backdrop-blur-sm sm:mb-8">
              <SparklesIcon className="h-4 w-4" /> แพลตฟอร์มวิเคราะห์เกรดข้าวด้วย AI
            </div>
            <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 drop-shadow-sm sm:mb-6 sm:text-5xl lg:text-6xl">
              ยกระดับตลาดข้าวไทย<br className="hidden sm:block"/>ด้วยเทคโนโลยีปัญญาประดิษฐ์
            </h1>
            <p className="mx-auto mb-6 max-w-xl text-sm leading-relaxed text-slate-600 sm:mb-10 sm:text-base">
              เชื่อมต่อเกษตรกรผู้ปลูกและผู้รับซื้อโดยตรง โปร่งใสและยุติธรรมด้วยระบบ AI ประเมินคุณภาพข้าวสารก่อนตกลงราคา
            </p>

            <div className="mx-auto max-w-2xl relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-[1.35rem] border border-white/70 bg-white/90 py-3.5 pl-12 pr-5 text-sm text-slate-700 shadow-xl outline-none transition placeholder:text-slate-400 focus:border-agri-green focus:ring-2 focus:ring-agri-green/30 sm:py-4 sm:pl-14 sm:pr-6"
                placeholder="ค้นหาพันธุ์ข้าว, มาตรฐาน หรือชื่อเกษตรกร..."
              />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          
          {/* Horizontal Stats Bar */}
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100 mb-12 relative -mt-8 mx-auto max-w-5xl z-10">
            <div className="flex-1 flex flex-col items-center justify-center py-2 md:py-0">
              <p className="text-4xl font-black text-emerald-600">{products.length || 8}</p>
              <p className="text-xs font-medium text-slate-500 tracking-wide mt-2">รายการสินค้า</p>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center py-2 md:py-0">
              <p className="text-4xl font-black text-emerald-600">{stats.ordersCount}</p>
              <p className="text-xs font-medium text-slate-500 tracking-wide mt-2">คำสั่งซื้อสำเร็จ</p>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center py-2 md:py-0">
              <p className="text-4xl font-black text-emerald-600">{stats.membersCount}</p>
              <p className="text-xs font-medium text-slate-500 tracking-wide mt-2">สมาชิกในระบบ</p>
            </div>
          </div>

          {/* Minimal Promotion Banner */}
          <div className="bg-emerald-50/50 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between border border-emerald-100 mb-12 text-slate-700 relative overflow-hidden">
            <div className="flex items-center gap-4 mb-4 md:mb-0 relative z-10">
              <div className="bg-white p-3 rounded-full border border-emerald-100 shadow-sm text-emerald-500">
                <SparklesIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-800">สิทธิพิเศษสำหรับสมาชิกใหม่</h3>
                <p className="text-xs text-slate-500 mt-1">สมัครสมาชิกวันนี้ รับเครดิตตรวจสอบคุณภาพข้าวด้วย AI ฟรี 100 ครั้ง/เดือน</p>
              </div>
            </div>
            <button className="bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-50 text-xs font-bold px-6 py-2.5 rounded-xl whitespace-nowrap shadow-sm transition w-full md:w-auto relative z-10">
              ลงทะเบียนรับสิทธิ์
            </button>
          </div>

          {/* Product Grid */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-800">ตลาดสินค้าเกษตรอัจฉริยะ</h2>
            <p className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
              พบ {filteredProducts.length} รายการ
            </p>
          </div>
          
          <div className="grid gap-3 sm:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 pb-20">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="rounded-3xl bg-white border border-dashed border-slate-300 py-16 text-center shadow-sm">
              <MagnifyingGlassIcon className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-600">ไม่พบสินค้าที่ตรงกับคำค้นหา</p>
              <p className="text-xs text-slate-400 mt-1">ลองใช้คำค้นหาอื่น เช่น "ข้าวหอมมะลิ" หรือ "Organic"</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
