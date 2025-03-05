import { useState } from 'react';
import { Task } from '../types';
import { cn } from '../lib/utils';
import { Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDraggable } from '@dnd-kit/core';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  isDragging?: boolean;
}

export function TaskCard({ task, onEdit, onDelete, isDragging }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });
  
  const statusColors = {
    'todo': 'border-l-yellow-500',
    'in-progress': 'border-l-blue-500',
    'done': 'border-l-green-500'
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        'bg-white dark:bg-secondary-800 rounded-md shadow-sm p-4 mb-2 cursor-grab',
        'border-l-4 hover:shadow-md transition-shadow duration-200',
        statusColors[task.status],
        isDragging && 'opacity-50'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...listeners}
      {...attributes}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-secondary-900 dark:text-secondary-100 mb-1">{task.title}</h3>
        
        {isHovered && !isDragging && (
          <div className="flex space-x-1">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              className="p-1 text-secondary-500 hover:text-primary-500 transition-colors"
            >
              <Edit size={16} />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              className="p-1 text-secondary-500 hover:text-red-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
      
      {task.description && (
        <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}
      
      <div className="text-xs text-secondary-500 dark:text-secondary-500 mt-2">
        {formatDate(task.updatedAt)}
      </div>
    </motion.div>
  );
}