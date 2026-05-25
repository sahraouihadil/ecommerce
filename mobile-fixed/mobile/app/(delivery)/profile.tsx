/**
 * Driver Profile Screen
 */
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { deliveryApi } from '../../src/api/delivery';
import { Button, GoldDivider, LoadingScreen } from '../../src/components/ui';
import { Colors } from '../../src/constants/colors';
import { formatPrice } from '../../src/utils/format';
import { Ionicons } from '@expo/vector-icons';
import type { DriverProfile } from '../../src/types/delivery.types';

export default function DriverProfileScreen() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchProfile = async () => {
    try { setProfile(await deliveryApi.getProfile()); }
    catch { } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/login'); } },
    ]);
  };

  if (loading || !profile) return <LoadingScreen />;

  const initials = (profile.name || '?').split(/[\s_@]+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');

  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProfile(); }} tintColor={Colors.accent} />}
      >
        <View style={s.avatarSection}>
          <View style={s.avatar}>
            <Text style={s.initials}>{initials}</Text>
          </View>
          <Text style={s.name}>{profile.name}</Text>
          {profile.phone && <Text style={s.info}>{profile.phone}</Text>}
          {profile.vehicle && <Text style={s.info}>{profile.vehicle}</Text>}
          {profile.member_since && <Text style={s.since}>Member since {profile.member_since}</Text>}
        </View>

        {/* Rating */}
        {profile.avg_rating != null && (
          <View style={s.ratingBox}>
            <View style={s.ratingRow}>
              {[1, 2, 3, 4, 5].map(star => (
                <Ionicons key={star} name={star <= Math.round(profile.avg_rating!) ? 'star' : 'star-outline'} size={20} color={Colors.accent} />
              ))}
            </View>
            <Text style={s.ratingValue}>{profile.avg_rating.toFixed(1)}</Text>
            <Text style={s.ratingLabel}>Average Rating</Text>
          </View>
        )}

        <GoldDivider />

        {/* Lifetime Stats */}
        <Text style={s.sectionLabel}>LIFETIME STATISTICS</Text>
        <View style={s.statsGrid}>
          {[
            { icon: 'cube-outline', value: profile.stats.total_orders, label: 'Total Orders' },
            { icon: 'checkmark-circle-outline', value: profile.stats.delivered, label: 'Delivered' },
            { icon: 'alert-circle-outline', value: profile.stats.issues, label: 'Issues' },
            { icon: 'cash-outline', value: formatPrice(profile.stats.total_earned), label: 'Total Earned' },
          ].map(stat => (
            <View key={stat.label} style={s.statCard}>
              <Ionicons name={stat.icon as any} size={22} color={Colors.accent} />
              <Text style={s.statValue}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <GoldDivider />

        <Button title="Sign Out" onPress={handleLogout} variant="danger" icon={<Ionicons name="log-out-outline" size={18} color={Colors.textLight} />} />
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  avatarSection: { alignItems: 'center', marginBottom: 16 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  initials: { fontSize: 28, fontWeight: '700', color: Colors.textLight },
  name: { fontSize: 22, fontWeight: '700', color: Colors.text },
  info: { fontSize: 13, color: Colors.textMuted, marginTop: 4 },
  since: { fontSize: 11, color: Colors.textMuted, marginTop: 8, fontStyle: 'italic' },
  ratingBox: { alignItems: 'center', padding: 16, backgroundColor: Colors.bgCard, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 8 },
  ratingRow: { flexDirection: 'row', gap: 4, marginBottom: 6 },
  ratingValue: { fontSize: 24, fontWeight: '700', color: Colors.text },
  ratingLabel: { fontSize: 10, letterSpacing: 2, color: Colors.textMuted, marginTop: 2 },
  sectionLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 3, color: Colors.textMuted, marginBottom: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '47%', backgroundColor: Colors.bgCard, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 16, alignItems: 'center', gap: 6 },
  statValue: { fontSize: 18, fontWeight: '700', color: Colors.text },
  statLabel: { fontSize: 10, letterSpacing: 1, color: Colors.textMuted, textAlign: 'center' },
});
