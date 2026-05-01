import { AIPlan } from '@/lib/shvasa/types';

export async function askCoach(input: {
  message: string;
  profile: { distractions: string; goals: string; peak_time: string } | null;
  tasks: Array<{ title: string; priority: 'low' | 'med' | 'high'; status: 'todo' | 'doing' | 'done'; deadline: string | null }>;
  accessToken: string;
}): Promise<AIPlan> {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${input.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: input.message,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || 'AI request failed');
  }

  const result = await response.json();

  if (!result.ok) {
    throw new Error(result.error || 'AI processing failed');
  }

  return result.data as AIPlan;
}

// ─── BLOOM Profile Analysis ────────────────────────────────────────────────────

export interface BloomAnalysis {
  display_name: string;
  archetype: string;
  daily_tasks: { title: string; priority: 'high' | 'medium' | 'low' }[];
  focus_mode: { duration: string; break: string; environment?: string };
  distraction_plan: { trigger: string; action: string }[];
  coach_message: string;
  daily_structure?: { morning: string; afternoon: string; evening: string };
}

export async function analyzeProfile(input: {
  display_name: string;
  focus_problem: string;
  distractions: string;
  goals: string;
  work_type: string;
  best_focus_time: string;
  primary_language: string;
  accessToken: string;
}): Promise<BloomAnalysis> {
  const { accessToken, ...profileData } = input;

  const response = await fetch('/api/ai/analyze-profile', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || 'BLOOM analysis failed');
  }

  const result = await response.json();

  if (!result.ok) {
    throw new Error(result.error || 'BLOOM analysis failed');
  }

  return result.data as BloomAnalysis;
}

// ─── AI Diagnosis (I'm not sure mode) ─────────────────────────────────────────

export interface DiagnoseResult {
  follow_up: string;
  is_final: boolean;
  inferred?: Record<string, string>;
}

export async function diagnoseQuestion(input: {
  question_id: string;
  question_label: string;
  user_response: string;
  conversation_so_far: { q: string; a: string }[];
  accessToken: string;
}): Promise<DiagnoseResult> {
  const { accessToken, ...body } = input;
  const response = await fetch('/api/ai/diagnose', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Diagnose failed');
  }
  const result = await response.json();
  if (!result.ok) throw new Error(result.error || 'Diagnose failed');
  return result.data as DiagnoseResult;
}

// ─── Recalculate (preference update) ──────────────────────────────────────────

export interface RecalcResult {
  archetype: string;
  daily_tasks: { title: string; priority: 'high' | 'medium' | 'low' }[];
  focus_mode: { duration: string; break: string; environment: string };
  distraction_plan: { trigger: string; action: string }[];
  daily_structure: { morning: string; afternoon: string; evening: string };
  coach_message: string;
}

export async function recalculateProfile(input: {
  display_name: string;
  focus_problem: string;
  distractions: string;
  goals: string;
  work_type: string;
  best_focus_time: string;
  primary_language: string;
  session_length: string | null;
  reminder_style: string | null;
  recovery_style: string | null;
  work_style: string | null;
  accessToken: string;
}): Promise<RecalcResult> {
  const { accessToken, ...body } = input;
  const response = await fetch('/api/ai/recalculate', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Recalculate failed');
  }
  const result = await response.json();
  if (!result.ok) throw new Error(result.error || 'Recalculate failed');
  return result.data as RecalcResult;
}
