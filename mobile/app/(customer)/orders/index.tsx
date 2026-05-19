/**
 * Orders List Screen
 */
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { customerApi } from '../../../src/api/customer';
import { LoadingScreen, EmptyState, StatusBadge } from '../../../src/components/ui';
import { Colors } from '../../../src/constants/colors';
import { formatPrice, formatDate } from '../../../src/utils/format';
import { Ionicons } from '@expo/vector-icons';
import type { Order } from '../../../src/types/customer.types';

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const { isAuthenticated } = useAuth();

  const fetchOrders = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try { setOrders(await customerApi.getOrders()); }
    catch { } finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { fetchOrders(); }, [isAuthenticated]));

  if (loading) return <LoadingScreen />;

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.header}>
          <Text style={s.label}>YOUR PURCHASES</Text>
          <Text style={s.title}>My Orders</Text>
        </View>
        <EmptyState 
          title="Sign in required" 
          subtitle="You need to sign in to view and track your orders." 
          icon={<Ionicons name="receipt-outline" size={48} color={Colors.textMuted} />} 
          action={{ title: 'Sign In', onPress: () => router.push('/(auth)/login') }} 
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.label}>YOUR PURCHASES</Text>
        <Text style={s.title}>My Orders</Text>
      </View>

      {orders.length === 0 ? (
        <EmptyState title="No orders yet" subtitle="Start shopping to see your orders here." icon={<Ionicons name="receipt-outline" size={48} color={Colors.textMuted} />} action={{ title: 'Shop Now', onPress: () => router.push('/(customer)/products') }} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={o => String(o.id)}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} tintColor={Colors.accent} />}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.card} onPress={() => router.push(`/(customer)/orders/${item.id}`)} activeOpacity={0.85}>
              <View style={s.cardTop}>
                <View>
                  <Text style={s.orderId}>Order #{item.id}</Text>
                  <Text style={s.orderDate}>{formatDate(item.orderdate)}</Text>
                </View>
                <StatusBadge status={item.status} />
              </View>
              <View style={s.cardBottom}>
                <Text style={s.itemsText}>{item.items?.length || 0} item{(item.items?.length || 0) !== 1 ? 's' : ''}</Text>
                <Text style={s.totalText}>{formatPrice(item.totalamount)}</Text>
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
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  label: { fontSize: 10, fontWeight: '600', letterSpacing: 4, color: Colors.textMuted },
  title: { fontSize: 24, fontWeight: '700', color: Colors.text, marginTop: 4 },
  card: { backgroundColor: Colors.bgCard, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 16 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  orderId: { fontSize: 15, fontWeight: '600', color: Colors.text },
  orderDate: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.divider, paddingTop: 10 },
  itemsText: { fontSize: 12, color: Colors.textMuted },
  totalText: { fontSize: 16, fontWeight: '700', color: Colors.accentDark },
});
