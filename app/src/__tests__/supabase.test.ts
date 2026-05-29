import {
  createSupabaseClient,
  readSupabaseConfig,
  SUPABASE_ENV_KEYS,
} from '../shared/services/supabase';

describe('Supabase config', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  it('reads Expo public Supabase env variables', () => {
    expect(
      readSupabaseConfig({
        [SUPABASE_ENV_KEYS.url]: 'https://fantasy-petanque.supabase.co',
        [SUPABASE_ENV_KEYS.publishableKey]: 'sb_publishable_test',
      }),
    ).toEqual({
      url: 'https://fantasy-petanque.supabase.co',
      publishableKey: 'sb_publishable_test',
    });
  });

  it('reads Expo public Supabase env variables from the runtime environment', () => {
    process.env = {
      ...originalEnv,
      EXPO_PUBLIC_SUPABASE_URL: 'https://runtime-fantasy-petanque.supabase.co',
      EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_runtime_publishable_test',
    };

    expect(readSupabaseConfig()).toEqual({
      url: 'https://runtime-fantasy-petanque.supabase.co',
      publishableKey: 'sb_runtime_publishable_test',
    });
  });

  it('throws a clear error when env variables are missing', () => {
    expect(() => readSupabaseConfig({})).toThrow(
      'Missing Supabase config. Define EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY in app/.env.',
    );
  });

  it('creates a typed Supabase client without touching the network', () => {
    const client = createSupabaseClient({
      url: 'https://fantasy-petanque.supabase.co',
      publishableKey: 'sb_publishable_test',
    });

    expect(typeof client.from('players').select).toBe('function');
  });
});
