import { BloomStage } from '@/lib/shvasa/types';

export function BloomIcon({ stage, className = '' }: { stage: BloomStage; className?: string }) {
  const label = {
    seed: 'Seed',
    sprout: 'Sprout',
    plant: 'Plant',
    tree: 'Tree',
  }[stage];

  return (
    <svg className={className} viewBox="0 0 180 180" role="img" aria-label={label}>
      <defs>
        <linearGradient id={`ground-${stage}`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fef3c7" />
          <stop offset="1" stopColor="#dcfce7" />
        </linearGradient>
      </defs>
      <path d="M28 134C48 118 132 118 154 134C142 154 48 154 28 134Z" fill={`url(#ground-${stage})`} />
      {stage === 'seed' && <ellipse cx="90" cy="126" rx="17" ry="11" fill="#92400e" />}
      {stage !== 'seed' && (
        <>
          <path d="M91 128C91 102 89 83 90 58" stroke="#166534" strokeWidth="9" strokeLinecap="round" />
          <path d="M91 100C72 86 63 75 57 59C77 60 88 73 93 91" fill="#22c55e" />
        </>
      )}
      {(stage === 'plant' || stage === 'tree') && (
        <path d="M91 82C113 65 125 53 131 35C107 36 94 51 89 74" fill="#38bdf8" opacity="0.85" />
      )}
      {stage === 'tree' && (
        <>
          <circle cx="91" cy="48" r="33" fill="#22c55e" />
          <circle cx="66" cy="66" r="24" fill="#16a34a" />
          <circle cx="117" cy="68" r="25" fill="#4ade80" />
          <path d="M90 80C78 87 71 94 64 107" stroke="#166534" strokeWidth="6" strokeLinecap="round" />
          <path d="M92 77C104 86 111 94 119 107" stroke="#166534" strokeWidth="6" strokeLinecap="round" />
          <circle cx="119" cy="47" r="6" fill="#f59e0b" />
        </>
      )}
    </svg>
  );
}

