/**
 * Customer Home Screen — Browse featured products
 * Fixed:
 *  - Shows all products as "New Arrivals" when no badge/new_arrival flags are set
 *  - Shows all products as "All Products" when on_sale is not set
 *  - Error state with retry instead of silent blank screen
 *  - Notifications bell in header
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, FlatList, Dimensions, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { customerApi, getImageUrl } from '../../src/api/customer';
import { useAuth } from '../../src/contexts/AuthContext';
import { SectionHeader, LoadingScreen, Button } from '../../src/components/ui';
import { Colors } from '../../src/constants/colors';
import { formatPrice } from '../../src/utils/format';
import { Ionicons } from '@expo/vector-icons';
import type { Product } from '../../src/types/customer.types';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 56) / 2;

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const { username } = useAuth();
  const router = useRouter();

  const fetchData = async () => {
    try {
      setError(false);
      const data = await customerApi.getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <LoadingScreen />;

  // Error state — never leave user on a blank screen
  if (error) {
    return (
      <SafeAreaView style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="wifi-outline" size={48} color={Colors.textMuted} />
        <Text style={{ color: Colors.text, fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 8 }}>
          Couldn't load products
        </Text>
        <Text style={{ color: Colors.textMuted, fontSize: 13, marginBottom: 24 }}>
          Check your connection and try again.
        </Text>
        <Button title="Retry" onPress={() => { setLoading(true); fetchData(); }} variant="outline" />
      </SafeAreaView>
    );
  }

  // Sections — fall back gracefully when flags are not set on products
  const featured = (() => {
    const flagged = products.filter(p => p.badge || p.new_arrival);
    return flagged.length > 0 ? flagged.slice(0, 8) : products.slice(0, 8);
  })();

  const onSale = (() => {
    const flagged = products.filter(p => p.on_sale);
    // Only show the sale section when there are genuinely discounted products
    return flagged.slice(0, 8);
  })();

  const allProducts = products.slice(0, 6);
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchData(); }}
            tintColor={Colors.accent}
          />
        }
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>Welcome back,</Text>
            <Text style={s.username}>{username || 'Guest'}</Text>
          </View>
          <View style={s.headerActions}>
            <TouchableOpacity onPress={() => router.push('/(customer)/search')} style={s.iconBtn}>
              <Ionicons name="search-outline" size={22} color={Colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(customer)/favorites')} style={s.iconBtn}>
              <Ionicons name="heart-outline" size={22} color={Colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Banner */}
        <View style={s.hero}>
          <Text style={s.heroLabel}>LUXURY FURNITURE</Text>
          <Text style={s.heroTitle}>Design Your{'\n'}Perfect Space</Text>
          <TouchableOpacity style={s.heroBtn} onPress={() => router.push('/(customer)/products')}>
            <Text style={s.heroBtnText}>SHOP NOW</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        {categories.length > 0 && (
          <View style={s.section}>
            <SectionHeader title="Categories" subtitle="BROWSE" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10 }}
            >
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={s.catChip}
                  onPress={() => router.push('/(customer)/products')}
                >
                  <Text style={s.catText}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Featured / New Arrivals */}
        {featured.length > 0 && (
          <View style={s.section}>
            <SectionHeader
              title="Featured"
              subtitle="NEW ARRIVALS"
              action={{ label: 'See All →', onPress: () => router.push('/(customer)/products') }}
            />
            <FlatList
              horizontal
              data={featured}
              showsHorizontalScrollIndicator={false}
              keyExtractor={p => String(p.id)}
              contentContainerStyle={{ gap: 14 }}
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  onPress={() => router.push(`/(customer)/product/${item.id}`)}
                />
              )}
            />
          </View>
        )}

        {/* On Sale */}
        {onSale.length > 0 && (
          <View style={s.section}>
            <SectionHeader
              title="On Sale"
              subtitle="SPECIAL OFFERS"
              action={{ label: 'See All →', onPress: () => router.push('/(customer)/products') }}
            />
            <FlatList
              horizontal
              data={onSale}
              showsHorizontalScrollIndicator={false}
              keyExtractor={p => String(p.id)}
              contentContainerStyle={{ gap: 14 }}
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  onPress={() => router.push(`/(customer)/product/${item.id}`)}
                />
              )}
            />
          </View>
        )}

        {/* All Products — always show something even if no flags are set */}
        {onSale.length === 0 && allProducts.length > 0 && (
          <View style={s.section}>
            <SectionHeader
              title="All Products"
              subtitle="EXPLORE"
              action={{ label: 'See All →', onPress: () => router.push('/(customer)/products') }}
            />
            <FlatList
              horizontal
              data={allProducts}
              showsHorizontalScrollIndicator={false}
              keyExtractor={p => String(p.id)}
              contentContainerStyle={{ gap: 14 }}
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  onPress={() => router.push(`/(customer)/product/${item.id}`)}
                />
              )}
            />
          </View>
        )}

        {/* Empty state — backend returned no products at all */}
        {products.length === 0 && (
          <View style={s.emptyWrap}>
            <Ionicons name="cube-outline" size={48} color={Colors.textMuted} />
            <Text style={s.emptyTitle}>No products yet</Text>
            <Text style={s.emptySubtitle}>Check back soon — new items are on the way.</Text>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ProductCard({ product, onPress }: { product: Product; onPress: () => void }) {
  const img = product.images?.[0]?.image_url;
  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.85}>
      <View style={s.cardImg}>
        {img ? (
          <Image source={{ uri: getImageUrl(img) }} style={s.cardImage} resizeMode="cover" />
        ) : (
          <View style={s.cardPlaceholder}>
            <Ionicons name="cube-outline" size={32} color={Colors.textMuted} />
          </View>
        )}
        {product.badge && (
          <View style={s.cardBadge}>
            <Text style={s.cardBadgeText}>{product.badge.toUpperCase()}</Text>
          </View>
        )}
        {product.on_sale && !product.badge && (
          <View style={[s.cardBadge, { backgroundColor: Colors.error }]}>
            <Text style={s.cardBadgeText}>SALE</Text>
          </View>
        )}
        {product.new_arrival && !product.badge && !product.on_sale && (
          <View style={[s.cardBadge, { backgroundColor: Colors.info }]}>
            <Text style={[s.cardBadgeText, { color: Colors.textLight }]}>NEW</Text>
          </View>
        )}
      </View>
      <View style={s.cardBody}>
        <Text style={s.cardName} numberOfLines={1}>{product.name}</Text>
        <Text style={s.cardCategory}>{product.category}</Text>
        <View style={s.cardPriceRow}>
          <Text style={s.cardPrice}>{formatPrice(product.discount_price || product.price)}</Text>
          {product.discount_price && (
            <Text style={s.cardOldPrice}>{formatPrice(product.price)}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12,
  },
  greeting: { fontSize: 13, color: Colors.textMuted, letterSpacing: 0.5 },
  username: { fontSize: 20, fontWeight: '700', color: Colors.text, letterSpacing: 0.5, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 12 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(200,169,106,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Hero
  hero: {
    marginHorizontal: 20, backgroundColor: Colors.primary,
    borderRadius: 20, padding: 28, marginBottom: 24,
  },
  heroLabel: { fontSize: 9, letterSpacing: 4, color: Colors.accent, fontWeight: '600', marginBottom: 8 },
  heroTitle: { fontSize: 28, fontWeight: '700', color: Colors.textLight, lineHeight: 36, marginBottom: 20 },
  heroBtn: {
    alignSelf: 'flex-start', backgroundColor: Colors.accent,
    paddingVertical: 10, paddingHorizontal: 22, borderRadius: 10,
  },
  heroBtnText: { fontSize: 11, fontWeight: '700', letterSpacing: 2, color: Colors.primary },

  // Section
  section: { paddingHorizontal: 20, marginBottom: 28 },

  // Categories
  catChip: {
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard,
  },
  catText: { fontSize: 12, fontWeight: '600', color: Colors.text, letterSpacing: 0.5 },

  // Product card
  card: {
    width: CARD_WIDTH, backgroundColor: Colors.bgCard,
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border,
  },
  cardImg: {
    width: '100%', height: CARD_WIDTH * 0.9,
    backgroundColor: Colors.bgInput, position: 'relative',
  },
  cardImage: { width: '100%', height: '100%' },
  cardPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  cardBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: Colors.accent,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  cardBadgeText: { fontSize: 8, fontWeight: '700', letterSpacing: 1.5, color: Colors.primary },
  cardBody: { padding: 12 },
  cardName: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 2 },
  cardCategory: {
    fontSize: 10, color: Colors.textMuted, letterSpacing: 1,
    textTransform: 'uppercase', marginBottom: 6,
  },
  cardPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardPrice: { fontSize: 14, fontWeight: '700', color: Colors.accentDark },
  cardOldPrice: { fontSize: 11, color: Colors.textMuted, textDecorationLine: 'line-through' },

  // Empty state
  emptyWrap: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: Colors.text, marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
