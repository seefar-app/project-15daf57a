export interface User {
  id: string;
  phone: string;
  email: string;
  name: string;
  avatar: string;
  defaultAddress: string | null;
  savedAddresses: Address[];
  favoriteRestaurants: string[];
  wallet: number;
  createdAt: Date;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  pincode: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  isDefault: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  cuisine: string[];
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  address: string;
  hours: string;
  menu: MenuItem[];
  coordinates: {
    latitude: number;
    longitude: number;
  };
  isFavorite?: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
  customizations: Customization[];
  vegetarian: boolean;
  vegan: boolean;
}

export interface Customization {
  id: string;
  name: string;
  options: CustomizationOption[];
  required: boolean;
  maxSelections: number;
}

export interface CustomizationOption {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  selectedCustomizations: SelectedCustomization[];
  specialInstructions: string;
  totalPrice: number;
}

export interface SelectedCustomization {
  customizationId: string;
  selectedOptions: string[];
}

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  restaurant: Restaurant;
  items: CartItem[];
  totalPrice: number;
  status: OrderStatus;
  address: Address;
  driver: Driver | null;
  createdAt: Date;
  estimatedDelivery: Date;
  actualDelivery: Date | null;
  paymentMethod: string;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'picked_up'
  | 'on_the_way'
  | 'delivered'
  | 'cancelled';

export interface Driver {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  rating: number;
  vehicleType: string;
  vehiclePlate: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface Payment {
  id: string;
  method: 'card' | 'wallet' | 'cash';
  cardLast4?: string;
  walletBalance?: number;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  images: string[];
  userId: string;
  userName: string;
  userAvatar: string;
  restaurantId: string;
  createdAt: Date;
}

export interface PromoCode {
  id: string;
  code: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  minOrder: number;
  expiresAt: Date;
}