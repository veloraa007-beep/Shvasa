'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Flame, Mic, Sparkles, Menu, User, Clock } from 'lucide-react';
import { FormEvent, useState, useEffect } from 'react';
import { saveTasks, saveStreak } from '@/lib/supabase/client';
import { todayKey } from '@/lib/shvasa/date';
import { updateStreak, upsertTasks, readSnapshot } from '@/lib/shvasa/local-store';
import { AppSnapshot, DailyTask, Priority, ShvasaUser, Streak, TaskStatus } from '@/lib/shvasa/types';
import { BloomPlant } from '@/components/shvasa/BloomPlant';
import { QuoteCard } from '@/components/shvasa/QuoteCard';
import { askCoach } from '@/lib/ai/client';
import { getTailoredEnvironment } from '@/lib/shvasa/environment';

// Time-based greeting
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function nextStreak(streak: Streak): Streak {
  const today = todayKey();
  if (streak.last_completed_date === today) return streak;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const continued = streak.last_completed_date === todayKey(yesterday);

  return {
    user_id: streak.user_id,
    current_streak: continued ? streak.current_streak + 1 : 1,
    last_completed_date: today,
  };
}

export function DashboardClient({ user, profile }: { user: ShvasaUser; profile: any }) {
  // Use display_name → email prefix → 'there' (never a mock name)
  const rawName = profile?.display_name?.trim();
  const emailPrefix = user.email ? user.email.split('@')[0] : '';
  const userName = rawName || emailPrefix || 'there';
  const env = getTailoredEnvironment(profile);

  const snapshotQuery = useQuery({
    queryKey: ['snapshot', user.id],
    queryFn: () => readSnapshot(user.id),
    enabled: Boolean(user),
  });

  const snapshot = snapshotQuery.data;
  const tasks = snapshot?.tasks ?? [];
  const completed = tasks.filter((task) => task.status === 'done').length;
  const streak = snapshot?.streak ?? { current_streak: 0, last_completed_date: '' } as Streak;

  const queryClient = useQueryClient();
  const greeting = getGreeting();

  const tasksMutation = useMutation({
    mutationFn: async (nextTasks: DailyTask[]) => {
      upsertTasks(user.id, nextTasks);
      await saveTasks(nextTasks, user.accessToken);

      if (nextTasks.every((task) => task.status === 'done')) {
        const newStreak = nextStreak(streak);
        updateStreak(user.id, newStreak);
        await saveStreak(newStreak, user.accessToken);
      }

      return nextTasks;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['snapshot', user.id] });
    },
  });

  function updateTaskStatus(id: string) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    tasksMutation.mutate(tasks.map(t => t.id === id ? { ...t, status: newStatus as TaskStatus } : t));
  }

  // Priority pills config
  const priorityConfig: Record<Priority, { bg: string; text: string; borderColor: string }> = {
    high: { bg: 'bg-red-50', text: 'text-red-700', borderColor: 'border-red-200' },
    med: { bg: 'bg-violet-50', text: 'text-violet-700', borderColor: 'border-violet-200' },
    low: { bg: 'bg-emerald-50', text: 'text-emerald-700', borderColor: 'border-emerald-200' },
  };

  return (
    <div className={`min-h-screen pb-24 md:pb-12 ${env.themeClass}`}>
      {/* TopBar for Mobile */}
      <header className="md:hidden sticky top-0 z-40 bg-[#fdfbf7]/80 backdrop-blur-2xl px-6 py-4 flex items-center justify-between">
        <button className="text-primary hover:opacity-80 transition-opacity scale-95 duration-300">
          <Menu size={30} />
        </button>
        <h1 className="font-editorial italic text-primary text-2xl tracking-tighter">Shvasa</h1>
        <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden flex items-center justify-center">
          <User size={20} className="text-primary" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8 pb-24 md:flex md:gap-12 md:items-start lg:gap-24">
        {/* Left/Main Column: Intent & Focus */}
        <section className="flex-1 space-y-12 w-full">
          {/* Greeting & Intent */}
          <div className="space-y-8 mt-4 lg:ml-[12%] lg:mr-[5%]">
            <motion.h2
              className="text-5xl md:text-6xl font-editorial text-primary tracking-tight leading-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {greeting}, {userName}.
              <span className="block text-2xl md:text-3xl text-primary/70 mt-2 font-body font-light tracking-normal">
                {env.greetingContext}
              </span>
            </motion.h2>
            
            {/* AI Command Bar with Glassmorphism */}
            <AiCommandBar />
          </div>

          {/* Bloom Visualization & Primary Action */}
          <div className="py-16 flex flex-col items-center justify-center space-y-12 relative">
            <div className="relative w-64 h-64 flex items-center justify-center animate-growth-pulse">
              <BloomStageIndicator completed={completed} />
              <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
            </div>

            <motion.button
              className="glow-button bg-gradient-to-br from-primary to-primary-dark text-on-primary px-8 py-5 rounded-full text-lg font-body font-medium tracking-wide flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="material-symbols-outlined hidden">play_circle</span>
              <span className="relative z-10">
                {tasks.some(t => t.status === 'doing') 
                  ? 'Continue Focus Mode' 
                  : tasks.length > 0 
                    ? `Start Focus: ${tasks[0].title}`
                    : 'Start Focus Mode'}
              </span>
            </motion.button>
          </div>
        </section>

        {/* Right/Sidebar Column: Context & The Daily 3 */}
        <aside className="w-full md:w-[350px] lg:w-[400px] space-y-8 mt-12 md:mt-0">
          {/* Daily Wisdom */}
          <QuoteCard customQuote={env.wisdomQuote} />

          {/* AI Insight */}
          {env.aiSummary && (
            <motion.div
              className="bg-primary/5 rounded-[14px] p-6 border border-primary/10 ambient-shadow relative overflow-hidden"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={18} className="text-primary" />
                <span className="text-sm font-medium tracking-wide text-primary">BLOOM Analysis</span>
              </div>
              {profile?.ai_archetype && (
                <span className="inline-block mb-3 text-xs font-mono uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                  {profile.ai_archetype}
                </span>
              )}
              <p 
                className="text-primary/80 leading-relaxed font-body text-[15px]" 
                dangerouslySetInnerHTML={{ __html: env.aiSummary.replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary font-medium">$1</strong>') }} 
              />
            </motion.div>
          )}

          {/* Streak Card */}
          <motion.div
            className="bg-surface-container-low rounded-[14px] p-6 flex items-center justify-between ambient-shadow"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center">
                <Flame size={24} className="text-secondary fill-secondary" />
              </div>
              <div>
                <p className="text-sm font-mono text-on-surface-variant uppercase tracking-widest">Current Streak</p>
                <p className="text-2xl font-editorial text-primary">{streak.current_streak} Days</p>
              </div>
            </div>
          </motion.div>

          {/* Focus Block: Active Execution Interface */}
          <motion.div
            className="bg-primary/10 rounded-[20px] p-8 ambient-shadow relative overflow-hidden border border-primary/20"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent animate-pulse-slow" />
            
            <div className="mb-6 relative z-10 flex justify-between items-end">
              <div>
                <h3 className="text-2xl font-editorial text-primary mb-1">Active Focus</h3>
                <p className="text-primary/70 text-sm font-body">The Daily 3 execution.</p>
              </div>
              {tasks.some(t => t.status === 'doing') && (
                <span className="bg-primary text-white text-xs font-mono px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  In Progress
                </span>
              )}
            </div>

            <div className="space-y-3 relative z-10">
              {tasks.slice(0, 3).map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  config={priorityConfig}
                  onStatusChange={() => updateTaskStatus(task.id)}
                />
              ))}

              {tasks.length < 3 && (
                <div className="h-20 border-2 border-dashed border-outline-variant/30 rounded-[14px] flex items-center justify-center text-on-surface-variant/50 text-sm">
                  + Add task
                </div>
              )}
            </div>
          </motion.div>
        </aside>
      </main>
    </div>
  );
}

function AiCommandBar() {
  const [input, setInput] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setShowConfirmation(true);
      // AI parsing would happen here
      setTimeout(() => setShowConfirmation(false), 4000);
    }
  };

  return (
    <div className="relative">
      <motion.form
        onSubmit={handleSubmit}
        className="glass-panel ambient-shadow rounded-full px-5 py-3.5 flex items-center gap-3 relative overflow-hidden group hover:bg-surface-container-lowest transition-colors"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <button
          type="button"
          className="p-2 rounded-full hover:bg-primary/10 relative"
          aria-label="Voice input"
        >
          <Mic size={18} className="text-primary" />
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What is your intention for today?"
          className="bg-transparent border-none focus:ring-0 w-full text-base placeholder:text-on-surface-variant/60 outline-none relative font-body"
        />

        <button
          type="submit"
          className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary-dark transition-colors"
          aria-label="Send"
        >
          <Sparkles size={16} />
        </button>
      </motion.form>

      {/* AI Confirmation Card */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            className="absolute top-full mt-3 left-0 right-0 bg-white rounded-2xl p-4 shadow-[0_20px_40px_-15px_rgba(45,90,39,0.1)] border border-primary/10 z-50"
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-primary/5">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles size={14} />
                <span className="text-xs font-medium uppercase tracking-wider">Parsed Task</span>
              </div>
              <button className="text-xs text-primary/70 hover:text-primary">Edit</button>
            </div>
            <div className="space-y-2">
              <p className="font-body text-on-surface font-medium">Prepare presentation slides</p>
              <div className="flex gap-2">
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-mono">2:00 PM</span>
                <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2 py-1 rounded-md text-xs font-mono">High</span>
              </div>
              <motion.button
                className="w-full bg-primary text-white rounded-lg py-2.5 text-sm font-medium hover:bg-primary-dark transition-colors mt-2"
                whileTap={{ scale: 0.98 }}
              >
                Confirm & Add
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TaskCard({
  task,
  index,
  config,
  onStatusChange,
}: {
  task: DailyTask;
  index: number;
  config: Record<Priority, { bg: string; text: string; borderColor: string }>;
  onStatusChange: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
      className={`bg-surface-container-lowest rounded-[14px] p-4 flex gap-4 items-start group transition-all hover:bg-white ${
        task.status === 'done' ? 'opacity-60' : ''
      }`}
    >
      {/* Animated Checkbox */}
      <motion.button
        onClick={onStatusChange}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
          task.status === 'done'
            ? 'bg-primary border-primary text-white'
            : 'border-outline-variant text-transparent hover:border-primary'
        }`}
        whileTap={{ scale: 0.85 }}
        aria-label="Toggle task completion"
      >
        <motion.div
          initial={false}
          animate={{ scale: task.status === 'done' ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <Check size={12} />
        </motion.div>
      </motion.button>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2 mb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            {index === 0 && task.status !== 'done' && (
              <span className="shrink-0 bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
                Start here
              </span>
            )}
            <p className={`font-body text-sm md:text-base truncate leading-tight ${task.status === 'done' ? 'text-on-surface-variant line-through' : 'text-on-surface font-medium'}`}>
              {task.title}
            </p>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 ${config[task.priority].bg} ${config[task.priority].text}`}>
            {task.priority.toUpperCase()}
          </span>
        </div>
        {task.deadline && (
          <div className="flex items-center gap-1.5 text-on-surface-variant/70 text-xs font-mono">
            <Clock size={12} />
            <span>{new Date(task.deadline).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function BloomStageIndicator({ completed }: { completed: number }) {
  let stage: 'seed' | 'sprout' | 'plant' | 'tree' = 'seed';
  if (completed >= 3) stage = 'tree';
  else if (completed === 2) stage = 'plant';
  else if (completed === 1) stage = 'sprout';

  const scaleMap = { seed: 0.6, sprout: 0.75, plant: 0.9, tree: 1.0 };
  const opacityMap = { seed: 0.4, sprout: 0.6, plant: 0.8, tree: 1.0 };

  return (
    <motion.div
      key={stage}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: opacityMap[stage], scale: scaleMap[stage] }}
      transition={{ duration: 0.4, type: 'spring' }}
    >
      <BloomPlant stage={stage} className="w-full h-full" />
    </motion.div>
  );
}
