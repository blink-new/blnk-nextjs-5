import { useState } from 'react';
import { Task } from '../types';
import { cn } from '../lib/utils';
import { Edit, Trash2, Clock, CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDraggable } from '@dnd-kit/core';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  isDragging?: boolean;
  dragOverlay?: boolean;
}

export function TaskCard({ task, onEdit, onDelete, isDragging, dragOverlay }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });
  
  const statusColors = {
    'todo': 'border-l-todo',
    'in-progress': 'border-l-progress',
    'done': 'border-l-done'
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 20,
  } : undefined;

  const isCurrentlyDragging = isDragging;
  
  // Calculate subtask completion stats
  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter(subtask => subtask.completed).length;
  const hasSubtasks = subtasks.length > 0;

  // Handle click on the card (excluding clicks on buttons)
  const handleCardClick = (e: React.MouseEvent) => {
    // Only open edit modal if not dragging and not clicking on action buttons
    if (!isCurrentlyDragging && !dragOverlay) {
      onEdit(task);
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'bg-white dark:bg-secondary-800 rounded-xl shadow-task p-4 mb-3 cursor-pointer',
        'border-l-4 hover:shadow-task-hover transition-all duration-200',
        statusColors[task.status],
        isCurrentlyDragging && 'opacity-50',
        dragOverlay && 'opacity-80 rotate-2 scale-105 shadow-xl'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      {...listeners}
      {...attributes}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-1">{task.title}</h3>
        
        {isHovered && !isCurrentlyDragging && !dragOverlay && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex space-x-1"
          >
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              className="p-1.5 rounded-full bg-secondary-100 dark:bg-secondary-700 text-secondary-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
            >
              <Edit size={14} />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              className="p-1.5 rounded-full bg-secondary-100 dark:bg-secondary-700 text-secondary-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            >
              <Trash2 size={14} />
            </motion.button>
          </motion.div>
        )}
      </div>
      
      {task.description && (
        <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}
      
      {hasSubtasks && (
        <div className="mt-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs text-secondary-600 dark:text-secondary-400 mb-1.5">
            <CheckSquare size={12} className="text-primary-500" />
            <span>
              {completedSubtasks} of {subtasks.length} subtasks
            </span>
          </div>
          <div className="w-full h-1.5 bg-secondary-100 dark:bg-secondary-700 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${subtasks.length ? (completedSubtasks / subtasks.length) * 100 : 0}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-primary-500 rounded-full"
            />
          </div>
        </div>
      )}
      
      <div className="flex items-center text-xs text-secondary-500 dark:text-secondary-500 mt-2">
        <Clock size={12} className="mr-1" />
        {formatDate(task.updatedAt)}
      </div>
    </motion.div>
  );
}