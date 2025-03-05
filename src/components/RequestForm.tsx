import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Send, Save } from 'lucide-react';
import { HttpMethod, RequestHeader, SavedRequest } from '../types';
import { RequestHeaders } from './RequestHeaders';
import { saveRequest } from '../lib/storage';

interface RequestFormProps {
  onSend: (url: string, method: HttpMethod, headers: RequestHeader[], body: string) => void;
  loading: boolean;
}

export const RequestForm = ({ onSend, loading }: RequestFormProps) => {
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts');
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [headers, setHeaders] = useState<RequestHeader[]>([
    { key: 'Content-Type', value: 'application/json' }
  ]);
  const [body, setBody] = useState('');
  const [requestName, setRequestName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }
    onSend(url, method, headers, body);
  };
  
  const handleSave = () => {
    if (!requestName.trim()) {
      toast.error('Please enter a name for this request');
      return;
    }
    
    const request: SavedRequest = {
      id: Date.now().toString(),
      name: requestName,
      url,
      method,
      headers,
      body
    };
    
    saveRequest(request);
    toast.success('Request saved successfully');
    setShowSaveDialog(false);
    setRequestName('');
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex space-x-2">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as HttpMethod)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
          <option value="OPTIONS">OPTIONS</option>
          <option value="HEAD">HEAD</option>
        </select>
        
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter request URL"
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
        
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={16} className="mr-2" />
          Send
        </button>
        
        <button
          type="button"
          onClick={() => setShowSaveDialog(true)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md flex items-center"
        >
          <Save size={16} className="mr-2" />
          Save
        </button>
      </div>
      
      <RequestHeaders headers={headers} onChange={setHeaders} />
      
      {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Request Body</h3>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Enter request body (JSON)"
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm"
          />
        </div>
      )}
      
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Save Request</h3>
            <input
              type="text"
              value={requestName}
              onChange={(e) => setRequestName(e.target.value)}
              placeholder="Request name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 mb-4"
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};