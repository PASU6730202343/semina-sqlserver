import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ImageBackground, Pressable, Text, TextInput, View } from 'react-native';
import { apiRequest } from '../../api';
import { Page } from '../components/Page';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';
import { styles } from '../theme';

export function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => { apiRequest('/products/').then((result) => setProducts(result.data || [])).finally(() => setLoading(false)); }, []);
  const filtered = useMemo(() => products.filter((product) => `${product.title} ${product.owner_name || ''} ${product.rice_standard || ''}`.toLowerCase().includes(search.toLowerCase())), [products, search]);
  return <Page>
    <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1600&q=80' }} imageStyle={styles.heroImage} style={styles.hero}>
      <Text style={styles.pill}>✦ แพลตฟอร์มวิเคราะห์เกรดข้าวด้วย AI</Text>
      <Text style={styles.heroTitle}>ยกระดับตลาดข้าวไทย{`\n`}ด้วยเทคโนโลยีปัญญาประดิษฐ์</Text>
      <Text style={styles.heroSub}>เชื่อมต่อเกษตรกรผู้ปลูกและผู้รับซื้อโดยตรง โปร่งใสและยุติธรรมด้วยระบบ AI</Text>
      <TextInput value={search} onChangeText={setSearch} placeholder="ค้นหาพันธุ์ข้าว, มาตรฐาน หรือชื่อเกษตรกร..." placeholderTextColor="#94a3b8" style={styles.search} />
    </ImageBackground>
    <View style={styles.stats}><Stat n={loading ? '—' : String(products.length)} t="รายการสินค้า" /><Stat n="5" t="คำสั่งซื้อสำเร็จ" /><Stat n="15" t="สมาชิกในระบบ" /></View>
    <Pressable style={styles.promo}><Text style={styles.promoTitle}>✦ สิทธิพิเศษสำหรับสมาชิกใหม่</Text><Text style={styles.promoSub}>สมัครวันนี้ รับเครดิตตรวจสอบคุณภาพข้าวด้วย AI ฟรี</Text></Pressable>
    <View style={styles.section}><Text style={styles.sectionTitle}>ตลาดสินค้าเกษตรอัจฉริยะ</Text><Text style={styles.result}>พบ {filtered.length} รายการ</Text></View>
    {loading ? <ActivityIndicator color="#059669" style={{ marginTop: 40 }} /> : <View style={styles.grid}>{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</View>}
  </Page>;
}

function Stat({ n, t }: { n: string; t: string }) { return <View style={styles.stat}><Text style={styles.statN}>{n}</Text><Text style={styles.statT}>{t}</Text></View>; }
