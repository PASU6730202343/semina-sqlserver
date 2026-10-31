'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

type FormData = { username: string; email: string; password: string; confirmPassword: string; role: string };

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({ username: '', email: '', password: '', confirmPassword: '', role: 'buyer' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (formData.password !== formData.confirmPassword) { setError('รหัสผ่านไม่ตรงกัน'); return; }
    setLoading(true);
    try {
      await api.post('/auth/register', { username: formData.username, email: formData.email, password: formData.password, role: formData.role });
      import('@/lib/stats').then(module => module.incrementMembersCount());
      setSuccess('สมัครสมาชิกสำเร็จ กำลังพาไปหน้าเข้าสู่ระบบ...');
      setTimeout(() => router.push('/login'), 1200);
    } catch (err: any) { setError(err?.response?.data?.detail || 'สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่'); }
    finally { setLoading(false); }
  };

  const inputClass = 'w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-agri-green/30 focus:border-agri-green outline-none transition';
  return (
    <div className="min-h-screen flex items-center justify-center p-4"><div className="bg-white rounded-3xl shadow-xl max-w-md w-full overflow-hidden">
      <div className="hero-rice-bg px-8 pt-8 pb-10 text-center text-white"><div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/30 mb-3"><img src="/images/logo.png" alt="โลโก้" className="h-7 w-auto" /></div><h1 className="text-2xl font-bold mb-1">สมัครสมาชิก</h1><p className="text-sm text-emerald-50">Smart Rice Marketplace AI</p></div>
      <form onSubmit={handleRegister} className="p-8 pt-6 space-y-4">
        <div><label className="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้ใช้ (Username)</label><input type="text" name="username" value={formData.username} onChange={handleChange} className={inputClass} required /></div>
        <div><label className="block text-sm font-medium text-slate-700 mb-1">อีเมล</label><input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} required /></div>
        <div><label className="block text-sm font-medium text-slate-700 mb-1">บทบาท (Role)</label><select name="role" value={formData.role} onChange={handleChange} className={inputClass}><option value="buyer">ผู้รับซื้อ (Buyer)</option><option value="seller">เกษตรกร/ผู้ขาย (Seller)</option></select></div>
        <div><label className="block text-sm font-medium text-slate-700 mb-1">รหัสผ่าน</label><input type="password" name="password" value={formData.password} onChange={handleChange} className={inputClass} required /></div>
        <div><label className="block text-sm font-medium text-slate-700 mb-1">ยืนยันรหัสผ่าน</label><input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={inputClass} required /></div>
        {error && <div className="rounded-xl bg-rose-50 border border-rose-100 px-4 py-2.5 text-xs font-semibold text-rose-700">{error}</div>}
        {success && <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-2.5 text-xs font-semibold text-emerald-700">{success}</div>}
        <button type="submit" disabled={loading || !!success} className="w-full bg-agri-green text-white py-3 rounded-xl font-bold hover:bg-agri-green-dark transition shadow-md mt-4 disabled:opacity-60">{loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}</button>
      </form>
      <div className="pb-8 text-center text-sm text-slate-600">มีบัญชีอยู่แล้ว? <Link href="/login" className="text-agri-green font-bold hover:underline">เข้าสู่ระบบ</Link></div>
    </div></div>
  );
}
