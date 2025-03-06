import { Task, TaskStatus } from '../types';

const STORAGE_KEY = 'taskboard_tasks';

export const getTasks = (): Task[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];
  
  try {
    return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to parse saved tasks', e);
    return [];
  }
};

export const saveTasks = (tasks: Task[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

export const addTask = (task: Task): void => {
  const tasks = getTasks();
  
  // Set position to the end of its status group if not provided
  if (task.position === undefined) {
    const tasksInSameStatus = tasks.filter(t => t.status === task.status);
    task.position = tasksInSameStatus.length;
  }
  
  tasks.push(task);
  saveTasks(tasks);
};

export const updateTask = (updatedTask: Task): void => {
  const tasks = getTasks();
  const index = tasks.findIndex(task => task.id === updatedTask.id);
  
  if (index !== -1) {
    // If status changed, update position
    if (tasks[index].status !== updatedTask.status) {
      const tasksInNewStatus = tasks.filter(t => t.status === updatedTask.status);
      updatedTask.position = tasksInNewStatus.length;
    }
    
    tasks[index] = updatedTask;
    saveTasks(tasks);
  }
};

export const deleteTask = (id: string): void => {
  const tasks = getTasks();
  const taskToDelete = tasks.find(t => t.id === id);
  
  if (!taskToDelete) return;
  
  const filteredTasks = tasks.filter(task => task.id !== id);
  
  // Update positions for tasks in the same status that were after the deleted task
  const updatedTasks = filteredTasks.map(task => {
    if (
      task.status === taskToDelete.status && 
      (task.position || 0) > (taskToDelete.position || 0)
    ) {
      return { ...task, position: (task.position || 0) - 1 };
    }
    return task;
  });
  
  saveTasks(updatedTasks);
};

export const updateTaskStatus = (id: string, status: TaskStatus): void => {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === id);
  
  if (task) {
    const oldStatus = task.status;
    task.status = status;
    task.updatedAt = Date.now();
    
    // If status changed, update position to be at the end of the new status group
    if (oldStatus !== status) {
      const tasksInNewStatus = tasks.filter(t => t.id !== id && t.status === status);
      task.position = tasksInNewStatus.length;
    }
    
    saveTasks(tasks);
  }
};