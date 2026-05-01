'use client';

import { AIPlan } from '@/lib/shvasa/types';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseEnv } from '@/lib/env/public';

function getAuthClient(accessToken: string) {
  const env = getSupabaseEnv();

  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );
}

export async function createTaskAction(
  userId: string,
  plan: AIPlan,
  accessToken: string
) {
  const supabase = getAuthClient(accessToken);
  const { error } = await supabase.from('tasks').insert({
    user_id: userId,
    title: plan.title,
    deadline: plan.deadline ? new Date(plan.deadline).toISOString() : null,
    priority: plan.priority === 'high' ? 'high' : plan.priority === 'low' ? 'low' : 'med',
    status: 'todo',
  });

  if (error) {
    console.error('Task insert error:', error);
    throw error;
  }
}

export async function createNoteAction(
  userId: string,
  plan: AIPlan,
  accessToken: string
) {
  // Notes table not yet implemented
  console.log('Note created:', plan.title);
  return { ok: true };
}

export async function createReminderAction(
  userId: string,
  plan: AIPlan,
  accessToken: string
) {
  // Reminders table not yet implemented
  console.log('Reminder created:', plan.title, 'at', plan.deadline);
  return { ok: true };
}

export function startFocusAction(plan: AIPlan) {
  if (typeof window !== 'undefined') {
    window.location.href = '/focus';
  }
}
