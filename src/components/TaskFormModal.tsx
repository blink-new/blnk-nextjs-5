import { useEffect } from 'react';
import { Task, TaskStatus } from '../types';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

interface TaskFormModalProps {
  task?: Task;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  initialStatus?: TaskStatus;
}

export function TaskFormModal({ 
  task, 
  isOpen, 
  onClose, 
  onSave,
  initialStatus = 'todo'
}: TaskFormModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    onSave({
      id: task?.id,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      status: (formData.get('status') as TaskStatus) || initialStatus,
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg w-full max-w-md mx-4"
      >
        <div className="flex justify-between items-center p-4 border-b dark:border-secondary-700">
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button 
            onClick={onClose}
            className="text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              defaultValue={task?.title || ''}
              className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-700 rounded-md 
                         focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-900"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={task?.description || ''}
              className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-700 rounded-md 
                         focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-900"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="status" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={task?.status || initialStatus}
              className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-700 rounded-md 
                         focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-900"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-secondary-300 dark:border-secondary-700 rounded-md
                         text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              {task ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}