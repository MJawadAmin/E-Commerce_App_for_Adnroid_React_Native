import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Minus, Trash2, CreditCard, ShoppingBag } from 'lucide-react-native';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  useSharedValue, 
  useAnimatedStyle,
  withSpring,
  withSequence
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useCart } from '@/contexts/CartContext';

export default function CartScreen() {
  const router = useRouter();
  const { items, total, itemCount, updateQuantity, removeFromCart } = useCart();
  const checkoutScale = useSharedValue(1);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    const item = items.find(item => item.id === productId);
    Alert.alert(
      '🗑️ Remove Item',
      `Are you sure you want to remove "${item?.name}" from your cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removeFromCart(productId)
        }
      ]
    );
  };

  const handleCheckout = () => {
    checkoutScale.value = withSequence(
      withSpring(0.95, { damping: 15 }),
      withSpring(1, { damping: 15 })
    );
    
    Alert.alert(
      '🛒 Checkout',
      `Proceed to payment for ${itemCount} item${itemCount !== 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue', 
          onPress: () => {
            Alert.alert('🎉 Success!', 'Order placed successfully! Thank you for shopping with us.');
          }
        }
      ]
    );
  };

  const shipping = total > 50 ? 0 : 9.99;
  const tax = total * 0.08;
  const finalTotal = total + shipping + tax;

  const animatedCheckoutStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkoutScale.value }],
  }));

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
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <ArrowLeft size={24} color="#1e293b" strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.title}>Shopping Cart</Text>
            <Text style={styles.subtitle}>
              {itemCount} item{itemCount !== 1 ? 's' : ''} • ${total.toFixed(2)}
            </Text>
          </View>
          <View style={styles.cartIcon}>
            <ShoppingBag size={24} color="#2563EB" strokeWidth={2} />
          </View>
        </LinearGradient>
      </Animated.View>

      {items.length === 0 ? (
        // Premium Empty Cart
        <Animated.View 
          entering={FadeInUp.duration(600)}
          style={styles.emptyCart}
        >
          <View style={styles.emptyCartIcon}>
            <LinearGradient
              colors={['#f1f5f9', '#e2e8f0']}
              style={styles.emptyCartIconGradient}
            >
              <Text style={styles.emptyCartEmoji}>🛒</Text>
            </LinearGradient>
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Discover amazing products and add them to your cart to get started
          </Text>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => router.push('/(tabs)/')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              style={styles.browseButtonGradient}
            >
              <Text style={styles.browseButtonText}>Start Shopping</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <>
          {/* Premium Cart Items */}
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {items.map((item, index) => (
              <Animated.View
                key={item.id}
                entering={FadeInDown.delay(index * 100).springify()}
                style={styles.cartItem}
              >
                <View style={styles.cartItemContent}>
                  <Image source={{ uri: item.image }} style={styles.productImage} />
                  
                  <View style={styles.productInfo}>
                    <Text style={styles.productCategory}>{item.category}</Text>
                    <Text style={styles.productName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.productPrice}>${item.price}</Text>
                    
                    <View style={styles.quantityContainer}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
                        activeOpacity={0.8}
                      >
                        <Minus size={16} color="#64748b" strokeWidth={2.5} />
                      </TouchableOpacity>
                      
                      <View style={styles.quantityDisplay}>
                        <Text style={styles.quantity}>{item.quantity}</Text>
                      </View>
                      
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
                        activeOpacity={0.8}
                      >
                        <Plus size={16} color="#64748b" strokeWidth={2.5} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.itemActions}>
                    <Text style={styles.itemTotal}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </Text>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveFromCart(item.id)}
                      activeOpacity={0.8}
                    >
                      <Trash2 size={18} color="#ef4444" strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            ))}
          </ScrollView>

          {/* Premium Cart Summary */}
          <Animated.View 
            entering={FadeInUp.delay(200).duration(600)}
            style={styles.cartSummary}
          >
            <View style={styles.summaryContent}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping</Text>
                <Text style={[styles.summaryValue, shipping === 0 && styles.freeShipping]}>
                  {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax</Text>
                <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>${finalTotal.toFixed(2)}</Text>
              </View>
              
              <Animated.View style={animatedCheckoutStyle}>
                <TouchableOpacity
                  style={styles.checkoutButton}
                  onPress={handleCheckout}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#059669', '#047857']}
                    style={styles.checkoutGradient}
                  >
                    <CreditCard size={20} color="#ffffff" strokeWidth={2} />
                    <Text style={styles.checkoutButtonText}>
                      Proceed to Checkout
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Animated.View>
        </>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backButton: {
    marginRight: 16,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    flex: 1,
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
  cartIcon: {
    padding: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 16,
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyCartIcon: {
    marginBottom: 32,
    borderRadius: 80,
    overflow: 'hidden',
  },
  emptyCartIconGradient: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartEmoji: {
    fontSize: 64,
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
    paddingBottom: 20,
  },
  cartItem: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f8fafc',
  },
  cartItemContent: {
    flexDirection: 'row',
    padding: 20,
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 16,
  },
  productInfo: {
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
    fontSize: 18,
    fontWeight: '800',
    color: '#2563EB',
    marginBottom: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 4,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quantityDisplay: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: 12,
  },
  itemTotal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 12,
  },
  removeButton: {
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
  },
  cartSummary: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  summaryContent: {
    padding: 28,
    paddingBottom: 44,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  freeShipping: {
    color: '#059669',
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: '#f1f5f9',
    paddingTop: 20,
    marginBottom: 28,
  },
  totalLabel: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
  },
  totalValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#2563EB',
  },
  checkoutButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  checkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  checkoutButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
});