export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      buildings: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          address_json: Json; // AddressJSON stored as JSONB
          floors: string[]; // denormalized relation
        };
        Insert: {
          id?: string; // generated automatically
          created_at?: string;
          name: string;
          address_json?: Json;
          floors?: string[];
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          address_json?: Json;
          floors?: string[];
        };
      };

      floors: {
        Row: {
          id: string;
          name: string;
          building_id: string;
          created_at: string;
          rooms_count: number;
        };
        Insert: {
          id?: string;
          name: string;
          building_id: string;
          created_at?: string;
          rooms_count?: number;
        };
        Update: {
          id?: string;
          name?: string;
          building_id?: string;
          created_at?: string;
          rooms_count?: number;
        };
      };

      rooms: {
        Row: {
          id: string;
          name: string;
          floor_id: string;
          geo_json: Json; // RoomGeoJSON stored as JSONB
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          floor_id: string;
          geo_json: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          floor_id?: string;
          geo_json?: Json;
          created_at?: string;
        };
      };
    };
  };
}

export type BuildingRow = Database["public"]["Tables"]["buildings"]["Row"];
export type FloorRow = Database["public"]["Tables"]["floors"]["Row"];
export type RoomRow = Database["public"]["Tables"]["rooms"]["Row"];
