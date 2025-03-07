export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';

export interface RequestHeader {
  key: string;
  value: string;
}

export interface SavedRequest {
  id: string;
  name: string;
  url: string;
  method: HttpMethod;
  headers: RequestHeader[];
  body: string;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  time: number;
  size: number;
}

export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: number;
  updatedAt: number;
  position?: number;
  subtasks?: SubTask[];
}

export interface Column {
  id: TaskStatus;
  title: string;
}