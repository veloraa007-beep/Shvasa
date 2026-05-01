'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Square, Wind } from 'lucide-react';
import { BloomPlant } from '@/components/shvasa/BloomPlant';
import { useRouter } from 'next/navigation';

export default function FocusPage() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 mins
  const [isActive, setIsActive] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateProgress = () => {
    return ((25 * 60 - timeLeft) / (25 * 60)) * 100;
  };

  const endSession = () => {
    // Optionally save focus data here
    router.push('/dashboard');
  };

  // Determine stage based on progress
  const progress = calculateProgress();
  let stage: 'seed' | 'sprout' | 'plant' | 'tree' = 'seed';
  if (progress > 90) stage = 'tree';
  else if (progress > 50) stage = 'plant';
  else if (progress > 10) stage = 'sprout';

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Animated ambient background */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: isActive 
            ? 'radial-gradient(circle at 50% 50%, rgba(45, 90, 39, 0.08) 0%, transparent 60%)' 
            : 'radial-gradient(circle at 50% 50%, rgba(45, 90, 39, 0.03) 0%, transparent 50%)'
        }}
        transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
      />

      <div className="z-10 flex flex-col items-center max-w-md w-full px-6">
        <div className="flex items-center gap-2 text-primary mb-12">
          <Wind size={20} className={isActive ? 'animate-pulse' : ''} />
          <span className="text-sm uppercase tracking-widest font-mono font-semibold">Focus Session</span>
        </div>

        <div className="relative w-64 h-64 md:w-80 md:h-80 mb-12 flex items-center justify-center">
          {/* Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="48%"
              className="stroke-surface-variant/20 fill-none"
              strokeWidth="4"
            />
            <motion.circle
              cx="50%"
              cy="50%"
              r="48%"
              className="stroke-primary fill-none"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ strokeDasharray: '0 1000' }}
              animate={{ strokeDasharray: `${(progress / 100) * 1000} 1000` }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </svg>

          {/* Plant visualization inside the ring */}
          <div className="w-3/4 h-3/4 absolute flex items-center justify-center">
             <BloomPlant stage={stage} className="w-full h-full" />
          </div>
        </div>

        {/* Timer Display */}
        <div className="text-7xl md:text-8xl font-editorial text-primary tracking-tighter tabular-nums mb-12">
          {formatTime(timeLeft)}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          <button 
            onClick={endSession}
            className="w-14 h-14 rounded-full bg-surface-container-low border border-surface-variant/30 text-on-surface-variant flex items-center justify-center hover:bg-surface-container hover:text-primary transition-all"
          >
            <Square size={20} />
          </button>
          
          <button 
            onClick={toggleTimer}
            className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center shadow-[0_8px_30px_rgb(45,90,39,0.3)] hover:scale-105 hover:bg-primary-dark transition-all"
          >
            {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
          </button>
        </div>
      </div>
    </div>
  );
}
