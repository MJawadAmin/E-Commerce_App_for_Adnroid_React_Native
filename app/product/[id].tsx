import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, Share as ShareIcon, ShoppingCart, Star, Plus } from 'lucide-react-native';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  useSharedValue, 
  useAnimatedStyle,
  withSpring,
  withSequence
} from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { products } from '@/data/mockData';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { addToCart } = useCart();
  const { items: wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();
  
  const product = products.find(p => p.id === id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const addToCartScale = useSharedValue(1);
  const wishlistScale = useSharedValue(1);
  
  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Product not found</Text>
      </SafeAreaView>
    );
  }

  const isInWishlist = wishlistItems.some(item => item.id === product.id);
  const productImages = [product.image, product.image, product.image]; // Mock multiple images

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    addToCartScale.value = withSequence(
      withSpring(1.1, { damping: 8 }),
      withSpring(1, { damping: 8 })
    );
  };

  const handleWishlistToggle = () => {
    if (isInWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
    wishlistScale.value = withSequence(
      withSpring(1.2, { damping: 8 }),
      withSpring(1, { damping: 8 })
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this amazing product: ${product.name} - $${product.price}`,
        title: product.name,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const animatedAddToCartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: addToCartScale.value }],
  }));

  const animatedWishlistStyle = useAnimatedStyle(() => ({
    transform: [{ scale: wishlistScale.value }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Premium Header */}
      <Animated.View 
        entering={FadeInDown.duration(600)}
        style={styles.header}
      >
        <BlurView intensity={80} style={styles.headerBlur}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerButton}
            activeOpacity={0.8}
          >
            <ArrowLeft size={24} color="#ffffff" strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <ShareIcon size={24} color="#ffffff" strokeWidth={2} />
            </TouchableOpacity>
            <Animated.View style={animatedWishlistStyle}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleWishlistToggle}
                activeOpacity={0.8}
              >
                <Heart 
                  size={24} 
                  color={isInWishlist ? "#ef4444" : "#ffffff"} 
                  strokeWidth={2} 
                  fill={isInWishlist ? "#ef4444" : "none"}
                />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </BlurView>
      </Animated.View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Premium Product Images */}
        <Animated.View 
          entering={FadeInUp.duration(600)}
          style={styles.imageSection}
        >
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setSelectedImage(index);
            }}
          >
            {productImages.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: image }} style={styles.productImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.4)']}
                  style={styles.imageGradient}
                />
              </View>
            ))}
          </ScrollView>
          
          {/* Premium Image Indicators */}
          <View style={styles.imageIndicators}>
            {productImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  selectedImage === index && styles.activeIndicator,
                ]}
              />
            ))}
          </View>
        </Animated.View>

        {/* Premium Product Info */}
        <Animated.View 
          entering={FadeInUp.delay(200).duration(600)}
          style={styles.productInfo}
        >
          <View style={styles.productInfoContent}>
            <View style={styles.productHeader}>
              <View style={styles.productTitleSection}>
                <Text style={styles.productCategory}>{product.category}</Text>
                <Text style={styles.productName}>{product.name}</Text>
              </View>
              <View style={styles.priceSection}>
                <Text style={styles.productPrice}>${product.price}</Text>
              </View>
            </View>

            {/* Premium Rating */}
            <View style={styles.ratingSection}>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    color={star <= Math.floor(product.rating) ? "#f59e0b" : "#e5e7eb"}
                    fill={star <= Math.floor(product.rating) ? "#f59e0b" : "#e5e7eb"}
                  />
                ))}
              </View>
              <Text style={styles.ratingText}>{product.rating}</Text>
              <Text style={styles.reviewCount}>({product.reviews} reviews)</Text>
            </View>

            {/* Quantity Selector */}
            <View style={styles.quantitySection}>
              <Text style={styles.sectionTitle}>Quantity</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  activeOpacity={0.8}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <View style={styles.quantityDisplay}>
                  <Text style={styles.quantity}>{quantity}</Text>
                </View>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(quantity + 1)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Description */}
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>
                {product.description || 'This is a premium quality product crafted with attention to detail and designed to exceed your expectations. Made with the finest materials and built to last, this item combines functionality with style to deliver exceptional value.'}
              </Text>
            </View>

            {/* Features */}
            <View style={styles.featuresSection}>
              <Text style={styles.sectionTitle}>Features</Text>
              {['Premium Quality Materials', 'Fast & Free Shipping', 'Easy Returns & Exchanges', '1 Year Warranty'].map((feature, index) => (
                <View key={index} style={styles.feature}>
                  <View style={styles.featureBullet} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Premium Bottom Actions */}
      <Animated.View 
        entering={FadeInUp.delay(400).duration(600)}
        style={styles.bottomActions}
      >
        <View style={styles.bottomActionsContent}>
          <TouchableOpacity
            style={styles.cartIconButton}
            onPress={() => router.push('/cart')}
            activeOpacity={0.8}
          >
            <ShoppingCart size={24} color="#2563EB" strokeWidth={2} />
          </TouchableOpacity>
          
          <Animated.View style={[styles.addToCartButtonContainer, animatedAddToCartStyle]}>
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={handleAddToCart}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#059669', '#047857']}
                style={styles.addToCartGradient}
              >
                <Plus size={20} color="#ffffff" strokeWidth={2} />
                <Text style={styles.addToCartText}>
                  Add {quantity > 1 ? `${quantity} ` : ''}to Cart
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderRadius: 0,
    overflow: 'hidden',
  },
  headerBlur: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  content: {
    flex: 1,
  },
  imageSection: {
    height: 420,
    backgroundColor: '#ffffff',
  },
  imageContainer: {
    width,
    height: 420,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 24,
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    backgroundColor: '#ffffff',
    width: 28,
  },
  productInfo: {
    flex: 1,
    marginTop: -28,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  productInfoContent: {
    paddingTop: 36,
    paddingHorizontal: 28,
    paddingBottom: 140,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  productTitleSection: {
    flex: 1,
    marginRight: 20,
  },
  productCategory: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  productName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1e293b',
    lineHeight: 38,
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  productPrice: {
    fontSize: 36,
    fontWeight: '900',
    color: '#2563EB',
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 36,
    gap: 8,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  reviewCount: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  quantitySection: {
    marginBottom: 36,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 6,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quantityButtonText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#64748b',
  },
  quantityDisplay: {
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
  },
  descriptionSection: {
    marginBottom: 36,
  },
  description: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 26,
    fontWeight: '500',
  },
  featuresSection: {
    marginBottom: 36,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  featureBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },
  featureText: {
    fontSize: 16,
    color: '#64748b',
    flex: 1,
    fontWeight: '500',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomActionsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 24,
    paddingBottom: 44,
    gap: 16,
  },
  cartIconButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartButtonContainer: {
    flex: 1,
  },
  addToCartButton: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  addToCartGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  addToCartText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
});