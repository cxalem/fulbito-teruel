export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Enums
export type MatchType = 'friendly' | 'training' | 'tournament'
export type SoccerPosition = 'gk' | 'lb' | 'cb' | 'rb' | 'cm' | 'st1' | 'st2'
export type Team = 'white' | 'black'

// Database types (to be generated with: pnpx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts)
export interface Database {
  public: {
    Tables: {
      admins: {
        Row: {
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          user_id: string
          role?: string
          created_at?: string
        }
        Update: {
          user_id?: string
          role?: string
          created_at?: string
        }
      }
      players: {
        Row: {
          id: string
          display_name: string
          image_url: string | null
          preferred_position: SoccerPosition | null
          created_at: string
        }
        Insert: {
          id?: string
          display_name: string
          image_url?: string | null
          preferred_position?: SoccerPosition | null
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          image_url?: string | null
          preferred_position?: SoccerPosition | null
          created_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          starts_at: string
          ends_at: string
          location: string | null
          capacity: number
          is_private: boolean
          match_type: MatchType
          created_by: string
          created_by_label: string | null
          rented_by_player_id: string | null
          rented_by_name: string | null
          total_cost: number | null
          created_at: string
        }
        Insert: {
          id?: string
          starts_at: string
          ends_at: string
          location?: string | null
          capacity?: number
          is_private?: boolean
          match_type?: MatchType
          created_by: string
          created_by_label?: string | null
          rented_by_player_id?: string | null
          rented_by_name?: string | null
          total_cost?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          starts_at?: string
          ends_at?: string
          location?: string | null
          capacity?: number
          is_private?: boolean
          match_type?: MatchType
          created_by?: string
          created_by_label?: string | null
          rented_by_player_id?: string | null
          rented_by_name?: string | null
          total_cost?: number | null
          created_at?: string
        }
      }
      signups: {
        Row: {
          match_id: string
          player_id: string
          team: Team
          position: SoccerPosition | null
          display_name_snapshot: string
          created_at: string
        }
        Insert: {
          match_id: string
          player_id: string
          team: Team
          position?: SoccerPosition | null
          display_name_snapshot: string
          created_at?: string
        }
        Update: {
          match_id?: string
          player_id?: string
          team?: Team
          position?: SoccerPosition | null
          display_name_snapshot?: string
          created_at?: string
        }
      }
    }
    Views: {
      team_lineup: {
        Row: {
          match_id: string
          team: Team
          player_id: string
          display_name: string
          image_url: string | null
          position: SoccerPosition | null
          position_order: number
          position_label: string | null
          created_at: string
        }
      }
    }
    Functions: {
      get_team_lineup: {
        Args: {
          _match_id: string
          _team: Team
        }
        Returns: {
          match_id: string
          team: Team
          player_id: string
          display_name: string
          image_url: string | null
          pos: SoccerPosition | null
          position_order: number
          position_label: string | null
        }[]
      }
      create_match_with_renter: {
        Args: {
          _starts_at: string
          _ends_at: string
          _location: string
          _capacity: number
          _is_private: boolean
          _match_type: MatchType
          _total_cost: number | null
          _renter_player_id?: string | null
          _renter_name?: string | null
        }
        Returns: string
      }
    }
    Enums: {
      match_type: MatchType
      soccer_pos: SoccerPosition
    }
  }
}
