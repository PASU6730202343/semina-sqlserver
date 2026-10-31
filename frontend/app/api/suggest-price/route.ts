import { NextResponse } from 'next/server';

interface PriceEntry {
  name: string;
  price: number; // บาทต่อตัน
}

// ราคากลางจาก /api/prices เป็นราคา "ข้าวเปลือก" (ที่ชาวนาขายให้โรงสี ยังไม่ได้สี) ซึ่งถูกกว่า
// ข้าวสารขายปลีกที่ระบบนี้ซื้อขายกันมาก เพราะยังไม่รวมต้นทุนการสี (ข้าวเปลือก 1 กก. สีได้ข้าวสาร
// ราว 0.65 กก.) + บรรจุภัณฑ์ + ค่าขนส่ง/กระจายสินค้า + กำไรพ่อค้า ใช้อัตรามาร์กอัปโดยประมาณ 2.8 เท่า
// (ค่าประมาณการทั่วไปของอุตสาหกรรมข้าวไทย จากข้าวเปลือกสู่ข้าวสารขายปลีก ไม่ใช่ตัวเลขทางการที่ตายตัว)
const PADDY_TO_RETAIL_MARKUP = 2.8;

// จับคู่มาตรฐาน/ชื่อพันธุ์ข้าวที่เกษตรกรกรอก เข้ากับราคากลางที่มีอยู่ใน /api/prices
// ไม่เจอที่ตรง -> ใช้ข้าวหอมมะลิเป็นค่าเริ่มต้น (เป็นราคาที่มีข้อมูลจริงรายวันแน่นอนที่สุด)
function matchPriceEntry(input: string, prices: PriceEntry[]): PriceEntry {
  const s = (input || '').toLowerCase();
  const find = (keyword: string) => prices.find((p) => p.name.toLowerCase().includes(keyword));

  const byKeyword =
    (s.includes('ปทุม') && find('ปทุมธานี')) ||
    (s.includes('เหนียว') && find('เหนียว')) ||
    ((s.includes('นิล') || s.includes('กล้อง') || s.includes('ดำ')) && find('หอมนิล')) ||
    (s.includes('ขาว') && find('ขาว')) ||
    (s.includes('หอมมะลิ') && find('หอมมะลิ'));

  return byKeyword || prices.find((p) => p.name.includes('หอมมะลิ')) || prices[0];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const brokenPercentage = Math.max(0, Math.min(100, Number(body.brokenPercentage) || 0));
    // riceStandard (general/GI/Organic/GAP) เป็นแค่ "มาตรฐานรับรอง" ไม่ใช่ชื่อพันธุ์ข้าว จึงไม่ใช้จับคู่ราคา
    // ใช้ riceVariety (ชื่อพันธุ์ชัดเจน) และ title (ชื่อสินค้า มักมีชื่อพันธุ์ปนอยู่) รวมกันแทน
    const riceLabel: string = [body.riceVariety, body.title].filter(Boolean).join(' ');

    // ดึงราคากลางล่าสุดจาก API ของเราเอง (endpoint เดียวกับหน้า "ราคากลางข้าว")
    const origin = new URL(request.url).origin;
    const pricesRes = await fetch(`${origin}/api/prices`, { cache: 'no-store' });
    const pricesData = await pricesRes.json();
    const prices: PriceEntry[] = pricesData?.prices ?? [];

    if (prices.length === 0) {
      throw new Error('no reference prices available');
    }

    const matched = matchPriceEntry(riceLabel, prices);
    const paddyPricePerKg = matched.price / 1000; // ราคากลางเป็นบาท/ตัน แปลงเป็นบาท/กก.
    const retailPricePerKg = paddyPricePerKg * PADDY_TO_RETAIL_MARKUP;

    // ข้าวหักยิ่งเยอะ คุณภาพยิ่งต่ำ ราคายิ่งลด (คูณลดสูงสุดไม่เกินครึ่งหนึ่งของราคาขายปลีก)
    const qualityFactor = Math.max(0.5, 1 - brokenPercentage / 100);
    const suggestedPrice = Math.round(retailPricePerKg * qualityFactor);

    return NextResponse.json({
      success: true,
      suggestedPrice,
      minPrice: Math.round(suggestedPrice * 0.9),
      maxPrice: Math.round(suggestedPrice * 1.1),
      basedOn: {
        matchedRiceType: matched.name,
        pricePerTon: matched.price,
        paddyPricePerKg: Math.round(paddyPricePerKg * 100) / 100,
        retailPricePerKg: Math.round(retailPricePerKg * 100) / 100,
        markup: PADDY_TO_RETAIL_MARKUP,
        brokenPercentage,
        qualityFactor: Math.round(qualityFactor * 100) / 100,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'คำนวณราคาแนะนำไม่สำเร็จ กรุณาลองใหม่' }, { status: 500 });
  }
}
