import { Image, Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styles } from '../theme';

export function Header() {
  const navigation = useNavigation<any>();
  return <View style={styles.header}><Pressable onPress={() => navigation.navigate('Home')} style={styles.brandRow}><Image source={require('../../assets/frontend/logo.png')} style={styles.logo} /><Text style={styles.brand}>Smart Rice{`\n`}Marketplace-AI</Text></Pressable><Pressable onPress={() => navigation.navigate('Settings')} style={styles.menu}><Text style={styles.menuText}>☰</Text></Pressable></View>;
}
