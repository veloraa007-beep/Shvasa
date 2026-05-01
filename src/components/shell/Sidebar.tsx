'use client';

import { motion } from 'framer-motion';
import {
  Home,
  CheckSquare,
  FileText,
  FolderOpen,
  Calendar,
  Mic,
  Timer,
  BarChart2,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: CheckSquare, label: 'Tasks', href: '/tasks' },
  { icon: FileText, label: 'Notes', href: '/notes' },
  { icon: Timer, label: 'Focus', href: '/focus' },
  { icon: BarChart2, label: 'Progress', href: '/progress' },
  { icon: Sparkles, label: 'Reflection', href: '/reflection' },
  { icon: Calendar, label: 'Calendar', href: '/calendar' },
  { icon: Mic, label: 'AI Mentor', href: '/ai-companion', isVoice: true },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

function BrandLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 32 Q20 20 28 12 Q32 8 36 12 Q32 18 20 24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.8"
      />
      <path
        d="M20 32 Q20 20 12 12 Q8 8 4 12 Q8 18 20 24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.6"
      />
      <path d="M20 32 L20 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="10" r="3" fill="currentColor" />
    </svg>
  );
}

export function Sidebar({ profile }: { profile?: any }) {
  const pathname = usePathname();

  const displayName = profile?.display_name || 'Friend';
  const avatarInitials = displayName.substring(0, 2).toUpperCase();
  const plan = profile?.plan === 'pro' ? 'Pro Plan' : 'Free Plan';

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] flex flex-col bg-surface border-r border-surface-variant/30 overflow-hidden z-50">
      {/* Logo & Brand */}
      <div className="p-6">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <BrandLogo className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-editorial italic text-primary text-xl tracking-tight">Shvasa</h1>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Nature • Focus • Flow</p>
          </div>
        </motion.div>
      </div>

      {/* User Profile Card */}
      <div className="px-4 mb-4">
        <Link href="/profile" className="block">
          <motion.div
            className="bg-surface-container rounded-[14px] p-4 flex items-center gap-3 cursor-pointer hover:bg-surface-container-low transition-colors"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {profile?.avatar ? (
              <img src={profile.avatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                {avatarInitials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-on-surface truncate">{displayName}</p>
              <div className="flex items-center gap-1">
                <Sparkles size={10} className="text-secondary" />
                <p className="text-[10px] text-on-surface-variant">{plan}</p>
              </div>
            </div>
            <ChevronDown size={14} className="text-on-surface-variant" />
          </motion.div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 overflow-y-auto space-y-1">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href || (item.href === '/' && pathname === '/');
          const Icon = item.icon;

          return (
            <Link key={item.label} href={item.href} className="block">
              <motion.div
                className={`flex items-center gap-3 h-11 px-4 rounded-[14px] transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Icon size={18} className="flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-nav-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white/60 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                {item.isVoice && (
                  <motion.div
                    className="ml-auto w-2 h-2 rounded-full bg-current"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-surface-variant/20">
        <motion.button
          className="flex items-center gap-3 w-full h-10 px-4 rounded-[14px] text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Sign out</span>
        </motion.button>
      </div>
    </aside>
  );
}
