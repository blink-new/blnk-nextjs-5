import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column, Task } from '../types';
import { TaskCard } from './TaskCard';
import { cn } from '../lib/utils';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { ColumnMenu } from './ColumnMenu';

interface TaskColumnProps {
  column: Column;
  tasks: Task[];
  onAddTask: (status: Column['id']) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onClearColumn: (columnId: Column['id']) => void;
  onSortColumn: (columnId: Column['id']) => void;
  onMarkAllComplete: (columnId: Column['id']) => void;
  activeTaskId?: string;
}

export function TaskColumn({ 
  column, 
  tasks, 
  onAddTask, 
  onEditTask, 
  onDeleteTask,
  onClearColumn,
  onSortColumn,
  onMarkAllComplete,
  activeTaskId
}: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  const columnColors = {
    'todo': 'bg-todo-light dark:bg-todo-dark/10 border-todo-border dark:border-todo-darkBorder',
    'in-progress': 'bg-progress-light dark:bg-progress-dark/10 border-progress-border dark:border-progress-darkBorder',
    'done': 'bg-done-light dark:bg-done-dark/10 border-done-border dark:border-done-darkBorder',
  };

  const titleColors = {
    'todo': 'text-todo-dark dark:text-todo',
    'in-progress': 'text-progress-dark dark:text-progress',
    'done': 'text-done-dark dark:text-done',
  };

  const headerBg = {
    'todo': 'bg-todo/10 dark:bg-todo/20',
    'in-progress': 'bg-progress/10 dark:bg-progress/20',
    'done': 'bg-done/10 dark:bg-done/20',
  };

  // Get task IDs for sortable context
  const taskIds = tasks.map(task => task.id);

  return (
    <div className="flex flex-col h-full min-h-[500px] w-full">
      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "flex items-center justify-between mb-3 px-3 py-2 rounded-lg",
          headerBg[column.id]
        )}
      >
        <div className="flex items-center">
          <h2 className={cn("font-semibold", titleColors[column.id])}>
            {column.title}
          </h2>
          <div className={cn(
            "ml-2 px-2 py-0.5 text-xs rounded-full font-medium",
            `bg-${column.id === 'todo' ? 'todo' : column.id === 'in-progress' ? 'progress' : 'done'}/20 dark:bg-${column.id === 'todo' ? 'todo' : column.id === 'in-progress' ? 'progress' : 'done'}/30`,
            `text-${column.id === 'todo' ? 'todo' : column.id === 'in-progress' ? 'progress' : 'done'}-dark dark:text-${column.id === 'todo' ? 'todo' : column.id === 'in-progress' ? 'progress' : 'done'}`
          )}>
            {tasks.length}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAddTask(column.id)}
            className={cn(
              "p-1.5 rounded-full transition-colors",
              `hover:bg-${column.id === 'todo' ? 'todo' : column.id === 'in-progress' ? 'progress' : 'done'}/20 dark:hover:bg-${column.id === 'todo' ? 'todo' : column.id === 'in-progress' ? 'progress' : 'done'}/30`,
              `text-${column.id === 'todo' ? 'todo' : column.id === 'in-progress' ? 'progress' : 'done'}-dark dark:text-${column.id === 'todo' ? 'todo' : column.id === 'in-progress' ? 'progress' : 'done'}`
            )}
          >
            <Plus size={18} />
          </motion.button>
          <ColumnMenu 
            column={column}
            onClearColumn={onClearColumn}
            onSortColumn={onSortColumn}
            onMarkAllComplete={onMarkAllComplete}
          />
        </div>
      </motion.div>
      
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 p-3 rounded-xl border overflow-y-auto shadow-column",
          columnColors[column.id],
          isOver && "ring-2 ring-offset-2 ring-offset-secondary-50 dark:ring-offset-secondary-900",
          isOver && column.id === 'todo' && "ring-todo",
          isOver && column.id === 'in-progress' && "ring-progress",
          isOver && column.id === 'done' && "ring-done"
        )}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <motion.div layout>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                isDragging={task.id === activeTaskId}
              />
            ))}
            
            {tasks.length === 0 && (
              <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-secondary-400 dark:text-secondary-600 text-sm">
                <motion.div 
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="mb-3 opacity-70"
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
                <p className="font-medium">Drop tasks here</p>
                <p className="text-xs mt-1 opacity-70">or click + to add a new task</p>
              </div>
            )}
          </motion.div>
        </SortableContext>
      </div>
    </div>
  );
}