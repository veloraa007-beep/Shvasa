'use client'
import { useState } from 'react'
import { Checkbox } from '@/components/ui/Checkbox'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, AlarmClock, MoreHorizontal } from 'lucide-react'

export interface Task {
  id: string;
  title: string;
  status?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW' | 'urgent' | 'high' | 'medium' | 'low';
  isCompleted?: boolean;
  dueDate?: string;
  deadline?: Date;
  tag?: string;
  tags?: string[];
  subtasks?: any[];
}

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<Task>) => void;
}

function isOverdue(date: Date) {
  return date < new Date() && date.toDateString() !== new Date().toDateString()
}

function isToday(date: Date) {
  return date.toDateString() === new Date().toDateString()
}

function formatDeadline(date: Date) {
  if (isToday(date)) return 'Today'
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  return date.toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

export function TaskCard({ task, onToggle }: TaskCardProps) {
  const [done, setDone] = useState(task.status === 'DONE' || task.isCompleted === true)

  const handleToggle = async () => {
    setDone(!done)
    // Optimistic update
    await onToggle(task.id)
  }

  return (
    <AnimatePresence>
      <motion.div
        layout
        layoutId={`task-${task.id}`}
        animate={{ opacity: done ? 0.5 : 1 }}
        exit={{ opacity: 0, x: 20, transition: { duration: 0.3, delay: 0.2 } }}
        className="flex items-start gap-3 bg-white border border-[#E8DFC8] rounded-[14px] px-4 py-3 mb-1 hover:bg-[#F5EDD8] transition-colors duration-150 cursor-pointer group relative overflow-hidden"
      >
        {/* Priority left edge */}
        <div className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full
          ${task.priority === 'HIGH' || task.priority === 'urgent' ? 'bg-[#FF6B35]' :
            task.priority === 'MEDIUM' || task.priority === 'high' ? 'bg-[#7B61FF]' :
            'bg-[#00FFB2]'}`}
        />

        <Checkbox checked={done} onChange={handleToggle} />

        <div className="flex-1 min-w-0">
          {/* Title with animated strikethrough */}
          <motion.p
            className="text-[14px] text-[#3A2E1E] leading-snug"
            animate={{
              color: done ? '#A08060' : '#3A2E1E',
              textDecoration: done ? 'line-through' : 'none',
            }}
            transition={{ duration: 0.2 }}
          >
            {task.title}
          </motion.p>

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {task.deadline && (
              <span className={`flex items-center gap-1 text-[12px] font-mono
                ${isOverdue(task.deadline) ? 'text-[#DC2626]' :
                  isToday(task.deadline) ? 'text-[#E8A000]' :
                  'text-[#A08060]'}`}>
                <Calendar size={11} />
                {formatDeadline(task.deadline)}
              </span>
            )}
            {task.dueDate && !task.deadline && (
              <span className={`flex items-center gap-1 text-[12px] font-mono
                ${task.dueDate.toLowerCase() === 'today' ? 'text-[#E8A000]' : 'text-[#A08060]'}`}>
                <Calendar size={11} />
                {task.dueDate}
              </span>
            )}
            {task.tag && (
              <span className="text-[11px] bg-[#F5EDD8] text-[#6B5B45] px-2 py-0.5 rounded-full border border-[#E8DFC8]">
                {task.tag}
              </span>
            )}
            {task.tags && task.tags.length > 0 && !task.tag && (
               <span className="text-[11px] bg-[#F5EDD8] text-[#6B5B45] px-2 py-0.5 rounded-full border border-[#E8DFC8]">
                 {task.tags[0]}
               </span>
            )}
          </div>
        </div>

        {/* Action buttons — fade in on hover */}
        <motion.div
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
        >
          <button className="w-7 h-7 flex items-center justify-center rounded-[7px] hover:bg-[#F5EDD8] text-[#A08060] hover:text-[#3A2E1E] transition-colors focus:outline-none">
            <AlarmClock size={13} />
          </button>
          <button className="w-7 h-7 flex items-center justify-center rounded-[7px] hover:bg-[#F5EDD8] text-[#A08060] hover:text-[#3A2E1E] transition-colors focus:outline-none">
            <Calendar size={13} />
          </button>
          <button className="w-7 h-7 flex items-center justify-center rounded-[7px] hover:bg-[#F5EDD8] text-[#A08060] hover:text-[#3A2E1E] transition-colors focus:outline-none">
            <MoreHorizontal size={13} />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
