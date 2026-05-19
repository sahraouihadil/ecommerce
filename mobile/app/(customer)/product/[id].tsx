/**
 * Product Detail Screen
 */
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { customerApi, getImageUrl } from '../../../src/api/customer';
import { Button, LoadingScreen, StatusBadge, GoldDivider } from '../../../src/components/ui';
import { Colors } from '../../../src/constants/colors';
import { formatPrice } from '../../../src/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../src/contexts/AuthContext';
import type { Product } from '../../../src/types/customer.types';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    customerApi.getProduct(Number(id))
      .then(setProduct)
      .catch(() => Alert.alert('Error', 'Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !product) return <LoadingScreen />;

  const images = product.images || [];
  const currentImage = images[selectedImage]?.image_url;
  const inStock = (product.quantity || 0) > 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    setAdding(true);
    try {
      await customerApi.addToCart(product.id, quantity);
      Alert.alert('Added!', `${product.name} added to your bag.`);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.detail || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    try {
      await customerApi.addFavorite(product.id);
      Alert.alert('Saved!', 'Added to your favorites.');
    } catch { }
  };

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Back + Favorite */}
        <View style={s.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleFavorite} style={s.backBtn}>
            <Ionicons name="heart-outline" size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>

        {/* Image Gallery */}
        <View style={s.imageBox}>
          {currentImage ? (
            <Image source={{ uri: getImageUrl(currentImage) }} style={s.mainImage} resizeMode="cover" />
          ) : (
            <View style={s.imgPlaceholder}><Ionicons name="cube-outline" size={48} color={Colors.textMuted} /></View>
          )}
        </View>
        {images.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.thumbRow}>
            {images.map((img, i) => (
              <TouchableOpacity key={img.id} onPress={() => setSelectedImage(i)} style={[s.thumb, i === selectedImage && s.thumbActive]}>
                <Image source={{ uri: getImageUrl(img.image_url) }} style={s.thumbImg} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Info */}
        <View style={s.info}>
          <Text style={s.category}>{product.category}</Text>
          <Text style={s.name}>{product.name}</Text>

          <View style={s.priceRow}>
            <Text style={s.price}>{formatPrice(product.discount_price || product.price)}</Text>
            {product.discount_price && <Text style={s.oldPrice}>{formatPrice(product.price)}</Text>}
          </View>

          <View style={s.stockRow}>
            <View style={[s.stockDot, { backgroundColor: inStock ? Colors.success : Colors.error }]} />
            <Text style={s.stockText}>{inStock ? `${product.quantity} in stock` : 'Out of stock'}</Text>
          </View>

          <GoldDivider />

          <Text style={s.descLabel}>DESCRIPTION</Text>
          <Text style={s.description}>{product.description}</Text>

          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <View style={s.colorsRow}>
              <Text style={s.descLabel}>COLORS</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                {product.colors.map(c => (
                  <View key={c.id} style={[s.colorDot, { backgroundColor: c.color }]} />
                ))}
              </View>
            </View>
          )}

          <GoldDivider />

          {/* Quantity */}
          <View style={s.qtyRow}>
            <Text style={s.descLabel}>QUANTITY</Text>
            <View style={s.qtyControls}>
              <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={s.qtyBtn}>
                <Ionicons name="remove" size={18} color={Colors.text} />
              </TouchableOpacity>
              <Text style={s.qtyValue}>{quantity}</Text>
              <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={s.qtyBtn}>
                <Ionicons name="add" size={18} color={Colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom bar */}
      <View style={s.bottomBar}>
        <View style={s.totalCol}>
          <Text style={s.totalLabel}>TOTAL</Text>
          <Text style={s.totalPrice}>{formatPrice((product.discount_price || product.price) * quantity)}</Text>
        </View>
        <Button
          title="Add to Bag"
          onPress={handleAddToCart}
          loading={adding}
          disabled={!inStock}
          style={{ flex: 1 }}
          icon={<Ionicons name="bag-add-outline" size={18} color={Colors.textLight} />}
        />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  imageBox: { width, height: width * 0.85, backgroundColor: Colors.bgInput },
  mainImage: { width: '100%', height: '100%' },
  imgPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  thumbRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  thumb: { width: 60, height: 60, borderRadius: 10, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  thumbActive: { borderColor: Colors.accent },
  thumbImg: { width: '100%', height: '100%' },
  info: { padding: 20 },
  category: { fontSize: 10, letterSpacing: 3, color: Colors.textMuted, textTransform: 'uppercase', marginBottom: 4 },
  name: { fontSize: 24, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  price: { fontSize: 22, fontWeight: '700', color: Colors.accentDark },
  oldPrice: { fontSize: 15, color: Colors.textMuted, textDecorationLine: 'line-through' },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stockDot: { width: 7, height: 7, borderRadius: 4 },
  stockText: { fontSize: 12, color: Colors.textSecondary },
  descLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 3, color: Colors.textMuted, textTransform: 'uppercase', marginBottom: 8 },
  description: { fontSize: 14, lineHeight: 22, color: Colors.textSecondary },
  colorsRow: { marginTop: 16 },
  colorDot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: Colors.border },
  qtyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  qtyBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  qtyValue: { fontSize: 18, fontWeight: '700', color: Colors.text, minWidth: 30, textAlign: 'center' },
  bottomBar: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, borderTopWidth: 1, borderTopColor: Colors.divider, backgroundColor: Colors.bgCard },
  totalCol: {},
  totalLabel: { fontSize: 9, letterSpacing: 2, color: Colors.textMuted },
  totalPrice: { fontSize: 18, fontWeight: '700', color: Colors.text },
});
