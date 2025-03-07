import { useState, useEffect } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverEvent, 
  DragOverlay, 
  DragStartEvent, 
  PointerSensor, 
  useSensor, 
  useSensors,
  closestCenter
} from '@dnd-kit/core';
import { Column, Task, TaskStatus } from '../types';
import { TaskColumn } from './TaskColumn';
import { TaskCard } from './TaskCard';
import { TaskFormModal } from './TaskFormModal';
import { getTasks, saveTasks, updateTaskStatus } from '../lib/taskStorage';
import { Plus, Layout, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const defaultColumns: Column[] = [
  { id: 'todo', title: 'To Do'},
  {id: 'in-progress', title: 'In Progress'},
  {id: 'done', title: 'Done'}
];

// Helper function to reorder an array
function arrayMove<T>(array: T[], from: number, to: number): T[] {
  const newArray = array.slice();
  newArray.splice(to < 0 ? newArray.length + to : to, 0, newArray.splice(from, 1)[0]);
  return newArray;
}

export function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [initialStatus, setInitialStatus] = useState<TaskStatus>('todo');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTaskId, setPreviewTaskId] = useState<string | null>(null);
  const [previewColumn, setPreviewColumn] = useState<TaskStatus | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    // Load tasks and ensure they have position values
    const loadedTasks = getTasks();
    
    // Group tasks by status and assign positions if they don't have them
    const tasksByStatus: Record<TaskStatus, Task[]> = {
      'todo': [],
      'in-progress': [],
      'done': []
    };
    
    // Group tasks by status
    loadedTasks.forEach(task => {
      tasksByStatus[task.status].push(task);
    });
    
    // Assign positions within each status group if needed
    const tasksWithPositions = loadedTasks.map((task, globalIndex) => {
      if (task.position === undefined) {
        // Find position within its status group
        const statusGroup = tasksByStatus[task.status];
        const statusIndex = statusGroup.findIndex(t => t.id === task.id);
        return { ...task, position: statusIndex };
      }
      return task;
    });
    
    // Sort tasks by position within each status
    const sortedTasks = [...tasksWithPositions].sort((a, b) => {
      if (a.status === b.status) {
        return (a.position || 0) - (b.position || 0);
      }
      return 0; // Don't change order between different statuses
    });
    
    setTasks(sortedTasks);
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
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    if (activeId === overId) return;
    
    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;
    
    // Check if we're hovering over a column or a task
    const isOverColumn = defaultColumns.some(col => col.id === overId);
    
    if (isOverColumn) {
      // We're hovering over a column
      const newStatus = overId as TaskStatus;
      setPreviewColumn(newStatus);
      
      // Set preview index to the end of the column
      const tasksInTargetColumn = tasks.filter(t => t.status === newStatus);
      setPreviewIndex(tasksInTargetColumn.length);
    } else {
      // We're hovering over another task
      const overTask = tasks.find(t => t.id === overId);
      if (!overTask) return;
      
      // If tasks are in different columns, update the status
      if (activeTask.status !== overTask.status) {
        setPreviewColumn(overTask.status);
      }
      
      // Find the index of the task we're hovering over
      const overTaskIndex = tasks
        .filter(t => t.status === overTask.status)
        .findIndex(t => t.id === overId);
      
      setPreviewIndex(overTaskIndex);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveTask(null);
      setPreviewTaskId(null);
      setPreviewColumn(null);
      setPreviewIndex(null);
      return;
    }
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    if (activeId === overId) {
      setActiveTask(null);
      setPreviewTaskId(null);
      setPreviewColumn(null);
      setPreviewIndex(null);
      return;
    }
    
    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;
    
    // Check if we're dropping onto a column or a task
    const isOverColumn = defaultColumns.some(col => col.id === overId);
    
    let updatedTasks = [...tasks];
    
    if (isOverColumn) {
      // We're dropping onto a column
      const newStatus = overId as TaskStatus;
      
      // Remove the task from its current position
      updatedTasks = updatedTasks.filter(t => t.id !== activeId);
      
      // Add it to the end of the target column
      const tasksInTargetColumn = updatedTasks.filter(t => t.status === newStatus);
      const newPosition = tasksInTargetColumn.length;
      
      const updatedTask = {
        ...activeTask,
        status: newStatus,
        position: newPosition,
        updatedAt: Date.now()
      };
      
      updatedTasks.push(updatedTask);
      
      // Update task status in storage
      updateTaskStatus(activeId, newStatus);
    } else {
      // We're dropping onto another task
      const overTask = tasks.find(t => t.id === overId);
      if (!overTask) return;
      
      // If tasks are in different columns
      if (activeTask.status !== overTask.status) {
        // Remove the task from its current position
        updatedTasks = updatedTasks.filter(t => t.id !== activeId);
        
        // Add it to the new column at the position of the over task
        const updatedTask = {
          ...activeTask,
          status: overTask.status,
          position: overTask.position,
          updatedAt: Date.now()
        };
        
        updatedTasks.push(updatedTask);
        
        // Update positions of all tasks in the target column
        updatedTasks = updatedTasks.map(task => {
          if (task.status === overTask.status && task.id !== activeId && (task.position || 0) >= (overTask.position || 0)) {
            return { ...task, position: (task.position || 0) + 1 };
          }
          return task;
        });
        
        // Update task status in storage
        updateTaskStatus(activeId, overTask.status);
      } else {
        // Same column reordering
        const activeIndex = tasks
          .filter(t => t.status === activeTask.status)
          .findIndex(t => t.id === activeId);
        
        const overIndex = tasks
          .filter(t => t.status === overTask.status)
          .findIndex(t => t.id === overId);
        
        // Get tasks in this column
        const tasksInColumn = tasks.filter(t => t.status === activeTask.status);
        
        // Reorder the tasks in this column
        const reorderedTasks = arrayMove(tasksInColumn, activeIndex, overIndex);
        
        // Update positions
        const tasksWithUpdatedPositions = reorderedTasks.map((task, index) => ({
          ...task,
          position: index
        }));
        
        // Replace the tasks in this column with the reordered ones
        updatedTasks = [
          ...tasks.filter(t => t.status !== activeTask.status),
          ...tasksWithUpdatedPositions
        ];
      }
    }
    
    // Sort tasks by position within each status
    updatedTasks.sort((a, b) => {
      if (a.status === b.status) {
        return (a.position || 0) - (b.position || 0);
      }
      return 0;
    });
    
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    
    setActiveTask(null);
    setPreviewTaskId(null);
    setPreviewColumn(null);
    setPreviewIndex(null);
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
              subtasks: taskData.subtasks,
              updatedAt: now 
            } 
          : task
      );
      
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
      toast.success('Task updated');
    } else {
      // Creating new task
      const tasksInTargetColumn = tasks.filter(t => t.status === (taskData.status || initialStatus));
      const position = tasksInTargetColumn.length;
      
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: taskData.title,
        description: taskData.description,
        status: taskData.status || initialStatus,
        subtasks: taskData.subtasks,
        createdAt: now,
        updatedAt: now,
        position: position
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
    const sortedColumnTasks = [...columnTasks]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map((task, index) => ({ ...task, position: index }));
    
    const updatedTasks = [...sortedColumnTasks, ...otherTasks];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    toast.success(`Sorted tasks in ${defaultColumns.find(col => col.id === columnId)?.title}`);
  };

  const handleMarkAllComplete = (columnId: Column['id']) => {
    // Get current tasks in the done column to calculate positions
    const doneTasks = tasks.filter(task => task.status === 'done');
    let nextPosition = doneTasks.length;
    
    const updatedTasks = tasks.map(task => {
      if (task.status === columnId) {
        return { 
          ...task, 
          status: 'done', 
          position: nextPosition++, 
          updatedAt: Date.now() 
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    toast.success(`Marked all tasks as complete from ${defaultColumns.find(col => col.id === columnId)?.title}`);
  };

  // Get tasks with preview applied
  const getTasksWithPreview = () => {
    if (!previewTaskId) return tasks;
    
    let updatedTasks = [...tasks];
    const activeTaskIndex = updatedTasks.findIndex(t => t.id === previewTaskId);
    
    if (activeTaskIndex === -1) return tasks;
    
    const activeTask = { ...updatedTasks[activeTaskIndex] };
    
    // Remove the task from its current position
    updatedTasks.splice(activeTaskIndex, 1);
    
    // If we have a preview column, update the task's status
    if (previewColumn) {
      activeTask.status = previewColumn;
    }
    
    // If we have a preview index, insert the task at that position
    if (previewIndex !== null) {
      // Get tasks in the target column
      const tasksInTargetColumn = updatedTasks.filter(t => t.status === activeTask.status);
      
      // Calculate the global index to insert at
      const globalInsertIndex = updatedTasks.findIndex(t => t.status === activeTask.status) + 
        Math.min(previewIndex, tasksInTargetColumn.length);
      
      // Insert the task at the calculated position
      if (globalInsertIndex >= 0) {
        updatedTasks.splice(globalInsertIndex, 0, activeTask);
      } else {
        // If we couldn't find a valid position, just append to the end
        updatedTasks.push(activeTask);
      }
    } else {
      // If no preview index, just append to the end
      updatedTasks.push(activeTask);
    }
    
    return updatedTasks;
  };

  const tasksWithPreview = getTasksWithPreview();
  
  const filteredTasks = searchQuery.trim() === '' 
    ? tasksWithPreview 
    : tasksWithPreview.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (task.subtasks && task.subtasks.some(st => 
          st.title.toLowerCase().includes(searchQuery.toLowerCase())
        ))
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
        collisionDetection={closestCenter}
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