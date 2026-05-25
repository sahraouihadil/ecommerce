import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { authApi } from '../../src/api/auth';
import { Button, Input, GoldDivider } from '../../src/components/ui';
import { Colors } from '../../src/constants/colors';
import { extractError } from '../../src/utils/format';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await authApi.register({ username: username.trim(), password, email: email.trim(), phone_num: phone.trim() });
      if (data.action === 'verify') {
        router.push({ pathname: '/(auth)/verify-code', params: { email: data.email, username: data.user_name } });
      }
    } catch (err: any) {
      setError(extractError(err, 'Registration failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.label}>JOIN AROOM</Text>
          <Text style={s.title}>Create Account</Text>
          <Text style={s.subtitle}>Begin your journey.</Text>
        </View>
        <GoldDivider style={{ maxWidth: 180, alignSelf: 'center' }} />
        {error ? <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View> : null}
        <Input label="Username" value={username} onChangeText={setUsername} placeholder="your username" autoCapitalize="none" icon={<Ionicons name="person-outline" size={18} color={Colors.textMuted} />} />
        <Input label="Email" value={email} onChangeText={setEmail} placeholder="your@email.com" keyboardType="email-address" autoCapitalize="none" icon={<Ionicons name="mail-outline" size={18} color={Colors.textMuted} />} />
        <Input label="Phone" value={phone} onChangeText={setPhone} placeholder="+213 6XX XXX XXX" keyboardType="phone-pad" icon={<Ionicons name="call-outline" size={18} color={Colors.textMuted} />} />
        <Input label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry icon={<Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />} />
        <Button title="Create Account" onPress={handleRegister} loading={loading} style={{ marginTop: 8 }} />
        <Button title="Already have an account? Sign In" onPress={() => router.back()} variant="outline" style={{ marginTop: 12 }} textStyle={{ fontSize: 11, letterSpacing: 1 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 24 },
  label: { fontSize: 10, fontWeight: '600', letterSpacing: 4, color: Colors.textMuted, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.text, letterSpacing: 1, marginBottom: 6 },
  subtitle: { fontSize: 16, fontStyle: 'italic', color: Colors.textSecondary, fontWeight: '300' },
  errorBox: { backgroundColor: Colors.errorBg, borderWidth: 1, borderColor: 'rgba(200,80,80,0.22)', borderRadius: 12, padding: 12, marginBottom: 12 },
  errorText: { fontSize: 12, color: Colors.error, textAlign: 'center' },
});
