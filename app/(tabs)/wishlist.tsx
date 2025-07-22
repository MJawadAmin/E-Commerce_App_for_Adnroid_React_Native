import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, ShoppingCart, Trash2, Star } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';

const { width } = Dimensions.get('window');

export default function WishlistScreen() {
  const router = useRouter();
  const { items: wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (product: any) => {
    addToCart(product);
  };

  const handleRemoveFromWishlist = (productId: string) => {
    removeFromWishlist(productId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Premium Header */}
      <Animated.View 
        entering={FadeInDown.duration(600)}
        style={styles.header}
      >
        <LinearGradient
          colors={['#ffffff', '#f8fafc']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.heartIcon}>
                <Heart size={24} color="#ef4444" strokeWidth={2} fill="#ef4444" />
              </View>
              <View>
                <Text style={styles.title}>My Wishlist</Text>
                <Text style={styles.subtitle}>
                  {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {wishlistItems.length === 0 ? (
        // Premium Empty Wishlist
        <Animated.View 
          entering={FadeInUp.duration(600)}
          style={styles.emptyWishlist}
        >
          <View style={styles.emptyWishlistIcon}>
            <LinearGradient
              colors={['#fef2f2', '#fee2e2']}
              style={styles.emptyWishlistIconGradient}
            >
              <Heart size={64} color="#ef4444" strokeWidth={1.5} />
            </LinearGradient>
          </View>
          <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptySubtitle}>
            Save products you love to your wishlist and never lose track of them
          </Text>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => router.push('/(tabs)/')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#ef4444', '#dc2626']}
              style={styles.browseButtonGradient}
            >
              <Text style={styles.browseButtonText}>Discover Products</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        // Premium Wishlist Items
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {wishlistItems.map((product, index) => (
            <Animated.View
              key={product.id}
              entering={FadeInDown.delay(index * 100).springify()}
              style={styles.wishlistItem}
            >
              <TouchableOpacity
                onPress={() => router.push(`/product/${product.id}`)}
                activeOpacity={0.9}
                style={styles.productInfo}
              >
                <Image source={{ uri: product.image }} style={styles.productImage} />
                <View style={styles.productDetails}>
                  <Text style={styles.productCategory}>{product.category}</Text>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.productPrice}>${product.price}</Text>
                  <View style={styles.productRating}>
                    <Star size={14} color="#f59e0b" fill="#f59e0b" />
                    <Text style={styles.ratingText}>{product.rating}</Text>
                    <Text style={styles.reviewCount}>({product.reviews})</Text>
                  </View>
                </View>
              </TouchableOpacity>
              
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.addToCartButton}
                  onPress={() => handleAddToCart(product)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#059669', '#047857']}
                    style={styles.addToCartGradient}
                  >
                    <ShoppingCart size={18} color="#ffffff" strokeWidth={2} />
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveFromWishlist(product.id)}
                  activeOpacity={0.8}
                >
                  <Trash2 size={18} color="#ef4444" strokeWidth={2} />
                </TouchableOpacity>
              </View>
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heartIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '600',
  },
  emptyWishlist: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyWishlistIcon: {
    marginBottom: 32,
    borderRadius: 80,
    overflow: 'hidden',
  },
  emptyWishlistIconGradient: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  browseButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  browseButtonGradient: {
    paddingHorizontal: 40,
    paddingVertical: 18,
  },
  browseButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  wishlistItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f8fafc',
  },
  productInfo: {
    flex: 1,
    flexDirection: 'row',
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    marginRight: 16,
  },
  productDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productCategory: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    lineHeight: 22,
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2563EB',
    marginBottom: 6,
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  reviewCount: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  actions: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 12,
  },
  addToCartButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  addToCartGradient: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
});