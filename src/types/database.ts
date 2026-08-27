export type ProfileRole = 'customer' | 'admin';

export type BookingStatus =
  | 'pending'
  | 'paid'
  | 'accepted'
  | 'rejected'
  | 'completed'
  | 'cancelled';

export type ServiceCategory = 'my-home' | 'cleaning-crew';

export type ProductOrderStatus =
  | 'pending'
  | 'accepted'
  | 'completed'
  | 'rejected'
  | 'cancelled';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          phone: string | null;
          address: string | null;
          address_lat: number | null;
          address_lng: number | null;
          role: ProfileRole;
          push_token: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          phone?: string | null;
          address?: string | null;
          address_lat?: number | null;
          address_lng?: number | null;
          role?: ProfileRole;
          push_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          phone?: string | null;
          address?: string | null;
          address_lat?: number | null;
          address_lng?: number | null;
          role?: ProfileRole;
          push_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          user_id: string | null;
          service_date: string;
          time_slot: string;
          category: ServiceCategory;
          option: string;
          contact_name: string | null;
          contact_email: string | null;
          contact_phone: string;
          contact_address: string;
          contact_lat: number | null;
          contact_lng: number | null;
          square_meters: number | null;
          extra_hours: number;
          supplies: {
            product_id: string;
            name_el: string;
            name_en: string;
            variant_label: string | null;
            unit_price_cents: number;
            quantity: number;
          }[];
          amount_cents: number;
          status: BookingStatus;
          arrival_time: string | null;
          push_token: string | null;
          payment_intent_id: string | null;
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          service_date: string;
          time_slot: string;
          category: ServiceCategory;
          option: string;
          contact_name?: string | null;
          contact_email?: string | null;
          contact_phone: string;
          contact_address: string;
          contact_lat?: number | null;
          contact_lng?: number | null;
          square_meters?: number | null;
          extra_hours?: number;
          supplies?: {
            product_id: string;
            name_el: string;
            name_en: string;
            variant_label: string | null;
            unit_price_cents: number;
            quantity: number;
          }[];
          amount_cents: number;
          status?: BookingStatus;
          arrival_time?: string | null;
          push_token?: string | null;
          payment_intent_id?: string | null;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          service_date?: string;
          time_slot?: string;
          category?: ServiceCategory;
          option?: string;
          contact_name?: string | null;
          contact_email?: string | null;
          contact_phone?: string;
          contact_address?: string;
          contact_lat?: number | null;
          contact_lng?: number | null;
          square_meters?: number | null;
          extra_hours?: number;
          supplies?: {
            product_id: string;
            name_el: string;
            name_en: string;
            variant_label: string | null;
            unit_price_cents: number;
            quantity: number;
          }[];
          amount_cents?: number;
          status?: BookingStatus;
          arrival_time?: string | null;
          push_token?: string | null;
          payment_intent_id?: string | null;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          code: string;
          category: string;
          name_el: string;
          name_en: string;
          variant_label: string | null;
          price_cents: number;
          sort: number;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          category: string;
          name_el: string;
          name_en: string;
          variant_label?: string | null;
          price_cents: number;
          sort?: number;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          category?: string;
          name_el?: string;
          name_en?: string;
          variant_label?: string | null;
          price_cents?: number;
          sort?: number;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      product_orders: {
        Row: {
          id: string;
          user_id: string;
          contact_email: string;
          contact_phone: string;
          contact_address: string;
          total_cents: number;
          status: ProductOrderStatus;
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          contact_email: string;
          contact_phone: string;
          contact_address: string;
          total_cents: number;
          status?: ProductOrderStatus;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          contact_email?: string;
          contact_phone?: string;
          contact_address?: string;
          total_cents?: number;
          status?: ProductOrderStatus;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          name_el: string;
          name_en: string;
          variant_label: string | null;
          unit_price_cents: number;
          quantity: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          name_el: string;
          name_en: string;
          variant_label?: string | null;
          unit_price_cents: number;
          quantity: number;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          name_el?: string;
          name_en?: string;
          variant_label?: string | null;
          unit_price_cents?: number;
          quantity?: number;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_booked_slots: {
        Args: { day: string };
        Returns: { start_hour: number; end_hour: number }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
export type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
export type Product = Database['public']['Tables']['products']['Row'];
export type ProductOrder = Database['public']['Tables']['product_orders']['Row'];
export type ProductOrderItem =
  Database['public']['Tables']['product_order_items']['Row'];
