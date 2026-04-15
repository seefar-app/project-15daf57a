import { create } from 'zustand';
import { Restaurant, MenuItem, CartItem, Order, OrderStatus, Driver, PromoCode, Review } from '@/types';
import { supabase } from '@/lib/supabase';

interface StoreState {
  restaurants: Restaurant[];
  featuredRestaurants: Restaurant[];
  cart: CartItem[];
  orders: Order[];
  activeOrder: Order | null;
  selectedRestaurant: Restaurant | null;
  searchQuery: string;
  selectedCuisine: string | null;
  appliedPromo: PromoCode | null;
  isLoading: boolean;
  error: string | null;
  
  fetchRestaurants: () => Promise<void>;
  searchRestaurants: (query: string) => void;
  filterByCuisine: (cuisine: string | null) => void;
  setSelectedRestaurant: (restaurant: Restaurant | null) => void;
  addToCart: (item: MenuItem, quantity: number, customizations?: any[], instructions?: string) => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  applyPromoCode: (code: string) => Promise<boolean>;
  removePromoCode: () => void;
  createOrder: (addressId: string, paymentMethod: string) => Promise<Order>;
  fetchOrders: () => Promise<void>;
  setActiveOrder: (order: Order | null) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  getRestaurantById: (id: string) => Restaurant | undefined;
}

const transformRestaurantFromDB = (dbRestaurant: any, menuItems: MenuItem[] = []): Restaurant => {
  return {
    id: dbRestaurant.id,
    name: dbRestaurant.name,
    image: dbRestaurant.logo_url || 'https://via.placeholder.com/400',
    cuisine: [],
    rating: parseFloat(dbRestaurant.rating) || 0,
    reviewCount: 0,
    deliveryTime: `${dbRestaurant.delivery_time_min || 0}-${dbRestaurant.delivery_time_max || 0} min`,
    deliveryFee: parseFloat(dbRestaurant.delivery_fee) || 0,
    minOrder: parseFloat(dbRestaurant.min_order_amount) || 0,
    address: '',
    hours: '10:00 AM - 10:00 PM',
    coordinates: {
      latitude: parseFloat(dbRestaurant.latitude) || 0,
      longitude: parseFloat(dbRestaurant.longitude) || 0,
    },
    menu: menuItems,
  };
};

const transformMenuItemFromDB = (dbItem: any): MenuItem => {
  return {
    id: dbItem.id,
    name: dbItem.name,
    description: dbItem.description || '',
    image: dbItem.image_url || 'https://via.placeholder.com/400',
    price: parseFloat(dbItem.price),
    category: 'General',
    customizations: [],
    vegetarian: false,
    vegan: false,
  };
};

export const useStore = create<StoreState>((set, get) => ({
  restaurants: [],
  featuredRestaurants: [],
  cart: [],
  orders: [],
  activeOrder: null,
  selectedRestaurant: null,
  searchQuery: '',
  selectedCuisine: null,
  appliedPromo: null,
  isLoading: false,
  error: null,

  fetchRestaurants: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { data: restaurants, error: restaurantsError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_open', true);

      if (restaurantsError) throw restaurantsError;

      const restaurantsWithMenus: Restaurant[] = [];

      for (const restaurant of restaurants || []) {
        const { data: menuItems, error: menuError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('restaurant_id', restaurant.id)
          .eq('is_available', true);

        if (menuError) throw menuError;

        const transformedMenu = (menuItems || []).map(transformMenuItemFromDB);
        const transformedRestaurant = transformRestaurantFromDB(restaurant, transformedMenu);
        restaurantsWithMenus.push(transformedRestaurant);
      }

      set({
        restaurants: restaurantsWithMenus,
        featuredRestaurants: restaurantsWithMenus.slice(0, 3),
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      set({ error: 'Failed to fetch restaurants', isLoading: false });
    }
  },

  searchRestaurants: (query: string) => {
    set({ searchQuery: query });
  },

  filterByCuisine: (cuisine: string | null) => {
    set({ selectedCuisine: cuisine });
  },

  setSelectedRestaurant: (restaurant) => {
    set({ selectedRestaurant: restaurant });
  },

  addToCart: (item, quantity, customizations = [], instructions = '') => {
    const { cart, selectedRestaurant } = get();
    
    if (cart.length > 0 && selectedRestaurant) {
      const existingRestaurantId = cart[0].menuItem.id.split('-')[0];
      if (existingRestaurantId !== item.id.split('-')[0]) {
        set({ cart: [] });
      }
    }

    const cartItemId = `${item.id}-${Date.now()}`;
    const totalPrice = item.price * quantity;

    const newCartItem: CartItem = {
      id: cartItemId,
      menuItem: item,
      quantity,
      selectedCustomizations: customizations,
      specialInstructions: instructions,
      totalPrice,
    };

    set({ cart: [...cart, newCartItem] });
  },

  updateCartItemQuantity: (itemId, quantity) => {
    const { cart } = get();
    if (quantity <= 0) {
      set({ cart: cart.filter(item => item.id !== itemId) });
    } else {
      set({
        cart: cart.map(item =>
          item.id === itemId
            ? { ...item, quantity, totalPrice: item.menuItem.price * quantity }
            : item
        ),
      });
    }
  },

  removeFromCart: (itemId) => {
    const { cart } = get();
    set({ cart: cart.filter(item => item.id !== itemId) });
  },

  clearCart: () => {
    set({ cart: [], appliedPromo: null });
  },

  getCartTotal: () => {
    const { cart, appliedPromo } = get();
    const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    
    if (appliedPromo) {
      if (appliedPromo.discountType === 'percentage') {
        return subtotal * (1 - appliedPromo.discount / 100);
      }
      return Math.max(0, subtotal - appliedPromo.discount);
    }
    
    return subtotal;
  },

  getCartCount: () => {
    const { cart } = get();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  },

  applyPromoCode: async (code: string) => {
    try {
      const { data: promos, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

      if (error || !promos) {
        return false;
      }

      const expiresAt = new Date(promos.expires_at);
      if (new Date() > expiresAt) {
        return false;
      }

      const { getCartTotal } = get();
      const cartTotal = getCartTotal();
      
      if (cartTotal >= (promos.min_order || 0)) {
        const promo: PromoCode = {
          id: promos.id,
          code: promos.code,
          discount: promos.discount,
          discountType: promos.discount_type,
          minOrder: promos.min_order || 0,
          expiresAt,
        };
        set({ appliedPromo: promo });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error applying promo code:', error);
      return false;
    }
  },

  removePromoCode: () => {
    set({ appliedPromo: null });
  },

  createOrder: async (addressId, paymentMethod) => {
    try {
      const { cart, selectedRestaurant, getCartTotal } = get();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const orderTotal = getCartTotal() + (selectedRestaurant?.deliveryFee || 0);

      const { data: newOrderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          restaurant_id: selectedRestaurant?.id,
          address_id: addressId,
          status: 'pending',
          total_amount: orderTotal,
          delivery_fee: selectedRestaurant?.deliveryFee || 0,
          estimated_delivery_time: parseInt(selectedRestaurant?.deliveryTime.split('-')[1] || '30'),
        })
        .select()
        .single();

      if (orderError) throw orderError;

      for (const cartItem of cart) {
        const { error: itemError } = await supabase
          .from('order_items')
          .insert({
            order_id: newOrderData.id,
            menu_item_id: cartItem.menuItem.id,
            quantity: cartItem.quantity,
            price: cartItem.menuItem.price,
          });

        if (itemError) throw itemError;
      }

      const newOrder: Order = {
        id: newOrderData.id,
        userId: user.id,
        restaurantId: selectedRestaurant?.id || '',
        restaurant: selectedRestaurant || ({} as Restaurant),
        items: [...cart],
        totalPrice: orderTotal,
        status: 'pending' as OrderStatus,
        address: {
          id: addressId,
          label: 'Delivery Address',
          street: '',
          city: '',
          pincode: '',
          coordinates: { latitude: 0, longitude: 0 },
          isDefault: false,
        },
        driver: null,
        createdAt: new Date(),
        estimatedDelivery: new Date(Date.now() + (parseInt(selectedRestaurant?.deliveryTime.split('-')[1] || '30') * 60 * 1000)),
        actualDelivery: null,
        paymentMethod,
      };

      set(state => ({
        orders: [newOrder, ...state.orders],
        activeOrder: newOrder,
        cart: [],
        appliedPromo: null,
      }));

      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  fetchOrders: async () => {
    try {
      set({ isLoading: true });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ isLoading: false });
        return;
      }

      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedOrders: Order[] = [];
      for (const order of orders || []) {
        const { data: items } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);

        const cartItems: CartItem[] = (items || []).map(item => ({
          id: item.id,
          menuItem: {
            id: item.menu_item_id,
            name: '',
            description: '',
            image: '',
            price: parseFloat(item.price),
            category: '',
            customizations: [],
            vegetarian: false,
            vegan: false,
          },
          quantity: item.quantity,
          selectedCustomizations: [],
          specialInstructions: '',
          totalPrice: parseFloat(item.price) * item.quantity,
        }));

        transformedOrders.push({
          id: order.id,
          userId: order.user_id,
          restaurantId: order.restaurant_id,
          restaurant: {} as Restaurant,
          items: cartItems,
          totalPrice: parseFloat(order.total_amount),
          status: order.status as OrderStatus,
          address: {
            id: order.address_id,
            label: '',
            street: '',
            city: '',
            pincode: '',
            coordinates: { latitude: 0, longitude: 0 },
            isDefault: false,
          },
          driver: null,
          createdAt: new Date(order.created_at),
          estimatedDelivery: new Date(order.created_at),
          actualDelivery: null,
          paymentMethod: '',
        });
      }

      set({ orders: transformedOrders, isLoading: false });
    } catch (error) {
      console.error('Error fetching orders:', error);
      set({ isLoading: false });
    }
  },

  setActiveOrder: (order) => {
    set({ activeOrder: order });
  },

  updateOrderStatus: (orderId, status) => {
    set(state => ({
      orders: state.orders.map(o =>
        o.id === orderId ? { ...o, status } : o
      ),
      activeOrder: state.activeOrder?.id === orderId
        ? { ...state.activeOrder, status }
        : state.activeOrder,
    }));
  },

  getRestaurantById: (id: string) => {
    const { restaurants } = get();
    return restaurants.find(r => r.id === id);
  },
}));