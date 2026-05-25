/**
 * Order Tracking Screen — View specific order details
 */
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { customerApi } from '../../../../src/api/customer';
import { LoadingScreen, StatusBadge, GoldDivider, Button } from '../../../../src/components/ui';
import { Colors } from '../../../../src/constants/colors';
import { formatPrice, formatDate } from '../../../../src/utils/format';
import { Ionicons } from '@expo/vector-icons';
import type { Order } from '../../../../src/types/customer.types';

const STEPS = ['pending', 'processing', 'shipped', 'delivered'];

export default function OrderTrackingScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!orderId) return;
    customerApi.getOrder(Number(orderId))
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading || !order) return <LoadingScreen />;

  const currentStep = STEPS.indexOf(order.status?.toLowerCase());

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.topBar}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} onPress={() => router.back()} />
          <Text style={s.title}>Order #{order.id}</Text>
          <View style={{ width: 20 }} />
        </View>

        <StatusBadge status={order.status} style={{ alignSelf: 'center', marginVertical: 16 }} />

        {/* Progress Steps */}
        <View style={s.steps}>
          {STEPS.map((step, i) => {
            const done = i <= currentStep;
            const isCurrent = i === currentStep;
            return (
              <View key={step} style={s.stepItem}>
                <View style={[s.stepCircle, done && s.stepDone, isCurrent && s.stepCurrent]}>
                  {done ? <Ionicons name="checkmark" size={14} color={Colors.textLight} /> : <Text style={s.stepNum}>{i + 1}</Text>}
                </View>
                <Text style={[s.stepLabel, done && s.stepLabelDone]}>{step.charAt(0).toUpperCase() + step.slice(1)}</Text>
                {i < STEPS.length - 1 && <View style={[s.stepLine, done && s.stepLineDone]} />}
              </View>
            );
          })}
        </View>

        <GoldDivider />

        {/* Order Info */}
        <View style={s.infoRow}><Text style={s.infoLabel}>ORDER DATE</Text><Text style={s.infoValue}>{formatDate(order.orderdate)}</Text></View>
        <View style={s.infoRow}><Text style={s.infoLabel}>DELIVERY DATE</Text><Text style={s.infoValue}>{formatDate(order.deliverydate)}</Text></View>
        <View style={s.infoRow}><Text style={s.infoLabel}>DELIVERY TYPE</Text><Text style={s.infoValue}>{order.delivery_type || 'Standard'}</Text></View>

        <GoldDivider />

        {/* Items */}
        <Text style={s.sectionLabel}>ORDER ITEMS</Text>
        {order.items?.map(item => (
          <View key={item.id} style={s.itemRow}>
            <View style={s.itemDot} />
            <View style={{ flex: 1 }}>
              <Text style={s.itemName}>{item.product_name || `Product #${item.product_id}`}</Text>
              <Text style={s.itemMeta}>Qty: {item.quantity}</Text>
            </View>
            <Text style={s.itemPrice}>{formatPrice(item.price)}</Text>
          </View>
        ))}

        <GoldDivider />

        <View style={s.totalRow}>
          <Text style={s.totalLabel}>TOTAL</Text>
          <Text style={s.totalValue}>{formatPrice(order.totalamount)}</Text>
        </View>

        <Button title="Back to Orders" onPress={() => router.back()} variant="outline" style={{ marginTop: 20 }} />
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 20 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text },
  steps: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 16, paddingHorizontal: 8 },
  stepItem: { alignItems: 'center', flex: 1, position: 'relative' },
  stepCircle: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bgCard, marginBottom: 6 },
  stepDone: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  stepCurrent: { borderColor: Colors.accent, borderWidth: 3 },
  stepNum: { fontSize: 11, fontWeight: '700', color: Colors.textMuted },
  stepLabel: { fontSize: 9, letterSpacing: 0.5, color: Colors.textMuted, textAlign: 'center' },
  stepLabelDone: { color: Colors.accentDark, fontWeight: '600' },
  stepLine: { position: 'absolute', top: 16, left: '60%', width: '80%', height: 2, backgroundColor: Colors.border },
  stepLineDone: { backgroundColor: Colors.accent },
  sectionLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 3, color: Colors.textMuted, marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  infoLabel: { fontSize: 10, letterSpacing: 2, color: Colors.textMuted, fontWeight: '600' },
  infoValue: { fontSize: 13, color: Colors.text, fontWeight: '500' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  itemDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.accent },
  itemName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  itemMeta: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: '700', color: Colors.accentDark },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 3, color: Colors.textMuted },
  totalValue: { fontSize: 22, fontWeight: '700', color: Colors.text },
});
