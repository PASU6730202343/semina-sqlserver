import { Alert, Text, TextInput } from 'react-native';
import { Button } from '../components/Button';
import { Page } from '../components/Page';
import { styles } from '../theme';

export function ChangePasswordScreen() { return <Page nav={false}><Text style={styles.title}>เปลี่ยนรหัสผ่าน</Text><TextInput style={styles.field} placeholder="รหัสผ่านเดิม" secureTextEntry /><TextInput style={styles.field} placeholder="รหัสผ่านใหม่" secureTextEntry /><Button title="บันทึก" onPress={() => Alert.alert('แจ้งเตือน', 'Backend ปัจจุบันยังไม่มี endpoint เปลี่ยนรหัสผ่าน')} /></Page>; }
