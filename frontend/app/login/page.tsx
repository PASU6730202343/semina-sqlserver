'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { username, password });
      const { access_token, user } = res.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('agrimatch_is_logged_in', 'true');
      localStorage.setItem('agrimatch_role', user.role);
      localStorage.setItem('agrimatch_username', user.full_name || user.username);
      localStorage.setItem('agrimatch_user_id', String(user.id));
      router.push('/');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'เข้าสู่ระบบไม่สำเร็จ ตรวจสอบ username/รหัสผ่านอีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full overflow-hidden">
        <div className="hero-rice-bg px-8 pt-8 pb-10 text-center text-white">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/30 mb-3">
            <img src="/images/logo.png" alt="โลโก้" className="h-7 w-auto" />
          </div>
          <h1 className="text-2xl font-bold mb-1">เข้าสู่ระบบ</h1>
          <p className="text-sm text-emerald-50">Smart Rice Marketplace AI</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 pt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้ใช้ (Username)</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-agri-green/30 focus:border-agri-green outline-none transition"
              placeholder="เช่น seller1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">รหัสผ่าน</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-agri-green/30 focus:border-agri-green outline-none transition"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-100 px-4 py-2.5 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-slate-600">
              <input type="checkbox" className="mr-2 rounded text-agri-green focus:ring-agri-green" />
              จดจำฉัน
            </label>
            <Link href="#" className="text-agri-green hover:underline">ลืมรหัสผ่าน?</Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-agri-green text-white py-3 rounded-xl font-bold hover:bg-agri-green-dark transition shadow-md disabled:opacity-60"
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div className="pb-8 text-center text-sm text-slate-600">
          ยังไม่มีบัญชีใช่หรือไม่?{' '}
          <Link href="/register" className="text-agri-green font-bold hover:underline">
            สมัครสมาชิก
          </Link>
        </div>
      </div>
    </div>
  );
}
