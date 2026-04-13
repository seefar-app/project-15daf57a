import { create } from 'zustand';
import { User, Address } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  initializeAuth: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  addAddress: (address: Address) => void;
  removeAddress: (addressId: string) => void;
  setDefaultAddress: (addressId: string) => void;
  toggleFavoriteRestaurant: (restaurantId: string) => void;
}

const mockUser: User = {
  id: '1',
  phone: '+1234567890',
  email: 'john@example.com',
  name: 'John Smith',
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  defaultAddress: '1',
  savedAddresses: [
    {
      id: '1',
      label: 'Home',
      street: '123 Ocean Drive',
      city: 'Miami',
      pincode: '33139',
      coordinates: { latitude: 25.7617, longitude: -80.1918 },
      isDefault: true,
    },
    {
      id: '2',
      label: 'Office',
      street: '456 Business Ave',
      city: 'Miami',
      pincode: '33131',
      coordinates: { latitude: 25.7742, longitude: -80.1936 },
      isDefault: false,
    },
  ],
  favoriteRestaurants: ['1', '3'],
  wallet: 45.50,
  createdAt: new Date('2024-01-15'),
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  authError: null,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, authError: null });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email === 'test@test.com' && password === 'password') {
        set({ user: mockUser, isAuthenticated: true, isLoading: false });
        return true;
      }
      
      if (email && password.length >= 6) {
        set({ user: { ...mockUser, email }, isAuthenticated: true, isLoading: false });
        return true;
      }
      
      set({ authError: 'Invalid email or password', isLoading: false });
      return false;
    } catch (error) {
      set({ authError: 'Login failed. Please try again.', isLoading: false });
      return false;
    }
  },

  signup: async (name: string, email: string, phone: string, password: string) => {
    try {
      set({ isLoading: true, authError: null });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (name && email && phone && password.length >= 6) {
        const newUser: User = {
          ...mockUser,
          id: Date.now().toString(),
          name,
          email,
          phone,
          savedAddresses: [],
          favoriteRestaurants: [],
          wallet: 0,
          createdAt: new Date(),
        };
        set({ user: newUser, isAuthenticated: true, isLoading: false });
        return true;
      }
      
      set({ authError: 'Please fill all fields correctly', isLoading: false });
      return false;
    } catch (error) {
      set({ authError: 'Signup failed. Please try again.', isLoading: false });
      return false;
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false, authError: null });
  },

  initializeAuth: async () => {
    try {
      set({ isLoading: true });
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  updateUser: (updates) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, ...updates } });
    }
  },

  addAddress: (address) => {
    const { user } = get();
    if (user) {
      const newAddresses = [...user.savedAddresses, address];
      if (address.isDefault) {
        newAddresses.forEach(a => a.isDefault = a.id === address.id);
      }
      set({ user: { ...user, savedAddresses: newAddresses } });
    }
  },

  removeAddress: (addressId) => {
    const { user } = get();
    if (user) {
      set({
        user: {
          ...user,
          savedAddresses: user.savedAddresses.filter(a => a.id !== addressId),
        },
      });
    }
  },

  setDefaultAddress: (addressId) => {
    const { user } = get();
    if (user) {
      const updatedAddresses = user.savedAddresses.map(a => ({
        ...a,
        isDefault: a.id === addressId,
      }));
      set({
        user: {
          ...user,
          savedAddresses: updatedAddresses,
          defaultAddress: addressId,
        },
      });
    }
  },

  toggleFavoriteRestaurant: (restaurantId) => {
    const { user } = get();
    if (user) {
      const isFavorite = user.favoriteRestaurants.includes(restaurantId);
      set({
        user: {
          ...user,
          favoriteRestaurants: isFavorite
            ? user.favoriteRestaurants.filter(id => id !== restaurantId)
            : [...user.favoriteRestaurants, restaurantId],
        },
      });
    }
  },
}));