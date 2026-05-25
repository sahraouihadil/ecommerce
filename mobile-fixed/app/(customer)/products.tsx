/**
 * Products Catalog Screen — Grid of all products
 */
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { customerApi, getImageUrl } from '../../src/api/customer';
import { LoadingScreen } from '../../src/components/ui';
import { Colors } from '../../src/constants/colors';
import { formatPrice } from '../../src/utils/format';
import { Ionicons } from '@expo/vector-icons';
import type { Product } from '../../src/types/customer.types';

const { width } = Dimensions.get('window');
const CARD_W = (width - 52) / 2;

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [category, setCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchProducts = async () => {
    try {
      const data = await customerApi.getProducts();
      setProducts(data);
      setFiltered(data);
    } catch { } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    if (!category) { setFiltered(products); return; }
    setFiltered(products.filter(p => p.category === category));
  }, [category, products]);

  if (loading) return <LoadingScreen />;

  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.label}>COLLECTION</Text>
        <Text style={s.title}>Our Products</Text>
      </View>

      {/* Category filter */}
      <FlatList
        horizontal
        data={categories}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, marginBottom: 16 }}
        keyExtractor={c => c}
        renderItem={({ item }) => {
          const active = item === 'All' ? !category : category === item;
          return (
            <TouchableOpacity
              style={[s.chip, active && s.chipActive]}
              onPress={() => setCategory(item === 'All' ? null : item)}
            >
              <Text style={[s.chipText, active && s.chipTextActive]}>{item}</Text>
            </TouchableOpacity>
          );
        }}
      />

      <FlatList
        data={filtered}
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: 16, gap: 12 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        keyExtractor={p => String(p.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProducts(); }} tintColor={Colors.accent} />}
        renderItem={({ item }) => {
          const img = item.images?.[0]?.image_url;
          return (
            <TouchableOpacity style={s.card} onPress={() => router.push(`/(customer)/product/${item.id}`)} activeOpacity={0.85}>
              <View style={s.cardImg}>
                {img ? <Image source={{ uri: getImageUrl(img) }} style={s.image} /> : <View style={s.imgPlaceholder}><Ionicons name="cube-outline" size={28} color={Colors.textMuted} /></View>}
              </View>
              <View style={s.cardBody}>
                <Text style={s.name} numberOfLines={1}>{item.name}</Text>
                <Text style={s.cat}>{item.category}</Text>
                <Text style={s.price}>{formatPrice(item.discount_price || item.price)}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  label: { fontSize: 10, fontWeight: '600', letterSpacing: 4, color: Colors.textMuted },
  title: { fontSize: 24, fontWeight: '700', color: Colors.text, marginTop: 4 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 12, fontWeight: '600', color: Colors.text },
  chipTextActive: { color: Colors.textLight },
  card: { width: CARD_W, backgroundColor: Colors.bgCard, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  cardImg: { width: '100%', height: CARD_W * 0.85, backgroundColor: Colors.bgInput },
  image: { width: '100%', height: '100%' },
  imgPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  cardBody: { padding: 10 },
  name: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 2 },
  cat: { fontSize: 9, color: Colors.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  price: { fontSize: 14, fontWeight: '700', color: Colors.accentDark },
});
