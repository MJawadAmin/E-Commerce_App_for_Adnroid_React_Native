import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShoppingCart, Plus, Search, Bell, MapPin, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { 
  FadeInDown, 
  FadeInRight, 
  useSharedValue, 
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolate
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useCart } from '@/contexts/CartContext';
import { products, categories } from '@/data/mockData';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { addToCart, itemCount } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const cartScale = useSharedValue(1);
  const headerOpacity = useSharedValue(1);
  const scrollY = useSharedValue(0);

  const filteredProducts = selectedCategory === 'All' 
    ? products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products.filter(product => 
        product.category === selectedCategory &&
        (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         product.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  const onRefresh = async () => {
    setRefreshing(true);
    headerOpacity.value = withSequence(
      withTiming(0.5, { duration: 300 }),
      withTiming(1, { duration: 300 })
    );
    setTimeout(() => setRefreshing(false), 1500);
  };

  const handleAddToCart = (product: any) => {
    addToCart(product);
    cartScale.value = withSequence(
      withSpring(1.4, { damping: 8 }),
      withSpring(1, { damping: 8 })
    );
  };

  const animatedCartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cartScale.value }],
  }));

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, 100],
          [0, -20],
          'clamp'
        )
      }
    ]
  }));

  const ProductCard = ({ product, index }: { product: any; index: number }) => {
    const cardScale = useSharedValue(1);
    const cardRotation = useSharedValue(0);
    
    const animatedCardStyle = useAnimatedStyle(() => ({
      transform: [
        { scale: cardScale.value },
        { rotateY: `${cardRotation.value}deg` }
      ],
    }));

    const handlePressIn = () => {
      cardScale.value = withSpring(0.96, { damping: 15 });
      cardRotation.value = withSpring(2, { damping: 15 });
    };

    const handlePressOut = () => {
      cardScale.value = withSpring(1, { damping: 15 });
      cardRotation.value = withSpring(0, { damping: 15 });
    };

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100).springify()}
        style={animatedCardStyle}
      >
        <TouchableOpacity
          onPress={() => router.push(`/product/${product.id}`)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          style={styles.productCard}
        >
          <View style={styles.imageContainer}>
            <Image source={{ uri: product.image }} style={styles.productImage} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.15)']}
              style={styles.imageGradient}
            />
            <View style={styles.ratingBadge}>
              <Star size={12} color="#f59e0b" fill="#f59e0b" />
              <Text style={styles.ratingBadgeText}>{product.rating}</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={(e) => {
                e.stopPropagation();
                handleAddToCart(product);
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#059669', '#047857']}
                style={styles.addButtonGradient}
              >
                <Plus size={16} color="#ffffff" strokeWidth={2.5} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          <View style={styles.productInfo}>
            <Text style={styles.productCategory}>{product.category}</Text>
            <Text style={styles.productName} numberOfLines={2}>
              {product.name}
            </Text>
            <View style={styles.productFooter}>
              <Text style={styles.productPrice}>${product.price}</Text>
              <Text style={styles.reviewCount}>({product.reviews})</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Premium Header */}
      <Animated.View 
        entering={FadeInDown.duration(600)}
        style={[styles.header, animatedHeaderStyle]}
      >
        <LinearGradient
          colors={['#ffffff', '#f8fafc', '#f1f5f9']}
          style={styles.headerGradient}
        >
          <View style={styles.headerTop}>
            <View style={styles.locationSection}>
              <View style={styles.locationIcon}>
                <MapPin size={14} color="#2563EB" strokeWidth={2} />
              </View>
              <View>
                <Text style={styles.locationLabel}>Deliver to</Text>
                <Text style={styles.locationText}>New York, NY 10001</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.notificationButton}>
                <Bell size={20} color="#64748b" strokeWidth={2} />
                <View style={styles.notificationBadge} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => router.push('/cart')}
                style={styles.cartButton}
              >
                <Animated.View style={animatedCartStyle}>
                  <ShoppingCart size={20} color="#2563EB" strokeWidth={2} />
                  {itemCount > 0 && (
                    <View style={styles.cartBadge}>
                      <Text style={styles.cartBadgeText}>{itemCount}</Text>
                    </View>
                  )}
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.welcomeSection}>
            <Text style={styles.greeting}>Good morning! 👋</Text>
            <Text style={styles.title}>Discover amazing products</Text>
          </View>

          {/* Premium Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Search size={18} color="#94a3b8" strokeWidth={2} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for products..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={(e) => {
          scrollY.value = e.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#2563EB"
            colors={['#2563EB']}
          />
        }
      >
        {/* Premium Categories */}
        <Animated.View 
          entering={FadeInRight.delay(200).duration(600)}
          style={styles.categoriesSection}
        >
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category, index) => {
              const isActive = selectedCategory === category;
              return (
                <Animated.View
                  key={category}
                  entering={FadeInRight.delay(index * 50).springify()}
                >
                  <TouchableOpacity
                    style={[
                      styles.categoryChip,
                      isActive && styles.categoryChipActive,
                    ]}
                    onPress={() => setSelectedCategory(category)}
                    activeOpacity={0.8}
                  >
                    {isActive ? (
                      <LinearGradient
                        colors={['#3B82F6', '#2563EB']}
                        style={styles.categoryGradient}
                      >
                        <Text style={styles.categoryTextActive}>{category}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={styles.categoryInactive}>
                        <Text style={styles.categoryText}>{category}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Products Grid */}
        <View style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {searchQuery ? `Results for "${searchQuery}"` : 'Featured Products'}
            </Text>
            <Text style={styles.productCount}>
              {filteredProducts.length} item{filteredProducts.length !== 1 ? 's' : ''}
            </Text>
          </View>
          
          <View style={styles.productsGrid}>
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </View>
        </View>
      </ScrollView>
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
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  locationText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  notificationButton: {
    position: 'relative',
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  cartButton: {
    position: 'relative',
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  welcomeSection: {
    marginBottom: 28,
  },
  greeting: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 6,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1e293b',
    lineHeight: 38,
  },
  searchContainer: {
    marginBottom: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  categoriesSection: {
    paddingVertical: 28,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
  },
  categoryChip: {
    marginRight: 16,
    borderRadius: 24,
    overflow: 'hidden',
  },
  categoryChipActive: {},
  categoryGradient: {
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  categoryInactive: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  categoryTextActive: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  productsSection: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
  },
  productCount: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -10,
  },
  productCard: {
    width: (width - 60) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f8fafc',
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  productImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f1f5f9',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
  },
  addButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonGradient: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 20,
  },
  productCategory: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    lineHeight: 22,
    marginBottom: 12,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2563EB',
  },
  reviewCount: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
});