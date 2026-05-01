'use client';

import * as React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'urgent' | 'high' | 'medium' | 'low';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-earth-deep text-bark-mid border-transparent',
    outline: 'border-border text-bark-mid',
    secondary: 'bg-leaf-pale text-forest border-transparent',
    urgent: 'bg-red-50 text-danger border-red-200',
    high: 'bg-gold-pale text-gold border-gold-light/20',
    medium: 'bg-blue-50 text-medium border-blue-200',
    low: 'bg-leaf-pale text-low border-leaf-light/20',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
