/**
 * Checkout Screen
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { customerApi } from '../../src/api/customer';
import { Button, Input, GoldDivider } from '../../src/components/ui';
import { Colors } from '../../src/constants/colors';
import { extractError } from '../../src/utils/format';
import { Ionicons } from '@expo/vector-icons';

export default function CheckoutScreen() {
  const [form, setForm] = useState({ fullName: '', phone: '', wilaya: '', city: '', streetAddress: '', notes: '' });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handlePlaceOrder = async () => {
    if (!form.fullName || !form.phone || !form.wilaya || !form.city || !form.streetAddress) {
      setError('Please fill in all required fields.'); return;
    }
    setError(''); setLoading(true);
    try {
      const res = await customerApi.createOrder({
        ...form,
        paymentMethod,
        delivery_type: 'standard',
        deliverydate: new Date().toISOString(),
      });
      Alert.alert('Order Placed!', `Order #${res.order_id} has been placed. Total: ${res.total?.toFixed(2)} DA`, [
        { text: 'View Orders', onPress: () => router.replace('/(customer)/orders') },
      ]);
    } catch (err: any) {
      setError(extractError(err, 'Failed to place order.'));
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={s.header}>
            <Ionicons name="arrow-back" size={20} color={Colors.text} onPress={() => router.back()} />
            <Text style={s.title}>Checkout</Text>
            <View style={{ width: 20 }} />
          </View>

          <GoldDivider />

          {error ? <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View> : null}

          <Text style={s.sectionLabel}>SHIPPING INFORMATION</Text>
          <Input label="Full Name" value={form.fullName} onChangeText={v => update('fullName', v)} placeholder="John Doe" icon={<Ionicons name="person-outline" size={16} color={Colors.textMuted} />} />
          <Input label="Phone" value={form.phone} onChangeText={v => update('phone', v)} placeholder="+213 6XX XXX XXX" keyboardType="phone-pad" icon={<Ionicons name="call-outline" size={16} color={Colors.textMuted} />} />
          <Input label="Wilaya" value={form.wilaya} onChangeText={v => update('wilaya', v)} placeholder="Your wilaya" icon={<Ionicons name="location-outline" size={16} color={Colors.textMuted} />} />
          <Input label="City" value={form.city} onChangeText={v => update('city', v)} placeholder="Your city" icon={<Ionicons name="business-outline" size={16} color={Colors.textMuted} />} />
          <Input label="Street Address" value={form.streetAddress} onChangeText={v => update('streetAddress', v)} placeholder="123 Main St" icon={<Ionicons name="map-outline" size={16} color={Colors.textMuted} />} />
          <Input label="Notes (Optional)" value={form.notes} onChangeText={v => update('notes', v)} placeholder="Special instructions..." multiline icon={<Ionicons name="chatbubble-ellipses-outline" size={16} color={Colors.textMuted} />} />

          <GoldDivider />

          <Text style={s.sectionLabel}>PAYMENT METHOD</Text>
          {['cash', 'cib'].map(method => (
            <View key={method} style={[s.paymentOption, paymentMethod === method && s.paymentActive]}>
              <Ionicons name={paymentMethod === method ? 'radio-button-on' : 'radio-button-off'} size={20} color={paymentMethod === method ? Colors.accent : Colors.textMuted} onPress={() => setPaymentMethod(method)} />
              <Text style={s.paymentText}>{method === 'cash' ? 'Cash on Delivery' : 'CIB Card'}</Text>
            </View>
          ))}

          <View style={{ height: 16 }} />
          <Button title="Place Order" onPress={handlePlaceOrder} loading={loading} icon={<Ionicons name="checkmark-circle-outline" size={18} color={Colors.textLight} />} />
          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.text },
  sectionLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 3, color: Colors.textMuted, marginBottom: 12, marginTop: 4 },
  errorBox: { backgroundColor: Colors.errorBg, borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(200,80,80,0.22)' },
  errorText: { fontSize: 12, color: Colors.error, textAlign: 'center' },
  paymentOption: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, marginBottom: 8, backgroundColor: Colors.bgCard },
  paymentActive: { borderColor: Colors.accent, backgroundColor: 'rgba(200,169,106,0.06)' },
  paymentText: { fontSize: 14, fontWeight: '500', color: Colors.text },
});
