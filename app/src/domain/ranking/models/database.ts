import type { RankingSport } from './index';

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
      players: {
        Row: {
          id: string;
          name: string;
          elo_petanque: number;
          elo_flechettes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          elo_petanque?: number;
          elo_flechettes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          elo_petanque?: number;
          elo_flechettes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      matches: {
        Row: {
          id: string;
          sport: RankingSport;
          date: string;
          participants: Json;
          result: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          sport: RankingSport;
          date?: string;
          participants: Json;
          result: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          sport?: RankingSport;
          date?: string;
          participants?: Json;
          result?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
