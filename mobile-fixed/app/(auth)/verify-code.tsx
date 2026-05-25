import React, { useState, useRef } from 'react';
import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { authApi } from '../../src/api/auth';
import { Button, GoldDivider } from '../../src/components/ui';
import { Colors } from '../../src/constants/colors';
import { extractError } from '../../src/utils/format';

export default function VerifyCodeScreen() {
  const { email = '', username = '' } = useLocalSearchParams<{ email: string; username: string }>();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const refs = useRef<(TextInput | null)[]>([]);
  const router = useRouter();

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...code];
    next[index] = value.slice(-1);
    setCode(next);
    if (value && index < 5) refs.current[index + 1]?.focus();
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !code[index] && index > 0) refs.current[index - 1]?.focus();
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length < 6) { setError('Please enter the complete 6-digit code.'); return; }
    setError('');
    setLoading(true);
    try {
      await authApi.verifyCode(email, fullCode);
      router.push({ pathname: '/(auth)/set-password', params: { username, email } });
    } catch (err: any) {
      setError(extractError(err, 'Invalid or expired code.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <Text style={s.label}>VERIFICATION</Text>
        <Text style={s.title}>Enter Code</Text>
        <Text style={s.subtitle}>A 6-digit code was sent to</Text>
        <Text style={s.email}>{email}</Text>
        <GoldDivider style={{ maxWidth: 120, alignSelf: 'center' }} />
        <View style={s.codeRow}>
          {code.map((digit, i) => (
            <TextInput
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              value={digit}
              onChangeText={(v) => handleChange(i, v)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(i, nativeEvent.key)}
              keyboardType="number-pad"
              maxLength={1}
              style={[s.codeInput, digit ? s.codeActive : null]}
            />
          ))}
        </View>
        {error ? <Text style={s.errorText}>{error}</Text> : null}
        <Button title="Verify Code" onPress={handleVerify} loading={loading} style={{ marginTop: 8 }} />
        <Button title="Resend Code" onPress={() => authApi.register({ username: username as string, password: '', email: email as string, phone_num: '' }).catch(() => {})} variant="outline" style={{ marginTop: 12 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 10, fontWeight: '600', letterSpacing: 4, color: Colors.textMuted, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  subtitle: { fontSize: 15, fontStyle: 'italic', color: Colors.textSecondary, marginBottom: 4 },
  email: { fontSize: 12, letterSpacing: 1, color: Colors.accentDark, marginBottom: 16 },
  codeRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  codeInput: { width: 48, height: 56, textAlign: 'center', backgroundColor: Colors.bgInput, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12, fontSize: 22, fontWeight: '600', color: Colors.text },
  codeActive: { borderColor: Colors.borderFocused },
  errorText: { fontSize: 12, color: Colors.error, textAlign: 'center', marginBottom: 8 },
});
