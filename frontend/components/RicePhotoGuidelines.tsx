'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AlertCircle, Camera, Check, Focus, Grid2X2, Sun, X } from 'lucide-react';
import guidelineData from './rice-photo-guidelines.json';

// Keep the icon mapping in code and the farmer-facing copy in JSON for easy editing.
const tipIcons = {
  grid: Grid2X2,
  contrast: Grid2X2,
  camera: Camera,
  sun: Sun,
  focus: Focus,
};

export function RicePhotoGuidelines() {
  const [comparisonOpen, setComparisonOpen] = useState(false);

  return (
    <section aria-labelledby="rice-photo-guidelines-title" className="mt-6 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">ถ่ายภาพให้ AI อ่านง่าย</p>
          <h2 id="rice-photo-guidelines-title" className="mt-1 text-lg font-bold text-slate-900">{guidelineData.title}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">{guidelineData.description}</p>
        </div>
        <button
          type="button"
          onClick={() => setComparisonOpen(true)}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
        >
          <Check aria-hidden="true" className="h-5 w-5" /> ดูตัวอย่างควรทำ / ควรเลี่ยง
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-center sm:p-4">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-900">
          <Image
            src="/images/rice-photo-source.png.png"
            alt="ตัวอย่างเมล็ดข้าวที่กระจายบนพื้นหลังสีเข้ม ถ่ายจากด้านบนและเห็นเมล็ดชัดเจน"
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-contain"
          />
        </div>
        <div className="px-1 py-2 sm:px-3">
          <p className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-3 py-1 text-xs font-bold text-white">
            <Check aria-hidden="true" className="h-4 w-4" /> ตัวอย่างภาพที่เหมาะกับการสแกน
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-700">ภาพนี้จัดเมล็ดแยกกันบนพื้นหลังเข้ม ถ่ายจากด้านบน และเห็นขอบเมล็ดได้ชัด ใช้เป็นแนวทางก่อนถ่ายภาพของคุณได้</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {guidelineData.tips.map((tip, index) => {
          const Icon = tipIcons[tip.icon as keyof typeof tipIcons];
          return (
            <article key={tip.id} className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                <Icon aria-hidden="true" className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900"><span className="mr-1 text-emerald-700">{index + 1}.</span>{tip.title}</p>
                <p className="mt-1 text-sm leading-5 text-slate-600">{tip.description}</p>
              </div>
            </article>
          );
        })}
      </div>

      {comparisonOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 sm:items-center sm:p-4" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setComparisonOpen(false);
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="photo-comparison-title" className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:max-w-2xl sm:rounded-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">เช็กรูปก่อนสแกน</p>
                <h3 id="photo-comparison-title" className="mt-1 text-lg font-bold text-slate-900">ถ่ายแบบไหน AI ตรวจได้ง่าย?</h3>
              </div>
              <button type="button" onClick={() => setComparisonOpen(false)} aria-label="ปิดหน้าต่าง" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600">
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <h4 className="flex items-center gap-2 font-bold text-emerald-900"><Check aria-hidden="true" className="h-5 w-5" />{guidelineData.comparison.doTitle}</h4>
                <ul className="mt-3 space-y-3">
                  {guidelineData.comparison.doItems.map((item) => <li key={item} className="flex gap-2 text-sm leading-5 text-emerald-950"><Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" /><span>{item}</span></li>)}
                </ul>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                <h4 className="flex items-center gap-2 font-bold text-rose-900"><X aria-hidden="true" className="h-5 w-5" />{guidelineData.comparison.dontTitle}</h4>
                <ul className="mt-3 space-y-3">
                  {guidelineData.comparison.dontItems.map((item) => <li key={item} className="flex gap-2 text-sm leading-5 text-rose-950"><X aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" /><span>{item}</span></li>)}
                </ul>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-amber-50 p-3 text-sm leading-5 text-amber-950">
              <p className="flex gap-2"><AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" /><span>ถ้ามีเมล็ดซ้อนกัน ให้แยกเมล็ดก่อนถ่าย ระบบอาจนับเมล็ดที่บังกันคลาดเคลื่อนได้</span></p>
            </div>
            <button type="button" onClick={() => setComparisonOpen(false)} className="mt-5 min-h-11 w-full rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2">เข้าใจแล้ว</button>
          </section>
        </div>
      )}
    </section>
  );
}
