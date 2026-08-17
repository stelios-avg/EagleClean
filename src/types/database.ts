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
          role: ProfileRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          phone?: string | null;
          role?: ProfileRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          phone?: string | null;
          role?: ProfileRole;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          service_date: string;
          time_slot: string;
          category: ServiceCategory;
          option: string;
          contact_email: string;
          contact_phone: string;
          contact_address: string;
          square_meters: number | null;
          extra_hours: number;
          amount_cents: number;
          status: BookingStatus;
          payment_intent_id: string | null;
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          service_date: string;
          time_slot: string;
          category: ServiceCategory;
          option: string;
          contact_email: string;
          contact_phone: string;
          contact_address: string;
          square_meters?: number | null;
          extra_hours?: number;
          amount_cents: number;
          status?: BookingStatus;
          payment_intent_id?: string | null;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          service_date?: string;
          time_slot?: string;
          category?: ServiceCategory;
          option?: string;
          contact_email?: string;
          contact_phone?: string;
          contact_address?: string;
          square_meters?: number | null;
          extra_hours?: number;
          amount_cents?: number;
          status?: BookingStatus;
          payment_intent_id?: string | null;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
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
export type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
