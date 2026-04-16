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
  async signUp(email: string, password: string, profile?: { firstName?: string; lastName?: string }) {
    const firstName = profile?.firstName?.trim() ?? '';
    const lastName = profile?.lastName?.trim() ?? '';
    const fullName = [firstName, lastName].filter(Boolean).join(' ');

    const { data, error } = await requireSupabase().auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/account`,
        data: {
          first_name: firstName || null,
          last_name: lastName || null,
          full_name: fullName || null,
          name: fullName || null,
        },
      },
    });
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

  async sendPasswordReset(email: string) {
    const { error } = await requireSupabase().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/account`,
    });
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

  async updateProfile(user: User, input: { fullName: string; firstName?: string; lastName?: string; email: string }) {
    const client = requireSupabase();
    const fullName = input.fullName.trim();
    const firstName = input.firstName?.trim() ?? '';
    const lastName = input.lastName?.trim() ?? '';
    const email = input.email.trim();
    const metadata = {
      ...user.user_metadata,
      full_name: fullName || null,
      name: fullName || null,
      first_name: firstName || (fullName ? fullName.split(/\s+/)[0] : null),
      last_name: lastName || null,
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
