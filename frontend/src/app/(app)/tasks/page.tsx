'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, Search, Calendar, Clock, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { readSnapshot, upsertTasks } from '@/lib/shvasa/local-store';
import { saveTasks } from '@/lib/supabase/client';
import { ShvasaUser, DailyTask, TaskStatus, Priority } from '@/lib/shvasa/types';

function readUser(): ShvasaUser | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem('shvasa:user');
  return raw ? JSON.parse(raw) as ShvasaUser : null;
}

export default function TasksPage() {
  const [user, setUser] = useState<ShvasaUser | null>(null);
  const [filter, setFilter] = useState<'all' | 'todo' | 'doing' | 'done'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const stored = readUser();
    if (!stored) router.push('/');
    else setUser(stored);
  }, [router]);

  const snapshotQuery = useQuery({
    queryKey: ['snapshot', user?.id],
    queryFn: () => readSnapshot(user!.id),
    enabled: Boolean(user),
  });

  const tasks = snapshotQuery.data?.tasks ?? [];

  const tasksMutation = useMutation({
    mutationFn: async (nextTasks: DailyTask[]) => {
      if (!user) return nextTasks;
      upsertTasks(user.id, nextTasks);
      await saveTasks(nextTasks, user.accessToken);
      return nextTasks;
    },
    onSuccess: async () => {
      if (user) await queryClient.invalidateQueries({ queryKey: ['snapshot', user.id] });
    },
  });

  function updateTaskStatus(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    tasksMutation.mutate(tasks.map((t) => (t.id === id ? { ...t, status: newStatus as TaskStatus } : t)));
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter !== 'all' && task.status !== filter) return false;
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (!user) return null;

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-surface">
      {/* Mobile Topbar Spacer */}
      <div className="h-16 md:hidden"></div>

      <main className="max-w-4xl mx-auto px-6 pt-8 pb-24">
        {/* Header & Controls */}
        <div className="mb-10 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-editorial text-primary tracking-tight">All Tasks</h1>
            <button className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">
              <Plus size={20} />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50" size={18} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-surface-container-low border border-surface-variant/30 rounded-[14px] text-on-surface focus:outline-none focus:border-primary/50 transition-colors font-body"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
              {['all', 'todo', 'doing', 'done'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-4 py-2.5 rounded-[12px] font-medium text-sm whitespace-nowrap transition-colors capitalize ${
                    filter === f
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredTasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20 text-on-surface-variant"
              >
                <div className="text-4xl mb-4 opacity-50">🍃</div>
                <p className="font-body text-lg">No tasks found here.</p>
                <p className="text-sm opacity-70 mt-1">Enjoy the clarity.</p>
              </motion.div>
            ) : (
              filteredTasks.map((task, i) => (
                <TaskListItem
                  key={task.id}
                  task={task}
                  index={i}
                  onStatusChange={() => updateTaskStatus(task.id)}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function TaskListItem({ task, index, onStatusChange }: { task: DailyTask; index: number; onStatusChange: () => void }) {
  const priorityConfig: Record<Priority, { bg: string; text: string }> = {
    high: { bg: 'bg-red-50', text: 'text-red-700' },
    med: { bg: 'bg-violet-50', text: 'text-violet-700' },
    low: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`bg-surface-container-lowest rounded-2xl p-4 sm:p-5 flex gap-4 items-start border border-surface-variant/20 hover:border-primary/20 transition-colors group ${
        task.status === 'done' ? 'opacity-50 grayscale-[30%]' : ''
      }`}
    >
      <button
        onClick={onStatusChange}
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
          task.status === 'done'
            ? 'bg-primary border-primary text-white'
            : 'border-outline-variant text-transparent hover:border-primary'
        }`}
      >
        <motion.div
          initial={false}
          animate={{ scale: task.status === 'done' ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <Check size={14} />
        </motion.div>
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-4">
          <p className={`font-body text-base sm:text-lg mb-1 leading-snug ${task.status === 'done' ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
            {task.title}
          </p>
          <span className={`text-[10px] font-mono px-2 py-1 rounded-md shrink-0 uppercase font-semibold ${priorityConfig[task.priority].bg} ${priorityConfig[task.priority].text}`}>
            {task.priority}
          </span>
        </div>
        
        {task.deadline && (
          <div className="flex items-center gap-3 mt-2 text-on-surface-variant text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <Calendar size={12} className="opacity-70" />
              <span>Today</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={12} className="opacity-70" />
              <span>{new Date(task.deadline).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
