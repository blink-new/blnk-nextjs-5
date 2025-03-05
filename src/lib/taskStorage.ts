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
  tasks.push(task);
  saveTasks(tasks);
};

export const updateTask = (updatedTask: Task): void => {
  const tasks = getTasks();
  const index = tasks.findIndex(task => task.id === updatedTask.id);
  
  if (index !== -1) {
    tasks[index] = updatedTask;
    saveTasks(tasks);
  }
};

export const deleteTask = (id: string): void => {
  const tasks = getTasks();
  const filteredTasks = tasks.filter(task => task.id !== id);
  saveTasks(filteredTasks);
};

export const updateTaskStatus = (id: string, status: TaskStatus): void => {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === id);
  
  if (task) {
    task.status = status;
    task.updatedAt = Date.now();
    saveTasks(tasks);
  }
};