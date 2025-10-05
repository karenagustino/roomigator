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
          id: number;
          created_at: string; // timestamptz
          name: string;
          address: Json; // jsonb
          floors: number; // denormalized (int8 in your DB screenshot)
          json: Json; // additional jsonb column shown in screenshot
        };
        Insert: {
          id?: number;
          created_at?: string;
          name: string;
          address?: Json;
          floors?: number;
          json?: Json;
        };
        Update: {
          id?: number;
          created_at?: string;
          name?: string;
          address?: Json;
          floors?: number;
          json?: Json;
        };
      };

      floors: {
        Row: {
          id: number;
          created_at: string; // timestamptz
          building_id: number;
          name: string;
          rooms: number; // int8 per screenshot
          json: Json; // jsonb column shown in screenshot
        };
        Insert: {
          id?: number;
          created_at?: string;
          building_id: number;
          name: string;
          rooms?: number;
          json?: Json;
        };
        Update: {
          id?: number;
          created_at?: string;
          building_id?: number;
          name?: string;
          rooms?: number;
          json?: Json;
        };
      };

      rooms: {
        Row: {
          id: number;
          created_at: string; // timestamptz
          floor_id: number;
          name: string;
          json: Json; // jsonb column (holds geo/props)
        };
        Insert: {
          id?: number;
          created_at?: string;
          floor_id: number;
          name: string;
          json: Json;
        };
        Update: {
          id?: number;
          created_at?: string;
          floor_id?: number;
          name?: string;
          json?: Json;
        };
      };
    };
  };
}

export type BuildingRow = Database["public"]["Tables"]["buildings"]["Row"];
export type FloorRow = Database["public"]["Tables"]["floors"]["Row"];
export type RoomRow = Database["public"]["Tables"]["rooms"]["Row"];
