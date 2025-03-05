import { useDndMonitor, useDroppable } from '@dnd-kit/core';
import { Column, Task } from '../types';
import { TaskCard } from './TaskCard';
import { cn } from '../lib/utils';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface TaskColumnProps {
  column: Column;
  tasks: Task[];
  onAddTask: (status: Column['id']) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

export function TaskColumn({ 
  column, 
  tasks, 
  onAddTask, 
  onEditTask, 
  onDeleteTask 
}: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  const columnColors = {
    'todo': 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900/30',
    'in-progress': 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30',
    'done': 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30',
  };

  const titleColors = {
    'todo': 'text-yellow-700 dark:text-yellow-400',
    'in-progress': 'text-blue-700 dark:text-blue-400',
    'done': 'text-green-700 dark:text-green-400',
  };

  return (
    <div className="flex flex-col h-full min-h-[500px] w-full">
      <div className="flex items-center justify-between mb-2">
        <h2 className={cn("font-semibold", titleColors[column.id])}>
          {column.title} ({tasks.length})
        </h2>
        <button
          onClick={() => onAddTask(column.id)}
          className="p-1 rounded-full hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors"
        >
          <Plus size={18} className="text-secondary-500" />
        </button>
      </div>
      
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 p-2 rounded-md border overflow-y-auto",
          columnColors[column.id],
          isOver && "ring-2 ring-primary-400 dark:ring-primary-500"
        )}
      >
        <motion.div layout>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
          
          {tasks.length === 0 && (
            <div className="h-full flex items-center justify-center text-secondary-400 dark:text-secondary-600 text-sm italic">
              Drop tasks here
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}