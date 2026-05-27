import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const envPath = resolve(process.cwd(), '.env');

function readDotEnv(path) {
  if (!existsSync(path)) return {};

  return readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .reduce((env, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return env;

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) return env;

      const key = trimmed.slice(0, separatorIndex).trim();
      const rawValue = trimmed.slice(separatorIndex + 1).trim();
      env[key] = rawValue.replace(/^['"]|['"]$/g, '');
      return env;
    }, {});
}

const fileEnv = readDotEnv(envPath);
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? fileEnv.EXPO_PUBLIC_SUPABASE_URL;
const publishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? fileEnv.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !publishableKey) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY in app/.env.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, publishableKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

const { data, error } = await supabase
  .from('players')
  .select('id,name,elo_petanque,elo_flechettes')
  .order('elo_petanque', { ascending: false })
  .limit(5);

if (error) {
  console.error('Supabase check failed:', error.message);
  process.exit(1);
}

console.log('Supabase check OK. Players fetched:', data.length);
console.table(data);
