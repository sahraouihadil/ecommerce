/**
 * Favorites Screen
 */
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { customerApi, getImageUrl } from '../../src/api/customer';
import { LoadingScreen, EmptyState } from '../../src/components/ui';
import { Colors } from '../../src/constants/colors';
import { formatPrice } from '../../src/utils/format';
import { Ionicons } from '@expo/vector-icons';
import type { FavoriteItem } from '../../src/types/customer.types';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const { isAuthenticated } = useAuth();

  const fetchFavorites = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try { setFavorites(await customerApi.getFavorites()); }
    catch { } finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { fetchFavorites(); }, [isAuthenticated]));

  const handleRemove = async (id: number) => {
    try {
      await customerApi.removeFavorite(id);
      setFavorites(prev => prev.filter(f => f.id !== id));
    } catch { Alert.alert('Error', 'Failed to remove favorite'); }
  };

  if (loading) return <LoadingScreen />;

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={s.label}>SAVED ITEMS</Text>
            <Text style={s.title}>Favorites</Text>
          </View>
        </View>
        <EmptyState
          title="Sign in required"
          subtitle="You need to sign in to view and save your favorite furniture."
          icon={<Ionicons name="heart-outline" size={48} color={Colors.textMuted} />}
          action={{ title: 'Sign In', onPress: () => router.push('/(auth)/login') }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={s.label}>SAVED ITEMS</Text>
          <Text style={s.title}>Favorites</Text>
        </View>
      </View>

      {favorites.length === 0 ? (
        <EmptyState
          title="No favorites yet"
          subtitle="Tap the heart icon on products you love."
          icon={<Ionicons name="heart-outline" size={48} color={Colors.textMuted} />}
          action={{ title: 'Browse Products', onPress: () => router.push('/(customer)/products') }}
        />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={f => String(f.id)}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchFavorites(); }} tintColor={Colors.accent} />}
          renderItem={({ item }) => (
            <View style={s.card}>
              <TouchableOpacity
                style={s.cardContent}
                onPress={() => router.push(`/(customer)/product/${item.product_id}`)}
                activeOpacity={0.85}
              >
                <View style={s.imgBox}>
                  {item.image ? (
                    <Image source={{ uri: getImageUrl(item.image) }} style={s.image} />
                  ) : (
                    <Ionicons name="cube-outline" size={24} color={Colors.textMuted} />
                  )}
                </View>
                <View style={s.cardBody}>
                  <Text style={s.name} numberOfLines={1}>{item.name || `Product #${item.product_id}`}</Text>
                  <Text style={s.price}>{formatPrice(item.price)}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleRemove(item.id)} style={s.removeBtn}>
                <Ionicons name="heart-dislike-outline" size={18} color={Colors.error} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(200,169,106,0.1)', alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 10, fontWeight: '600', letterSpacing: 4, color: Colors.textMuted },
  title: { fontSize: 24, fontWeight: '700', color: Colors.text, marginTop: 2 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, paddingRight: 12 },
  cardContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  imgBox: { width: 64, height: 64, borderRadius: 12, backgroundColor: Colors.bgInput, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  cardBody: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  price: { fontSize: 14, fontWeight: '700', color: Colors.accentDark },
  removeBtn: { padding: 8 },
});
