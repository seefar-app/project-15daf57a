import { create } from 'zustand';
import { Restaurant, MenuItem, CartItem, Order, OrderStatus, Driver, PromoCode, Review } from '@/types';

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

const mockRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Ocean Sushi Bar',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800',
    cuisine: ['Japanese', 'Sushi'],
    rating: 4.8,
    reviewCount: 324,
    deliveryTime: '25-35 min',
    deliveryFee: 2.99,
    minOrder: 15,
    address: '123 Seaside Blvd',
    hours: '11:00 AM - 10:00 PM',
    coordinates: { latitude: 25.7617, longitude: -80.1918 },
    menu: [
      {
        id: '1-1',
        name: 'Dragon Roll',
        description: 'Shrimp tempura, avocado, cucumber topped with eel and special sauce',
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
        price: 16.99,
        category: 'Specialty Rolls',
        customizations: [],
        vegetarian: false,
        vegan: false,
      },
      {
        id: '1-2',
        name: 'Salmon Nigiri',
        description: 'Fresh Atlantic salmon over pressed rice',
        image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400',
        price: 8.99,
        category: 'Nigiri',
        customizations: [],
        vegetarian: false,
        vegan: false,
      },
      {
        id: '1-3',
        name: 'Miso Soup',
        description: 'Traditional Japanese soup with tofu and seaweed',
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
        price: 4.99,
        category: 'Soups',
        customizations: [],
        vegetarian: true,
        vegan: true,
      },
    ],
  },
  {
    id: '2',
    name: 'Bella Italia',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    cuisine: ['Italian', 'Pizza'],
    rating: 4.6,
    reviewCount: 512,
    deliveryTime: '30-40 min',
    deliveryFee: 1.99,
    minOrder: 12,
    address: '456 Main Street',
    hours: '10:00 AM - 11:00 PM',
    coordinates: { latitude: 25.7700, longitude: -80.1850 },
    menu: [
      {
        id: '2-1',
        name: 'Margherita Pizza',
        description: 'Fresh mozzarella, tomatoes, basil on hand-tossed dough',
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
        price: 14.99,
        category: 'Pizza',
        customizations: [
          {
            id: 'size',
            name: 'Size',
            options: [
              { id: 'small', name: 'Small (10")', price: 0 },
              { id: 'medium', name: 'Medium (12")', price: 3 },
              { id: 'large', name: 'Large (14")', price: 6 },
            ],
            required: true,
            maxSelections: 1,
          },
        ],
        vegetarian: true,
        vegan: false,
      },
      {
        id: '2-2',
        name: 'Spaghetti Carbonara',
        description: 'Classic pasta with eggs, cheese, pancetta, and black pepper',
        image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400',
        price: 16.99,
        category: 'Pasta',
        customizations: [],
        vegetarian: false,
        vegan: false,
      },
    ],
  },
  {
    id: '3',
    name: 'Taco Loco',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800',
    cuisine: ['Mexican', 'Tacos'],
    rating: 4.7,
    reviewCount: 289,
    deliveryTime: '20-30 min',
    deliveryFee: 1.49,
    minOrder: 10,
    address: '789 Fiesta Ave',
    hours: '11:00 AM - 12:00 AM',
    coordinates: { latitude: 25.7550, longitude: -80.2000 },
    menu: [
      {
        id: '3-1',
        name: 'Street Tacos',
        description: 'Three soft corn tortillas with your choice of meat, onions, and cilantro',
        image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400',
        price: 9.99,
        category: 'Tacos',
        customizations: [
          {
            id: 'protein',
            name: 'Protein',
            options: [
              { id: 'carnitas', name: 'Carnitas', price: 0 },
              { id: 'asada', name: 'Carne Asada', price: 1 },
              { id: 'pollo', name: 'Chicken', price: 0 },
            ],
            required: true,
            maxSelections: 1,
          },
        ],
        vegetarian: false,
        vegan: false,
      },
      {
        id: '3-2',
        name: 'Guacamole & Chips',
        description: 'Fresh made guacamole with crispy tortilla chips',
        image: 'https://images.unsplash.com/photo-1600335895229-6e75511892c8?w=400',
        price: 7.99,
        category: 'Appetizers',
        customizations: [],
        vegetarian: true,
        vegan: true,
      },
    ],
  },
  {
    id: '4',
    name: 'Burger Palace',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800',
    cuisine: ['American', 'Burgers'],
    rating: 4.5,
    reviewCount: 678,
    deliveryTime: '25-35 min',
    deliveryFee: 2.49,
    minOrder: 12,
    address: '321 Grill Street',
    hours: '11:00 AM - 11:00 PM',
    coordinates: { latitude: 25.7680, longitude: -80.1880 },
    menu: [
      {
        id: '4-1',
        name: 'Classic Cheeseburger',
        description: 'Angus beef patty with American cheese, lettuce, tomato, and special sauce',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        price: 12.99,
        category: 'Burgers',
        customizations: [
          {
            id: 'doneness',
            name: 'How would you like it?',
            options: [
              { id: 'medium', name: 'Medium', price: 0 },
              { id: 'well', name: 'Well Done', price: 0 },
            ],
            required: false,
            maxSelections: 1,
          },
        ],
        vegetarian: false,
        vegan: false,
      },
      {
        id: '4-2',
        name: 'Loaded Fries',
        description: 'Crispy fries topped with cheese, bacon, and green onions',
        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400',
        price: 8.99,
        category: 'Sides',
        customizations: [],
        vegetarian: false,
        vegan: false,
      },
    ],
  },
  {
    id: '5',
    name: 'Thai Orchid',
    image: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800',
    cuisine: ['Thai', 'Asian'],
    rating: 4.9,
    reviewCount: 198,
    deliveryTime: '30-45 min',
    deliveryFee: 2.99,
    minOrder: 18,
    address: '555 Spice Lane',
    hours: '11:30 AM - 10:00 PM',
    coordinates: { latitude: 25.7590, longitude: -80.1950 },
    menu: [
      {
        id: '5-1',
        name: 'Pad Thai',
        description: 'Stir-fried rice noodles with shrimp, peanuts, and tamarind sauce',
        image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400',
        price: 15.99,
        category: 'Noodles',
        customizations: [
          {
            id: 'spice',
            name: 'Spice Level',
            options: [
              { id: 'mild', name: 'Mild', price: 0 },
              { id: 'medium', name: 'Medium', price: 0 },
              { id: 'hot', name: 'Hot', price: 0 },
            ],
            required: false,
            maxSelections: 1,
          },
        ],
        vegetarian: false,
        vegan: false,
      },
      {
        id: '5-2',
        name: 'Green Curry',
        description: 'Creamy coconut curry with vegetables and your choice of protein',
        image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400',
        price: 16.99,
        category: 'Curries',
        customizations: [],
        vegetarian: false,
        vegan: false,
      },
    ],
  },
  {
    id: '6',
    name: 'Mediterranean Delight',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
    cuisine: ['Mediterranean', 'Greek'],
    rating: 4.7,
    reviewCount: 156,
    deliveryTime: '25-35 min',
    deliveryFee: 1.99,
    minOrder: 14,
    address: '888 Olive Court',
    hours: '10:00 AM - 9:00 PM',
    coordinates: { latitude: 25.7630, longitude: -80.1900 },
    menu: [
      {
        id: '6-1',
        name: 'Chicken Shawarma Plate',
        description: 'Marinated chicken with rice, hummus, salad, and pita bread',
        image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400',
        price: 14.99,
        category: 'Plates',
        customizations: [],
        vegetarian: false,
        vegan: false,
      },
      {
        id: '6-2',
        name: 'Falafel Wrap',
        description: 'Crispy falafel with tahini, pickles, and fresh vegetables',
        image: 'https://images.unsplash.com/photo-1593001874117-c99c800e3eb5?w=400',
        price: 11.99,
        category: 'Wraps',
        customizations: [],
        vegetarian: true,
        vegan: true,
      },
    ],
  },
];

const mockPromos: PromoCode[] = [
  {
    id: '1',
    code: 'WELCOME20',
    discount: 20,
    discountType: 'percentage',
    minOrder: 15,
    expiresAt: new Date('2025-12-31'),
  },
  {
    id: '2',
    code: 'FREESHIP',
    discount: 5,
    discountType: 'fixed',
    minOrder: 20,
    expiresAt: new Date('2025-06-30'),
  },
];

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
      await new Promise(resolve => setTimeout(resolve, 500));
      set({
        restaurants: mockRestaurants,
        featuredRestaurants: mockRestaurants.slice(0, 3),
        isLoading: false,
      });
    } catch (error) {
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
    await new Promise(resolve => setTimeout(resolve, 500));
    const promo = mockPromos.find(p => p.code.toUpperCase() === code.toUpperCase());
    
    if (promo && new Date() < promo.expiresAt) {
      const { getCartTotal } = get();
      if (getCartTotal() >= promo.minOrder) {
        set({ appliedPromo: promo });
        return true;
      }
    }
    return false;
  },

  removePromoCode: () => {
    set({ appliedPromo: null });
  },

  createOrder: async (addressId, paymentMethod) => {
    const { cart, selectedRestaurant, getCartTotal, appliedPromo } = get();
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockDriver: Driver = {
      id: 'd1',
      name: 'Michael Chen',
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
      phone: '+1234567890',
      rating: 4.9,
      vehicleType: 'Motorcycle',
      vehiclePlate: 'ABC-1234',
      coordinates: { latitude: 25.7650, longitude: -80.1920 },
    };

    const newOrder: Order = {
      id: Date.now().toString(),
      userId: '1',
      restaurantId: selectedRestaurant?.id || '1',
      restaurant: selectedRestaurant || mockRestaurants[0],
      items: [...cart],
      totalPrice: getCartTotal() + (selectedRestaurant?.deliveryFee || 0),
      status: 'pending',
      address: {
        id: addressId,
        label: 'Home',
        street: '123 Ocean Drive',
        city: 'Miami',
        pincode: '33139',
        coordinates: { latitude: 25.7617, longitude: -80.1918 },
        isDefault: true,
      },
      driver: null,
      createdAt: new Date(),
      estimatedDelivery: new Date(Date.now() + 45 * 60 * 1000),
      actualDelivery: null,
      paymentMethod,
    };

    set(state => ({
      orders: [newOrder, ...state.orders],
      activeOrder: newOrder,
      cart: [],
      appliedPromo: null,
    }));

    setTimeout(() => {
      set(state => ({
        orders: state.orders.map(o =>
          o.id === newOrder.id ? { ...o, status: 'confirmed' as OrderStatus } : o
        ),
        activeOrder: state.activeOrder?.id === newOrder.id
          ? { ...state.activeOrder, status: 'confirmed' as OrderStatus }
          : state.activeOrder,
      }));
    }, 3000);

    setTimeout(() => {
      set(state => ({
        orders: state.orders.map(o =>
          o.id === newOrder.id ? { ...o, status: 'preparing' as OrderStatus } : o
        ),
        activeOrder: state.activeOrder?.id === newOrder.id
          ? { ...state.activeOrder, status: 'preparing' as OrderStatus }
          : state.activeOrder,
      }));
    }, 8000);

    setTimeout(() => {
      set(state => ({
        orders: state.orders.map(o =>
          o.id === newOrder.id ? { ...o, status: 'picked_up' as OrderStatus, driver: mockDriver } : o
        ),
        activeOrder: state.activeOrder?.id === newOrder.id
          ? { ...state.activeOrder, status: 'picked_up' as OrderStatus, driver: mockDriver }
          : state.activeOrder,
      }));
    }, 15000);

    return newOrder;
  },

  fetchOrders: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ isLoading: false });
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