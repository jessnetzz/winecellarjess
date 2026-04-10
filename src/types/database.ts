import { WineStatus, WineStyle } from './wine';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      storage_locations: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          rack: string | null;
          shelf: string | null;
          bin: string | null;
          box: string | null;
          fridge: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label: string;
          rack?: string | null;
          shelf?: string | null;
          bin?: string | null;
          box?: string | null;
          fridge?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          label?: string;
          rack?: string | null;
          shelf?: string | null;
          bin?: string | null;
          box?: string | null;
          fridge?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      wines: {
        Row: {
          id: string;
          user_id: string;
          wine_name: string;
          producer: string;
          vintage_year: number;
          appellation: string | null;
          region: string | null;
          country: string | null;
          varietal: string | null;
          style_category: WineStyle;
          bottle_size: string | null;
          quantity: number;
          purchase_date: string | null;
          purchase_price: number | null;
          estimated_market_value: number | null;
          alcohol_percentage: number | null;
          drink_window_start_year: number;
          drink_window_end_year: number;
          best_drink_by_year: number;
          acquisition_source: string | null;
          status: WineStatus;
          tasting_notes: string | null;
          personal_rating: number | null;
          food_pairing_notes: string | null;
          ai_advice: string | null;
          image_url: string | null;
          storage_location_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          wine_name: string;
          producer: string;
          vintage_year: number;
          appellation?: string | null;
          region?: string | null;
          country?: string | null;
          varietal?: string | null;
          style_category?: WineStyle;
          bottle_size?: string | null;
          quantity?: number;
          purchase_date?: string | null;
          purchase_price?: number | null;
          estimated_market_value?: number | null;
          alcohol_percentage?: number | null;
          drink_window_start_year: number;
          drink_window_end_year: number;
          best_drink_by_year: number;
          acquisition_source?: string | null;
          status?: WineStatus;
          tasting_notes?: string | null;
          personal_rating?: number | null;
          food_pairing_notes?: string | null;
          ai_advice?: string | null;
          image_url?: string | null;
          storage_location_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          wine_name?: string;
          producer?: string;
          vintage_year?: number;
          appellation?: string | null;
          region?: string | null;
          country?: string | null;
          varietal?: string | null;
          style_category?: WineStyle;
          bottle_size?: string | null;
          quantity?: number;
          purchase_date?: string | null;
          purchase_price?: number | null;
          estimated_market_value?: number | null;
          alcohol_percentage?: number | null;
          drink_window_start_year?: number;
          drink_window_end_year?: number;
          best_drink_by_year?: number;
          acquisition_source?: string | null;
          status?: WineStatus;
          tasting_notes?: string | null;
          personal_rating?: number | null;
          food_pairing_notes?: string | null;
          ai_advice?: string | null;
          image_url?: string | null;
          storage_location_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'wines_storage_location_id_fkey';
            columns: ['storage_location_id'];
            isOneToOne: false;
            referencedRelation: 'storage_locations';
            referencedColumns: ['id'];
          },
        ];
      };
      tasting_entries: {
        Row: {
          id: string;
          wine_id: string;
          user_id: string;
          tasted_at: string;
          notes: string;
          rating: number | null;
          decanted: boolean;
          pairing: string | null;
          occasion: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          wine_id: string;
          user_id: string;
          tasted_at: string;
          notes: string;
          rating?: number | null;
          decanted?: boolean;
          pairing?: string | null;
          occasion?: string | null;
          created_at?: string;
        };
        Update: {
          tasted_at?: string;
          notes?: string;
          rating?: number | null;
          decanted?: boolean;
          pairing?: string | null;
          occasion?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'tasting_entries_wine_id_fkey';
            columns: ['wine_id'];
            isOneToOne: false;
            referencedRelation: 'wines';
            referencedColumns: ['id'];
          },
        ];
      };
      ai_advice_cache: {
        Row: {
          id: string;
          wine_id: string;
          user_id: string;
          prompt_context: Record<string, unknown>;
          advice: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          wine_id: string;
          user_id: string;
          prompt_context: Record<string, unknown>;
          advice: Record<string, unknown>;
          created_at?: string;
        };
        Update: never;
        Relationships: [
          {
            foreignKeyName: 'ai_advice_cache_wine_id_fkey';
            columns: ['wine_id'];
            isOneToOne: false;
            referencedRelation: 'wines';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
