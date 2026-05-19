/**
 * Stub Screen Factory — All excluded domains get a "Coming Soon" placeholder
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, GoldDivider } from '../../src/components/ui';
import { Colors } from '../../src/constants/colors';
import { useAuth } from '../../src/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

interface StubProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}

export function StubScreen({ title, icon, description }: StubProps) {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <SafeAreaView style={s.container}>
      <View style={s.content}>
        <View style={s.iconCircle}>
          <Ionicons name={icon} size={40} color={Colors.accent} />
        </View>
        <Text style={s.label}>COMING SOON</Text>
        <Text style={s.title}>{title}</Text>
        <GoldDivider style={{ maxWidth: 120 }} />
        <Text style={s.description}>{description}</Text>
        <View style={s.actions}>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            variant="outline"
            style={{ flex: 1 }}
          />
          <Button
            title="Sign Out"
            onPress={async () => { await logout(); router.replace('/(auth)/login'); }}
            variant="danger"
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(200,169,106,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  label: { fontSize: 10, fontWeight: '600', letterSpacing: 5, color: Colors.textMuted },
  title: { fontSize: 26, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  description: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, maxWidth: 280 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 16, width: '100%' },
});
