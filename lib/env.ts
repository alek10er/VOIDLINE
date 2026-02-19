const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'LIVEKIT_API_KEY',
  'LIVEKIT_API_SECRET',
  'NEXT_PUBLIC_LIVEKIT_URL',
] as const;

required.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`Missing env var: ${key}`);
  }
});

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  livekitApiKey: process.env.LIVEKIT_API_KEY ?? '',
  livekitApiSecret: process.env.LIVEKIT_API_SECRET ?? '',
  livekitUrl: process.env.NEXT_PUBLIC_LIVEKIT_URL ?? '',
};
