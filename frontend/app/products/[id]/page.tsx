'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TopBar } from '@/components/TopBar';
import { Product, getStoredProducts, formatCurrency } from '@/lib/products';
import { createOrder } from '@/lib/orders';
import { api } from '@/lib/api';
import { 
  ArrowLeftIcon, 
  SparklesIcon, 
  CheckBadgeIcon, 
  UserCircleIcon, 
  MapPinIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [contactQuantity, setContactQuantity] = useState(1);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState('');
  useEffect(() => {
    if (!params.id) return;
    const id = Number(params.id);

    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        if (res.status === 200 && res.data?.success && res.data.data) {
          const p = res.data.data;
          setProduct({
            id: p.id,
            title: p.title,
            description: p.description || '',
            price: Number(p.price),
            stock: p.stock !== undefined ? p.stock : (p.quantity ?? 0),
            riceStandard: p.rice_standard || p.riceStandard || 'general',
            imageUrl: p.image_url || p.thumbnail || p.imageUrl,
            sellerName: p.seller_name || p.sellerName,
          });
          return;
        }
      } catch (error) {
        console.warn('Could not load product from server, falling back to local cache');
      }

      const found = getStoredProducts().find((item) => item.id === id);
      if (found) setProduct(found);
    };

    fetchProduct();
  }, [params.id]);

  if (!product) {
    return (
      <div className="min-h-screen">
        <TopBar />
        <div className="flex flex-col items-center justify-center pt-32">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-slate-200 rounded-full mb-4"></div>
            <div className="h-4 w-32 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const isAvailable = product.stock > 0;

  return (
    <div className="min-h-screen pb-20">
      <TopBar />
      
      <main className="mx-auto max-w-5xl px-4 pt-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4" /> กลับสู่หน้าหลัก
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row">
          
          {/* Image Section */}
          <div className="md:w-1/2 bg-slate-100 relative h-64 md:h-auto">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.title} 
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                <span className="text-slate-400">ไม่มีรูปภาพ</span>
              </div>
            )}
            
            <div className="absolute top-4 left-4">
              {product.riceStandard !== 'general' && product.riceStandard !== 'ทั่วไป (ไม่มีมาตรฐาน)' && (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full shadow-sm border border-emerald-200">
                  มาตรฐาน {product.riceStandard}
                </span>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="md:w-1/2 p-8 lg:p-10 flex flex-col">
            <div className="mb-2">
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md ${isAvailable ? 'bg-agri-green/10 text-agri-green-dark' : 'bg-red-100 text-red-700'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-agri-green' : 'bg-red-500'}`} />
                {isAvailable ? `มีสินค้าพร้อมส่ง (${product.stock} กก.)` : 'สินค้าหมดชั่วคราว'}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-4 leading-tight">
              {product.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <UserCircleIcon className="h-5 w-5 text-slate-400" />
                <span className="font-semibold text-slate-700">{product.sellerName || 'ผู้ขายทั่วไป'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPinIcon className="h-4 w-4 text-slate-400" />
                <span>จ. สุรินทร์</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheckIcon className="h-4 w-4 text-emerald-500" />
                <span className="text-emerald-600 font-medium">ยืนยันตัวตนแล้ว</span>
              </div>
            </div>

            <div className="mb-8 flex-1">
              <h3 className="text-sm font-bold text-slate-800 mb-2">รายละเอียดสินค้า</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                {product.description || 'ไม่มีรายละเอียดเพิ่มเติมสำหรับสินค้านี้ ข้าวคุณภาพพรีเมียม ส่งตรงจากเกษตรกร มั่นใจในคุณภาพและมาตรฐานที่ผ่านการรับรอง'}
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 mb-1">ราคาต่อกิโลกรัม</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-agri-green tracking-tight">{formatCurrency(product.price)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                disabled={!isAvailable}
                onClick={() => {
                  const isLoggedIn = localStorage.getItem('agrimatch_is_logged_in') === 'true';
                  if (!isLoggedIn) {
                    alert('กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อสินค้าครับ');
                    router.push('/login');
                    return;
                  }
                  const role = localStorage.getItem('agrimatch_role');
                  if (role !== 'buyer') {
                    alert('สั่งซื้อสินค้าได้เฉพาะบัญชีผู้ซื้อ (buyer) เท่านั้นครับ');
                    return;
                  }
                  setContactQuantity(1);
                  setShowContactModal(true);
                }}
                className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm shadow-sm transition-all ${
                  isAvailable
                    ? 'bg-slate-800 hover:bg-slate-900 text-white hover:shadow-md'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                สั่งซื้อสินค้า
              </button>
              
              <Link 
                href="/ai-grading" 
                className="flex-1 py-3.5 px-6 rounded-xl font-bold text-sm border-2 border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors flex items-center justify-center gap-2 group"
              >
                <SparklesIcon className="h-5 w-5 text-purple-500 group-hover:scale-110 transition-transform" />
                สแกนคุณภาพด้วย AI
              </Link>
            </div>

          </div>
        </div>
      </main>

      {/* Order Confirmation Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="font-bold text-lg text-slate-800">ยืนยันการสั่งซื้อ</h2>
              <button onClick={() => setShowContactModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">จำนวนที่ต้องการซื้อ (กก.)</label>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={contactQuantity}
                  onChange={(e) => setContactQuantity(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-agri-green outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">มีสินค้าพร้อมส่ง {product.stock} กก.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">หมายเหตุถึงผู้ขาย (ไม่บังคับ)</label>
                <textarea
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-agri-green outline-none"
                  rows={2}
                  placeholder="เช่น ที่อยู่จัดส่ง, ช่วงเวลาที่สะดวกรับของ"
                ></textarea>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">ยอดรวม</span>
                <span className="text-xl font-black text-agri-green">{formatCurrency(contactQuantity * product.price)}</span>
              </div>

              {orderError && (
                <div className="rounded-xl bg-rose-50 border border-rose-100 px-4 py-2.5 text-xs font-semibold text-rose-700">
                  {orderError}
                </div>
              )}

              <button
                disabled={orderLoading}
                onClick={async () => {
                  setOrderError('');
                  setOrderLoading(true);
                  try {
                    await createOrder(product.id, contactQuantity, contactMessage);
                    import('@/lib/stats').then(module => {
                      module.incrementOrdersCount();
                    });
                    setShowContactModal(false);
                    setProduct((current) => current ? { ...current, stock: current.stock - contactQuantity } : current);
                    alert('สั่งซื้อสำเร็จ! ระบบหักสต็อกสินค้าให้เรียบร้อยแล้ว ดูสถานะได้ที่ "รายการสั่งซื้อของฉัน"');
                    router.push('/orders/manage');
                  } catch (err: any) {
                    setOrderError(err?.response?.data?.detail || 'สั่งซื้อไม่สำเร็จ กรุณาลองใหม่ (ต้องเข้าสู่ระบบเป็นผู้ซื้อก่อน)');
                  } finally {
                    setOrderLoading(false);
                  }
                }}
                className="w-full bg-agri-green hover:bg-agri-green-dark text-white font-bold py-3 rounded-xl transition shadow-sm mt-2 disabled:opacity-60"
              >
                {orderLoading ? 'กำลังยืนยันสั่งซื้อ...' : 'ยืนยันสั่งซื้อ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
