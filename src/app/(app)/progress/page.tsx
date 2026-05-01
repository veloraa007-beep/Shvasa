'use client';

import { motion } from 'framer-motion';
import { Flame, TreeDeciduous, Trophy, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { readSnapshot } from '@/lib/shvasa/local-store';
import { ShvasaUser } from '@/lib/shvasa/types';
import { useRouter } from 'next/navigation';

function readUser(): ShvasaUser | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem('shvasa:user');
  return raw ? JSON.parse(raw) as ShvasaUser : null;
}

export default function ProgressPage() {
  const [user, setUser] = useState<ShvasaUser | null>(null);
  const router = useRouter();

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

  const streak = snapshotQuery.data?.streak?.current_streak || 0;
  
  // Dummy data for visual representation
  const weeklyCompletion = [100, 100, 66, 100, 33, 0, 0]; // Sun to Sat
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  if (!user) return null;

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-surface">
      <div className="h-16 md:hidden"></div>

      <main className="max-w-5xl mx-auto px-6 pt-8 pb-24">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-editorial text-primary tracking-tight mb-2">Your Garden</h1>
          <p className="text-on-surface-variant font-body">Watch your consistency bloom into a beautiful landscape.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Stat 1: Streak */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-container-low rounded-[24px] p-6 border border-surface-variant/20 flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mb-6">
              <Flame size={24} />
            </div>
            <div>
              <p className="text-sm font-mono text-on-surface-variant uppercase tracking-widest mb-1">Current Streak</p>
              <p className="text-4xl font-editorial text-primary">{streak} <span className="text-xl text-primary/60">days</span></p>
            </div>
          </motion.div>

          {/* Stat 2: Total Blooms */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-primary/10 rounded-[24px] p-6 border border-primary/20 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute -right-4 -bottom-4 text-primary/10">
              <TreeDeciduous size={120} />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-6">
                <TreeDeciduous size={24} />
              </div>
              <div>
                <p className="text-sm font-mono text-primary/80 uppercase tracking-widest mb-1">Trees Planted</p>
                <p className="text-4xl font-editorial text-primary">12 <span className="text-xl text-primary/60">trees</span></p>
              </div>
            </div>
          </motion.div>

          {/* Stat 3: Focus Time */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface-container-low rounded-[24px] p-6 border border-surface-variant/20 flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center mb-6">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-sm font-mono text-on-surface-variant uppercase tracking-widest mb-1">Deep Focus</p>
              <p className="text-4xl font-editorial text-primary">14 <span className="text-xl text-primary/60">hours</span></p>
            </div>
          </motion.div>
        </div>

        {/* Weekly Chart */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface-container-lowest rounded-[32px] p-8 border border-surface-variant/20 mb-12"
        >
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-2xl font-editorial text-primary mb-1">This Week</h2>
              <p className="text-sm text-on-surface-variant font-body">The Daily 3 completion rate</p>
            </div>
            <div className="flex items-center gap-1 text-primary bg-primary/10 px-3 py-1.5 rounded-full text-sm font-medium">
              <ArrowUpRight size={16} />
              <span>12% from last week</span>
            </div>
          </div>

          <div className="flex justify-between items-end h-48 gap-2">
            {weeklyCompletion.map((percent, i) => (
              <div key={i} className="flex flex-col items-center flex-1 gap-3">
                <div className="w-full max-w-[48px] h-full bg-surface-container rounded-t-full rounded-b-full relative flex items-end p-1">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${percent}%` }}
                    transition={{ duration: 1, delay: 0.4 + i * 0.1, ease: 'easeOut' }}
                    className={`w-full rounded-full ${percent === 100 ? 'bg-primary' : percent > 0 ? 'bg-primary/40' : 'bg-transparent'}`}
                  />
                </div>
                <span className="text-xs font-mono font-medium text-on-surface-variant uppercase">{days[i]}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Milestone Timeline */}
        <section>
          <h2 className="text-2xl font-editorial text-primary mb-6">Recent Milestones</h2>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-surface-variant/30">
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-surface bg-primary text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                <CheckCircle2 size={20} />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-surface-container-low p-5 rounded-[16px] border border-surface-variant/20 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-primary">7-Day Streak</h3>
                  <span className="text-xs font-mono text-on-surface-variant">Today</span>
                </div>
                <p className="text-sm text-on-surface-variant font-body">You maintained a perfect focus routine for a week. A new Sapling has been added to your garden.</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-surface bg-surface-container text-on-surface-variant shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <TreeDeciduous size={20} />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-surface-container-lowest p-5 rounded-[16px] border border-surface-variant/20">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-on-surface">First Forest</h3>
                  <span className="text-xs font-mono text-on-surface-variant">Oct 12</span>
                </div>
                <p className="text-sm text-on-surface-variant font-body">Planted 10 trees by completing all tasks consistently.</p>
              </div>
            </motion.div>

          </div>
        </section>

      </main>
    </div>
  );
}
