'use client';

import { motion } from 'framer-motion';

type BloomStage = 'seed' | 'sprout' | 'plant' | 'tree';

const STAGE_SCALES: Record<BloomStage, number> = {
  seed: 0.6,
  sprout: 0.75,
  plant: 0.9,
  tree: 1.0,
};

const STAGE_OPACITIES: Record<BloomStage, number> = {
  seed: 0.4,
  sprout: 0.6,
  plant: 0.85,
  tree: 1.0,
};

export function BloomPlant({ stage, className = '' }: { stage: BloomStage; className?: string }) {
  const scale = STAGE_SCALES[stage];
  const opacity = STAGE_OPACITIES[stage];

  return (
    <motion.div
      className={`relative ${className}`}
      animate={{ scale: [scale * 0.98, scale, scale * 0.98] }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {/* Soft Glow Background */}
      <div
        className="absolute inset-0 blur-3xl rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, #7DBF6E 0%, transparent 70%)',
        }}
      />

      {/* Minimalist SVG Plant */}
      <svg
        viewBox="0 0 100 120"
        className="relative z-10 w-full h-full"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: '#2D5A27' }}
      >
        <defs>
          <linearGradient id="stemGrad" x1="0.5" y1="1" x2="0.5" y2="0">
            <stop offset="0%" stopColor="#2D5A27" />
            <stop offset="100%" stopColor="#7DBF6E" />
          </linearGradient>
        </defs>

        {/* Main Stem */}
        {stage !== 'seed' && (
          <path
            d="M50 115 Q50 85 50 55 L50 20"
            stroke="url(#stemGrad)"
            strokeWidth="3"
            className="transition-all duration-500"
          />
        )}

        {/* Seed stage - just a seed */}
        {stage === 'seed' && (
          <ellipse
            cx="50"
            cy="102"
            rx="8"
            ry="5"
            fill="#6B5B45"
            stroke="none"
          />
        )}

        {/* Sprout - single pair of leaves */}
        {stage === 'sprout' && (
          <>
            {/* Left leaf */}
            <path
              d="M50 85 Q35 75 28 65"
              strokeWidth="2.5"
              stroke="#7DBF6E"
              fill="none"
            />
            {/* Right leaf */}
            <path
              d="M50 85 Q65 75 72 65"
              strokeWidth="2.5"
              stroke="#7DBF6E"
              fill="none"
            />
            {/* Small leaves at base */}
            <path d="M42 95 Q38 92 34 88" stroke="#7DBF6E" strokeWidth="2" fill="none" />
            <path d="M58 95 Q62 92 66 88" stroke="#7DBF6E" strokeWidth="2" fill="none" />
          </>
        )}

        {/* Plant - more leaves and slight growth */}
        {stage === 'plant' && (
          <>
            {/* Lower leaves */}
            <path
              d="M50 80 Q30 70 22 60"
              strokeWidth="2.5"
              stroke="#7DBF6E"
              fill="none"
            />
            <path
              d="M50 80 Q70 70 78 60"
              strokeWidth="2.5"
              stroke="#7DBF6E"
              fill="none"
            />
            {/* Upper leaves */}
            <path
              d="M50 60 Q38 50 32 40"
              strokeWidth="2"
              stroke="#2D5A27"
              fill="none"
            />
            <path
              d="M50 60 Q62 50 68 40"
              strokeWidth="2"
              stroke="#2D5A27"
              fill="none"
            />
            {/* Small budding flower */}
            <circle cx="50" cy="35" r="4" fill="#7DBF6E" />
          </>
        )}

        {/* Tree - Full bloom */}
        {stage === 'tree' && (
          <>
            {/* Multiple leaves */}
            <path
              d="M50 75 Q25 65 18 55"
              strokeWidth="2.5"
              stroke="#7DBF6E"
              fill="none"
            />
            <path
              d="M50 75 Q75 65 82 55"
              strokeWidth="2.5"
              stroke="#7DBF6E"
              fill="none"
            />
            <path
              d="M50 60 Q35 45 30 35"
              strokeWidth="2"
              stroke="#2D5A27"
              fill="none"
            />
            <path
              d="M50 60 Q65 45 70 35"
              strokeWidth="2"
              stroke="#2D5A27"
              fill="none"
            />
            {/* Flower canopy - abstract bloom */}
            <g>
              <motion.circle
                cx="50"
                cy="30"
                r="12"
                fill="#7DBF6E"
                initial={{ r: 0, opacity: 0 }}
                animate={{ r: 12, opacity: 0.8 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
              <motion.circle
                cx="42"
                cy="25"
                r="8"
                fill="#2D5A27"
                initial={{ r: 0, opacity: 0 }}
                animate={{ r: 8, opacity: 0.9 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              />
              <motion.circle
                cx="58"
                cy="27"
                r="9"
                fill="#2D5A27"
                initial={{ r: 0, opacity: 0 }}
                animate={{ r: 9, opacity: 0.9 }}
                transition={{ delay: 0.15, duration: 0.5 }}
              />
            </g>
          </>
        )}
      </svg>
    </motion.div>
  );
}
