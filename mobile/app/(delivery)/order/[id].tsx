/**
 * Order Detail + Status Update Screen — Delivery driver can advance order status
 */
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Alert, Modal, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deliveryApi } from '../../../src/api/delivery';
import { getImageUrl } from '../../../src/api/client';
import { Button, LoadingScreen, StatusBadge, GoldDivider } from '../../../src/components/ui';
import { Colors } from '../../../src/constants/colors';
import { formatPrice } from '../../../src/utils/format';
import { Ionicons } from '@expo/vector-icons';
import type { DeliveryOrder } from '../../../src/types/delivery.types';
import { STATUS_TRANSITIONS, ALLOWED_PROBLEM_REASONS } from '../../../src/types/delivery.types';

export default function DeliveryOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<DeliveryOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showProblem, setShowProblem] = useState(false);
  const [problemReason, setProblemReason] = useState<string>(ALLOWED_PROBLEM_REASONS[0]);
  const [problemNotes, setProblemNotes] = useState('');
  const router = useRouter();

  const fetchOrder = async () => {
    try { setOrder(await deliveryApi.getOrder(Number(id))); }
    catch { Alert.alert('Error', 'Order not found'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (id) fetchOrder(); }, [id]);

  const handleStatusUpdate = async (nextStatus: string) => {
    if (!order) return;
    const confirmMsg = nextStatus === 'canceled'
      ? 'Are you sure you want to cancel this order?'
      : `Move order to "${nextStatus}"?`;

    Alert.alert('Confirm', confirmMsg, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          setActionLoading(true);
          try {
            if (nextStatus === 'canceled') {
              await deliveryApi.cancelOrder(order.id_raw);
            } else {
              await deliveryApi.updateOrderStatus(order.id_raw, nextStatus);
            }
            await fetchOrder();
            Alert.alert('Success', `Order updated to "${nextStatus}"`);
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.detail || 'Failed to update');
          } finally { setActionLoading(false); }
        },
      },
    ]);
  };

  const handleProblemReport = async () => {
    if (!order) return;
    setActionLoading(true);
    try {
      await deliveryApi.reportProblem(order.id_raw, { reason: problemReason, notes: problemNotes });
      setShowProblem(false);
      setProblemNotes('');
      await fetchOrder();
      Alert.alert('Reported', 'Problem has been reported to the stock manager.');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.detail || 'Failed to report');
    } finally { setActionLoading(false); }
  };

  const handleItemStatus = async (itemId: number, status: string) => {
    if (!order) return;
    try {
      await deliveryApi.updateItemStatus(order.id_raw, itemId, status);
      await fetchOrder();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.detail || 'Failed to update item');
    }
  };

  if (loading || !order) return <LoadingScreen />;

  const allowedNext = STATUS_TRANSITIONS[order.status?.toLowerCase()] || [];
  const isTerminal = allowedNext.length === 0;

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Top Bar */}
        <View style={s.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </TouchableOpacity>
          <Text style={s.topTitle}>{order.id}</Text>
          <StatusBadge status={order.status} />
        </View>

        {/* Customer Info */}
        <View style={s.infoCard}>
          <View style={s.infoRow}>
            <Ionicons name="person-outline" size={16} color={Colors.textMuted} />
            <Text style={s.infoText}>{order.customer}</Text>
          </View>
          <View style={s.infoRow}>
            <Ionicons name="location-outline" size={16} color={Colors.textMuted} />
            <Text style={s.infoText}>{order.address}</Text>
          </View>
          {order.eta > 0 && (
            <View style={s.infoRow}>
              <Ionicons name="time-outline" size={16} color={Colors.textMuted} />
              <Text style={s.infoText}>{order.eta} min ETA</Text>
            </View>
          )}
          <View style={s.infoRow}>
            <Ionicons name="cash-outline" size={16} color={Colors.textMuted} />
            <Text style={[s.infoText, { fontWeight: '700', color: Colors.accentDark }]}>{formatPrice(order.amount)}</Text>
          </View>
        </View>

        {/* Problem display */}
        {order.problem_reason && (
          <View style={s.problemBox}>
            <Ionicons name="warning-outline" size={18} color={Colors.warning} />
            <View style={{ flex: 1 }}>
              <Text style={s.problemReason}>{order.problem_reason}</Text>
              {order.problem_notes && <Text style={s.problemNotes}>{order.problem_notes}</Text>}
            </View>
          </View>
        )}

        <GoldDivider />

        {/* Items */}
        <Text style={s.sectionLabel}>ORDER ITEMS ({order.items?.length || 0})</Text>
        {order.items?.map(item => (
          <View key={item.id} style={s.itemCard}>
            <View style={s.itemImgBox}>
              {item.image ? (
                <Image source={{ uri: getImageUrl(item.image) }} style={s.itemImg} />
              ) : (
                <Ionicons name="cube-outline" size={20} color={Colors.textMuted} />
              )}
            </View>
            <View style={s.itemBody}>
              <Text style={s.itemName} numberOfLines={1}>{item.product_name}</Text>
              <View style={s.itemMeta}>
                <Text style={s.itemQty}>Qty: {item.quantity}</Text>
                <Text style={s.itemPrice}>{formatPrice(item.price)}</Text>
              </View>
              <StatusBadge status={item.status} />
            </View>
            {/* Per-item status actions */}
            {!isTerminal && (
              <View style={s.itemActions}>
                <TouchableOpacity onPress={() => handleItemStatus(item.id, 'delivered')} style={s.itemActionBtn}>
                  <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleItemStatus(item.id, 'canceled')} style={s.itemActionBtn}>
                  <Ionicons name="close-circle" size={22} color={Colors.error} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        <GoldDivider />

        {/* Action Buttons */}
        {!isTerminal && (
          <View style={s.actionsSection}>
            <Text style={s.sectionLabel}>ACTIONS</Text>
            {allowedNext.filter(s => s !== 'problem' && s !== 'canceled').map(nextStatus => (
              <Button
                key={nextStatus}
                title={`Mark as ${nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}`}
                onPress={() => handleStatusUpdate(nextStatus)}
                loading={actionLoading}
                style={{ marginBottom: 10 }}
                icon={<Ionicons name={nextStatus === 'delivered' ? 'checkmark-circle-outline' : 'arrow-forward-circle-outline'} size={18} color={Colors.textLight} />}
              />
            ))}

            {allowedNext.includes('canceled') && (
              <Button
                title="Cancel Order"
                onPress={() => handleStatusUpdate('canceled')}
                variant="danger"
                loading={actionLoading}
                style={{ marginBottom: 10 }}
                icon={<Ionicons name="close-circle-outline" size={18} color={Colors.textLight} />}
              />
            )}

            {allowedNext.includes('problem') && (
              <Button
                title="Report Problem"
                onPress={() => setShowProblem(true)}
                variant="outline"
                style={{ marginBottom: 10 }}
                icon={<Ionicons name="warning-outline" size={18} color={Colors.accentDark} />}
              />
            )}
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Problem Report Modal */}
      <Modal visible={showProblem} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>Report Problem</Text>
            <GoldDivider />
            <Text style={s.sectionLabel}>REASON</Text>
            {ALLOWED_PROBLEM_REASONS.map(reason => (
              <TouchableOpacity
                key={reason}
                style={[s.reasonOption, problemReason === reason && s.reasonActive]}
                onPress={() => setProblemReason(reason)}
              >
                <Ionicons name={problemReason === reason ? 'radio-button-on' : 'radio-button-off'} size={18} color={problemReason === reason ? Colors.accent : Colors.textMuted} />
                <Text style={s.reasonText}>{reason}</Text>
              </TouchableOpacity>
            ))}
            <Text style={[s.sectionLabel, { marginTop: 12 }]}>NOTES</Text>
            <TextInput
              value={problemNotes}
              onChangeText={setProblemNotes}
              placeholder="Additional details..."
              multiline
              numberOfLines={3}
              style={s.notesInput}
              placeholderTextColor={Colors.textMuted}
            />
            <View style={s.modalActions}>
              <Button title="Cancel" onPress={() => setShowProblem(false)} variant="outline" style={{ flex: 1 }} />
              <Button title="Submit" onPress={handleProblemReport} loading={actionLoading} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 16 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(200,169,106,0.1)', alignItems: 'center', justifyContent: 'center' },
  topTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: Colors.text },
  infoCard: { backgroundColor: Colors.bgCard, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 16, gap: 10, marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { fontSize: 14, color: Colors.textSecondary, flex: 1 },
  problemBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: 'rgba(217,119,6,0.08)', borderRadius: 12, padding: 14, marginTop: 8, borderWidth: 1, borderColor: 'rgba(217,119,6,0.2)' },
  problemReason: { fontSize: 13, fontWeight: '600', color: Colors.warning },
  problemNotes: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  sectionLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 3, color: Colors.textMuted, marginBottom: 10 },
  itemCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.bgCard, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 12, marginBottom: 8 },
  itemImgBox: { width: 52, height: 52, borderRadius: 10, backgroundColor: Colors.bgInput, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  itemImg: { width: '100%', height: '100%' },
  itemBody: { flex: 1, gap: 4 },
  itemName: { fontSize: 13, fontWeight: '600', color: Colors.text },
  itemMeta: { flexDirection: 'row', gap: 10 },
  itemQty: { fontSize: 11, color: Colors.textMuted },
  itemPrice: { fontSize: 12, fontWeight: '600', color: Colors.accentDark },
  itemActions: { gap: 6 },
  itemActionBtn: { padding: 4 },
  actionsSection: { marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  reasonOption: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, marginBottom: 4 },
  reasonActive: { backgroundColor: 'rgba(200,169,106,0.08)' },
  reasonText: { fontSize: 14, color: Colors.text },
  notesInput: { backgroundColor: Colors.bgInput, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 14, fontSize: 14, color: Colors.text, minHeight: 80, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
});
