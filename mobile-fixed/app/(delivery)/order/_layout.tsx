import { Stack } from 'expo-router';
import { Colors } from '../../../src/constants/colors';

export default function DeliveryOrderLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.bg },
        animation: 'slide_from_right',
      }}
    />
  );
}
