import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, GoldDivider } from '../src/components/ui';
import { Colors } from '../src/constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.container}>
      <View style={s.content}>
        <View style={s.iconCircle}>
          <Ionicons name="compass-outline" size={48} color={Colors.accent} />
        </View>
        <Text style={s.code}>404</Text>
        <Text style={s.title}>Page Not Found</Text>
        <GoldDivider style={{ maxWidth: 100 }} />
        <Text style={s.subtitle}>The room you're looking for doesn't exist.</Text>
        <Button title="Go Home" onPress={() => router.replace('/')} style={{ marginTop: 24, minWidth: 180 }} />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8 },
  iconCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(200,169,106,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  code: { fontSize: 48, fontWeight: '700', color: Colors.accent, letterSpacing: 4 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.text },
  subtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
});
