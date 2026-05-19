/**
 * Cart Screen
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { customerApi, getImageUrl } from '../../src/api/customer';
import { Button, LoadingScreen, EmptyState, GoldDivider } from '../../src/components/ui';
import { Colors } from '../../src/constants/colors';
import { formatPrice } from '../../src/utils/format';
import { Ionicons } from '@expo/vector-icons';
import type { CartItem } from '../../src/types/customer.types';

export default function CartScreen() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchCart = async () => {
    try {
      const data = await customerApi.getCart();
      setItems(data);
    } catch { } finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { fetchCart(); }, []));

  const handleRemove = async (id: number) => {
    try {
      await customerApi.removeFromCart(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch { Alert.alert('Error', 'Failed to remove item'); }
  };

  const handleUpdateQty = async (id: number, qty: number) => {
    if (qty < 1) return;
    try {
      await customerApi.updateCartItem(id, qty);
      setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
    } catch { }
  };

  if (loading) return <LoadingScreen />;

  const total = items.reduce((acc, i) => acc + ((i.product?.price || 0) * i.quantity), 0);

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.label}>YOUR SELECTION</Text>
        <Text style={s.title}>Shopping Bag</Text>
        <Text style={s.count}>{items.length} {items.length === 1 ? 'item' : 'items'}</Text>
      </View>

      {items.length === 0 ? (
        <EmptyState
          title="Your bag is empty"
          subtitle="Browse our collection and add items you love."
          icon={<Ionicons name="bag-outline" size={48} color={Colors.textMuted} />}
          action={{ title: 'Shop Now', onPress: () => router.push('/(customer)/products') }}
        />
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={i => String(i.id)}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 16 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCart(); }} tintColor={Colors.accent} />}
            renderItem={({ item }) => {
              const img = item.product?.images?.[0]?.image_url;
              return (
                <View style={s.card}>
                  <View style={s.cardImg}>
                    {img ? <Image source={{ uri: getImageUrl(img) }} style={s.image} /> : <Ionicons name="cube-outline" size={24} color={Colors.textMuted} />}
                  </View>
                  <View style={s.cardBody}>
                    <Text style={s.name} numberOfLines={1}>{item.product?.name || `Product #${item.product_id}`}</Text>
                    <Text style={s.price}>{formatPrice(item.product?.price)}</Text>
                    <View style={s.qtyRow}>
                      <TouchableOpacity onPress={() => handleUpdateQty(item.id, item.quantity - 1)} style={s.qtyBtn}>
                        <Ionicons name="remove" size={14} color={Colors.text} />
                      </TouchableOpacity>
                      <Text style={s.qty}>{item.quantity}</Text>
                      <TouchableOpacity onPress={() => handleUpdateQty(item.id, item.quantity + 1)} style={s.qtyBtn}>
                        <Ionicons name="add" size={14} color={Colors.text} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => handleRemove(item.id)} style={s.removeBtn}>
                    <Ionicons name="trash-outline" size={16} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              );
            }}
          />
          <View style={s.bottomBar}>
            <View>
              <Text style={s.totalLabel}>TOTAL</Text>
              <Text style={s.totalPrice}>{formatPrice(total)}</Text>
            </View>
            <Button title="Checkout" onPress={() => router.push('/(customer)/checkout')} style={{ flex: 1 }} icon={<Ionicons name="arrow-forward" size={16} color={Colors.textLight} />} />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  label: { fontSize: 10, fontWeight: '600', letterSpacing: 4, color: Colors.textMuted },
  title: { fontSize: 24, fontWeight: '700', color: Colors.text, marginTop: 4 },
  count: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
  card: { flexDirection: 'row', backgroundColor: Colors.bgCard, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 12, gap: 12, alignItems: 'center' },
  cardImg: { width: 72, height: 72, borderRadius: 12, backgroundColor: Colors.bgInput, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  cardBody: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  price: { fontSize: 14, fontWeight: '700', color: Colors.accentDark, marginBottom: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: { width: 28, height: 28, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  qty: { fontSize: 14, fontWeight: '700', color: Colors.text, minWidth: 20, textAlign: 'center' },
  removeBtn: { padding: 8 },
  bottomBar: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, borderTopWidth: 1, borderTopColor: Colors.divider, backgroundColor: Colors.bgCard },
  totalLabel: { fontSize: 9, letterSpacing: 2, color: Colors.textMuted },
  totalPrice: { fontSize: 18, fontWeight: '700', color: Colors.text },
});
