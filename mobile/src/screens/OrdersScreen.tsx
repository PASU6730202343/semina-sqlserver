import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { apiRequest } from '../../api';
import { Page } from '../components/Page';
import { styles } from '../theme';
import { imageUrl } from '../utils';

type Order = { id: number; product_title?: string; product_image_url?: string; unit_price: number; quantity: number; total_amount: number; status: string };
const statusLabel: Record<string, string> = { pending: 'รอผู้ขายยืนยัน', confirmed: 'ยืนยันแล้ว', shipped: 'จัดส่งแล้ว', cancelled: 'ยกเลิกแล้ว' };

export function OrdersScreen() {
  const navigation = useNavigation<any>();
  const [orders, setOrders] = useState<Order[]>([]); const [loading, setLoading] = useState(true); const [cancelling, setCancelling] = useState<number | null>(null);
  const loadOrders = async () => { setLoading(true); try { const result = await apiRequest('/orders/my'); setOrders(result.data || []); } catch (error: any) { Alert.alert('โหลดรายการไม่สำเร็จ', error.message || 'กรุณาลองใหม่อีกครั้ง'); } finally { setLoading(false); } };
  useEffect(() => { loadOrders(); }, []);
  const cancelOrder = (order: Order) => { if (order.status !== 'pending') return; Alert.alert('ยืนยันการยกเลิก', 'คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำสั่งซื้อนี้?', [{ text: 'ไม่ใช่', style: 'cancel' }, { text: 'ยกเลิกคำสั่งซื้อ', style: 'destructive', onPress: async () => { setCancelling(order.id); try { await apiRequest(`/orders/${order.id}`, { method: 'PUT', body: JSON.stringify({ status: 'cancelled' }) }); setOrders((current) => current.map((item) => item.id === order.id ? { ...item, status: 'cancelled' } : item)); Alert.alert('สำเร็จ', 'ยกเลิกคำสั่งซื้อเรียบร้อยแล้ว Stock ถูกคืนเข้าระบบแล้ว'); await loadOrders(); } catch (error: any) { Alert.alert('ยกเลิกไม่สำเร็จ', error.message || 'กรุณาลองใหม่อีกครั้ง'); } finally { setCancelling(null); } } }]); };
  return <Page nav={false}><View style={styles.ordersHeading}><Pressable onPress={() => navigation.goBack()} style={styles.backButton}><Text style={styles.backIcon}>‹</Text></Pressable><View><Text style={styles.dashboardLabel}>DASHBOARD ผู้ซื้อ</Text><Text style={styles.title}>รายการสั่งซื้อของฉัน</Text></View></View><View style={styles.ordersPanel}><View style={styles.ordersPanelHeader}><Text style={styles.panelTitle}>🛍  คำสั่งซื้อทั้งหมด</Text><Text style={styles.countBadge}>{orders.length} รายการ</Text></View>{loading ? <ActivityIndicator color="#059669" style={{ margin: 35 }} /> : orders.length === 0 ? <Text style={styles.empty}>ยังไม่มีรายการสั่งซื้อ</Text> : orders.map((order) => <View key={order.id} style={styles.orderItem}><Image source={{ uri: imageUrl(order.product_image_url) }} style={styles.orderImage} /><View style={styles.orderInfo}><Text style={styles.orderId}>รหัสสั่งซื้อ: #{order.id}</Text><Text style={styles.orderProduct}>{order.product_title || 'สินค้า'}</Text><Text style={styles.orderMeta}>ราคา: ฿{Number(order.unit_price || 0).toLocaleString('th-TH')} × {order.quantity}</Text><Text style={[styles.statusBadge, { color: order.status === 'pending' ? '#b45309' : order.status === 'cancelled' ? '#64748b' : '#047857' }]}>{statusLabel[order.status] || order.status}</Text></View><View style={styles.orderTotal}><Text style={styles.totalLabel}>ยอดรวม</Text><Text style={styles.totalPrice}>฿{Number(order.total_amount || 0).toLocaleString('th-TH')}</Text>{order.status === 'pending' && <Pressable disabled={cancelling === order.id} onPress={() => cancelOrder(order)} style={styles.cancelButton}><Text style={styles.cancelText}>{cancelling === order.id ? 'กำลังยกเลิก...' : '♜ ยกเลิก'}</Text></Pressable>}</View></View>)}</View></Page>;
}
