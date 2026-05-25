/**
 * Search Screen
 */
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { customerApi, getImageUrl } from '../../src/api/customer';
import { Input, EmptyState } from '../../src/components/ui';
import { Colors } from '../../src/constants/colors';
import { formatPrice } from '../../src/utils/format';
import { Ionicons } from '@expo/vector-icons';
import type { SearchResult } from '../../src/types/customer.types';

const { width } = Dimensions.get('window');
const CARD_W = (width - 52) / 2;

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const router = useRouter();

  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.trim().length < 2) { setResults([]); setSearched(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await customerApi.searchProducts(text.trim());
        setResults(data);
        setSearched(true);
      } catch { setResults([]); setSearched(true); }
    }, 400);
  }, []);

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Input
            value={query}
            onChangeText={handleSearch}
            placeholder="Search furniture..."
            autoFocus
            returnKeyType="search"
            containerStyle={{ marginBottom: 0 }}
            icon={<Ionicons name="search-outline" size={18} color={Colors.textMuted} />}
          />
        </View>
      </View>

      {!searched ? (
        <View style={s.hintContainer}>
          <Ionicons name="search" size={48} color={Colors.divider} />
          <Text style={s.hintText}>Search for furniture by name, category, or description</Text>
        </View>
      ) : results.length === 0 ? (
        <EmptyState title="No results" subtitle={`No products found for "${query}"`} icon={<Ionicons name="search-outline" size={48} color={Colors.textMuted} />} />
      ) : (
        <FlatList
          data={results}
          numColumns={2}
          columnWrapperStyle={{ paddingHorizontal: 16, gap: 12 }}
          contentContainerStyle={{ gap: 12, paddingBottom: 24, paddingTop: 8 }}
          keyExtractor={p => String(p.id)}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.card} onPress={() => router.push(`/(customer)/product/${item.id}`)} activeOpacity={0.85}>
              <View style={s.cardImg}>
                {item.image_url ? <Image source={{ uri: getImageUrl(item.image_url) }} style={s.image} /> : <Ionicons name="cube-outline" size={28} color={Colors.textMuted} />}
              </View>
              <View style={s.cardBody}>
                <Text style={s.name} numberOfLines={1}>{item.name}</Text>
                <Text style={s.cat}>{item.category}</Text>
                <Text style={s.price}>{formatPrice(item.price)}</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(200,169,106,0.1)', alignItems: 'center', justifyContent: 'center' },
  hintContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  hintText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
  card: { width: CARD_W, backgroundColor: Colors.bgCard, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  cardImg: { width: '100%', height: CARD_W * 0.85, backgroundColor: Colors.bgInput, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  cardBody: { padding: 10 },
  name: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 2 },
  cat: { fontSize: 9, color: Colors.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  price: { fontSize: 14, fontWeight: '700', color: Colors.accentDark },
});
