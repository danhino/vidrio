import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Browser client — uses anon key, respects RLS
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server client — uses service role key, bypasses RLS
// Only use in server-side API routes
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Create a Supabase client with a custom clerk_id set for RLS
export function createSupabaseClientWithClerkId(clerkId: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        'x-clerk-id': clerkId,
      },
    },
    db: {
      schema: 'public',
    },
  })
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          clerk_id: string
          email: string
          name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan: 'free' | 'basic' | 'pro'
          status: string
          trial_ends_at: string | null
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>
      }
      settings: {
        Row: {
          id: string
          user_id: string
          theme: string
          font: string
          font_size: number
          opacity: number
          layout: string
          ai_provider: string
          ai_model: string
          custom_api_key: string | null
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['settings']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['settings']['Insert']>
      }
      notes: {
        Row: {
          id: string
          user_id: string | null
          title: string
          encrypted_content: string
          share_token: string
          password_hash: string | null
          is_shared: boolean
          expires_at: string | null
          size_bytes: number
          format: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['notes']['Row'], 'id' | 'share_token' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['notes']['Insert']>
      }
      usage: {
        Row: {
          id: string
          user_id: string
          date: string
          ai_calls_count: number
        }
        Insert: Omit<Database['public']['Tables']['usage']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['usage']['Insert']>
      }
    }
  }
}
