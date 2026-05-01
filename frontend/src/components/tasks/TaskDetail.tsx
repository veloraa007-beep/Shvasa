'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Flag, UserPlus, AlarmClock, Trash2, CheckCircle2, Sprout, Leaf, TreePine } from 'lucide-react'
import { Checkbox } from '@/components/ui/Checkbox'
import { useState } from 'react'
import { Task } from './TaskCard'

interface Subtask {
  id: string
  text: string
  done: boolean
}

interface ExtendedTask extends Task {
  subtasks?: Subtask[]
}

interface TaskDetailProps {
  task: ExtendedTask | null
  onClose: () => void
}

export function TaskDetail({ task, onClose }: TaskDetailProps) {
  return (
    <AnimatePresence>
      {task && (
        <>
          {/* Backdrop (subtle) */}
          <motion.div
            className="absolute inset-0 z-[60] bg-black/10"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Panel slides in from right */}
          <motion.div
            className="absolute right-0 top-0 h-full w-[480px] bg-white border-l border-[#E8DFC8] z-[70] flex flex-col overflow-hidden shadow-2xl"
            initial={{ x: 480 }}
            animate={{ x: 0 }}
            exit={{ x: 480 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F5EDD8]">
              {/* Status pill */}
              <button className="flex items-center gap-1.5 bg-[#EAF5E2] text-[#2D5A27] px-3 py-1 rounded-full text-[12px] font-medium">
                {(task.status === 'TODO' || !task.status) && <><Sprout size={13} /> Seed</>}
                {task.status === 'IN_PROGRESS' && <><Leaf size={13} /> Growing</>}
                {task.status === 'DONE' && <><TreePine size={13} /> Complete</>}
              </button>

              {/* Priority pill */}
              {task.priority && (
                <button
                  className="flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-medium"
                  style={{
                    background: task.priority === 'HIGH' || task.priority === 'urgent' ? '#FF6B3518' :
                                 task.priority === 'MEDIUM' || task.priority === 'high' ? '#7B61FF18' : '#00FFB218',
                    color: task.priority === 'HIGH' || task.priority === 'urgent' ? '#FF6B35' :
                           task.priority === 'MEDIUM' || task.priority === 'high' ? '#7B61FF' : '#00A87A'
                  }}
                >
                  <Flag size={11} />
                  {task.priority}
                </button>
              )}

              <div className="ml-auto flex items-center gap-1">
                <button className="w-8 h-8 flex items-center justify-center rounded-[8px] hover:bg-[#F5EDD8] text-[#A08060] transition-colors">
                  <Trash2 size={15} />
                </button>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-[8px] hover:bg-[#F5EDD8] text-[#A08060] transition-colors"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

              {/* Title */}
              <div>
                <input
                  defaultValue={task.title}
                  className="w-full font-['DM_Serif_Display'] text-[22px] text-[#3A2E1E] italic outline-none border-none bg-transparent placeholder:text-[#D4C8AA] leading-tight"
                  placeholder="Task title..."
                />
              </div>

              {/* Deadline */}
              <div>
                <p className="text-[10px] font-mono text-[#A08060] uppercase tracking-wider mb-2">Deadline</p>
                <button className="flex items-center gap-2 text-[13px] text-[#6B5B45] hover:text-[#3A2E1E] transition-colors group">
                  <Calendar size={15} className="text-[#A08060] group-hover:text-[#E8A000]" />
                  {task.deadline
                    ? new Date(task.deadline).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : <span className="text-[#A08060]">No deadline set</span>
                  }
                </button>
              </div>

              {/* Subtasks */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-mono text-[#A08060] uppercase tracking-wider">Subtasks</p>
                  {task.subtasks && task.subtasks.length > 0 && (
                    <span className="text-[11px] font-mono text-[#A08060]">
                      {task.subtasks.filter(s => s.done).length}/{task.subtasks.length}
                    </span>
                  )}
                </div>
                {/* Progress bar */}
                {task.subtasks && task.subtasks.length > 0 && (
                  <div className="h-[3px] bg-[#F5EDD8] rounded-full mb-3 overflow-hidden">
                    <motion.div
                      className="h-full bg-[#7DBF6E] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(task.subtasks.filter(s => s.done).length / task.subtasks.length) * 100}%` }}
                    />
                  </div>
                )}
                {/* Subtask list */}
                <div className="space-y-1.5">
                  {task.subtasks?.map(sub => (
                    <SubtaskRow key={sub.id} subtask={sub} />
                  ))}
                </div>
                {/* Add subtask */}
                <button className="flex items-center gap-2 mt-2 text-[12px] text-[#A08060] hover:text-[#4A8C3F] transition-colors focus:outline-none">
                  <span className="w-4 h-4 rounded-full border border-[#E8DFC8] flex items-center justify-center text-[10px]">+</span>
                  Add subtask
                </button>
              </div>

              {/* Notes */}
              <div>
                <p className="text-[10px] font-mono text-[#A08060] uppercase tracking-wider mb-2">Notes</p>
                <textarea
                  placeholder="Add notes, links, context..."
                  className="w-full text-[13px] text-[#3A2E1E] placeholder:text-[#A08060] placeholder:italic outline-none border-none bg-transparent resize-none min-h-[80px] leading-relaxed"
                />
              </div>

            </div>

            {/* Bottom action bar */}
            <div className="flex items-center gap-2 px-5 py-3 border-t border-[#F5EDD8] bg-[#FDFAF4]">
              <motion.button
                className="flex-1 flex items-center justify-center gap-2 h-10 bg-[#2D5A27] text-white text-[13px] font-medium rounded-full"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
              >
                <CheckCircle2 size={15} />
                Mark complete
              </motion.button>
              <button className="flex items-center gap-1.5 h-10 px-4 text-[13px] text-[#6B5B45] border border-[#E8DFC8] rounded-full hover:bg-[#F5EDD8] transition-colors focus:outline-none">
                <Calendar size={13} />
                Reschedule
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function SubtaskRow({ subtask }: { subtask: Subtask }) {
  const [done, setDone] = useState(subtask.done)
  return (
    <div className="flex items-center gap-2.5 py-1">
      <Checkbox checked={done} onChange={() => setDone(!done)} size={16} />
      <span className={`text-[13px] transition-all ${done ? 'line-through text-[#A08060]' : 'text-[#3A2E1E]'}`}>
        {subtask.text}
      </span>
    </div>
  )
}
