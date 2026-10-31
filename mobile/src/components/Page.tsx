import { ReactNode } from 'react';
import { SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { BottomNav } from './BottomNav';
import { Header } from './Header';
import { styles } from '../theme';

export function Page({ children, nav = true }: { children: ReactNode; nav?: boolean }) {
  return <SafeAreaView style={styles.safe}><StatusBar barStyle="dark-content" /><Header /><ScrollView contentContainerStyle={[styles.page, nav && styles.pageWithNav]}>{children}</ScrollView>{nav && <BottomNav />}</SafeAreaView>;
}
