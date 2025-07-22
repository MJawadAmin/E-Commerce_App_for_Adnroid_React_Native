import React, { createContext, useContext, useReducer } from 'react';
import { Alert } from 'react-native';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
}

interface WishlistState {
  items: WishlistItem[];
}

type WishlistAction =
  | { type: 'ADD_ITEM'; payload: WishlistItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_WISHLIST' };

const initialState: WishlistState = {
  items: [],
};

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const exists = state.items.find(item => item.id === action.payload.id);
      if (exists) {
        return state;
      }
      return { items: [...state.items, action.payload] };
    }
    
    case 'REMOVE_ITEM': {
      return { items: state.items.filter(item => item.id !== action.payload) };
    }
    
    case 'CLEAR_WISHLIST':
      return initialState;
    
    default:
      return state;
  }
}

interface WishlistContextType extends WishlistState {
  addToWishlist: (product: WishlistItem) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  const addToWishlist = (product: WishlistItem) => {
    const exists = state.items.find(item => item.id === product.id);
    if (!exists) {
      dispatch({ type: 'ADD_ITEM', payload: product });
      Alert.alert('💖 Added to Wishlist', `${product.name} has been added to your wishlist!`);
    }
  };

  const removeFromWishlist = (productId: string) => {
    const item = state.items.find(item => item.id === productId);
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
    if (item) {
      Alert.alert('💔 Removed', `${item.name} has been removed from your wishlist.`);
    }
  };

  const isInWishlist = (productId: string) => {
    return state.items.some(item => item.id === productId);
  };

  const clearWishlist = () => {
    dispatch({ type: 'CLEAR_WISHLIST' });
  };

  return (
    <WishlistContext.Provider
      value={{
        ...state,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}