import { SavedRequest } from '../types';

const STORAGE_KEY = 'posthub_saved_requests';

export const getSavedRequests = (): SavedRequest[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];
  
  try {
    return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to parse saved requests', e);
    return [];
  }
};

export const saveRequest = (request: SavedRequest): void => {
  const requests = getSavedRequests();
  const existingIndex = requests.findIndex(r => r.id === request.id);
  
  if (existingIndex >= 0) {
    requests[existingIndex] = request;
  } else {
    requests.push(request);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
};

export const deleteRequest = (id: string): void => {
  const requests = getSavedRequests();
  const filteredRequests = requests.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredRequests));
};