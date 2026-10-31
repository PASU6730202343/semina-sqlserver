'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BuildingStorefrontIcon, ShoppingCartIcon, UserIcon, PhoneIcon, ChevronDownIcon, PlusIcon, HomeIcon, UserCircleIcon, SparklesIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export function TopBar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('บัญชีของฉัน');
  const [role, setRole] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const canSell = role === 'seller' || role === 'farmer' || role === 'admin';
  const isActive = (path: string) => path === '/' ? pathname === '/' : pathname.startsWith(path);

  useEffect(() => {
    // Check login state from local storage on mount
    const loggedIn = localStorage.getItem('agrimatch_is_logged_in') === 'true';
    setIsLoggedIn(loggedIn);
    
    const storedUsername = localStorage.getItem('agrimatch_username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
    
    const storedRole = localStorage.getItem('agrimatch_role');
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('agrimatch_is_logged_in');
    localStorage.removeItem('agrimatch_username');
    localStorage.removeItem('agrimatch_role');
    setIsLoggedIn(false);
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="border-b border-slate-200 bg-white sticky top-0 z-40">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 sm:px-6 sm:py-3 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <img src="/images/logo.png" alt="Smart Rice Marketplace Logo" className="h-9 w-auto shrink-0 sm:h-12" />
          <span className="hidden truncate text-[15px] font-bold text-agri-green sm:inline">Smart Rice Marketplace-AI</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          {isLoggedIn && (role === 'seller' || role === 'farmer') && (
            <Link href="/orders/incoming" className="flex items-center gap-1 text-sm font-bold text-emerald-700 hover:text-agri-green">
              <ShoppingCartIcon className="h-4 w-4" /> คำสั่งซื้อที่เข้ามา
            </Link>
          )}
          <Link href="/" className="flex items-center gap-1.5 text-sm font-semibold text-agri-green">
            <HomeIcon className="h-4 w-4" />
            หน้าแรก
          </Link>
          <Link href="/prices" className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-agri-green">
            ราคากลางวันนี้
          </Link>
          <div className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-agri-green">
            <PhoneIcon className="h-3.5 w-3.5 mr-1 text-agri-green" />
            02-123-4567
          </div>
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          {(!isLoggedIn || canSell) && (
            <Link
              href={isLoggedIn ? "/ai-grading" : "/login"}
              onClick={(e) => {
                if (!isLoggedIn) {
                  e.preventDefault();
                  alert('กรุณาเข้าสู่ระบบก่อนใช้งานระบบตรวจสอบเกรดข้าว AI ครับ');
                  router.push('/login');
                }
              }}
              className="hidden sm:flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold px-4 py-2 rounded-xl transition shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-emerald-100"
            >
              <SparklesIcon className="h-4 w-4" />
              <span>ตรวจสอบเกรดข้าว (AI)</span>
            </Link>
          )}

          {!isLoggedIn ? (
            <Link href="/login" className="hidden md:inline-block text-xs font-semibold text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition border border-transparent hover:border-slate-200">
              เข้าสู่ระบบ
            </Link>
          ) : (
            <div className="relative group hidden md:block">
              <button className="flex items-center gap-1 bg-agri-surface hover:bg-agri-green-light text-agri-green hover:text-white text-xs font-bold px-3 py-2 rounded-lg transition">
                <UserCircleIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{username}</span>
              </button>

              <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-white p-2 shadow-lg ring-1 ring-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="px-3 py-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">เมนูผู้ใช้งาน</div>
                <div className="space-y-1">
                  {(role === 'seller' || role === 'farmer') ? (
                    <Link href="/products/manage" className="block rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-agri-green">จัดการสินค้า (ผู้ขาย)</Link>
                  ) : role === 'admin' ? (
                    <Link href="/products/manage" className="block rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-agri-green">จัดการสินค้า (แอดมิน)</Link>
                  ) : (
                    <Link href="/orders/manage" className="block rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-agri-green">รายการสั่งซื้อของฉัน</Link>
                  )}
                  <Link href="/settings" className="block rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-agri-green">การตั้งค่าบัญชี</Link>
                </div>
                <div className="mt-2 border-t border-slate-100 pt-2">
                  <button onClick={handleLogout} className="w-full text-left rounded-lg px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50">
                    ออกจากระบบ
                  </button>
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label="เปิดเมนู"
            className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg text-slate-600 hover:bg-slate-100 transition"
          >
            {isMobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1 shadow-lg">
          {(role === 'seller' || role === 'farmer') && (
            <Link href="/orders/incoming" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100">
              <ShoppingCartIcon className="h-4 w-4" /> คำสั่งซื้อที่เข้ามา
            </Link>
          )}
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-agri-green hover:bg-slate-50">
            <HomeIcon className="h-4 w-4" /> หน้าแรก
          </Link>
          <Link href="/prices" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            ราคากลางวันนี้
          </Link>
          {(!isLoggedIn || canSell) && (
            <Link
              href={isLoggedIn ? "/ai-grading" : "/login"}
              onClick={(e) => {
                setIsMobileMenuOpen(false);
                if (!isLoggedIn) {
                  e.preventDefault();
                  alert('กรุณาเข้าสู่ระบบก่อนใช้งานระบบตรวจสอบเกรดข้าว AI ครับ');
                  router.push('/login');
                }
              }}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
            >
              <SparklesIcon className="h-4 w-4" /> ตรวจสอบเกรดข้าว (AI)
            </Link>
          )}
          <div className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500">
            <PhoneIcon className="h-4 w-4 text-agri-green" /> 02-123-4567
          </div>

          <div className="border-t border-slate-100 my-2" />

          {!isLoggedIn ? (
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-bold text-white bg-agri-green text-center hover:bg-agri-green-dark">
              เข้าสู่ระบบ
            </Link>
          ) : (
            <>
              <div className="px-3 py-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">{username}</div>
              {(role === 'seller' || role === 'farmer') ? (
                <Link href="/products/manage" onClick={() => setIsMobileMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">จัดการสินค้า (ผู้ขาย)</Link>
              ) : role === 'admin' ? (
                <Link href="/products/manage" onClick={() => setIsMobileMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">จัดการสินค้า (แอดมิน)</Link>
              ) : (
                <Link href="/orders/manage" onClick={() => setIsMobileMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">รายการสั่งซื้อของฉัน</Link>
              )}
              <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">การตั้งค่าบัญชี</Link>
              <button
                onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                className="w-full text-left rounded-lg px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"
              >
                ออกจากระบบ
              </button>
            </>
          )}
        </div>
      )}

      <div className="fixed inset-x-3 bottom-3 z-50 flex items-center justify-around rounded-[2rem] border border-white/80 bg-white/85 px-2 py-2 shadow-[0_12px_35px_rgba(15,23,42,0.16)] backdrop-blur-xl md:hidden">
        <Link href="/" className={`flex min-w-[52px] flex-col items-center gap-0.5 rounded-2xl px-2 py-1 text-[10px] font-bold transition ${isActive('/') ? 'bg-blue-50 text-blue-600' : 'text-slate-500'}`}>
          <HomeIcon className="h-5 w-5" />
          <span>หน้าหลัก</span>
        </Link>
        <Link href="/prices" className={`flex min-w-[52px] flex-col items-center gap-0.5 rounded-2xl px-2 py-1 text-[10px] font-semibold transition ${isActive('/prices') ? 'bg-blue-50 text-blue-600' : 'text-slate-500'}`}>
          <SparklesIcon className="h-5 w-5" />
          <span>ราคา</span>
        </Link>
        <Link href={isLoggedIn ? '/ai-grading' : '/login'} className={`flex min-w-[52px] flex-col items-center gap-0.5 rounded-2xl px-2 py-1 text-[10px] font-semibold transition ${isActive('/ai-grading') ? 'bg-blue-50 text-blue-600' : 'text-slate-500'}`}>
          <BuildingStorefrontIcon className="h-5 w-5" />
          <span>AI ข้าว</span>
        </Link>
        <Link href={isLoggedIn && canSell ? '/products/manage' : '/login'} className={`flex min-w-[52px] flex-col items-center gap-0.5 rounded-2xl px-2 py-1 text-[10px] font-semibold transition ${isActive('/products/manage') ? 'bg-blue-50 text-blue-600' : 'text-slate-500'}`}>
          <ShoppingCartIcon className="h-5 w-5" />
          <span>จัดการ</span>
        </Link>
        <Link href={isLoggedIn ? '/settings' : '/login'} className={`flex min-w-[52px] flex-col items-center gap-0.5 rounded-2xl px-2 py-1 text-[10px] font-semibold transition ${isActive('/settings') ? 'bg-blue-50 text-blue-600' : 'text-slate-500'}`}>
          <UserCircleIcon className="h-5 w-5" />
          <span>โปรไฟล์</span>
        </Link>
      </div>
    </nav>
  );
}
