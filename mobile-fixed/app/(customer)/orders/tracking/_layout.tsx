import { Stack } from 'expo-router';
import { Colors } from '../../../../src/constants/colors';

export default function TrackingLayout() {
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
