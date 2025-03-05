import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Column, Task, TaskStatus } from '../types';
import { TaskColumn } from './TaskColumn';
import { TaskCard } from './TaskCard';
import { TaskFormModal } from './TaskFormModal';
import { getTasks, saveTasks, updateTaskStatus } from '../lib/taskStorage';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

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
    }
  };

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Task Board</h1>
        <button
          onClick={() => handleAddTask('todo')}
          className="flex items-center gap-1 px-3 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <Plus size={18} />
          <span>Add Task</span>
        </button>
      </div>
      
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {defaultColumns.map(column => (
            <TaskColumn
              key={column.id}
              column={column}
              tasks={tasks.filter(task => task.status === column.id)}
              onAddTask={handleAddTask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </div>
        
        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} />}
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