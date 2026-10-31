'use client';

import { useEffect, useState } from 'react';
import { TopBar } from '@/components/TopBar';
import { ChartBarIcon, SignalIcon } from '@heroicons/react/24/outline';

type Basis = 'live' | 'derived' | 'estimate';

interface PriceItem {
  name: string;
  price: number;
  basis: Basis;
  dataDate?: string;
}

const BASIS_BADGE: Record<Basis, { label: string; className: string }> = {
  live: { label: 'ข้อมูลจริงรายวัน', className: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  derived: { label: 'คำนวณจากหอมมะลิ×สัดส่วนจริง', className: 'text-blue-600 bg-blue-50 border-blue-100' },
  estimate: { label: 'ประมาณการ', className: 'text-slate-400 bg-slate-50 border-slate-100' },
};

export default function PricesPage() {
  const [prices, setPrices] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('/api/prices');
        const data = await res.json();
        if (data.success && Array.isArray(data.prices)) {
          setPrices(data.prices);
          setUpdatedAt(data.updatedAt);
        }
      } catch (err) {
        console.warn('Could not load prices');
      } finally {
        setLoading(false);
      }
    };
    fetchPrices();
  }, []);

  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">ตลาดกลาง</p>
            <h1 className="text-2xl font-extrabold text-slate-800">ราคากลางข้าว</h1>
            {updatedAt && (
              <p className="text-xs text-slate-400 mt-1">
                อัปเดตล่าสุด {new Date(updatedAt).toLocaleString('th-TH')}
              </p>
            )}
          </div>
          <ChartBarIcon className="h-8 w-8 text-slate-300" />
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-slate-700">สายพันธุ์ข้าว</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-700">ราคา (บาท/ตัน)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr>
                    <td colSpan={2} className="px-6 py-10 text-center text-slate-400 text-sm">
                      กำลังโหลดราคา...
                    </td>
                  </tr>
                )}
                {!loading && prices.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-5 font-bold text-slate-800">
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.name}
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${BASIS_BADGE[item.basis].className}`}>
                          {item.basis === 'live' && <SignalIcon className="h-3 w-3" />}
                          {BASIS_BADGE[item.basis].label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-bold text-slate-700">{item.price.toLocaleString('th-TH')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-xs text-slate-400 text-center space-y-1">
          <p><span className="font-bold text-emerald-600">ข้อมูลจริงรายวัน</span> — ข้าวหอมมะลิ 105 ดึงจากราคาข้าวเปลือกรายวันของภาครัฐ (เฉลี่ยจากตลาด/โรงสีทั่วประเทศ)</p>
          <p><span className="font-bold text-blue-600">คำนวณจากหอมมะลิ×สัดส่วนจริง</span> — ข้าวปทุมธานี 1, ข้าวขาว 5%, ข้าวเหนียว กข6 คำนวณจากราคาหอมมะลิวันนี้ คูณสัดส่วนราคาจริงของสมาคมโรงสีข้าวไทย</p>
          <p><span className="font-bold text-slate-500">ประมาณการ</span> — ข้าวหอมนิล ยังไม่พบแหล่งข้อมูลราคาทางการเปรียบเทียบได้</p>
        </div>
      </div>
    </div>
  );
}
