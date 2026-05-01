'use client';

import { createBrowserClient } from '@supabase/ssr';
import { DailyTask, FocusSession, ShvasaUser, Streak, UserProfile } from '@/lib/shvasa/types';
import { getSupabaseEnv, hasSupabaseEnv } from '@/lib/env/public';

const env = getSupabaseEnv();

const supabase = createBrowserClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export { supabase };

export function hasSupabaseConfig() {
  return hasSupabaseEnv();
}

function requireSessionAccessToken(accessToken?: string) {
  if (!accessToken) {
    throw new Error('Supabase Auth did not return a session. Confirm email settings or sign in again.');
  }
  return accessToken;
}

export type AuthResult =
  | { status: 'signed-in'; user: ShvasaUser }
  | { status: 'confirmation-required'; email: string };

export async function signInWithPassword(email: string, password: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return {
    status: 'signed-in',
    user: {
      id: data.user.id,
      email: data.user.email ?? email,
      accessToken: requireSessionAccessToken(data.session?.access_token),
    },
  };
}

export async function signUpWithPassword(email: string, password: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  if (!data.session?.access_token || !data.user?.id) {
    return {
      status: 'confirmation-required',
      email,
    };
  }

  // Create a default profile
  const { error: profileError } = await supabase
    .from('user_profile')
    .upsert(
      { id: data.user.id, distractions: '', goals: '', peak_time: '' },
      { onConflict: 'id' }
    );

  if (profileError) {
    throw profileError;
  }

  return {
    status: 'signed-in',
    user: {
      id: data.user.id,
      email: data.user.email ?? email,
      accessToken: data.session.access_token,
    },
  };
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

export async function saveProfile(profile: UserProfile, accessToken?: string) {
  void accessToken;
  const { data, error } = await supabase
    .from('user_profile')
    .upsert(profile, { onConflict: 'id' })
    .select();

  if (error) throw error;
  return data as UserProfile[];
}

export async function createTask(task: Pick<DailyTask, 'user_id' | 'title' | 'priority'> & Partial<DailyTask>) {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      ...task,
      status: task.status ?? 'todo',
    })
    .select();

  if (error) throw error;
  return data as DailyTask[];
}

export async function fetchTasks(userId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as DailyTask[];
}

export async function saveTasks(tasks: DailyTask[], accessToken?: string) {
  void accessToken;
  const { data, error } = await supabase
    .from('tasks')
    .upsert(tasks, { onConflict: 'id' })
    .select();

  if (error) throw error;
  return data as DailyTask[];
}

export async function saveFocusSession(session: FocusSession, accessToken?: string) {
  void accessToken;
  const { data, error } = await supabase
    .from('focus_sessions')
    .insert(session)
    .select();

  if (error) throw error;
  return data as FocusSession[];
}

export async function saveStreak(streak: Streak, accessToken?: string) {
  void accessToken;
  const { data, error } = await supabase
    .from('streaks')
    .upsert(streak, { onConflict: 'user_id' })
    .select();

  if (error) throw error;
  return data as Streak[];
}

export async function saveDeviceToken(userId: string, token: string, accessToken?: string) {
  void accessToken;
  const { error } = await supabase
    .from('device_tokens')
    .upsert({ user_id: userId, token }, { onConflict: 'user_id, token' });

  if (error) throw error;
}
