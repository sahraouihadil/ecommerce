/**
 * Today's Orders Dashboard — Delivery driver's main screen
 */
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deliveryApi } from '../../src/api/delivery';
import { LoadingScreen, EmptyState, StatusBadge } from '../../src/components/ui';
import { Colors, getStatusColor } from '../../src/constants/colors';
import { formatPrice } from '../../src/utils/format';
import { Ionicons } from '@expo/vector-icons';
import type { DeliveryOrder, TodayStats } from '../../src/types/delivery.types';

export default function TodayOrdersScreen() {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [stats, setStats] = useState<TodayStats | null>(null);
  const [dateStr, setDateStr] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchData = async () => {
    try {
      const data = await deliveryApi.getTodayOrders();
      setOrders(data.orders);
      setStats(data.stats);
      setDateStr(data.date);
    } catch { } finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.label}>DELIVERY DASHBOARD</Text>
          <Text style={s.title}>Today's Orders</Text>
          <Text style={s.date}>{dateStr}</Text>
        </View>
      </View>

      {/* Stats Row */}
      {stats && (
        <View style={s.statsRow}>
          {[
            { value: stats.total, label: 'Total', color: Colors.text },
            { value: stats.delivered, label: 'Done', color: Colors.success },
            { value: stats.in_transit, label: 'Transit', color: Colors.warning },
            { value: stats.pending, label: 'Pending', color: Colors.textMuted },
          ].map(s2 => (
            <View key={s2.label} style={s.statItem}>
              <Text style={[s.statValue, { color: s2.color }]}>{s2.value}</Text>
              <Text style={s.statLabel}>{s2.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Orders List */}
      {orders.length === 0 ? (
        <EmptyState
          title="No orders today"
          subtitle="You have no deliveries scheduled for today."
          icon={<Ionicons name="cube-outline" size={48} color={Colors.textMuted} />}
        />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={o => String(o.id_raw)}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={Colors.accent} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.card}
              onPress={() => router.push(`/(delivery)/order/${item.id_raw}`)}
              activeOpacity={0.85}
            >
              <View style={s.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={s.orderId}>{item.id}</Text>
                  <Text style={s.customer}>{item.customer}</Text>
                </View>
                <StatusBadge status={item.status} />
              </View>
              <View style={s.cardBody}>
                <View style={s.infoItem}>
                  <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
                  <Text style={s.infoText} numberOfLines={1}>{item.address}</Text>
                </View>
                <View style={s.infoItem}>
                  <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
                  <Text style={s.infoText}>{item.eta > 0 ? `${item.eta} min ETA` : 'No ETA'}</Text>
                </View>
              </View>
              <View style={s.cardFooter}>
                <Text style={s.itemCount}>{item.items?.length || 0} item{(item.items?.length || 0) !== 1 ? 's' : ''}</Text>
                <Text style={s.amount}>{formatPrice(item.amount)}</Text>
              </View>
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
  date: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
  statsRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 16, backgroundColor: Colors.bgCard, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 16 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 9, letterSpacing: 1.5, color: Colors.textMuted, marginTop: 2, textTransform: 'uppercase' },
  card: { backgroundColor: Colors.bgCard, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 14, paddingBottom: 8 },
  orderId: { fontSize: 15, fontWeight: '700', color: Colors.text },
  customer: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  cardBody: { paddingHorizontal: 14, gap: 6, paddingBottom: 10 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 12, color: Colors.textMuted, flex: 1 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.divider },
  itemCount: { fontSize: 11, color: Colors.textMuted },
  amount: { fontSize: 15, fontWeight: '700', color: Colors.accentDark },
});
