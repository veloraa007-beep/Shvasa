'use client';

import * as React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  onClear?: () => void;
  isSearch?: boolean;
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, onClear, isSearch, error, ...props }, ref) => {
    const [hasValue, setHasValue] = React.useState(!!props.value || !!props.defaultValue);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    return (
      <div className="relative w-full group">
        {isSearch && (
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-bark-light" />
        )}
        {icon && !isSearch && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-bark-light">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-border bg-white px-3 py-2 text-sm font-sans transition-all duration-150',
            'placeholder:text-bark-light focus-visible:outline-none focus-visible:border-forest focus-visible:ring-2 focus-visible:ring-forest/10',
            isSearch && 'pl-9 bg-earth border-border hover:bg-white',
            (icon && !isSearch) && 'pl-9',
            error && 'border-danger focus-visible:ring-danger/10',
            className
          )}
          ref={ref}
          onChange={handleChange}
          {...props}
        />
        <AnimatePresence>
          {onClear && hasValue && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              type="button"
              onClick={onClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-earth rounded-full transition-colors"
            >
              <X className="h-3.5 w-3.5 text-bark-light" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    );
  }
);
Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[100px] w-full rounded-md border border-border bg-white px-3 py-2 text-sm font-sans transition-all duration-150',
          'placeholder:text-bark-light focus-visible:outline-none focus-visible:border-forest focus-visible:ring-2 focus-visible:ring-forest/10',
          error && 'border-danger focus-visible:ring-danger/10',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export const TagInput = ({ tags, onRemove, onAdd }: { tags: string[], onRemove: (tag: string) => void, onAdd: (tag: string) => void }) => {
  const [input, setInput] = React.useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      onAdd(input.trim());
      setInput('');
      e.preventDefault();
    }
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 rounded-md border border-border bg-white focus-within:border-forest transition-colors">
      <AnimatePresence>
        {tags.map((tag) => (
          <motion.span
            key={tag}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-earth-deep text-bark-mid text-xs font-medium"
          >
            {tag}
            <button onClick={() => onRemove(tag)} className="hover:text-danger">
              <X size={12} />
            </button>
          </motion.span>
        ))}
      </AnimatePresence>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add tag..."
        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm font-sans placeholder:text-bark-light"
      />
    </div>
  );
};
