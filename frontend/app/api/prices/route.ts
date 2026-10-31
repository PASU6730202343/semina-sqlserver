import { NextResponse } from 'next/server';

// ราคาข้าวเปลือกเจ้าหอมมะลิ 105 แบบรายวันจริง จาก API เปิดของภาครัฐ (ไม่ต้องใช้ API key)
const JASMINE_PADDY_URL =
  'https://agriapi.nabc.go.th/api/daily-prices/product?product_name=' +
  encodeURIComponent('ข้าวเปลือกเจ้าหอมมะลิ 105') +
  '&page=1';

type Basis = 'live' | 'derived' | 'estimate';

interface PriceItem {
  name: string;
  price: number;
  basis: Basis;
  dataDate?: string;
}

// สัดส่วนราคาข้าวเปลือกแต่ละชนิด "เทียบกับข้าวหอมมะลิ" อ้างอิงจากรายงานราคาเฉลี่ย
// ของสมาคมโรงสีข้าวไทย (สรุปราคาข้าวสารและข้าวเปลือกเฉลี่ย, thairicemillers.org):
//   ข้าวเปลือกหอมมะลิ 15,537 / ข้าวเปลือกหอมปทุมฯ 9,534 / ข้าวเปลือกเจ้า 7,999 / ข้าวเปลือกเหนียว(กข.6) 12,878 บาท/ตัน
// สัดส่วนระหว่างชนิดข้าวค่อนข้างคงที่กว่าราคาสัมบูรณ์ (ซึ่งเปลี่ยนตามภาวะตลาด/เงินเฟ้อ)
// จึงใช้สัดส่วนนี้คูณกับราคาหอมมะลิที่เป็นข้อมูลจริงวันนี้ แทนการหา API แยกทีละชนิด
const PRICE_RATIOS: { name: string; ratio: number }[] = [
  { name: 'ข้าวปทุมธานี 1', ratio: 9534 / 15537 },
  { name: 'ข้าวขาว 5%', ratio: 7999 / 15537 },
  { name: 'ข้าวเหนียว กข6', ratio: 12878 / 15537 },
];

// ข้าวหอมนิล: ไม่พบรายงานราคาข้าวเปลือกอย่างเป็นทางการ (พืชพิเศษ ไม่อยู่ในระบบสำรวจราคาหลักของหน่วยงานรัฐ/
// สมาคมโรงสี) จึงเป็นค่าประมาณการเท่านั้น ไม่ได้คำนวณจากสัดส่วนที่มีแหล่งอ้างอิงจริงแบบ 3 ชนิดข้างต้น
const BLACK_RICE_ESTIMATE: PriceItem = {
  name: 'ข้าวหอมนิล',
  price: 18000,
  basis: 'estimate',
};

const FALLBACK_JASMINE: PriceItem = {
  name: 'ข้าวหอมมะลิ 105',
  price: 15500,
  basis: 'estimate',
};

function average(values: number[]) {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function deriveRatioPrices(basePrice: number): PriceItem[] {
  return PRICE_RATIOS.map(({ name, ratio }) => ({
    name,
    price: Math.round(basePrice * ratio),
    basis: 'derived' as const,
  }));
}

export async function GET() {
  try {
    const res = await fetch(JASMINE_PADDY_URL, { next: { revalidate: 3600 } });
    const json = await res.json();

    if (!json?.success || !Array.isArray(json.data) || json.data.length === 0) {
      throw new Error('empty response from upstream API');
    }

    const byDate = new Map<string, number[]>();
    for (const record of json.data as { data_date: string; day_price: number }[]) {
      const list = byDate.get(record.data_date) ?? [];
      list.push(record.day_price);
      byDate.set(record.data_date, list);
    }

    const latestDate = Array.from(byDate.keys()).sort().pop()!;
    const latestAvg = Math.round(average(byDate.get(latestDate)!));

    const jasmine: PriceItem = {
      name: 'ข้าวหอมมะลิ 105',
      price: latestAvg,
      basis: 'live',
      dataDate: latestDate,
    };

    return NextResponse.json({
      success: true,
      updatedAt: new Date().toISOString(),
      prices: [jasmine, ...deriveRatioPrices(latestAvg), BLACK_RICE_ESTIMATE],
    });
  } catch (error) {
    // แหล่งข้อมูลภายนอกล่ม/เน็ตมีปัญหา -> ใช้ราคาประมาณการล้วนแทน กันหน้าเว็บพัง
    return NextResponse.json({
      success: true,
      updatedAt: new Date().toISOString(),
      prices: [
        FALLBACK_JASMINE,
        ...deriveRatioPrices(FALLBACK_JASMINE.price).map((p) => ({ ...p, basis: 'estimate' as const })),
        BLACK_RICE_ESTIMATE,
      ],
    });
  }
}
