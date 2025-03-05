import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Column, Task, TaskStatus } from '../types';
import { TaskColumn } from './TaskColumn';
import { TaskCard } from './TaskCard';
import { TaskFormModal } from './TaskFormModal';
import { getTasks, saveTasks, updateTaskStatus } from '../lib/taskStorage';
import { Plus, Layout, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const defaultColumns: Column[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' }
];

export function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [initialStatus, setInitialStatus] = useState<TaskStatus>('todo');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTaskId, setPreviewTaskId] = useState<string | null>(null);
  const [previewColumn, setPreviewColumn] = useState<TaskStatus | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    setTasks(getTasks());
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeTaskId = active.id as string;
    const task = tasks.find(t => t.id === activeTaskId);
    if (task) {
      setActiveTask(task);
      setPreviewTaskId(activeTaskId);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const taskId = active.id as string;
      const newStatus = over.id as TaskStatus;
      
      // Update preview column
      setPreviewColumn(newStatus);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const taskId = active.id as string;
      const newStatus = over.id as TaskStatus;
      
      updateTaskStatus(taskId, newStatus);
      
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, status: newStatus, updatedAt: Date.now() } 
            : task
        )
      );
    }
    
    setActiveTask(null);
    setPreviewTaskId(null);
    setPreviewColumn(null);
  };

  const handleAddTask = (status: TaskStatus) => {
    setInitialStatus(status);
    setEditingTask(undefined);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = (id: string) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    toast.success('Task deleted');
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const now = Date.now();
    
    if (taskData.id) {
      // Editing existing task
      const updatedTasks = tasks.map(task => 
        task.id === taskData.id 
          ? { 
              ...task, 
              title: taskData.title, 
              description: taskData.description, 
              status: taskData.status, 
              updatedAt: now 
            } 
          : task
      );
      
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
      toast.success('Task updated');
    } else {
      // Creating new task
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: taskData.title,
        description: taskData.description,
        status: taskData.status || initialStatus,
        createdAt: now,
        updatedAt: now,
      };
      
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
      toast.success('Task created');
    }
  };

  // Column menu functions
  const handleClearColumn = (columnId: Column['id']) => {
    const updatedTasks = tasks.filter(task => task.status !== columnId);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    toast.success(`Cleared all tasks from ${defaultColumns.find(col => col.id === columnId)?.title}`);
  };

  const handleSortColumn = (columnId: Column['id']) => {
    const columnTasks = tasks.filter(task => task.status === columnId);
    const otherTasks = tasks.filter(task => task.status !== columnId);
    
    // Sort by updatedAt (newest first)
    const sortedColumnTasks = [...columnTasks].sort((a, b) => b.updatedAt - a.updatedAt);
    
    const updatedTasks = [...sortedColumnTasks, ...otherTasks];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    toast.success(`Sorted tasks in ${defaultColumns.find(col => col.id === columnId)?.title}`);
  };

  const handleMarkAllComplete = (columnId: Column['id']) => {
    const updatedTasks = tasks.map(task => 
      task.status === columnId 
        ? { ...task, status: 'done', updatedAt: Date.now() } 
        : task
    );
    
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    toast.success(`Marked all tasks as complete from ${defaultColumns.find(col => col.id === columnId)?.title}`);
  };

  // Get tasks with preview applied
  const getTasksWithPreview = () => {
    if (!previewTaskId || !previewColumn) return tasks;
    
    return tasks.map(task => 
      task.id === previewTaskId 
        ? { ...task, status: previewColumn } 
        : task
    );
  };

  const tasksWithPreview = getTasksWithPreview();
  
  const filteredTasks = searchQuery.trim() === '' 
    ? tasksWithPreview 
    : tasksWithPreview.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  return (
    <div className="h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-1 flex items-center">
            <Layout className="mr-2 text-primary-500" size={28} />
            <span>My Tasks</span>
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            Organize, prioritize, and track your tasks
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" size={18} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full sm:w-64 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 
                       rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-500"
            />
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAddTask('todo')}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-sm"
          >
            <Plus size={18} />
            <span className="font-medium">Add Task</span>
          </motion.button>
        </div>
      </div>
      
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {defaultColumns.map(column => (
            <TaskColumn
              key={column.id}
              column={column}
              tasks={filteredTasks.filter(task => task.status === column.id)}
              onAddTask={handleAddTask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onClearColumn={handleClearColumn}
              onSortColumn={handleSortColumn}
              onMarkAllComplete={handleMarkAllComplete}
              activeTaskId={activeTask?.id}
            />
          ))}
        </div>
        
        <DragOverlay>
          {activeTask && (
            <TaskCard 
              task={activeTask} 
              onEdit={() => {}} 
              onDelete={() => {}} 
              isDragging={true}
              dragOverlay={true}
            />
          )}
        </DragOverlay>
      </DndContext>
      
      <TaskFormModal
        task={editingTask}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        initialStatus={initialStatus}
      />
    </div>
  );
}