import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('SUPABASE URL:', url);
  console.log('SUPABASE KEY EXISTE:', !!key);
  console.log('SUPABASE KEY LONGITUD:', key?.length);

  return createBrowserClient(url!, key!);
}