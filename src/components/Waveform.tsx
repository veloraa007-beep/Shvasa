'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Waveform({ isActive }: { isActive: boolean }) {
  const bars = [...Array(12)];

  return (
    <div className="flex items-center gap-1 h-8 px-4">
      {bars.map((_, i) => (
        <motion.div
          key={i}
          initial={{ height: 4 }}
          animate={isActive ? {
            height: [4, 16, 8, 24, 4],
          } : { height: 4 }}
          transition={isActive ? {
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.05,
            ease: 'easeInOut'
          } : {}}
          className="w-1 bg-forest rounded-full opacity-60"
        />
      ))}
    </div>
  );
}
