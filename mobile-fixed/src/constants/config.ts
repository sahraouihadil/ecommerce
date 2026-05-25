import { Platform } from 'react-native';

// API configuration
// Android emulator uses 10.0.2.2 to reach host's localhost
// Physical device (Expo Go) needs your LAN IP e.g. 192.168.x.x
const getApiUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;
  // Default for Android emulator
  if (Platform.OS === 'android') return 'http://10.0.2.2:8000';
  // iOS simulator can use localhost
  return 'http://localhost:8000';
};

export const Config = {
  API_URL: getApiUrl(),
  APP_NAME: 'ARoom',
  APP_VERSION: '1.0.0',
} as const;
