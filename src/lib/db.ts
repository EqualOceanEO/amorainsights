import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Use service role key for server-side operations (bypasses RLS)
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Server-side Supabase client (never expose to browser)
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

// ─── Types ───────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  password: string;
  name: string | null;
  created_at: string;
}

// ─── User operations ─────────────────────────────────────────────────────────

export async function createUser(
  email: string,
  hashedPassword: string,
  name?: string | null
): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .insert({ email, password: hashedPassword, name: name ?? null })
    .select()
    .single();

  if (error) throw new Error(`createUser failed: ${error.message}`);
  if (!data) throw new Error('createUser: no data returned');
  return data as User;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) throw new Error(`getUserByEmail failed: ${error.message}`);
  return (data as User) ?? null;
}

export async function getUserById(id: number): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(`getUserById failed: ${error.message}`);
  return (data as User) ?? null;
}
