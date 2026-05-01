'use client'
import { motion } from 'framer-motion'
import { Sprout, Leaf, TreePine } from 'lucide-react'

// Mock data — replace with real tasks from React Query
const fallbackMockTasks = [
  { id: '1', title: 'Prune the digital garden', status: 'DONE',        priority: 'HIGH' },
  { id: '2', title: 'Prepare for review',        status: 'IN_PROGRESS', priority: 'MEDIUM' },
  { id: '3', title: 'Write weekly report',       status: 'TODO',        priority: 'LOW' },
  { id: '4', title: 'Update roadmap',            status: 'IN_PROGRESS', priority: 'HIGH' },
  { id: '5', title: 'Design new feature',        status: 'DONE',        priority: 'MEDIUM' },
  { id: '6', title: 'Fix auth bug',              status: 'TODO',        priority: 'HIGH' },
  { id: '7', title: 'Write tests',              status: 'TODO',        priority: 'LOW' },
  { id: '8', title: 'Deploy to prod',           status: 'DONE',        priority: 'HIGH' },
]

interface GardenViewProps {
  tasks?: any[];
}

export function GardenView({ tasks = fallbackMockTasks }: GardenViewProps) {
  return (
    <div
      className="grid gap-4 p-2"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))' }}
    >
      {tasks.map((task, i) => (
        <GardenCard key={task.id} task={task} index={i} />
      ))}
    </div>
  )
}

function GardenCard({ task, index }: { task: any; index: number }) {
  const isTree  = task.status === 'DONE'
  const isPlant = task.status === 'IN_PROGRESS'
  const isSeed  = task.status === 'TODO' || !task.status

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: index * 0.04,
        type: 'spring',
        stiffness: 320,
        damping: 22
      }}
      whileHover={{ y: -5, scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className={`
        flex flex-col items-center justify-end gap-2 cursor-pointer
        rounded-[14px] border p-3 transition-shadow hover:shadow-md
        ${isTree  ? 'bg-[#D1FAE5] border-[#6EE7B7] min-h-[120px]' : ''}
        ${isPlant ? 'bg-[#EAF5E2] border-[#7DBF6E] min-h-[100px]' : ''}
        ${isSeed  ? 'bg-[#F5EDD8] border-[#E8DFC8] min-h-[80px]'  : ''}
      `}
      style={{ transition: 'box-shadow 0.15s ease' }}
    >
      {/* Status icon */}
      <div className="flex-1 flex items-center justify-center">
        {isTree  && <TreePine size={32} className="text-[#2D5A27]" />}
        {isPlant && <Leaf     size={26} className="text-[#4A8C3F]" />}
        {isSeed  && <Sprout   size={22} className="text-[#7DBF6E]" />}
      </div>

      {/* Priority dot */}
      {task.priority && (
        <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full"
          style={{
            background: task.priority === 'HIGH' || task.priority === 'urgent' ? '#FF6B35' :
                        task.priority === 'MEDIUM' || task.priority === 'high' ? '#7B61FF' : '#00FFB2'
          }}
        />
      )}

      {/* Title */}
      <p className="text-[10px] text-[#3A2E1E] text-center leading-tight line-clamp-2 w-full">
        {task.title}
      </p>
    </motion.div>
  )
}
