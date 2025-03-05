import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal, Trash2, RefreshCw, ArrowDownToLine, CheckSquare } from 'lucide-react';
import { Column } from '../types';

interface ColumnMenuProps {
  column: Column;
  onClearColumn: (columnId: Column['id']) => void;
  onSortColumn: (columnId: Column['id']) => void;
  onMarkAllComplete: (columnId: Column['id']) => void;
}

export function ColumnMenu({ column, onClearColumn, onSortColumn, onMarkAllComplete }: ColumnMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const menuItems = [
    {
      label: 'Sort by date',
      icon: <ArrowDownToLine size={16} />,
      onClick: () => {
        onSortColumn(column.id);
        setIsOpen(false);
      },
    },
    {
      label: 'Clear all tasks',
      icon: <Trash2 size={16} />,
      onClick: () => {
        onClearColumn(column.id);
        setIsOpen(false);
      },
      danger: true,
    }
  ];

  // Add "Mark all as complete" only for non-done columns
  if (column.id !== 'done') {
    menuItems.unshift({
      label: 'Mark all as complete',
      icon: <CheckSquare size={16} />,
      onClick: () => {
        onMarkAllComplete(column.id);
        setIsOpen(false);
      },
    });
  }

  const getMenuColor = () => {
    switch (column.id) {
      case 'todo':
        return {
          bg: 'bg-todo/10 dark:bg-todo/20',
          hoverBg: 'hover:bg-todo/20 dark:hover:bg-todo/30',
          text: 'text-todo-dark dark:text-todo',
        };
      case 'in-progress':
        return {
          bg: 'bg-progress/10 dark:bg-progress/20',
          hoverBg: 'hover:bg-progress/20 dark:hover:bg-progress/30',
          text: 'text-progress-dark dark:text-progress',
        };
      case 'done':
        return {
          bg: 'bg-done/10 dark:bg-done/20',
          hoverBg: 'hover:bg-done/20 dark:hover:bg-done/30',
          text: 'text-done-dark dark:text-done',
        };
      default:
        return {
          bg: 'bg-secondary-100 dark:bg-secondary-800',
          hoverBg: 'hover:bg-secondary-200 dark:hover:bg-secondary-700',
          text: 'text-secondary-700 dark:text-secondary-300',
        };
    }
  };

  const colors = getMenuColor();

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1.5 rounded-full transition-colors ${colors.text} ${colors.hoverBg}`}
        aria-label="Column menu"
      >
        <MoreHorizontal size={18} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-1 w-48 rounded-xl shadow-lg bg-white dark:bg-secondary-800 ring-1 ring-black/5 dark:ring-white/10 z-10"
          >
            <div className="py-1">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.onClick}
                  className={`flex items-center w-full px-4 py-2 text-sm ${
                    item.danger 
                      ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20' 
                      : 'text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}