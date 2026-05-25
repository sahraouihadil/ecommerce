/**
 * Login Screen — Mobile equivalent of LoginPage.jsx
 */

import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, StyleSheet, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { Button, Input, GoldDivider } from '../../src/components/ui';
import { Colors } from '../../src/constants/colors';
import { extractError } from '../../src/utils/format';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { role } = await login(username.trim(), password);
      // Navigate based on role
      switch (role) {
        case 'customer':
          router.replace('/(customer)');
          break;
        case 'deliveryman':
          router.replace('/(delivery)');
          break;
        default:
          router.replace('/(stubs)/admin');
      }
    } catch (err: any) {
      setError(extractError(err, 'Invalid username or password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={s.welcomeText}>WELCOME BACK</Text>
          <Text style={s.brandName}>ARoom</Text>
          <Text style={s.title}>Sign In</Text>
          <Text style={s.subtitle}>Your sanctuary awaits.</Text>
        </View>

        <GoldDivider style={{ maxWidth: 180, alignSelf: 'center' }} />

        {/* Error */}
        {error ? (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Form */}
        <View style={s.form}>
          <Input
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="your username"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            icon={<Ionicons name="person-outline" size={18} color={Colors.textMuted} />}
          />

          <View>
            <View style={s.passwordHeader}>
              <Text style={s.inputLabel}>PASSWORD</Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                <Text style={s.forgotText}>FORGOT?</Text>
              </TouchableOpacity>
            </View>
            <View style={s.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />
              <View style={{ flex: 1 }}>
                <Input
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  containerStyle={{ marginBottom: 0 }}
                />
              </View>
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: 8 }}
          />

          {/* Divider */}
          <View style={s.orRow}>
            <View style={s.orLine} />
            <Text style={s.orText}>OR</Text>
            <View style={s.orLine} />
          </View>

          <Button
            title="Create Account"
            onPress={() => router.push('/(auth)/register')}
            variant="outline"
          />
        </View>

        {/* Footer */}
        <Text style={s.footer}>
          By signing in, you agree to our Terms & Privacy
        </Text>
        <Text style={s.sanctuary}>ENTER YOUR SANCTUARY</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center', minHeight: '100%' },
  header: { alignItems: 'center', marginBottom: 24 },
  welcomeText: { fontSize: 10, fontWeight: '600', letterSpacing: 4, color: Colors.textMuted, marginBottom: 8 },
  brandName: { fontSize: 18, fontWeight: '700', letterSpacing: 2, color: Colors.accent, marginBottom: 16 },
  title: { fontSize: 32, fontWeight: '700', color: Colors.text, letterSpacing: 1, marginBottom: 6 },
  subtitle: { fontSize: 16, fontStyle: 'italic', color: Colors.textSecondary, fontWeight: '300' },
  errorBox: { backgroundColor: Colors.errorBg, borderWidth: 1, borderColor: 'rgba(200,80,80,0.22)', borderRadius: 12, padding: 12, marginBottom: 12 },
  errorText: { fontSize: 12, color: Colors.error, textAlign: 'center', letterSpacing: 1 },
  form: { gap: 4 },
  passwordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  inputLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 2, color: Colors.textMuted },
  forgotText: { fontSize: 10, fontWeight: '600', letterSpacing: 1.5, color: Colors.accentDark },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.bgInput, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 14, paddingLeft: 14, marginBottom: 16 },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 8 },
  orLine: { flex: 1, height: 1, backgroundColor: Colors.divider },
  orText: { fontSize: 10, letterSpacing: 3, color: 'rgba(158,142,122,0.5)' },
  footer: { fontSize: 10, letterSpacing: 1.5, color: Colors.textMuted, textAlign: 'center', marginTop: 24 },
  sanctuary: { fontSize: 9, letterSpacing: 5, color: 'rgba(200,169,106,0.3)', textAlign: 'center', marginTop: 16, fontWeight: '600' },
});
