'use client';

import { usePathname } from 'next/navigation';
import { Home, CheckSquare, FileText, Timer, BarChart2, Mic } from 'lucide-react';

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: 'Home', href: '/dashboard' },
    { icon: CheckSquare, label: 'Tasks', href: '/tasks' },
    { icon: Timer, label: 'Focus', href: '/focus' },
    { icon: Mic, label: 'AI Mentor', href: '/ai-companion' },
    { icon: BarChart2, label: 'Progress', href: '/progress' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container/80 backdrop-blur-3xl border-t border-surface-variant/20 z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <a
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center px-3 py-1 rounded-lg transition-all ${
                isActive
                  ? 'text-primary scale-95'
                  : 'text-on-surface-variant/70 hover:text-primary/80'
              }`}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-mono uppercase tracking-wider mt-0.5">{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
