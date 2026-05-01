'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sprout, Calendar, Flag, Tag, UserPlus, Sparkles, X } from 'lucide-react'

export function QuickAdd() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [deadline, setDeadline] = useState<Date | null>(null)
  const [priority, setPriority] = useState<'HIGH'|'MEDIUM'|'LOW'|null>(null)
  const [tag, setTag] = useState('')
  const [parsing, setParsing] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Open on Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    // Also listen for FAB event
    const fabHandler = () => setOpen(true)
    window.addEventListener('taskly:quickadd', fabHandler)
    return () => {
      window.removeEventListener('keydown', handler)
      window.removeEventListener('taskly:quickadd', fabHandler)
    }
  }, [])

  // Auto-focus input when modal opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80)
    else { setTitle(''); setDeadline(null); setPriority(null); setTag('') }
  }, [open])

  // AI parse on typing pause (800ms debounce)
  useEffect(() => {
    if (!title.trim() || title.length < 10) return
    const t = setTimeout(async () => {
      setParsing(true)
      try {
        const res = await fetch('/api/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ raw_transcript: title })
        })
        const data = await res.json()
        if (data.task?.deadline) setDeadline(new Date(data.task.deadline))
        if (data.task?.priority) setPriority(data.task.priority)
      } catch {}
      setParsing(false)
    }, 800)
    return () => clearTimeout(t)
  }, [title])

  const handleSave = async () => {
    if (!title.trim()) return
    // POST to backend (commented out for visual frontend focus)
    /*
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw_transcript: title })
    })
    */
    setOpen(false)
  }

  const priorityColors: Record<string, string> = {
    HIGH: '#FF6B35', MEDIUM: '#7B61FF', LOW: '#00FFB2'
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-[3px] z-50 pointer-events-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            {/* Modal */}
            <motion.div
              className="fixed top-[30%] left-1/2 -translate-x-1/2 w-[560px] bg-white rounded-[20px] shadow-2xl z-[60] overflow-visible"
              initial={{ scale: 0.92, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, y: 12, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            >
              {/* Main input row */}
              <div className="flex items-center gap-3 px-5 pt-5 pb-3">
                <Sprout size={20} className="text-[#4A8C3F] flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSave()}
                  placeholder="What needs to be done?"
                  className="flex-1 text-[16px] text-[#3A2E1E] placeholder:text-[#A08060] outline-none font-sans bg-transparent"
                />
                {/* Sparkles animates when AI is parsing */}
                <motion.div
                  animate={parsing ? {
                    scale: [1, 1.3, 1],
                    color: ['#A08060', '#E8A000', '#A08060'],
                  } : {}}
                  transition={{ duration: 0.6, repeat: Infinity }}
                >
                  <Sparkles size={16} className={parsing ? 'text-[#E8A000]' : 'text-[#E8DFC8]'} />
                </motion.div>
              </div>

              {/* Property chips */}
              <div className="flex items-center gap-2 px-5 pb-4 border-t border-[#F5EDD8] pt-3 flex-wrap">

                {/* Deadline chip */}
                <motion.button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border text-[12px] font-medium transition-all
                    ${deadline
                      ? 'bg-[#FEF3C7] border-[#FDE68A] text-[#E8A000]'
                      : 'bg-[#F5EDD8] border-[#E8DFC8] text-[#A08060] hover:border-[#D4C8AA]'}`}
                  animate={deadline ? { scale: [1, 1.06, 1] } : {}}
                  transition={{ duration: 0.25 }}
                >
                  <Calendar size={13} />
                  {deadline ? formatDate(deadline) : 'Deadline'}
                </motion.button>

                {/* Priority chip */}
                <motion.button
                  onClick={() => {
                    const order: Array<'HIGH'|'MEDIUM'|'LOW'|null> = [null,'HIGH','MEDIUM','LOW']
                    const idx = order.indexOf(priority)
                    setPriority(order[(idx + 1) % order.length])
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border text-[12px] font-medium transition-all
                    ${priority ? 'border-transparent' : 'bg-[#F5EDD8] border-[#E8DFC8] text-[#A08060]'}`}
                  style={priority ? {
                    background: priorityColors[priority] + '18',
                    borderColor: priorityColors[priority] + '40',
                    color: priorityColors[priority]
                  } : {}}
                  animate={priority ? { scale: [1, 1.06, 1] } : {}}
                  transition={{ duration: 0.25 }}
                >
                  <Flag size={13} />
                  {priority ?? 'Priority'}
                </motion.button>

                {/* Tag chip */}
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#F5EDD8] border border-[#E8DFC8] text-[12px] text-[#A08060] hover:border-[#D4C8AA] font-medium transition-all">
                  <Tag size={13} />
                  Add tag
                </button>

                {/* Assign chip */}
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#F5EDD8] border border-[#E8DFC8] text-[12px] text-[#A08060] hover:border-[#D4C8AA] font-medium transition-all">
                  <UserPlus size={13} />
                  Assign
                </button>
              </div>

              {/* Bottom bar */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-[#F5EDD8] bg-[#FDFAF4]">
                <span className="text-[11px] text-[#A08060] font-mono">
                  Enter to save · Esc to cancel
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOpen(false)}
                    className="px-4 py-1.5 text-[13px] text-[#6B5B45] hover:text-[#3A2E1E] font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    onClick={handleSave}
                    disabled={!title.trim()}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-[#2D5A27] text-white text-[13px] font-medium rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
                    whileHover={title.trim() ? { scale: 1.02 } : {}}
                    whileTap={title.trim() ? { scale: 0.97 } : {}}
                  >
                    <Sprout size={13} />
                    Save task
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function formatDate(d: Date) {
  const today = new Date()
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric' })
}
