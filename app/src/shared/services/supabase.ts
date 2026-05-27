import 'react-native-url-polyfill/auto';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../domain/ranking/models/database';

export const SUPABASE_ENV_KEYS = {
  url: 'EXPO_PUBLIC_SUPABASE_URL',
  publishableKey: 'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
} as const;

export interface SupabaseConfig {
  url: string;
  publishableKey: string;
}

type SupabaseEnv = Record<string, string | undefined>;

let cachedClient: SupabaseClient<Database> | null = null;

export function readSupabaseConfig(env: SupabaseEnv = process.env): SupabaseConfig {
  const url = env[SUPABASE_ENV_KEYS.url]?.trim();
  const publishableKey = env[SUPABASE_ENV_KEYS.publishableKey]?.trim();

  if (!url || !publishableKey) {
    throw new Error(
      `Missing Supabase config. Define ${SUPABASE_ENV_KEYS.url} and ${SUPABASE_ENV_KEYS.publishableKey} in app/.env.`,
    );
  }

  return { url, publishableKey };
}

export function createSupabaseClient(config: SupabaseConfig): SupabaseClient<Database> {
  return createClient<Database>(config.url, config.publishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export function getSupabaseClient(): SupabaseClient<Database> {
  cachedClient ??= createSupabaseClient(readSupabaseConfig());
  return cachedClient;
}
