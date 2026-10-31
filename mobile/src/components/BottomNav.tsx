import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getSession } from '../../api';
import { styles } from '../theme';

export function BottomNav() {
  const navigation = useNavigation<any>(); const [role, setRole] = useState('buyer');
  useEffect(() => { getSession().then((session) => setRole(session?.agrimatch_role || 'buyer')); }, []);
  const seller = role === 'seller' || role === 'farmer' || role === 'admin';
  const items = seller ? [['Home', '⌂', 'หน้าหลัก'], ['Prices', '✦', 'ราคา'], ['AIGrading', '▣', 'AI ข้าว'], ['ManageProducts', '▤', 'จัดการสินค้า'], ['Settings', '♙', 'โปรไฟล์']] : [['Home', '⌂', 'หน้าหลัก'], ['Prices', '✦', 'ราคา'], ['AIGrading', '▣', 'AI ข้าว'], ['Orders', '🛒', 'คำสั่งซื้อ'], ['Settings', '♙', 'โปรไฟล์']];
  return <View style={styles.bottom}>{items.map(([route, icon, label]) => <Pressable key={route} onPress={() => navigation.navigate(route)} style={styles.navItem}><Text style={styles.navIcon}>{icon}</Text><Text style={styles.navText}>{label}</Text></Pressable>)}</View>;
}
