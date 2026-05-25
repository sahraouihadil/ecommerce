/**
 * Schedule Screen — Monthly calendar view for delivery driver
 */
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deliveryApi } from '../../src/api/delivery';
import { LoadingScreen, StatusBadge } from '../../src/components/ui';
import { Colors } from '../../src/constants/colors';
import { formatPrice } from '../../src/utils/format';
import { Ionicons } from '@expo/vector-icons';
import type { ScheduleResponse, ScheduleDayData } from '../../src/types/delivery.types';

const { width } = Dimensions.get('window');
const DAY_SIZE = (width - 48) / 7;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DOT_COLORS: Record<string, string> = {
  delivered: Colors.success,
  problem: Colors.error,
  pending: Colors.warning,
};

export default function ScheduleScreen() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [schedule, setSchedule] = useState<Record<string, ScheduleDayData>>({});
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    deliveryApi.getSchedule(year, month)
      .then(data => { setSchedule(data.schedule); setSelectedDay(null); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [year, month]);

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };

  // Build calendar grid
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectedData = selectedDay ? schedule[selectedDay] : null;

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.label}>DELIVERY SCHEDULE</Text>
          <Text style={s.title}>Calendar</Text>
        </View>

        {/* Month Nav */}
        <View style={s.monthNav}>
          <TouchableOpacity onPress={prevMonth} style={s.navBtn}>
            <Ionicons name="chevron-back" size={20} color={Colors.text} />
          </TouchableOpacity>
          <Text style={s.monthLabel}>{MONTHS[month - 1]} {year}</Text>
          <TouchableOpacity onPress={nextMonth} style={s.navBtn}>
            <Ionicons name="chevron-forward" size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Day Headers */}
        <View style={s.daysHeader}>
          {DAYS.map(d => <Text key={d} style={s.dayHeaderText}>{d}</Text>)}
        </View>

        {/* Calendar Grid */}
        <View style={s.grid}>
          {cells.map((day, i) => {
            if (day === null) return <View key={`empty-${i}`} style={s.cell} />;
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayData = schedule[dateStr];
            const isToday = day === now.getDate() && month === now.getMonth() + 1 && year === now.getFullYear();
            const isSelected = dateStr === selectedDay;

            return (
              <TouchableOpacity
                key={dateStr}
                style={[s.cell, isToday && s.cellToday, isSelected && s.cellSelected]}
                onPress={() => setSelectedDay(dateStr)}
                activeOpacity={0.7}
              >
                <Text style={[s.cellDay, isToday && s.cellDayToday, isSelected && s.cellDaySelected]}>{day}</Text>
                {dayData && (
                  <View style={[s.dot, { backgroundColor: DOT_COLORS[dayData.dot] || Colors.textMuted }]} />
                )}
                {dayData && <Text style={s.cellCount}>{dayData.count}</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected Day Orders */}
        {selectedData && (
          <View style={s.detailSection}>
            <Text style={s.detailTitle}>{selectedDay}</Text>
            <Text style={s.detailCount}>{selectedData.count} order{selectedData.count !== 1 ? 's' : ''}</Text>
            {selectedData.orders.map(order => (
              <TouchableOpacity
                key={order.id_raw}
                style={s.orderCard}
                onPress={() => router.push(`/(delivery)/order/${order.id_raw}`)}
              >
                <View style={s.orderTop}>
                  <Text style={s.orderId}>{order.id}</Text>
                  <StatusBadge status={order.status} />
                </View>
                <Text style={s.orderCustomer}>{order.customer}</Text>
                <Text style={s.orderAmount}>{formatPrice(order.amount)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  label: { fontSize: 10, fontWeight: '600', letterSpacing: 4, color: Colors.textMuted },
  title: { fontSize: 24, fontWeight: '700', color: Colors.text, marginTop: 4 },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 },
  navBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  monthLabel: { fontSize: 16, fontWeight: '700', color: Colors.text },
  daysHeader: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 8 },
  dayHeaderText: { width: DAY_SIZE, textAlign: 'center', fontSize: 10, fontWeight: '600', letterSpacing: 1, color: Colors.textMuted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20 },
  cell: { width: DAY_SIZE, height: DAY_SIZE + 8, alignItems: 'center', justifyContent: 'center', gap: 2 },
  cellToday: { backgroundColor: 'rgba(200,169,106,0.1)', borderRadius: 12 },
  cellSelected: { backgroundColor: Colors.primary, borderRadius: 12 },
  cellDay: { fontSize: 14, fontWeight: '500', color: Colors.text },
  cellDayToday: { color: Colors.accentDark, fontWeight: '700' },
  cellDaySelected: { color: Colors.textLight, fontWeight: '700' },
  dot: { width: 5, height: 5, borderRadius: 3 },
  cellCount: { fontSize: 8, color: Colors.textMuted, fontWeight: '600' },
  detailSection: { paddingHorizontal: 20, marginTop: 16 },
  detailTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  detailCount: { fontSize: 12, color: Colors.textMuted, marginTop: 2, marginBottom: 12 },
  orderCard: { backgroundColor: Colors.bgCard, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 14, marginBottom: 10 },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  orderId: { fontSize: 14, fontWeight: '700', color: Colors.text },
  orderCustomer: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  orderAmount: { fontSize: 14, fontWeight: '700', color: Colors.accentDark },
});
