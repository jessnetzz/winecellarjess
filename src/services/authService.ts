import { supabase } from './supabaseClient';
import { Database } from '../types/database';
import { User } from '@supabase/supabase-js';

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.');
  }

  return supabase;
}

export const authService = {
  async signUp(email: string, password: string) {
    const { data, error } = await requireSupabase().auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await requireSupabase().auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await requireSupabase().auth.signOut();
    if (error) throw error;
  },

  async getProfile(userId: string) {
    const { data, error } = await requireSupabase()
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data as Database['public']['Tables']['profiles']['Row'] | null;
  },

  async updateProfile(user: User, input: { fullName: string; email: string }) {
    const client = requireSupabase();
    const fullName = input.fullName.trim();
    const email = input.email.trim();
    const metadata = {
      ...user.user_metadata,
      full_name: fullName || null,
      name: fullName || null,
      first_name: fullName ? fullName.split(/\s+/)[0] : null,
    };

    const { data, error } = await client.auth.updateUser({
      email: email !== user.email ? email : undefined,
      data: metadata,
    });

    if (error) throw error;

    const { error: profileError } = await client.from('profiles').upsert({
      id: user.id,
      email,
      full_name: fullName || null,
    });

    if (profileError) throw profileError;

    return data.user;
  },

  async updatePassword(password: string) {
    const { data, error } = await requireSupabase().auth.updateUser({ password });
    if (error) throw error;
    return data.user;
  },
};
