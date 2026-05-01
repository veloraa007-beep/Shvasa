'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, ChevronRight, ChevronDown, Plus, MoreHorizontal, FileText } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TreeItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  children?: TreeItem[];
  isOpen?: boolean;
}

const mockData: TreeItem[] = [
  {
    id: '1',
    name: 'Personal Space',
    type: 'folder',
    isOpen: true,
    children: [
      { id: '2', name: 'Journal', type: 'file' },
      { id: '3', name: 'Ideas', type: 'folder', children: [
        { id: '4', name: 'App Vision', type: 'file' }
      ]},
    ]
  },
  { id: '5', name: 'Work garden', type: 'folder', children: [] },
];

export function FolderTree() {
  const [data, setData] = React.useState(mockData);

  const toggleFolder = (id: string) => {
    // Recursive toggle logic
    const toggle = (items: TreeItem[]): TreeItem[] => {
      return items.map(item => {
        if (item.id === id) return { ...item, isOpen: !item.isOpen };
        if (item.children) return { ...item, children: toggle(item.children) };
        return item;
      });
    };
    setData(toggle(data));
  };

  const renderItem = (item: TreeItem, depth: number = 0) => {
    const isFolder = item.type === 'folder';
    const Icon = isFolder ? Folder : FileText;

    return (
      <div key={item.id} className="select-none">
        <div
          className={cn(
            "group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors",
            "hover:bg-leaf-pale/50 text-bark-mid hover:text-forest"
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => isFolder ? toggleFolder(item.id) : null}
        >
          {isFolder ? (
            <motion.div
              animate={{ rotate: item.isOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight size={14} className="text-bark-light" />
            </motion.div>
          ) : (
            <div className="w-3.5" />
          )}
          <Icon size={16} className={cn(isFolder ? "text-bark-mid" : "text-bark-light")} />
          <span className="text-sm truncate flex-1">{item.name}</span>
          
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
            <button className="p-1 hover:bg-earth rounded transition-colors text-bark-light">
               <Plus size={12} />
            </button>
            <button className="p-1 hover:bg-earth rounded transition-colors text-bark-light">
               <MoreHorizontal size={12} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isFolder && item.isOpen && item.children && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {item.children.map(child => renderItem(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-1 p-2">
      <div className="px-2 mb-2 flex items-center justify-between">
         <h4 className="text-[10px] font-sans font-semibold text-bark-light uppercase tracking-widest">Workspace</h4>
         <button className="p-1 hover:bg-leaf-pale rounded text-forest transition-colors">
           <Plus size={14} />
         </button>
      </div>
      {data.map(item => renderItem(item))}
    </div>
  );
}
