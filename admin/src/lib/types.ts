export type ProfileRole = 'customer' | 'admin';

export type BookingStatus =
  | 'pending'
  | 'paid'
  | 'accepted'
  | 'rejected'
  | 'completed'
  | 'cancelled';

export type ServiceCategory = 'my-home' | 'cleaning-crew';

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
          role?: ProfileRole;
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          phone?: string | null;
          role?: ProfileRole;
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
        Insert: Record<string, unknown>;
        Update: {
          status?: BookingStatus;
          admin_notes?: string | null;
          arrival_time?: string | null;
        };
        Relationships: [];
      };
      closed_slots: {
        Row: {
          id: string;
          service_date: string;
          start_hour: number;
          end_hour: number;
          created_at: string;
        };
        Insert: {
          service_date: string;
          start_hour: number;
          end_hour: number;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
