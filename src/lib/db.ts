import { supabase } from './supabase';

export interface User {
  id: string;
  email: string;
  name: string | null;
  password_hash: string;
  email_verified: Date | null;
  created_at: string;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Row not found
        return null;
      }
      throw error;
    }

    return data as User;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data as User;
  } catch (error) {
    console.error('Error fetching user by id:', error);
    return null;
  }
}

export async function createUser(email: string, password_hash: string, name?: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash,
        name: name || null,
        email_verified: null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as User;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}
