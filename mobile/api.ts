import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_URL = 'http://119.59.102.161:3009/api';
export const API_ORIGIN = 'http://119.59.102.161:3009';

export async function apiRequest(path: string, options: RequestInit = {}) {
  const token = await AsyncStorage.getItem('token');
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || data.message || 'เกิดข้อผิดพลาดจากระบบ');
  return data;
}

export async function login(username: string, password: string) {
  const data = await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
  await AsyncStorage.multiSet([
    ['token', data.access_token],
    ['agrimatch_is_logged_in', 'true'],
    ['agrimatch_username', data.user?.full_name || data.user?.username || username],
    ['agrimatch_role', data.user?.role || 'buyer'],
    ['agrimatch_user_id', String(data.user?.id || '')],
  ]);
  return data;
}

export async function logout() {
  await AsyncStorage.multiRemove(['token', 'agrimatch_is_logged_in', 'agrimatch_username', 'agrimatch_role', 'agrimatch_user_id']);
}

export async function getSession() {
  const values = await AsyncStorage.multiGet(['token', 'agrimatch_is_logged_in', 'agrimatch_username', 'agrimatch_role', 'agrimatch_user_id']);
  const session = Object.fromEntries(values.map(([key, value]) => [key, value || '']));
  return session.token ? session : null;
}
