-- ─── Phase 1: Core onboarding columns ────────────────────────────────────────
ALTER TABLE public.user_profile
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS primary_language TEXT,
ADD COLUMN IF NOT EXISTS secondary_language TEXT,
ADD COLUMN IF NOT EXISTS focus_problem TEXT,
ADD COLUMN IF NOT EXISTS work_type TEXT,
ADD COLUMN IF NOT EXISTS best_focus_time TEXT,
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS avatar TEXT,
ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT false;

-- ─── Phase 2: Base preference columns ────────────────────────────────────────
ALTER TABLE public.user_profile
ADD COLUMN IF NOT EXISTS distractions TEXT,
ADD COLUMN IF NOT EXISTS goals TEXT;

-- ─── Phase 3: AI-generated profile columns ────────────────────────────────────
ALTER TABLE public.user_profile
ADD COLUMN IF NOT EXISTS ai_archetype TEXT,
ADD COLUMN IF NOT EXISTS ai_coach_message TEXT,
ADD COLUMN IF NOT EXISTS ai_focus_config JSONB,
ADD COLUMN IF NOT EXISTS ai_daily_structure JSONB;

-- ─── Phase 4: Extended user preferences (editable from Settings) ──────────────
ALTER TABLE public.user_profile
ADD COLUMN IF NOT EXISTS session_length TEXT,
ADD COLUMN IF NOT EXISTS reminder_style TEXT,
ADD COLUMN IF NOT EXISTS recovery_style TEXT,
ADD COLUMN IF NOT EXISTS work_style TEXT;

-- ─── Phase 5: Diagnostic / AI conversation data ───────────────────────────────
ALTER TABLE public.user_profile
ADD COLUMN IF NOT EXISTS diagnostic_data JSONB;
