import { API_ORIGIN } from '../api';

export const imageUrl = (value?: string) => value ? (value.startsWith('http') ? value : `${API_ORIGIN}${value}`) : 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=80';
