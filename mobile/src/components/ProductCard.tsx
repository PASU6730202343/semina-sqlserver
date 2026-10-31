import { Image, Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Product } from '../types';
import { styles } from '../theme';
import { imageUrl } from '../utils';

export function ProductCard({ product }: { product: Product }) {
  const navigation = useNavigation<any>();
  return <View style={styles.productCard}><Image source={{ uri: imageUrl(product.image_url) }} style={styles.productImage} /><View style={styles.productBody}><Text numberOfLines={1} style={styles.cardTitle}>{product.title}</Text><Text numberOfLines={1} style={styles.owner}>{product.owner_name || 'ไม่ระบุผู้ขาย'}</Text><Text style={styles.price}>฿{Number(product.price).toLocaleString('th-TH')}</Text><Pressable onPress={() => navigation.navigate('Product', { product })} style={styles.button}><Text style={styles.buttonText}>รายละเอียด / สั่งซื้อ</Text></Pressable></View></View>;
}
