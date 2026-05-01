'use client'
import { motion } from 'framer-motion'

interface CheckboxProps {
  checked: boolean
  onChange: () => void
  size?: number
}

export function Checkbox({ checked, onChange, size = 20 }: CheckboxProps) {
  return (
    <motion.button
      onClick={onChange}
      className="flex-shrink-0 cursor-pointer focus:outline-none"
      whileTap={{ scale: 0.88 }}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
        {/* Circle background */}
        <motion.circle
          cx="10" cy="10" r="9"
          stroke={checked ? '#4A8C3F' : '#E8DFC8'}
          fill={checked ? '#4A8C3F' : 'transparent'}
          strokeWidth="1.5"
          animate={{
            scale: checked ? [1, 0.82, 1.12, 1] : 1,
            stroke: checked ? '#4A8C3F' : '#E8DFC8',
            fill: checked ? '#4A8C3F' : 'transparent',
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
        />
        {/* Checkmark path draws itself */}
        <motion.path
          d="M5.5 10.5l3 3 6-6"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: checked ? 1 : 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
        />
      </svg>
    </motion.button>
  )
}
