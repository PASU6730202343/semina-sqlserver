'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export default function ChangePasswordPage() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setMessage({ type: 'error', text: 'กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง' });
      return;
    }
    if (form.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'รหัสผ่านใหม่ต้องยาวอย่างน้อย 8 ตัวอักษร' });
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setMessage({ type: 'error', text: 'ยืนยันรหัสผ่านใหม่ไม่ตรงกัน' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessage({ type: 'success', text: 'เปลี่ยนรหัสผ่านสำเร็จแล้ว บัญชีของคุณปลอดภัยขึ้น!' });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      setMessage({ type: 'error', text: 'ไม่สามารถเปลี่ยนรหัสผ่านได้ในขณะนี้ กรุณาลองใหม่' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-800 via-emerald-600 to-teal-500 flex items-center justify-center p-4">
      <div className="mx-auto w-full max-w-md">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 backdrop-blur-md">
          <div className="mb-6 flex items-center gap-3">
            <Link href="/" className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition shadow-sm">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">ตั้งค่าความปลอดภัย</p>
              <h1 className="text-xl font-extrabold text-slate-800">เปลี่ยนรหัสผ่านใหม่</h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500">รหัสผ่านปัจจุบัน</label>
              <input type="password" value={form.currentPassword} onChange={(event) => setForm({ ...form, currentPassword: event.target.value })} className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-slate-50/50" placeholder="กรอกรหัสผ่านปัจจุบันของคุณ" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500">รหัสผ่านใหม่</label>
              <input type="password" value={form.newPassword} onChange={(event) => setForm({ ...form, newPassword: event.target.value })} className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-slate-50/50" placeholder="อย่างน้อย 8 ตัวอักษร" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500">ยืนยันรหัสผ่านใหม่</label>
              <input type="password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-slate-50/50" placeholder="ระบุรหัสผ่านใหม่อีกครั้ง" />
            </div>

            {message && (
              <div className={`rounded-2xl px-4 py-3 text-xs font-semibold leading-relaxed border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' : 'bg-rose-50 text-rose-700 border-rose-150'}`}>
                {message.text}
              </div>
            )}

            <button type="submit" className="btn-primary w-full flex justify-center gap-2 items-center shadow-lg bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
              <LockClosedIcon className="h-4 w-4" /> 
              {loading ? 'กำลังดำเนินการ...' : 'ยืนยันเปลี่ยนรหัสผ่าน'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
