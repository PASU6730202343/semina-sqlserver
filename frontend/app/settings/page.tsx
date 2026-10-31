'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/TopBar';
import { UserCircleIcon, Cog6ToothIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('agrimatch_is_logged_in') === 'true';
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    setUsername(localStorage.getItem('agrimatch_username') || '');
    const storedRole = localStorage.getItem('agrimatch_role') || 'buyer';
    setRole(storedRole);
    setIsAdmin(storedRole === 'admin');
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setMessage({ type: 'error', text: 'กรุณากรอกชื่อผู้ใช้งาน' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const currentRole = localStorage.getItem('agrimatch_role');
      if (!isAdmin && role !== currentRole) {
        const res = await api.put('/auth/role', { role });
        localStorage.setItem('token', res.data.access_token);
        localStorage.setItem('agrimatch_role', res.data.user.role);
      }

      localStorage.setItem('agrimatch_username', username);
      // Simulate saving password if provided

      setMessage({ type: 'success', text: 'บันทึกการตั้งค่าเรียบร้อยแล้ว!' });

      // Refresh the page to update the TopBar after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err?.response?.data?.detail || 'บันทึกไม่สำเร็จ กรุณาลองใหม่',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <button 
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-700 transition font-semibold mb-6"
          >
            <ArrowLeftIcon className="h-4 w-4" /> ย้อนกลับ
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <Cog6ToothIcon className="h-8 w-8 text-emerald-600" />
            <h1 className="text-2xl font-extrabold text-slate-800">การตั้งค่าบัญชี</h1>
          </div>
          <p className="text-slate-500 text-sm">จัดการข้อมูลส่วนตัวและรหัสผ่านของคุณ</p>
        </div>

        <form onSubmit={handleSave} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 space-y-6">
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              ชื่อผู้ใช้งาน
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <UserCircleIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                placeholder="ชื่อของคุณ"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              ประเภทบัญชีผู้ใช้งาน
            </label>
            {isAdmin ? (
              <div className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-slate-50 text-slate-500">
                แอดมิน (Admin) — ไม่สามารถสลับประเภทบัญชีได้
              </div>
            ) : (
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all bg-white"
              >
                <option value="buyer">ผู้ซื้อ (Buyer)</option>
                <option value="seller">ผู้ขาย / เกษตรกร (Seller)</option>
              </select>
            )}
          </div>

          <div className="border-t border-slate-100 pt-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              เปลี่ยนรหัสผ่านใหม่ (ไม่บังคับ)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
              placeholder="เว้นว่างไว้หากไม่ต้องการเปลี่ยน"
            />
          </div>

          {message && (
            <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 transition-colors shadow-sm disabled:opacity-60"
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
