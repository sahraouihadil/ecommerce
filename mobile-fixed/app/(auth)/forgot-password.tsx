import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { authApi } from '../../src/api/auth';
import { Button, Input, GoldDivider } from '../../src/components/ui';
import { Colors } from '../../src/constants/colors';
import { extractError } from '../../src/utils/format';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<'request' | 'verify' | 'reset'>('request');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRequest = async () => {
    if (!username.trim() || !email.trim()) { setError('Username and email are required.'); return; }
    setError(''); setLoading(true);
    try {
      await authApi.forgotPassword(username.trim(), email.trim());
      setStep('verify');
    } catch (err: any) {
      setError(extractError(err, 'User not found.'));
    } finally { setLoading(false); }
  };

  const handleVerify = async () => {
    if (!code.trim()) { setError('Enter the code.'); return; }
    setError(''); setLoading(true);
    try {
      await authApi.verifyResetCode(email, code.trim());
      setStep('reset');
    } catch (err: any) {
      setError(extractError(err, 'Invalid code.'));
    } finally { setLoading(false); }
  };

  const handleReset = async () => {
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError(''); setLoading(true);
    try {
      await authApi.resetPassword(email, code, newPassword);
      router.replace('/(auth)/login');
    } catch (err: any) {
      setError(extractError(err, 'Failed to reset password.'));
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Text style={s.label}>{step === 'request' ? 'FORGOT PASSWORD' : step === 'verify' ? 'CHECK YOUR EMAIL' : 'NEW PASSWORD'}</Text>
          <Text style={s.title}>{step === 'request' ? 'Reset Password' : step === 'verify' ? 'Enter Code' : 'Set New Password'}</Text>
        </View>
        <GoldDivider style={{ maxWidth: 120, alignSelf: 'center' }} />
        {error ? <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View> : null}

        {step === 'request' && <>
          <Input label="Username" value={username} onChangeText={setUsername} placeholder="your username" autoCapitalize="none" icon={<Ionicons name="person-outline" size={18} color={Colors.textMuted} />} />
          <Input label="Email" value={email} onChangeText={setEmail} placeholder="your@email.com" keyboardType="email-address" autoCapitalize="none" icon={<Ionicons name="mail-outline" size={18} color={Colors.textMuted} />} />
          <Button title="Send Reset Code" onPress={handleRequest} loading={loading} />
        </>}

        {step === 'verify' && <>
          <Input label="Verification Code" value={code} onChangeText={setCode} placeholder="Enter 6-digit code" keyboardType="number-pad" icon={<Ionicons name="keypad-outline" size={18} color={Colors.textMuted} />} />
          <Button title="Verify Code" onPress={handleVerify} loading={loading} />
        </>}

        {step === 'reset' && <>
          <Input label="New Password" value={newPassword} onChangeText={setNewPassword} placeholder="••••••••" secureTextEntry icon={<Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />} />
          <Button title="Reset Password" onPress={handleReset} loading={loading} />
        </>}

        <Button title="Back to Login" onPress={() => router.back()} variant="outline" style={{ marginTop: 16 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  label: { fontSize: 10, fontWeight: '600', letterSpacing: 4, color: Colors.textMuted, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  errorBox: { backgroundColor: Colors.errorBg, borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(200,80,80,0.22)' },
  errorText: { fontSize: 12, color: Colors.error, textAlign: 'center' },
});
