import { useEffect, useState } from 'react';
import { Task, TaskStatus } from '../types';
import { X, CheckCircle2, Clock, AlignLeft, Trash2, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>(
    task ? task.status : initialStatus
  );

  // Update selected status when task or initialStatus changes
  useEffect(() => {
    setSelectedStatus(task ? task.status : initialStatus);
  }, [task, initialStatus]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    onSave({
      id: task?.id,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      status: selectedStatus,
    });
    
    onClose();
  };

  const statusOptions = [
    { value: 'todo', label: 'To Do', color: 'bg-todo text-white' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-progress text-white' },
    { value: 'done', label: 'Done', color: 'bg-done text-white' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-secondary-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="flex justify-between items-center p-5 border-b dark:border-secondary-700">
              <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100">
                {task ? 'Edit Task' : 'Create New Task'}
              </h2>
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300 p-1 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-700"
              >
                <X size={20} />
              </motion.button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5">
              <div className="mb-5">
                <label htmlFor="title" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5 flex items-center">
                  <CheckCircle2 size={16} className="mr-1.5 text-primary-500" />
                  Task Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  defaultValue={task?.title || ''}
                  placeholder="What needs to be done?"
                  className="w-full px-3.5 py-2.5 border border-secondary-300 dark:border-secondary-700 rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-900
                           placeholder:text-secondary-400 dark:placeholder:text-secondary-600"
                />
              </div>
              
              <div className="mb-5">
                <label htmlFor="description" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5 flex items-center">
                  <AlignLeft size={16} className="mr-1.5 text-primary-500" />
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={task?.description || ''}
                  placeholder="Add more details about this task..."
                  className="w-full px-3.5 py-2.5 border border-secondary-300 dark:border-secondary-700 rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-900
                           placeholder:text-secondary-400 dark:placeholder:text-secondary-600"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5 flex items-center">
                  <Clock size={16} className="mr-1.5 text-primary-500" />
                  Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedStatus(option.value as TaskStatus)}
                      className={`
                        py-2 px-3 rounded-lg text-center text-sm font-medium
                        transition-all duration-200 border-2
                        ${selectedStatus === option.value
                          ? option.color + ' border-transparent' 
                          : 'bg-secondary-100 dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-700'}
                      `}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {/* Hidden input to store the selected status */}
                <input type="hidden" name="status" value={selectedStatus} />
              </div>
              
              <div className="flex justify-end space-x-3 mt-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 border border-secondary-300 dark:border-secondary-700 rounded-xl
                           text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700
                           font-medium transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                           font-medium shadow-sm transition-colors"
                >
                  {task ? 'Update Task' : 'Create Task'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}