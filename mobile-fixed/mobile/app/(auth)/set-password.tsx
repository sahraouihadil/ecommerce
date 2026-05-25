import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { authApi } from '../../src/api/auth';
import { Button, Input, GoldDivider } from '../../src/components/ui';
import { Colors } from '../../src/constants/colors';
import { extractError } from '../../src/utils/format';
import { Ionicons } from '@expo/vector-icons';

export default function SetPasswordScreen() {
  const { username = '' } = useLocalSearchParams<{ username: string }>();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSetPassword = async () => {
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setError('');
    setLoading(true);
    try {
      await authApi.setPassword(username as string, password);
      router.replace('/(auth)/login');
    } catch (err: any) {
      setError(extractError(err, 'Failed to set password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Text style={s.label}>FINAL STEP</Text>
          <Text style={s.title}>Set Password</Text>
          <Text style={s.subtitle}>Choose a strong password.</Text>
        </View>
        <GoldDivider style={{ maxWidth: 120, alignSelf: 'center' }} />
        {error ? <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View> : null}
        <Input label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry icon={<Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />} />
        <Input label="Confirm Password" value={confirm} onChangeText={setConfirm} placeholder="••••••••" secureTextEntry icon={<Ionicons name="shield-checkmark-outline" size={18} color={Colors.textMuted} />} />
        <Button title="Set Password & Sign In" onPress={handleSetPassword} loading={loading} style={{ marginTop: 8 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  label: { fontSize: 10, fontWeight: '600', letterSpacing: 4, color: Colors.textMuted, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  subtitle: { fontSize: 15, fontStyle: 'italic', color: Colors.textSecondary },
  errorBox: { backgroundColor: Colors.errorBg, borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(200,80,80,0.22)' },
  errorText: { fontSize: 12, color: Colors.error, textAlign: 'center' },
});
