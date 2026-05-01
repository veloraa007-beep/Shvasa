'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Moon, Globe, Shield, CreditCard, LogOut,
  Brain, Timer, Zap, Wind, Sparkles, Check, Loader2, ChevronDown, RotateCcw,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/lib/shvasa/types';

// ─── Preference options ────────────────────────────────────────────────────────

const SESSION_OPTIONS = ['20 min', '25 min', '30 min', '45 min', '60 min', '90 min'];
const REMINDER_OPTIONS = ['gentle', 'strict', 'silent'];
const RECOVERY_OPTIONS = ['walk', 'breathe', 'music', 'stretch', 'hydrate'];
const WORK_STYLE_OPTIONS = ['deep work', 'sprints', 'mixed'];

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Prefs {
  session_length: string;
  reminder_style: string;
  recovery_style: string;
  work_style: string;
  primary_language: string;
}

type RecalcStatus = 'idle' | 'saving' | 'recalculating' | 'done' | 'error';

// ─── Reset Onboarding Section ───────────────────────────────────────────────

function ResetOnboardingSection({
  supabase,
  profile,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any;
  profile: UserProfile | null;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!profile) return;
    setLoading(true);
    await supabase
      .from('user_profile')
      .update({ onboarding_complete: false })
      .eq('id', profile.id);
    router.push('/onboarding');
    router.refresh();
  };

  return (
    <div className="bg-surface-container rounded-[24px] p-6 border border-surface-variant/20 ambient-shadow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <RotateCcw size={16} className="text-primary/60" />
            <h3 className="font-medium text-on-surface font-body">Reset Focus Profile</h3>
          </div>
          <p className="text-sm text-on-surface-variant font-body">
            Redo your onboarding to let BLOOM rebuild your focus environment from scratch.
          </p>
        </div>
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="shrink-0 px-5 py-2 rounded-full border border-surface-variant/40 text-sm font-medium text-on-surface-variant hover:border-primary/30 hover:text-primary transition-colors font-body"
          >
            Reset
          </button>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setConfirming(false)}
              className="px-4 py-2 rounded-full text-sm text-on-surface-variant hover:text-on-surface transition-colors font-body"
            >
              Cancel
            </button>
            <button
              onClick={handleReset}
              disabled={loading}
              className="px-5 py-2 rounded-full bg-primary text-on-primary text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-60 font-body"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : null}
              Yes, reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Pill selector sub-component ──────────────────────────────────────────────

function PillSelector({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-4 py-2 rounded-full text-sm font-body font-medium transition-all border ${
            value === opt
              ? 'bg-primary text-on-primary border-primary shadow-sm'
              : 'bg-surface-container-lowest text-on-surface-variant border-surface-variant/30 hover:border-primary/30 hover:text-primary'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [prefs, setPrefs] = useState<Prefs>({
    session_length: '25 min',
    reminder_style: 'gentle',
    recovery_style: 'breathe',
    work_style: 'deep work',
    primary_language: 'English',
  });
  const [dirty, setDirty] = useState(false);
  const [recalcStatus, setRecalcStatus] = useState<RecalcStatus>('idle');
  const [coachPreview, setCoachPreview] = useState<string | null>(null);
  const [signOutLoading, setSignOutLoading] = useState(false);

  // ── Load profile ─────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('user_profile').select('*').eq('id', user.id).single();
      if (data) {
        setProfile(data as UserProfile);
        setPrefs({
          session_length: data.session_length || '25 min',
          reminder_style: data.reminder_style || 'gentle',
          recovery_style: data.recovery_style || 'breathe',
          work_style:     data.work_style     || 'deep work',
          primary_language: data.primary_language || 'English',
        });
      }
    })();
  }, [supabase]);

  const updatePref = <K extends keyof Prefs>(key: K, value: Prefs[K]) => {
    setPrefs(p => ({ ...p, [key]: value }));
    setDirty(true);
    setRecalcStatus('idle');
  };

  // ── Save + Recalculate ───────────────────────────────────────────────────
  const saveAndRecalculate = async () => {
    if (!profile) return;
    setRecalcStatus('saving');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setRecalcStatus('error'); return; }

    // 1. Persist preferences
    await supabase.from('user_profile').update({
      session_length:  prefs.session_length,
      reminder_style:  prefs.reminder_style,
      recovery_style:  prefs.recovery_style,
      work_style:      prefs.work_style,
      primary_language: prefs.primary_language,
    }).eq('id', profile.id);

    setRecalcStatus('recalculating');

    try {
      const { recalculateProfile } = await import('@/lib/ai/client');
      const result = await recalculateProfile({
        display_name:     profile.display_name,
        focus_problem:    profile.focus_problem,
        distractions:     profile.distractions,
        goals:            profile.goals,
        work_type:        profile.work_type,
        best_focus_time:  profile.best_focus_time,
        primary_language: prefs.primary_language,
        session_length:   prefs.session_length,
        reminder_style:   prefs.reminder_style,
        recovery_style:   prefs.recovery_style,
        work_style:       prefs.work_style,
        accessToken:      session.access_token,
      });

      // 2. Persist AI results
      await supabase.from('user_profile').update({
        ai_archetype:      result.archetype,
        ai_coach_message:  result.coach_message,
        ai_focus_config:   result.focus_mode,
        ai_daily_structure: result.daily_structure,
      }).eq('id', profile.id);

      // 3. Re-seed tasks with today's new Daily 3
      const priorityMap: Record<'high' | 'medium' | 'low', 'high' | 'med' | 'low'> = {
        high: 'high', medium: 'med', low: 'low',
      };
      const now = new Date().toISOString();
      // Delete today's pending tasks first so we don't duplicate
      await supabase
        .from('tasks')
        .delete()
        .eq('user_id', profile.id)
        .eq('status', 'todo');

      const { error: tasksErr } = await supabase.from('tasks').insert(
        result.daily_tasks.map(t => ({
          user_id:    profile.id,
          title:      t.title,
          priority:   priorityMap[t.priority],
          status:     'todo' as const,
          created_at: now,
          deadline:   null,
        }))
      );
      if (tasksErr) console.error('[settings] Tasks insert failed:', tasksErr);

      setCoachPreview(result.coach_message);
      setRecalcStatus('done');
      setDirty(false);
      router.refresh();
    } catch (e) {
      console.error('[settings] Recalculate failed:', e);
      setRecalcStatus('error');
    }
  };

  const handleSignOut = async () => {
    setSignOutLoading(true);
    await supabase.auth.signOut();
    router.push('/login');
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-surface">
      <main className="max-w-3xl mx-auto px-6 pt-12 pb-24 space-y-8">

        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-editorial text-primary tracking-tight mb-2">Settings</h1>
          <p className="text-on-surface-variant font-body">Your preferences shape how BLOOM builds your day.</p>
        </header>

        {/* ── Focus Preferences ──────────────────────────────────────────── */}
        <section className="bg-white rounded-[24px] overflow-hidden ambient-shadow border border-surface-variant/20">
          <div className="bg-surface-container-lowest px-6 py-4 border-b border-surface-variant/20 flex items-center gap-2">
            <Brain size={16} className="text-primary" />
            <h2 className="text-lg font-editorial text-primary">Focus Preferences</h2>
          </div>

          <div className="divide-y divide-surface-variant/10">
            {/* Session length */}
            <div className="px-6 py-5">
              <div className="flex items-center gap-3 mb-1">
                <Timer size={16} className="text-primary/60" />
                <span className="font-medium text-on-surface font-body">Session Length</span>
              </div>
              <p className="text-xs text-on-surface-variant font-body mb-2 pl-7">How long should each focus block last?</p>
              <div className="pl-7">
                <PillSelector options={SESSION_OPTIONS} value={prefs.session_length} onChange={v => updatePref('session_length', v)} />
              </div>
            </div>

            {/* Work style */}
            <div className="px-6 py-5">
              <div className="flex items-center gap-3 mb-1">
                <Zap size={16} className="text-primary/60" />
                <span className="font-medium text-on-surface font-body">Work Style</span>
              </div>
              <p className="text-xs text-on-surface-variant font-body mb-2 pl-7">How do you prefer to structure focus?</p>
              <div className="pl-7">
                <PillSelector options={WORK_STYLE_OPTIONS} value={prefs.work_style} onChange={v => updatePref('work_style', v)} />
              </div>
            </div>

            {/* Recovery style */}
            <div className="px-6 py-5">
              <div className="flex items-center gap-3 mb-1">
                <Wind size={16} className="text-primary/60" />
                <span className="font-medium text-on-surface font-body">Recovery Style</span>
              </div>
              <p className="text-xs text-on-surface-variant font-body mb-2 pl-7">How do you prefer to reset between sessions?</p>
              <div className="pl-7">
                <PillSelector options={RECOVERY_OPTIONS} value={prefs.recovery_style} onChange={v => updatePref('recovery_style', v)} />
              </div>
            </div>

            {/* Reminder style */}
            <div className="px-6 py-5">
              <div className="flex items-center gap-3 mb-1">
                <Bell size={16} className="text-primary/60" />
                <span className="font-medium text-on-surface font-body">Reminder Style</span>
              </div>
              <p className="text-xs text-on-surface-variant font-body mb-2 pl-7">How should BLOOM nudge you?</p>
              <div className="pl-7">
                <PillSelector options={REMINDER_OPTIONS} value={prefs.reminder_style} onChange={v => updatePref('reminder_style', v)} />
              </div>
            </div>

            {/* Language */}
            <div className="px-6 py-5">
              <div className="flex items-center gap-3 mb-1">
                <Globe size={16} className="text-primary/60" />
                <span className="font-medium text-on-surface font-body">Language</span>
              </div>
              <div className="pl-7 mt-2 relative">
                <select
                  value={prefs.primary_language}
                  onChange={e => updatePref('primary_language', e.target.value)}
                  className="appearance-none w-full max-w-xs bg-surface-container-lowest border border-surface-variant/30 rounded-xl px-4 py-2.5 text-sm text-on-surface font-body focus:outline-none focus:ring-2 focus:ring-primary/40 pr-8"
                >
                  {['English', 'Hindi', 'Spanish', 'French', 'German', 'Japanese', 'Portuguese', 'Arabic'].map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3 text-on-surface-variant pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Save + Recalculate CTA ─────────────────────────────────────── */}
        <AnimatePresence>
          {dirty && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="bg-primary/5 border border-primary/15 rounded-[20px] p-6 flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-medium text-primary font-body">Preferences changed</p>
                <p className="text-sm text-on-surface-variant font-body">Save to let BLOOM recalculate your daily structure.</p>
              </div>
              <button
                onClick={saveAndRecalculate}
                disabled={recalcStatus === 'saving' || recalcStatus === 'recalculating'}
                className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-medium hover:bg-primary-dark transition-colors disabled:opacity-60 shrink-0"
              >
                {recalcStatus === 'saving' || recalcStatus === 'recalculating' ? (
                  <><Loader2 size={16} className="animate-spin" /> Recalculating...</>
                ) : (
                  <><Sparkles size={16} /> Save & Recalculate</>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── BLOOM updated banner ───────────────────────────────────────── */}
        <AnimatePresence>
          {recalcStatus === 'done' && coachPreview && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-primary/5 border border-primary/15 rounded-[20px] p-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <Check size={16} className="text-primary" />
                <span className="text-sm font-medium text-primary font-body">BLOOM has recalculated your environment</span>
              </div>
              <p className="text-on-surface-variant font-body text-sm italic">"{coachPreview}"</p>
              <button
                onClick={() => router.push('/dashboard')}
                className="mt-4 text-sm text-primary font-medium hover:underline"
              >
                Go to dashboard →
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── App Preferences ────────────────────────────────────────────── */}
        <section className="bg-white rounded-[24px] overflow-hidden ambient-shadow border border-surface-variant/20">
          <div className="bg-surface-container-lowest px-6 py-4 border-b border-surface-variant/20">
            <h2 className="text-lg font-editorial text-primary">App</h2>
          </div>
          <div className="divide-y divide-surface-variant/10">
            {[
              { icon: Moon, label: 'Dark Mode', sublabel: 'Coming soon' },
              { icon: Shield, label: 'Privacy & Security', sublabel: 'Manage' },
              { icon: CreditCard, label: 'Subscription', sublabel: 'Manage' },
            ].map(item => (
              <div key={item.label} className="px-6 py-5 flex items-center justify-between hover:bg-surface-container-lowest transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                    <item.icon size={18} />
                  </div>
                  <span className="font-medium text-on-surface font-body">{item.label}</span>
                </div>
                <span className="text-sm text-on-surface-variant font-body">{item.sublabel}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Reset Focus Profile ─────────────────────────────────────── */}
        <ResetOnboardingSection supabase={supabase} profile={profile} />

        {/* ── Sign Out ───────────────────────────────────────────────────── */}
        <div className="bg-red-50 rounded-[24px] p-6 border border-red-100 flex items-center justify-between mt-4">
          <div>
            <h3 className="text-red-800 font-medium font-body mb-1">Sign Out</h3>
            <p className="text-sm text-red-600/80">End your current session securely.</p>
          </div>
          <button
            onClick={handleSignOut}
            disabled={signOutLoading}
            className="bg-white text-red-600 border border-red-200 px-6 py-2.5 rounded-xl font-medium hover:bg-red-50 hover:border-red-300 transition-colors flex items-center gap-2"
          >
            <LogOut size={16} />
            {signOutLoading ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>

      </main>
    </div>
  );
}
