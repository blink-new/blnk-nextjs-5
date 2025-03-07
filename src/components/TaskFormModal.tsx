import { useState, useEffect } from 'react';
import { Task, TaskStatus, SubTask } from '../types';
import { X, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskFormModalProps {
  task?: Task;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  initialStatus: TaskStatus;
}

export function TaskFormModal({ task, isOpen, onClose, onSave, initialStatus }: TaskFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const [subtasks, setSubtasks] = useState<Omit<SubTask, 'id' | 'createdAt'>[]>([]);
  const [newSubtask, setNewSubtask] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setSubtasks(task.subtasks?.map(st => ({ title: st.title, completed: st.completed })) || []);
    } else {
      setTitle('');
      setDescription('');
      setStatus(initialStatus);
      setSubtasks([]);
    }
    setNewSubtask('');
  }, [task, initialStatus, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    onSave({
      id: task?.id,
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      subtasks: subtasks.length > 0 ? subtasks.map(st => ({
        ...st,
        id: crypto.randomUUID(),
        createdAt: Date.now()
      })) : undefined
    });
    
    onClose();
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    
    setSubtasks([...subtasks, { title: newSubtask.trim(), completed: false }]);
    setNewSubtask('');
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleToggleSubtask = (index: number) => {
    setSubtasks(
      subtasks.map((subtask, i) => 
        i === index ? { ...subtask, completed: !subtask.completed } : subtask
      )
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-secondary-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="flex justify-between items-center p-4 border-b border-secondary-200 dark:border-secondary-700">
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
          >
            <X size={18} className="text-secondary-500 dark:text-secondary-400" />
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-500"
              placeholder="Task title"
              autoFocus
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-500 min-h-[80px]"
              placeholder="Add details about this task"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="status" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full px-3 py-2 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-500"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
              Subtasks
            </label>
            
            <div className="space-y-2 mb-3">
              <AnimatePresence>
                {subtasks.map((subtask, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleSubtask(index)}
                      className={`p-1.5 rounded-full transition-colors ${
                        subtask.completed 
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-500' 
                          : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-500'
                      }`}
                    >
                      <CheckCircle2 size={16} />
                    </button>
                    <input
                      type="text"
                      value={subtask.title}
                      onChange={(e) => {
                        const newSubtasks = [...subtasks];
                        newSubtasks[index].title = e.target.value;
                        setSubtasks(newSubtasks);
                      }}
                      className={`flex-1 px-3 py-1.5 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 rounded-lg 
                               focus:outline-none focus:ring-1 focus:ring-primary-500 dark:focus:ring-primary-500 text-sm ${
                                 subtask.completed ? 'line-through text-secondary-400 dark:text-secondary-500' : ''
                               }`}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(index)}
                      className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 text-secondary-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Add a subtask"
                className="flex-1 px-3 py-2 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-500 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newSubtask.trim()) {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                disabled={!newSubtask.trim()}
                className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}