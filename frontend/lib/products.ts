export type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  stock: number;
  riceStandard: string;
  imageUrl?: string;
  ownerId?: number | null;
  sellerName?: string;
};

export function formatCurrency(value: number) {
  return `฿${value.toLocaleString('th-TH')}`;
}

export function loadProducts(): Product[] {
  return [
    {
      id: 1,
      title: 'ข้าวหอมมะลิ 105 สุรินทร์',
      description: 'ข้าวหอมมะลิแท้จากแปลงปลูกที่ผ่านการคัดเลือก คุณภาพนุ่มหอมและคงความสด',
      price: 220,
      stock: 350,
      riceStandard: 'GI',
      imageUrl: 'https://images.pexels.com/photos/36346840/pexels-photo-36346840.jpeg',
    },
    {
      id: 2,
      title: 'ข้าวกข43 อินทรีย์',
      description: 'ปลูกแบบเกษตรอินทรีย์ ไม่ใช้สารเคมี เหมาะกับตลาดสุขภาพ',
      price: 185,
      stock: 80,
      riceStandard: 'Organic',
      imageUrl: 'https://moonfarms.com/wp-content/uploads/2020/01/5-scaled.jpg',
    },
    {
      id: 3,
      title: 'ข้าวหอมนิลเพื่อสุขภาพ',
      description: 'สีม่วงเข้ม อุดมด้วยสารแอนโทไซยานิน เหมาะสำหรับผู้รักสุขภาพ',
      price: 320,
      stock: 0,
      riceStandard: 'GAP',
      imageUrl: 'https://media.istockphoto.com/id/1304817570/th/%E0%B8%A3%E0%B8%B9%E0%B8%9B%E0%B8%96%E0%B9%88%E0%B8%B2%E0%B8%A2/%E0%B8%82%E0%B9%89%E0%B8%B2%E0%B8%A7%E0%B8%82%E0%B8%B2%E0%B8%A7-%E0%B8%9E%E0%B8%A3%E0%B9%89%E0%B8%AD%E0%B8%A1%E0%B8%8A%E0%B9%89%E0%B8%AD%E0%B8%99%E0%B9%84%E0%B8%A1%E0%B9%89%E0%B9%83%E0%B8%99%E0%B8%8A%E0%B8%B2%E0%B8%A1%E0%B9%84%E0%B8%A1%E0%B9%89%E0%B9%81%E0%B8%A5%E0%B8%B0%E0%B8%82%E0%B9%89%E0%B8%B2%E0%B8%A7%E0%B9%80%E0%B8%9B%E0%B8%A5%E0%B8%B7%E0%B8%AD%E0%B8%81.jpg?s=612x612&w=0&k=20&c=seduQpP3f-VcGItE3TSzHLIlL1AOF6Onzpn_2e88IzM=',
    },
    {
      id: 4,
      title: 'ข้าวปทุมธานี 1',
      description: 'ข้าวหอมคล้ายหอมมะลิ หุงขึ้นหม้อ รสชาติดีเยี่ยม',
      price: 180,
      stock: 500,
      riceStandard: 'general',
      imageUrl: 'https://media.istockphoto.com/id/1004040534/th/%E0%B8%A3%E0%B8%B9%E0%B8%9B%E0%B8%96%E0%B9%88%E0%B8%B2%E0%B8%A2/%E0%B8%A1%E0%B8%B8%E0%B8%A1%E0%B8%A1%E0%B8%AD%E0%B8%87%E0%B8%A1%E0%B8%B8%E0%B8%A1%E0%B8%AA%E0%B8%B9%E0%B8%87%E0%B8%82%E0%B8%AD%E0%B8%87%E0%B8%82%E0%B9%89%E0%B8%B2%E0%B8%A7%E0%B8%9A%E0%B8%99%E0%B9%82%E0%B8%95%E0%B9%8A%E0%B8%B0.jpg?s=612x612&w=0&k=20&c=8956HFGP8ylmBp6n-4cAWaqAZ-SJYMz9tN1Sul95FHk=',
    },
    {
      id: 5,
      title: 'ข้าวขาว 5%',
      description: 'ข้าวขาวคุณภาพดี เมล็ดสวย สำหรับร้านอาหารและบริโภคทั่วไป',
      price: 150,
      stock: 1000,
      riceStandard: 'general',
      imageUrl: 'https://media.istockphoto.com/id/1193203404/th/%E0%B8%A3%E0%B8%B9%E0%B8%9B%E0%B8%96%E0%B9%88%E0%B8%B2%E0%B8%A2/%E0%B8%82%E0%B9%89%E0%B8%B2%E0%B8%A7%E0%B8%AB%E0%B8%AD%E0%B8%A1%E0%B8%A1%E0%B8%B0%E0%B8%A5%E0%B8%B4%E0%B9%83%E0%B8%99%E0%B8%8A%E0%B8%B2%E0%B8%A1%E0%B9%84%E0%B8%A1%E0%B9%89.jpg?s=612x612&w=0&k=20&c=abS9Hn2XYOJfsraRe-TiQwSBC-K_0W8B58KXlbFrQoA=',
    },
    {
      id: 6,
      title: 'ข้าวเหนียว กข6',
      description: 'ข้าวเหนียวพันธุ์ดี หอม นุ่ม นาน ไม่แข็งตัวง่าย',
      price: 190,
      stock: 200,
      riceStandard: 'general',
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    },
  ];
}

const LOCAL_STORAGE_KEY = 'agrimatch_products_v3';

export function getStoredProducts(): Product[] {
  if (typeof window === 'undefined') {
    return loadProducts();
  }
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  
  if (!stored) {
    const initial = loadProducts();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  
  try {
    return JSON.parse(stored);
  } catch {
    return loadProducts();
  }
}

export function saveStoredProducts(products: Product[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
  }
}

export function addStoredProduct(product: Omit<Product, 'id'>): Product {
  const products = getStoredProducts();
  const nextId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
  
  // Safe image handling to prevent LocalStorage 5MB quota exceeded error when uploading large photos
  let safeImageUrl = product.imageUrl;
  if (safeImageUrl && safeImageUrl.startsWith('data:image/') && safeImageUrl.length > 50000) {
    safeImageUrl = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=80';
  }

  const newProduct = { ...product, imageUrl: safeImageUrl, id: nextId };
  products.unshift(newProduct);
  
  try {
    saveStoredProducts(products);
  } catch (err) {
    console.warn('LocalStorage quota exceeded, saving with default image');
    // Fallback if quota is still exceeded
    products[0].imageUrl = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=80';
    try {
      saveStoredProducts(products);
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }
  return newProduct;
}

export function updateStoredProduct(product: Product): void {
  const products = getStoredProducts();
  const idx = products.findIndex(p => p.id === product.id);
  if (idx !== -1) {
    products[idx] = product;
    saveStoredProducts(products);
  }
}

export function deleteStoredProduct(id: number): void {
  const products = getStoredProducts();
  const filtered = products.filter(p => p.id !== id);
  saveStoredProducts(filtered);
}
