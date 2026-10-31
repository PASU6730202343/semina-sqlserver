'use client';
import { useState, useEffect } from 'react';
import { SparklesIcon, PhotoIcon, CheckBadgeIcon, UserCircleIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { Product, formatCurrency } from '@/lib/products';
import Link from 'next/link';

function RiceStandardTag({ standard }: { standard: string }) {
  if (!standard || standard === 'general' || standard === 'ทั่วไป (ไม่มีมาตรฐาน)') return null;
  const configs: Record<string, { cls: string; label: string }> = {
    GI: { cls: 'bg-amber-100 text-amber-800', label: 'GI' },
    Organic: { cls: 'bg-agri-surface text-agri-green-dark', label: 'Organic' },
    GAP: { cls: 'bg-blue-50 text-blue-700', label: 'GAP' },
  };
  const cfg = configs[standard] || { cls: 'bg-slate-100 text-slate-700', label: standard };
  return (
    <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const isAvailable = product.stock > 0;
  const stockLabel = isAvailable ? `${product.stock.toLocaleString('th-TH')} กก.` : 'หมด';
  const stockClass = isAvailable ? 'bg-agri-green text-white' : 'bg-red-500 text-white';

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    setIsLoggedIn(localStorage.getItem('agrimatch_is_logged_in') === 'true');
  }, []);

  return (
    <article className="group overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative">
      <div>
        <div className="relative aspect-[4/3] bg-slate-50">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <PhotoIcon className="h-8 w-8 sm:h-12 sm:w-12 text-slate-300" />
            </div>
          )}
          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex gap-1">
            <RiceStandardTag standard={product.riceStandard} />
          </div>
          <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2">
            <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm ${stockClass}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-white opacity-90 shrink-0" />
              {stockLabel}
            </span>
          </div>
        </div>
        <div className="p-2.5 sm:p-4 space-y-1 sm:space-y-2">
          <h3 className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-1">{product.title}</h3>

          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-500">
            <UserCircleIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            <span className="line-clamp-1">{product.sellerName || 'ผู้ขายทั่วไป'}</span>
            <CheckBadgeIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-agri-green shrink-0" />
          </div>

          <p className="hidden sm:block text-[11px] text-slate-500 line-clamp-2 leading-relaxed h-8">
            {product.description || 'ข้าวคุณภาพพรีเมียม ส่งตรงจากเกษตรกร มั่นใจในคุณภาพและมาตรฐานที่ผ่านการรับรอง'}
          </p>
        </div>
      </div>

      <div className="px-2.5 sm:px-4 pb-2.5 sm:pb-4 mt-auto">
        <div className="flex items-center justify-between mt-1 sm:mt-3 pt-1.5 sm:pt-3 border-t border-slate-100">
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[10px] text-slate-500 mb-0.5 hidden sm:block">ราคาแนะนำ</span>
            <span className="text-sm sm:text-lg font-extrabold text-agri-green">{formatCurrency(product.price)}</span>
          </div>
          <Link href={`/products/${product.id}`} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] sm:text-[11px] font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-colors border border-slate-200">
            รายละเอียด
          </Link>
        </div>

        <Link
          href={isLoggedIn ? `/products/${product.id}` : '/login'}
          onClick={(e) => {
            if (!isLoggedIn) {
              e.preventDefault();
              alert('กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อสินค้าครับ');
              window.location.href = '/login';
            }
          }}
          className="w-full rounded-lg sm:rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] sm:text-[11px] font-bold py-1.5 sm:py-2.5 px-3 sm:px-4 transition-colors flex items-center justify-center gap-1 sm:gap-1.5 mt-1.5 sm:mt-2 shadow-sm"
        >
          <ShoppingCartIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          สั่งซื้อสินค้า
        </Link>
      </div>
    </article>
  );
}
