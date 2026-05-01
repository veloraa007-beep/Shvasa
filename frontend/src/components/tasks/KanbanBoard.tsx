'use client'
import { motion } from 'framer-motion'

const COLUMNS = [
  { id: 'TODO',        label: 'Seed 🌱',      color: '#A08060', bg: '#F5EDD8' },
  { id: 'IN_PROGRESS', label: 'Growing 🌿',   color: '#2563EB', bg: '#EFF6FF' },
  { id: 'DONE',        label: 'Complete 🌳',  color: '#2D5A27', bg: '#EAF5E2' },
  { id: 'ARCHIVED',   label: 'Archived',      color: '#A08060', bg: '#F5F5F5' },
]

export function KanbanBoard() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
      {COLUMNS.map((col, ci) => (
        <motion.div
          key={col.id}
          className="flex-shrink-0 w-[240px]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: ci * 0.06, type: 'spring', stiffness: 300 }}
        >
          {/* Column header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[13px] font-semibold" style={{ color: col.color }}>
              {col.label}
            </span>
            <span className="text-[11px] font-mono text-[#A08060] bg-[#F5EDD8] px-2 py-0.5 rounded-full">0</span>
          </div>

          {/* Drop zone */}
          <div
            className="min-h-[200px] rounded-[14px] p-2 border-2 border-dashed border-[#E8DFC8] transition-colors"
            style={{ background: col.bg }}
          >
            {/* Task cards dragged here */}
            <button
              className="w-full flex items-center justify-center gap-2 py-2 px-2 text-[12px] text-[#A08060] hover:text-[#6B5B45] transition-colors rounded-[8px] hover:bg-white/50 focus:outline-none"
            >
              <span className="w-4 h-4 rounded-full border border-[#E8DFC8] flex items-center justify-center text-[10px]">+</span>
              Add task
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
