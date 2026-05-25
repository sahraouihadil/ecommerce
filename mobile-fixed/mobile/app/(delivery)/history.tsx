/**
 * Delivery History Screen
 */
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deliveryApi } from '../../src/api/delivery';
import { LoadingScreen, EmptyState, StatusBadge, GoldDivider } from '../../src/components/ui';
import { Colors } from '../../src/constants/colors';
import { formatPrice, formatDate } from '../../src/utils/format';
import { Ionicons } from '@expo/vector-icons';
import type { DeliveryOrder, HistoryStats } from '../../src/types/delivery.types';

export default function HistoryScreen() {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchHistory = async () => {
    try {
      const data = await deliveryApi.getOrderHistory();
      setOrders(data.orders);
      setStats(data.stats);
    } catch { } finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { fetchHistory(); }, []));

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.label}>PAST DELIVERIES</Text>
        <Text style={s.title}>History</Text>
      </View>

      {/* Stats */}
      {stats && (
        <View style={s.statsCard}>
          <View style={s.statsRow}>
            <View style={s.statItem}>
              <Text style={s.statValue}>{stats.total}</Text>
              <Text style={s.statLabel}>Total</Text>
            </View>
            <View style={s.statItem}>
              <Text style={[s.statValue, { color: Colors.success }]}>{stats.delivered}</Text>
              <Text style={s.statLabel}>Delivered</Text>
            </View>
            <View style={s.statItem}>
              <Text style={[s.statValue, { color: Colors.error }]}>{stats.canceled}</Text>
              <Text style={s.statLabel}>Canceled</Text>
            </View>
          </View>
          <GoldDivider />
          <View style={{ alignItems: 'center' }}>
            <Text style={s.earnedLabel}>TOTAL EARNED</Text>
            <Text style={s.earnedValue}>{formatPrice(stats.total_earned)}</Text>
          </View>
        </View>
      )}

      {orders.length === 0 ? (
        <EmptyState title="No history yet" subtitle="Your completed deliveries will appear here." icon={<Ionicons name="time-outline" size={48} color={Colors.textMuted} />} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={o => String(o.id_raw)}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchHistory(); }} tintColor={Colors.accent} />}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.card} onPress={() => router.push(`/(delivery)/order/${item.id_raw}`)} activeOpacity={0.85}>
              <View style={s.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={s.orderId}>{item.id}</Text>
                  <Text style={s.orderDate}>{formatDate(item.date)}</Text>
                </View>
                <StatusBadge status={item.status} />
              </View>
              <View style={s.cardBottom}>
                <Text style={s.customer}>{item.customer}</Text>
                <Text style={s.amount}>{formatPrice(item.amount)}</Text>
              </View>
              {item.rating && (
                <View style={s.ratingRow}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Ionicons key={star} name={star <= item.rating! ? 'star' : 'star-outline'} size={14} color={Colors.accent} />
                  ))}
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  label: { fontSize: 10, fontWeight: '600', letterSpacing: 4, color: Colors.textMuted },
  title: { fontSize: 24, fontWeight: '700', color: Colors.text, marginTop: 4 },
  statsCard: { marginHorizontal: 16, marginBottom: 16, backgroundColor: Colors.bgCard, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 16 },
  statsRow: { flexDirection: 'row' },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '700', color: Colors.text },
  statLabel: { fontSize: 9, letterSpacing: 1.5, color: Colors.textMuted, marginTop: 2, textTransform: 'uppercase' },
  earnedLabel: { fontSize: 9, letterSpacing: 3, color: Colors.textMuted, marginBottom: 4 },
  earnedValue: { fontSize: 22, fontWeight: '700', color: Colors.accentDark },
  card: { backgroundColor: Colors.bgCard, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  orderId: { fontSize: 14, fontWeight: '700', color: Colors.text },
  orderDate: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  customer: { fontSize: 13, color: Colors.textSecondary },
  amount: { fontSize: 14, fontWeight: '700', color: Colors.accentDark },
  ratingRow: { flexDirection: 'row', gap: 2, marginTop: 8 },
});
