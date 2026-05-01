export type Priority = 'low' | 'med' | 'high';
export type TaskStatus = 'todo' | 'doing' | 'done';
export type BloomStage = 'seed' | 'sprout' | 'plant' | 'tree';

export interface ShvasaUser {
  id: string;
  email: string;
  accessToken: string;
}

export interface UserProfile {
  id: string;
  display_name: string;
  email: string;

  // ── Core onboarding ─────────────────────────────────────────────────────────
  primary_language: string;
  secondary_language: string | null;
  focus_problem: string;
  distractions: string;
  work_type: string;
  best_focus_time: string;
  goals: string;
  plan: string;
  avatar: string | null;
  onboarding_complete: boolean;

  // ── Expanded preferences (editable after onboarding) ────────────────────────
  /** e.g. "25 min" | "45 min" | "90 min" */
  session_length: string | null;
  /** e.g. "gentle" | "strict" | "silent" */
  reminder_style: string | null;
  /** e.g. "walk" | "breathe" | "music" | "stretch" */
  recovery_style: string | null;
  /** e.g. "deep work" | "sprints" | "mixed" */
  work_style: string | null;

  // ── AI-generated fields (set by BLOOM) ──────────────────────────────────────
  ai_archetype: string | null;
  ai_coach_message: string | null;
  ai_daily_structure: AIDailyStructure | null;
  ai_focus_config: AIFocusConfig | null;

  // ── Diagnostic data (raw conversation when user selected "I'm not sure") ─────
  diagnostic_data: DiagnosticData | null;
}

export interface AIDailyStructure {
  morning: string;
  afternoon: string;
  evening: string;
}

export interface AIFocusConfig {
  duration: string;
  break: string;
  environment: string;
}

export interface DiagnosticEntry {
  question_id: string;
  questions: string[];
  answers: string[];
  inferred: Record<string, string>;
}

export interface DiagnosticData {
  entries: DiagnosticEntry[];
  created_at: string;
}


export interface DailyTask {
  id: string;
  user_id: string;
  title: string;
  deadline: string | null;
  priority: Priority;
  status: TaskStatus;
  created_at: string;
}

export interface FocusSession {
  id: string;
  user_id: string;
  task_id: string;
  duration: number;
  completed: boolean;
  created_at: string;
}

export interface Streak {
  user_id: string;
  current_streak: number;
  last_completed_date: string | null;
}

export interface CoachMessage {
  id: string;
  role: 'user' | 'coach';
  text: string;
}

export interface AppSnapshot {
  profile: UserProfile | null;
  tasks: DailyTask[];
  sessions: FocusSession[];
  streak: Streak;
}

export interface CoachReply {
  mode: 'mentor' | 'distraction';
  reply: string;
  next_action: string;
}

export type ActionType = 'task' | 'note' | 'reminder' | 'focus' | 'chat';

export interface AIPlan {
  type: ActionType;
  title: string;
  description: string;
  deadline: string | null;
  priority: 'low' | 'medium' | 'high';
  steps: string[];
  confidence: number;
  // For chat responses
  reply?: string;
}

