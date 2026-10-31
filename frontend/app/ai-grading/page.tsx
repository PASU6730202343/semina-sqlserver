'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TopBar } from '@/components/TopBar';
import { CloudArrowUpIcon, DocumentIcon, SparklesIcon, XMarkIcon, CameraIcon, PhotoIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { api, BACKEND_URL } from '@/lib/api';
import { RicePhotoGuidelines } from '@/components/RicePhotoGuidelines';

const VARIETY_LABELS: Record<string, string> = {
  jasmine: 'ข้าวหอมมะลิ',
  white: 'ข้าวขาว',
  sticky: 'ข้าวเหนียว',
};

function resizeImageFile(file: File, maxSide = 1280, quality = 0.85): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (Math.max(width, height) > maxSide) {
        const scale = maxSide / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not supported')); return; }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (!blob) { reject(new Error('ย่อรูปไม่สำเร็จ')); return; }
        resolve(new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }));
      }, 'image/jpeg', quality);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('โหลดรูปภาพไม่สำเร็จ')); };
    img.src = url;
  });
}

interface GradeAnalysis {
  total_grains: number;
  whole_grains: number;
  broken_grains: number;
  broken_percentage: number;
  rice_grade_estimate: string;
}

interface PriceInfo {
  suggestedPrice: number;
  minPrice: number;
  maxPrice: number;
  basedOn: { matchedRiceType: string };
}

export default function AIGradingPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [riceVariety, setRiceVariety] = useState('jasmine');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [analysis, setAnalysis] = useState<GradeAnalysis | null>(null);
  const [priceInfo, setPriceInfo] = useState<PriceInfo | null>(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'upload' | 'camera'>('upload');

  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    setRole(localStorage.getItem('agrimatch_role'));
  }, []);
  const canSell = role === 'seller' || role === 'farmer' || role === 'admin';

  const [listingForm, setListingForm] = useState({ title: '', description: '', stock: '', riceStandard: 'general' });
  const [listing, setListing] = useState(false);
  const [listMessage, setListMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [priceOverride, setPriceOverride] = useState('');

  // ผู้ขายปรับราคาเองได้ แต่ห้ามหลุดช่วง ±10% ที่ AI แนะนำ (minPrice/maxPrice จาก /api/suggest-price)
  const clampPrice = (value: number, info: PriceInfo) =>
    Math.min(info.maxPrice, Math.max(info.minPrice, value));

  useEffect(() => {
    if (priceInfo) {
      setPriceOverride(String(priceInfo.suggestedPrice));
    }
  }, [priceInfo]);

  const finalPrice = priceInfo
    ? clampPrice(Number(priceOverride) || priceInfo.suggestedPrice, priceInfo)
    : 0;

  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file || !file.type.startsWith('image/')) {
      setFilePreviewUrl(null);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setFilePreviewUrl(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [file]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      setError('ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตให้ใช้งานกล้องหรือใช้โหมดอัปโหลด');
      setMode('upload');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const toggleMode = (newMode: 'upload' | 'camera') => {
    setMode(newMode);
    if (newMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const capturedFile = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
            setFile(capturedFile);
            stopCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
    // Reset so selecting the exact same file again still fires onChange
    // (the browser otherwise treats it as no change and silently does nothing).
    e.target.value = '';
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('กรุณาอัปโหลดรูปภาพเมล็ดข้าว');
      return;
    }
    setError('');
    setLoading(true);
    setAnalysis(null);
    setPriceInfo(null);
    setListMessage(null);

    try {
      // 1. ส่งรูปให้ AI (backend YOLO จริง) ตรวจสัดส่วนข้าวหัก/สมบูรณ์
      // ย่อรูปก่อนอัปโหลดเสมอ — ไฟล์ต้นฉบับจากมือถือหลาย MB ทำให้ค้าง/หลุดกลางทาง
      // ที่ตัวกลาง (reverse proxy) ของเซิร์ฟเวอร์ ย่อฝั่งเบราว์เซอร์ก่อนจะไม่ต้อง
      // อัปโหลดไฟล์ใหญ่ข้ามเครือข่ายเลยตั้งแต่แรก
      const resizedFile = await resizeImageFile(file);
      const formData = new FormData();
      formData.append('file', resizedFile);
      formData.append('rice_variety', riceVariety);

      const res = await fetch(`${BACKEND_URL}/api/ai/predict-rice-grade`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.detail || 'เกิดข้อผิดพลาดในการวิเคราะห์รูปภาพ');
      }
      setMessage(data.message);
      setAnalysis(data.analysis);

      // 2. เอาผลตรวจไปคำนวณราคาจากราคากลางข้าวจริงวันนี้ (แทนราคาจำลองเดิม)
      const priceRes = await fetch('/api/suggest-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riceVariety: VARIETY_LABELS[riceVariety] || riceVariety,
          brokenPercentage: data.analysis.broken_percentage,
        }),
      });
      const priceData = await priceRes.json();
      if (priceData.success) {
        setPriceInfo(priceData);
      }
    } catch (err: any) {
      setError(err?.message || 'ไม่สามารถเชื่อมต่อกับระบบ AI ได้');
    } finally {
      setLoading(false);
    }
  };

  const handleList = async () => {
    if (!priceInfo || !analysis) return;
    if (!listingForm.title || !listingForm.stock) {
      setListMessage({ type: 'error', text: 'กรุณากรอกชื่อสายพันธุ์ข้าวและจำนวนสต็อกก่อนลงขาย' });
      return;
    }
    setListing(true);
    setListMessage(null);

    try {
      if (!file) {
        throw new Error('กรุณาเลือกรูปภาพก่อนลงขาย');
      }

      // อัปโหลดรูปจริงที่ผู้ใช้เลือกไปเก็บเป็นไฟล์บน backend (ย่อก่อนอัปโหลดเช่นกัน)
      const resizedForListing = await resizeImageFile(file);
      const imageForm = new FormData();
      imageForm.append('image', resizedForListing, resizedForListing.name);
      const imageResponse = await api.post('/products/upload-image', imageForm, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const imageUrl = imageResponse.data?.url;
      if (!imageUrl) {
        throw new Error('ระบบไม่สามารถบันทึกรูปภาพได้');
      }

      const priceNum = finalPrice;
      const stockNum = Number(listingForm.stock);

      // ต้องสำเร็จที่ backend จริงเท่านั้นถึงจะถือว่าลงขายสำเร็จ (ไม่ fallback ไป localStorage
      // เงียบๆ อีกต่อไป เพราะจะทำให้สินค้าไม่มี owner_id จริง และไม่โผล่ในหน้าจัดการสินค้าของผู้ขายเอง
      // — ไม่ต้อง mirror ไป localStorage ด้วย เพราะหน้ารายการสินค้าดึงจาก backend จริงอยู่แล้วเสมอ)
      await api.post('/products/', {
        title: listingForm.title,
        description: listingForm.description,
        price: priceNum,
        stock: stockNum,
        rice_standard: listingForm.riceStandard,
        image_url: imageUrl,
      });

      setListMessage({ type: 'success', text: `ลงขาย "${listingForm.title}" ที่ราคา ฿${priceNum}/กก. สำเร็จแล้ว!` });
      setTimeout(() => router.push('/products/manage'), 1500);
    } catch (err: any) {
      const status = err?.response?.status;
      const serverDetail = err?.response?.data?.detail;
      const thaiError = status === 405
        ? 'ระบบอัปโหลดรูปยังไม่พร้อมใช้งาน กรุณารีสตาร์ท backend ให้เป็นเวอร์ชันล่าสุด'
        : serverDetail || err?.message;
      setListMessage({
        type: 'error',
        text: thaiError || 'ลงขายไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อกับระบบ',
      });
    } finally {
      setListing(false);
    }
  };

  if (role === 'buyer') {
    return (
      <div className="min-h-screen">
        <TopBar />
        <div className="flex items-center justify-center p-4 pt-24">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-sm text-center">
            <p className="text-sm font-semibold text-slate-700">ฟีเจอร์นี้สำหรับผู้ขาย/เกษตรกรและแอดมินเท่านั้น</p>
            <p className="text-xs text-slate-500 mt-2">บัญชีผู้ซื้อไม่จำเป็นต้องใช้ระบบตรวจเกรดข้าว สามารถเลือกซื้อสินค้าได้จากหน้าแรกได้เลย</p>
            <Link href="/" className="inline-block mt-4 text-sm font-bold text-emerald-600 hover:underline">กลับหน้าแรก</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <TopBar />

      <main className="mx-auto w-full max-w-4xl px-3 py-5 sm:px-4 sm:py-8">
        <div className="mb-5 flex items-center justify-between sm:mb-8">
          <div>
            <h1 className="flex items-center gap-2 text-lg font-bold leading-tight text-slate-800 sm:text-2xl">
              <SparklesIcon className="h-5 w-5 shrink-0 text-purple-600 sm:h-6 sm:w-6" />
              ระบบประเมินเกรดข้าวด้วย AI
            </h1>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">
              สแกนภาพหรืออัปโหลดภาพตัวอย่างเมล็ดข้าวของคุณเพื่อให้ AI ช่วยประเมินสัดส่วนข้าวหักและราคา
              {canSell && ' — ผู้ขายสามารถลงขายต่อได้ทันทีจากผลตรวจนี้'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 md:gap-8">
          {/* Upload Section */}
          <div className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex rounded-xl bg-slate-100 p-1 sm:mb-6">
              <button
                onClick={() => toggleMode('upload')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition ${mode === 'upload' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <PhotoIcon className="h-4 w-4" /> อัปโหลดรูปภาพ
              </button>
              <button
                onClick={() => toggleMode('camera')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition ${mode === 'camera' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <CameraIcon className="h-4 w-4" /> สแกนด้วยกล้อง
              </button>
            </div>

            {mode === 'upload' && (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-4 text-center transition hover:border-purple-500 hover:bg-purple-50 sm:min-h-[240px] sm:p-8"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
                {file ? (
                  <div className="flex flex-col items-center animate-in zoom-in duration-300">
                    {filePreviewUrl ? (
                      <img src={filePreviewUrl} alt="Rice image preview" className="mb-3 max-h-40 w-auto rounded-lg border border-slate-200 object-contain shadow-sm" />
                    ) : (
                      <DocumentIcon className="mb-2 h-12 w-12 text-purple-600" />
                    )}
                    <p className="text-sm font-semibold text-slate-700">{file.name === 'camera-capture.jpg' ? 'ภาพสแกนจากกล้อง' : file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <>
                    <CloudArrowUpIcon className="h-12 w-12 text-slate-400 mb-3" />
                    <p className="text-sm font-bold text-slate-700">คลิก หรือ ลากไฟล์รูปภาพมาวางที่นี่</p>
                    <p className="text-xs text-slate-500 mt-1">รองรับ JPG, PNG (แนะนำให้วางเมล็ดข้าวบนพื้นทึบ)</p>
                  </>
                )}
              </div>
            )}

            {mode === 'camera' && (
              <div className="relative flex min-h-[200px] flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-slate-200 bg-black sm:min-h-[240px]">
                {!file && (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className={`w-full h-full object-cover ${isCameraActive ? 'opacity-100' : 'opacity-0'}`}
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {isCameraActive && (
                      <div className="absolute inset-0 pointer-events-none border-[3px] border-purple-500/50 m-4 rounded-lg">
                        <div className="w-full h-[2px] bg-purple-500 absolute animate-[scan_2s_ease-in-out_infinite]" />
                      </div>
                    )}

                    {isCameraActive ? (
                      <button
                        onClick={captureImage}
                        className="absolute bottom-4 bg-white text-purple-700 p-3 rounded-full shadow-lg hover:scale-105 transition active:scale-95"
                      >
                        <CameraIcon className="h-8 w-8" />
                      </button>
                    ) : (
                      <div className="text-white text-sm animate-pulse">กำลังเปิดกล้อง...</div>
                    )}
                  </>
                )}

                {file && (
                  <div className="w-full h-full relative">
                    <img src={filePreviewUrl || undefined} alt="Rice image preview" className="h-full w-full object-contain" />
                    <button
                      onClick={() => { setFile(null); startCamera(); }}
                      className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white text-slate-800 px-4 py-2 rounded-lg font-bold text-sm shadow-lg"
                    >
                      ถ่ายใหม่
                    </button>
                  </div>
                )}
              </div>
            )}

            {file && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setAnalysis(null);
                  setPriceInfo(null);
                  if (mode === 'camera') startCamera();
                }}
                className="mt-3 text-xs font-semibold text-red-500 hover:text-red-700 flex items-center justify-center w-full"
              >
                <XMarkIcon className="h-3 w-3 mr-1" /> ลบรูปภาพ
              </button>
            )}

            <div className="mt-6">
              <h2 className="text-base font-bold text-slate-800 mb-3">ระบุสายพันธุ์ข้าว</h2>
              <select
                value={riceVariety}
                onChange={(e) => setRiceVariety(e.target.value)}
                className="w-full rounded-lg border-slate-200 text-sm focus:ring-purple-500 focus:border-purple-500 py-2.5 px-3 border shadow-sm outline-none"
              >
                <option value="jasmine">ข้าวหอมมะลิ</option>
                <option value="white">ข้าวขาวทั่วไป</option>
                <option value="sticky">ข้าวเหนียว</option>
              </select>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start">
                <span className="mr-2">⚠️</span> {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || !file}
              className={`mt-auto pt-6 w-full py-3 rounded-xl font-bold text-white shadow-sm flex items-center justify-center gap-2 transition ${
                loading || !file ? 'bg-slate-300 cursor-not-allowed mt-6' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 mt-6 transform hover:-translate-y-0.5'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังให้ AI วิเคราะห์สแกนภาพ...
                </>
              ) : (
                <>
                  <SparklesIcon className="h-5 w-5" />
                  สแกนและประเมินราคา
                </>
              )}
            </button>
          </div>

          {/* Result Section */}
          <div className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-base font-bold text-slate-800 mb-4">ผลการวิเคราะห์ราคา</h2>

            {!analysis ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <SparklesIcon className="h-12 w-12 mb-2 opacity-20" />
                <p className="text-sm">ผลการประเมินราคาข้าวจะแสดงที่นี่</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider mb-1">ผลสรุปจากภาพ AI SCANNER</p>
                  <p className="text-sm font-semibold text-slate-800">{message}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-slate-100 p-4 rounded-xl text-center bg-slate-50 shadow-inner">
                    <p className="text-xs text-slate-500 mb-1">เมล็ดที่พบทั้งหมด</p>
                    <p className="text-2xl font-black text-slate-800">{analysis.total_grains}</p>
                  </div>
                  <div className="border border-slate-100 p-4 rounded-xl text-center bg-red-50/50 shadow-inner">
                    <p className="text-xs text-slate-500 mb-1">สัดส่วนเมล็ดหัก</p>
                    <p className="text-2xl font-black text-red-500">{analysis.broken_percentage}%</p>
                  </div>
                </div>

                <div className="border border-slate-100 p-4 rounded-xl bg-slate-50">
                   <p className="text-xs text-slate-500 mb-1">คุณภาพข้าวประเมินเบื้องต้น</p>
                   <p className="text-lg font-bold text-slate-800">{analysis.rice_grade_estimate}</p>
                </div>

                {priceInfo && (
                  <div className="bg-gradient-to-r from-agri-green to-teal-600 p-6 rounded-xl text-white shadow-lg transform hover:scale-[1.02] transition">
                    <p className="text-xs text-teal-100 font-semibold mb-2">ราคาแนะนำต่อกิโลกรัม (จากราคากลาง{priceInfo.basedOn.matchedRiceType}วันนี้)</p>
                    <p className="text-4xl font-black tracking-tight">฿{priceInfo.suggestedPrice}</p>
                    <p className="text-[10px] mt-3 opacity-80 border-t border-white/20 pt-2">
                      ช่วงราคาตลาด ฿{priceInfo.minPrice} - ฿{priceInfo.maxPrice} *คำนวณจากราคากลางข้าวเปลือกจริงวันนี้ ปรับตามสัดส่วนข้าวหัก
                    </p>
                  </div>
                )}

                {/* ฟอร์มลงขาย — เฉพาะผู้ขาย/แอดมิน */}
                {canSell && priceInfo && (
                  <div className="border-t border-slate-100 pt-5 space-y-3">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <ShoppingBagIcon className="h-4 w-4 text-emerald-600" /> ลงขายสินค้านี้เลย
                    </h3>
                    <input
                      value={listingForm.title}
                      onChange={(e) => setListingForm({ ...listingForm, title: e.target.value })}
                      placeholder="ชื่อสายพันธุ์ข้าว เช่น ข้าวหอมมะลิ 105"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-slate-50/50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                    <textarea
                      value={listingForm.description}
                      onChange={(e) => setListingForm({ ...listingForm, description: e.target.value })}
                      placeholder="รายละเอียดสินค้า (ไม่บังคับ)"
                      rows={2}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-slate-50/50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                    />
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <select
                        value={listingForm.riceStandard}
                        onChange={(e) => setListingForm({ ...listingForm, riceStandard: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-slate-50/50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="general">ทั่วไป (ไม่มีมาตรฐาน)</option>
                        <option value="GI">GI</option>
                        <option value="Organic">Organic</option>
                        <option value="GAP">GAP</option>
                      </select>
                      <input
                        type="number"
                        value={listingForm.stock}
                        onChange={(e) => setListingForm({ ...listingForm, stock: e.target.value })}
                        placeholder="สต็อก (กก.)"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-slate-50/50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">
                        ราคาขาย (บาท/กก.) — ปรับได้ ±10% จากราคาแนะนำ
                      </label>
                      <input
                        type="number"
                        value={priceOverride}
                        onChange={(e) => setPriceOverride(e.target.value)}
                        onBlur={() => {
                          if (!priceInfo) return;
                          const num = Number(priceOverride);
                          setPriceOverride(String(clampPrice(num || priceInfo.suggestedPrice, priceInfo)));
                        }}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-slate-50/50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                      {priceInfo && (
                        <p className="mt-1 text-[11px] text-slate-400">
                          ตั้งได้ระหว่าง ฿{priceInfo.minPrice} - ฿{priceInfo.maxPrice}
                        </p>
                      )}
                    </div>

                    {listMessage && (
                      <div className={`rounded-xl px-3 py-2.5 text-xs font-semibold border ${listMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' : 'bg-rose-50 text-rose-700 border-rose-150'}`}>
                        {listMessage.text}
                      </div>
                    )}

                    <button
                      onClick={handleList}
                      disabled={listing}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition shadow-sm disabled:opacity-60 flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBagIcon className="h-4 w-4" />
                      {listing ? 'กำลังลงขาย...' : `ลงขายที่ ฿${finalPrice}/กก.`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <RicePhotoGuidelines />
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
}
