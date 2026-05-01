'use client';

import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'link' | 'pill';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, icon, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-forest text-white border-none hover:bg-forest-dark shadow-sm hover:shadow-md',
      secondary: 'bg-earth text-bark border border-border-dark hover:bg-earth-deep',
      ghost: 'bg-transparent text-bark-mid hover:bg-leaf-pale hover:text-bark',
      danger: 'bg-red-50 text-danger border border-red-200 hover:bg-red-100 hover:border-red-300',
      pill: 'bg-earth text-bark-mid border border-border hover:bg-leaf-pale hover:text-forest hover:border-leaf-light rounded-full',
      link: 'bg-transparent text-forest p-0 h-auto hover:underline',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs h-8',
      md: 'px-5 py-2.5 text-sm h-10',
      lg: 'px-8 py-3.5 text-base h-12',
      icon: 'p-2 w-10 h-10 flex items-center justify-center',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={!disabled && !isLoading ? { scale: 1.01 } : {}}
        whileTap={!disabled && !isLoading ? { scale: 0.97 } : {}}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-full font-sans font-medium transition-all duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 disabled:opacity-45 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size === 'icon' ? 'icon' : size],
          variant === 'pill' && 'px-4 py-1.5 rounded-full',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {children}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export const IconButton = ({ icon, size = 'md', className, ...props }: ButtonProps) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
    lg: 'w-10 h-10',
    icon: 'w-10 h-10',
  };

  return (
    <Button
      size="icon"
      className={cn('p-0 rounded-md bg-transparent border-none hover:bg-earth', iconSizes[size === 'icon' ? 'icon' : size], className)}
      {...props}
      icon={icon}
    />
  );
};
