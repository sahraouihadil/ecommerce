/**
 * Profile Screen
 */
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { customerApi } from '../../src/api/customer';
import { Button, GoldDivider, LoadingScreen } from '../../src/components/ui';
import { Colors } from '../../src/constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { username, role, logout, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchProfile = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try { setProfile(await customerApi.getProfile()); }
    catch { } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchProfile(); }, [isAuthenticated]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/login'); } },
    ]);
  };

  if (loading) return <LoadingScreen />;

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[s.container, { justifyContent: 'center' }]}>
        <View style={{ padding: 24, alignItems: 'center' }}>
          <Ionicons name="person-circle-outline" size={80} color={Colors.textMuted} />
          <Text style={[s.name, { marginTop: 16, marginBottom: 8 }]}>Guest User</Text>
          <Text style={[s.email, { textAlign: 'center', marginBottom: 24 }]}>Sign in to view your profile, manage orders, and track your points.</Text>
          <Button title="Sign In" onPress={() => router.push('/(auth)/login')} style={{ width: '100%' }} />
        </View>
      </SafeAreaView>
    );
  }

  const initials = (profile?.username || username || '?')
    .split(/[\s_@]+/).slice(0, 2).map((w: string) => w[0]?.toUpperCase() ?? '').join('');

  const stats = profile?.stats;
  const orderCount = profile?.orders?.length ?? 0;
  const favCount = profile?.favorites?.length ?? 0;

  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProfile(); }} tintColor={Colors.accent} />}
        contentContainerStyle={{ padding: 20 }}
      >
        {/* Avatar + Info */}
        <View style={s.avatarSection}>
          <View style={s.avatar}>
            <Text style={s.initials}>{initials}</Text>
          </View>
          <Text style={s.name}>{profile?.username || username}</Text>
          {profile?.email && <Text style={s.email}>{profile.email}</Text>}
          {profile?.phone && <Text style={s.phone}>{profile.phone}</Text>}
          {role && <Text style={s.role}>{role.toUpperCase()}</Text>}
        </View>

        <GoldDivider />

        {/* Stats */}
        <View style={s.statsRow}>
          <View style={s.statItem}>
            <Text style={s.statValue}>{orderCount}</Text>
            <Text style={s.statLabel}>Orders</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statValue}>{favCount}</Text>
            <Text style={s.statLabel}>Saved</Text>
          </View>
          {stats?.points != null && <>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Text style={s.statValue}>{stats.points.toLocaleString()}</Text>
              <Text style={s.statLabel}>Points</Text>
            </View>
          </>}
        </View>

        {stats?.tier && (
          <View style={s.tierRow}>
            <View style={[s.tierBadge, { backgroundColor: stats.tier.color + '18', borderColor: stats.tier.color + '44' }]}>
              <Text style={[s.tierText, { color: stats.tier.color }]}>{stats.tier.name.toUpperCase()}</Text>
            </View>
            {stats.progress_pct != null && (
              <View style={s.progressBar}>
                <View style={[s.progressFill, { width: `${stats.progress_pct}%`, backgroundColor: stats.tier.color }]} />
              </View>
            )}
          </View>
        )}

        <GoldDivider />

        {/* Menu Items */}
        <Text style={s.sectionLabel}>ACCOUNT</Text>
        {[
          { icon: 'receipt-outline', label: 'My Orders', onPress: () => router.push('/(customer)/orders') },
          { icon: 'heart-outline', label: 'Favorites', onPress: () => router.push('/(customer)/favorites') },
          { icon: 'cart-outline', label: 'Shopping Bag', onPress: () => router.push('/(customer)/cart') },
        ].map(item => (
          <TouchableOpacity key={item.label} style={s.menuItem} onPress={item.onPress}>
            <Ionicons name={item.icon as any} size={20} color={Colors.textSecondary} />
            <Text style={s.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        ))}

        <GoldDivider />

        <Button title="Sign Out" onPress={handleLogout} variant="danger" icon={<Ionicons name="log-out-outline" size={18} color={Colors.textLight} />} />
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  avatarSection: { alignItems: 'center', marginBottom: 8 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  initials: { fontSize: 28, fontWeight: '700', color: Colors.textLight },
  name: { fontSize: 22, fontWeight: '700', color: Colors.text },
  email: { fontSize: 13, color: Colors.textMuted, marginTop: 4 },
  phone: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  role: { fontSize: 9, letterSpacing: 3, color: Colors.accentDark, fontWeight: '600', marginTop: 8, backgroundColor: 'rgba(200,169,106,0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  statsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 0, marginVertical: 8 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '700', color: Colors.text },
  statLabel: { fontSize: 10, letterSpacing: 1.5, color: Colors.textMuted, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: Colors.divider },
  tierRow: { alignItems: 'center', marginVertical: 8 },
  tierBadge: { paddingHorizontal: 14, paddingVertical: 4, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  tierText: { fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  progressBar: { width: '60%', height: 4, borderRadius: 2, backgroundColor: Colors.bgInput, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  sectionLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 3, color: Colors.textMuted, marginBottom: 8, marginTop: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: Colors.text },
});
