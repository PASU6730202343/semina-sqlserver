import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Pressable, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { fetch as expoFetch } from 'expo/fetch';
import { File } from 'expo-file-system';
import { useNavigation } from '@react-navigation/native';
import { API_ORIGIN, API_URL, apiRequest, getSession } from '../../api';
import { Button } from '../components/Button';
import { Page } from '../components/Page';
import { styles } from '../theme';

const varieties = [
  { value: 'jasmine', label: 'ข้าวหอมมะลิ' },
  { value: 'white', label: 'ข้าวขาวทั่วไป' },
  { value: 'sticky', label: 'ข้าวเหนียว' },
];

const photoTips = [
  ['▦', 'กระจายเมล็ดข้าว', 'วางเมล็ดให้ห่างกันพอประมาณ ไม่ให้เกยหรือซ้อนทับกัน'],
  ['▦', 'ใช้พื้นหลังสีเข้ม', 'เลือกพื้นหลังสีเข้มและเรียบ เช่น แผ่นกระดาษสีดำ'],
  ['▣', 'ถ่ายจากด้านบน', 'วางกล้องตรงเหนือเมล็ดข้าว ให้กล้องทำมุมประมาณ 90 องศา'],
  ['☼', 'ให้แสงสว่างทั่วถึง', 'ถ่ายในที่สว่าง หลีกเลี่ยงแสงสะท้อนและเงามืดที่บังเมล็ด'],
  ['⌾', 'เช็กความคมชัด', 'แตะโฟกัสก่อนถ่าย และตรวจว่าภาพไม่สั่นหรือเบลอ'],
];

export function AIScreen({ detect = false }: { detect?: boolean }) {
  const navigation = useNavigation<any>();
  const [session, setSession] = useState<any>();
  const [uri, setUri] = useState<string>();
  const [variety, setVariety] = useState('jasmine');
  const [varietyPickerOpen, setVarietyPickerOpen] = useState(false);
  const [source, setSource] = useState<'library' | 'camera'>('library');
  const [result, setResult] = useState<any>();
  const [busy, setBusy] = useState(false);
  const [listingForm, setListingForm] = useState({ title: '', description: '', riceStandard: 'general', stock: '' });
  const [listingBusy, setListingBusy] = useState(false);
  const [listMessage, setListMessage] = useState<string>();

  useEffect(() => { getSession().then(setSession); }, []);

  const normalizeImage = async (imageUri: string) => {
    const converted = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 1280 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
    );
    return converted.uri;
  };

  const choose = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert('ต้องอนุญาตการเข้าถึงรูปภาพ');
    const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
    if (!picked.canceled) {
      // รูปจากแกลเลอรีเป็นไฟล์มาตรฐานอยู่แล้ว จึงไม่ต้องแปลงซ้ำ
      setSource('library');
      setUri(await normalizeImage(picked.assets[0].uri));
      setResult(undefined);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return Alert.alert('ต้องอนุญาตการใช้งานกล้อง');
    const captured = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.9,
      cameraType: ImagePicker.CameraType.back,
    });
    if (!captured.canceled) {
      setSource('camera');
      setUri(await normalizeImage(captured.assets[0].uri));
      setResult(undefined);
    }
  };

  const run = async () => {
    if (!uri) return Alert.alert('กรุณาอัปโหลดรูปภาพเมล็ดข้าว');
    setBusy(true);
    try {
      const imageFile = new File(uri);
      if (!imageFile.exists || imageFile.size <= 0) throw new Error('ไม่พบไฟล์รูปที่พร้อมส่ง');
      const form = new FormData();
      form.append('file', imageFile as any);
      if (!detect) form.append('rice_variety', variety);
      const endpoint = detect ? `${API_ORIGIN}/predict` : `${API_ORIGIN}/api/ai/predict-rice-grade`;
      const response = await expoFetch(endpoint, { method: 'POST', body: form });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.detail || 'วิเคราะห์รูปภาพไม่สำเร็จ');
      setResult(data);
    } catch (error: any) {
      Alert.alert('วิเคราะห์ไม่สำเร็จ', error?.message || 'เชื่อมต่อระบบ AI ไม่ได้');
    } finally {
      setBusy(false);
    }
  };

  const handleList = async () => {
    if (!uri || !analysis || !priceInfo || !listingForm.title.trim() || !listingForm.stock) {
      setListMessage('กรุณากรอกชื่อสินค้าและจำนวนสต็อกก่อนลงขาย');
      return;
    }
    const stock = Number(listingForm.stock);
    if (!Number.isInteger(stock) || stock <= 0) {
      setListMessage('สต็อกต้องเป็นจำนวนกิโลกรัมที่มากกว่า 0');
      return;
    }

    setListingBusy(true);
    setListMessage(undefined);
    try {
      const current = await getSession();
      if (!current?.token) throw new Error('กรุณาเข้าสู่ระบบใหม่');

      const imageForm = new FormData();
      imageForm.append('image', new File(uri) as any);
      const imageResponse = await expoFetch(`${API_URL}/products/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${current.token}` },
        body: imageForm,
      });
      const imageData = await imageResponse.json();
      if (!imageResponse.ok || !imageData.url) throw new Error(imageData.detail || 'ระบบบันทึกรูปภาพไม่สำเร็จ');

      await apiRequest('/products/', {
        method: 'POST',
        body: JSON.stringify({
          title: listingForm.title.trim(),
          description: listingForm.description.trim(),
          price: priceInfo.suggestedPrice,
          stock,
          rice_standard: listingForm.riceStandard,
          rice_variety: selectedVarietyLabel,
          unit: 'กิโลกรัม',
          image_url: imageData.url,
          broken_rice_percentage: Number(analysis.broken_percentage) || 0,
          ai_verified: true,
        }),
      });
      setListMessage(`ลงขาย "${listingForm.title.trim()}" ที่ราคา ฿${priceInfo.suggestedPrice}/กก. สำเร็จแล้ว`);
      setListingForm({ title: '', description: '', riceStandard: 'general', stock: '' });
    } catch (error: any) {
      setListMessage(error?.message || 'ลงขายสินค้าไม่สำเร็จ');
    } finally {
      setListingBusy(false);
    }
  };

  if (session === undefined) return <Page nav={false}><ActivityIndicator color="#059669" /></Page>;

  if (!session || !['seller', 'farmer', 'admin'].includes(session.agrimatch_role)) {
    return (
      <Page nav={false}>
        <View style={styles.permissionCard}>
          <Text style={styles.permissionIcon}>🔒</Text>
          <Text style={styles.title}>ระบบประเมินเกรดข้าวด้วย AI</Text>
          <Text style={styles.subtitle}>ฟีเจอร์นี้สำหรับผู้ขาย/เกษตรกรและแอดมินเท่านั้น บัญชีผู้ซื้อไม่สามารถใช้งานระบบตรวจเกรดข้าวได้</Text>
          <Button title="กลับหน้าหลัก" onPress={() => navigation.navigate('Home')} />
        </View>
      </Page>
    );
  }

  const analysis = result?.analysis;
  const price = result?.price_recommendation;
  const selectedVarietyLabel = varieties.find((item) => item.value === variety)?.label || variety;
  const qualityFactor = Math.max(0.5, 1 - (Number(analysis?.broken_percentage) || 0) / 100);
  const paddyPricePerKg = Number(price?.suggested_price || 0) / 1000;
  const priceInfo = price ? {
    suggestedPrice: Math.max(1, Math.round(paddyPricePerKg * 2.8)),
    minPrice: Math.max(1, Math.round(paddyPricePerKg * 2.8 * 0.9)),
    maxPrice: Math.max(1, Math.round(paddyPricePerKg * 2.8 * 1.1)),
    matchedRiceType: selectedVarietyLabel,
    qualityFactor,
  } : undefined;

  return (
    <Page nav={false}>
      <Text style={styles.aiTitle}>✦ ระบบประเมินเกรดข้าวด้วย AI</Text>
      <Text style={styles.aiSubtitle}>สแกนภาพหรืออัปโหลดภาพตัวอย่างเมล็ดข้าวของคุณเพื่อให้ AI ช่วยประเมินสัดส่วนข้าวหักและราคา</Text>
      <View style={styles.aiColumns}>
        <View style={styles.aiUploadCard}>
          <View style={styles.aiTabs}>
            <Pressable style={source === 'library' ? styles.aiTabActive : styles.aiTab} onPress={choose}><Text>▣ อัปโหลดรูปภาพ</Text></Pressable>
            <Pressable style={source === 'camera' ? styles.aiTabActive : styles.aiTab} onPress={takePhoto}><Text>◉ สแกนด้วยกล้อง</Text></Pressable>
          </View>
          <Pressable onPress={choose} style={styles.uploadBox}>
            {uri ? <Image source={{ uri }} style={styles.uploadPreview} /> : <><Text style={styles.uploadIcon}>☁</Text><Text style={styles.uploadTitle}>คลิกเพื่อเลือกรูปภาพ</Text><Text style={styles.uploadHint}>รองรับ JPG, PNG (แนะนำให้วางเมล็ดข้าวบนพื้นทึบ)</Text></>}
          </Pressable>
          {!detect && <><Text style={styles.label}>ระบุสายพันธุ์ข้าว</Text><Pressable style={styles.select} onPress={() => setVarietyPickerOpen(true)}><Text>{varieties.find((item) => item.value === variety)?.label}</Text><Text>⌄</Text></Pressable><Modal visible={varietyPickerOpen} transparent animationType="fade" onRequestClose={() => setVarietyPickerOpen(false)}><Pressable style={styles.modalBackdrop} onPress={() => setVarietyPickerOpen(false)}><View style={styles.orderModal}><Text style={styles.modalTitle}>ระบุสายพันธุ์ข้าว</Text>{varieties.map((item) => <Pressable key={item.value} style={styles.roleOption} onPress={() => { setVariety(item.value); setVarietyPickerOpen(false); }}><Text style={item.value === variety ? styles.resultGrade : undefined}>{item.label}</Text></Pressable>)}</View></Pressable></Modal></>}
          <Button title={busy ? 'กำลังวิเคราะห์...' : '✦ ส่งผลเพื่อประเมินราคา'} onPress={run} />
        </View>
        <View style={styles.aiResultCard}>
          <Text style={styles.aiResultTitle}>ผลการวิเคราะห์</Text>
          {busy ? <ActivityIndicator color="#7c3aed" style={{ marginTop: 70 }} /> : !result ? <View style={styles.emptyAI}><Text style={styles.emptyAIIcon}>✧</Text><Text style={styles.emptyAIText}>ผลการประเมินจะแสดงที่นี่</Text></View> : <View><Text style={styles.resultMessage}>{result.message}</Text>{analysis && <View style={styles.analysisGrid}><Metric label="เมล็ดทั้งหมด" value={analysis.total_grains} /><Metric label="เมล็ดสมบูรณ์" value={analysis.whole_grains} /><Metric label="เมล็ดหัก" value={analysis.broken_grains} /><Metric label="เปอร์เซ็นต์หัก" value={`${analysis.broken_percentage}%`} /></View>}{priceInfo && <View style={styles.priceRecommendation}><Text style={styles.label}>ราคาแนะนำต่อกิโลกรัม (จากราคากลาง{priceInfo.matchedRiceType})</Text><Text style={styles.recommendedPrice}>฿{priceInfo.suggestedPrice.toLocaleString('th-TH')}</Text><Text style={styles.hint}>ช่วงราคาตลาด ฿{priceInfo.minPrice.toLocaleString('th-TH')} - ฿{priceInfo.maxPrice.toLocaleString('th-TH')} / กก. คำนวณตามสัดส่วนข้าวหัก</Text></View>}<Text style={styles.resultGrade}>{analysis?.rice_grade_estimate}</Text></View>}
          {priceInfo && (session.agrimatch_role === 'seller' || session.agrimatch_role === 'admin') && <View style={{ borderTopWidth: 1, borderTopColor: '#f1f5f9', marginTop: 18, paddingTop: 16, gap: 10 }}>
            <Text style={styles.detailHeading}>🛍 ลงขายสินค้านี้เลย</Text>
            <TextInput style={styles.field} value={listingForm.title} onChangeText={(value) => setListingForm({ ...listingForm, title: value })} placeholder="ชื่อสายพันธุ์ข้าว เช่น ข้าวหอมมะลิ 105" />
            <TextInput style={[styles.field, styles.noteField]} value={listingForm.description} onChangeText={(value) => setListingForm({ ...listingForm, description: value })} placeholder="รายละเอียดสินค้า (ไม่บังคับ)" multiline />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable style={[styles.select, { flex: 1 }]} onPress={() => setListingForm({ ...listingForm, riceStandard: listingForm.riceStandard === 'general' ? 'GI' : listingForm.riceStandard === 'GI' ? 'Organic' : listingForm.riceStandard === 'Organic' ? 'GAP' : 'general' })}><Text>{listingForm.riceStandard === 'general' ? 'ทั่วไป (ไม่มีมาตรฐาน)' : listingForm.riceStandard}</Text><Text>⌄</Text></Pressable>
              <TextInput style={[styles.field, { flex: 1 }]} value={listingForm.stock} onChangeText={(value) => setListingForm({ ...listingForm, stock: value })} placeholder="สต็อก (กก.)" keyboardType="numeric" />
            </View>
            {listMessage && <Text style={{ color: listMessage.includes('สำเร็จ') ? '#047857' : '#dc2626', fontSize: 12, fontWeight: '700' }}>{listMessage}</Text>}
            <Button title={listingBusy ? 'กำลังลงขาย...' : `ลงขายที่ ฿${priceInfo.suggestedPrice}/กก.`} onPress={handleList} />
          </View>}
        </View>
      </View>
      <View style={styles.guidelineCard}>
        <Text style={styles.guidelineEyebrow}>ถ่ายภาพให้ AI อ่านง่าย</Text>
        <Text style={styles.guidelineTitle}>คำแนะนำการถ่ายภาพข้าว</Text>
        <Text style={styles.guidelineText}>ถ่ายภาพให้เห็นเมล็ดชัด ช่วยให้ AI ตรวจเมล็ดเต็มและเมล็ดหักได้ดีขึ้น</Text>
        <View style={{ marginTop: 12, borderWidth: 1, borderColor: '#a7f3d0', borderRadius: 12, backgroundColor: '#ecfdf5', padding: 10 }}>
          <Image source={require('../../assets/frontend/rice-photo-source.png.png')} style={styles.guidelineImage} />
          <Text style={{ color: '#047857', fontSize: 11, fontWeight: '800', marginTop: 10 }}>✓ ตัวอย่างภาพที่เหมาะกับการสแกน</Text>
          <Text style={styles.guidelineText}>ภาพนี้จัดเมล็ดแยกกันบนพื้นหลังเข้ม ถ่ายจากด้านบน และเห็นขอบเมล็ดได้ชัด ใช้เป็นแนวทางก่อนถ่ายภาพของคุณได้</Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          {photoTips.map(([icon, title, description], index) => <View key={title} style={{ width: '48%', minHeight: 92, flexDirection: 'row', gap: 8, padding: 10, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, backgroundColor: '#f8fafc' }}><Text style={{ color: '#047857', backgroundColor: '#d1fae5', borderRadius: 8, padding: 7, height: 32 }}>{icon}</Text><View style={{ flex: 1 }}><Text style={{ color: '#0f172a', fontSize: 11, fontWeight: '800' }}>{index + 1}. {title}</Text><Text style={{ color: '#475569', fontSize: 10, lineHeight: 15, marginTop: 3 }}>{description}</Text></View></View>)}
        </View>
      </View>
    </Page>
  );
}

function Metric({ label, value }: { label: string; value: any }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}
