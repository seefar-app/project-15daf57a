import { create } from 'zustand';
import { User, Address } from '@/types';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  removeAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
  toggleFavoriteRestaurant: (restaurantId: string) => Promise<void>;
}

const mapSupabaseUserToUser = (dbUser: any, addresses: any[], favorites: any[]): User => {
  return {
    id: dbUser.id,
    phone: dbUser.phone || '',
    email: dbUser.email,
    name: `${dbUser.first_name || ''} ${dbUser.last_name || ''}`.trim() || 'User',
    avatar: dbUser.avatar_url || '',
    defaultAddress: addresses.find(a => a.is_default)?.id || (addresses[0]?.id || ''),
    savedAddresses: addresses.map(a => ({
      id: a.id,
      label: a.label || '',
      street: a.street,
      city: a.city,
      pincode: a.postal_code || '',
      coordinates: {
        latitude: parseFloat(a.latitude) || 0,
        longitude: parseFloat(a.longitude) || 0,
      },
      isDefault: a.is_default || false,
    })),
    favoriteRestaurants: favorites.map(f => f.restaurant_id),
    wallet: 0,
    createdAt: new Date(dbUser.created_at),
  };
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  authError: null,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, authError: null });

      if (!email || !password) {
        set({ authError: 'Please fill in all required fields.', isLoading: false });
        return false;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let friendlyMessage = 'Incorrect email or password. Please try again.';
        if (error.message.includes('Invalid login credentials')) {
          friendlyMessage = 'Incorrect email or password. Please try again.';
        } else if (error.message.includes('Email not confirmed')) {
          friendlyMessage = 'Please confirm your email before logging in.';
        }
        set({ authError: friendlyMessage, isLoading: false });
        return false;
      }

      if (data.user) {
        const { data: dbUser, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (userError || !dbUser) {
          set({ authError: 'Failed to load user profile.', isLoading: false });
          return false;
        }

        const { data: addresses } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', data.user.id)
          .order('is_default', { ascending: false });

        const { data: favorites } = await supabase
          .from('favorites')
          .select('restaurant_id')
          .eq('user_id', data.user.id);

        const user = mapSupabaseUserToUser(dbUser, addresses || [], favorites || []);
        set({ user, isAuthenticated: true, authError: null, isLoading: false });
        return true;
      }

      set({ authError: 'Login failed. Please try again.', isLoading: false });
      return false;
    } catch (error: any) {
      set({ authError: 'Login failed. Please try again.', isLoading: false });
      return false;
    }
  },

  signup: async (name: string, email: string, phone: string, password: string) => {
    try {
      set({ isLoading: true, authError: null });

      if (!name || !email || !phone || !password) {
        set({ authError: 'Please fill in all required fields.', isLoading: false });
        return false;
      }

      if (password.length < 6) {
        set({ authError: 'Password must be at least 6 characters long.', isLoading: false });
        return false;
      }

      const [firstName, ...lastNameParts] = name.split(' ');
      const lastName = lastNameParts.join(' ');

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        let friendlyMessage = 'Signup failed. Please try again.';
        if (error.message.includes('already registered')) {
          friendlyMessage = 'An account with this email already exists.';
        } else if (error.message.includes('invalid email')) {
          friendlyMessage = 'Please enter a valid email address.';
        }
        set({ authError: friendlyMessage, isLoading: false });
        return false;
      }

      if (data.user) {
        const { error: updateError } = await supabase
          .from('users')
          .update({
            first_name: firstName,
            last_name: lastName,
            phone,
          })
          .eq('id', data.user.id);

        if (updateError) {
          set({ authError: 'Failed to complete signup.', isLoading: false });
          return false;
        }

        const { data: dbUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (dbUser) {
          const user = mapSupabaseUserToUser(dbUser, [], []);
          set({ user, isAuthenticated: true, authError: null, isLoading: false });
          return true;
        }
      }

      set({ authError: 'Signup failed. Please try again.', isLoading: false });
      return false;
    } catch (error: any) {
      set({ authError: 'Signup failed. Please try again.', isLoading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
      set({ user: null, isAuthenticated: false, authError: null });
    } catch (error) {
      set({ user: null, isAuthenticated: false, authError: null });
    }
  },

  initializeAuth: async () => {
    try {
      set({ isLoading: true });

      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      const { data: dbUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.session.user.id)
        .single();

      if (userError || !dbUser) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      const { data: addresses } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', data.session.user.id)
        .order('is_default', { ascending: false });

      const { data: favorites } = await supabase
        .from('favorites')
        .select('restaurant_id')
        .eq('user_id', data.session.user.id);

      const user = mapSupabaseUserToUser(dbUser, addresses || [], favorites || []);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false, isAuthenticated: false });
    }
  },

  updateUser: async (updates) => {
    try {
      const { user } = get();
      if (!user) return;

      const updateData: any = {};
      if (updates.name) {
        const [firstName, ...lastNameParts] = updates.name.split(' ');
        updateData.first_name = firstName;
        updateData.last_name = lastNameParts.join(' ');
      }
      if (updates.phone) updateData.phone = updates.phone;
      if (updates.avatar) updateData.avatar_url = updates.avatar;

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      set({ user: { ...user, ...updates } });
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  },

  addAddress: async (address) => {
    try {
      const { user } = get();
      if (!user) return;

      const { data, error } = await supabase
        .from('addresses')
        .insert({
          user_id: user.id,
          label: address.label,
          street: address.street,
          city: address.city,
          postal_code: address.pincode,
          latitude: address.coordinates.latitude,
          longitude: address.coordinates.longitude,
          is_default: address.isDefault || false,
        })
        .select()
        .single();

      if (error) throw error;

      if (address.isDefault) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .neq('id', data.id);
      }

      const newAddress: Address = {
        id: data.id,
        label: data.label || '',
        street: data.street,
        city: data.city,
        pincode: data.postal_code || '',
        coordinates: {
          latitude: parseFloat(data.latitude) || 0,
          longitude: parseFloat(data.longitude) || 0,
        },
        isDefault: data.is_default || false,
      };

      const updatedAddresses = [...user.savedAddresses, newAddress];
      if (address.isDefault) {
        updatedAddresses.forEach(a => a.isDefault = a.id === newAddress.id);
      }

      set({ user: { ...user, savedAddresses: updatedAddresses } });
    } catch (error) {
      console.error('Failed to add address:', error);
    }
  },

  removeAddress: async (addressId) => {
    try {
      const { user } = get();
      if (!user) return;

      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', user.id);

      if (error) throw error;

      set({
        user: {
          ...user,
          savedAddresses: user.savedAddresses.filter(a => a.id !== addressId),
        },
      });
    } catch (error) {
      console.error('Failed to remove address:', error);
    }
  },

  setDefaultAddress: async (addressId) => {
    try {
      const { user } = get();
      if (!user) return;

      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId)
        .eq('user_id', user.id);

      if (error) throw error;

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
    } catch (error) {
      console.error('Failed to set default address:', error);
    }
  },

  toggleFavoriteRestaurant: async (restaurantId) => {
    try {
      const { user } = get();
      if (!user) return;

      const isFavorite = user.favoriteRestaurants.includes(restaurantId);

      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('restaurant_id', restaurantId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            restaurant_id: restaurantId,
          });

        if (error) throw error;
      }

      set({
        user: {
          ...user,
          favoriteRestaurants: isFavorite
            ? user.favoriteRestaurants.filter(id => id !== restaurantId)
            : [...user.favoriteRestaurants, restaurantId],
        },
      });
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  },
}));