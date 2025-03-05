import { Plus, Trash2 } from 'lucide-react';
import { RequestHeader } from '../types';

interface RequestHeadersProps {
  headers: RequestHeader[];
  onChange: (headers: RequestHeader[]) => void;
}

export const RequestHeaders = ({ headers, onChange }: RequestHeadersProps) => {
  const addHeader = () => {
    onChange([...headers, { key: '', value: '' }]);
  };
  
  const removeHeader = (index: number) => {
    const newHeaders = [...headers];
    newHeaders.splice(index, 1);
    onChange(newHeaders);
  };
  
  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    onChange(newHeaders);
  };
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Headers</h3>
        <button
          onClick={addHeader}
          className="flex items-center text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          <Plus size={14} className="mr-1" />
          Add Header
        </button>
      </div>
      
      {headers.length === 0 ? (
        <div className="text-sm text-gray-500 dark:text-gray-400 italic">
          No headers added
        </div>
      ) : (
        <div className="space-y-2">
          {headers.map((header, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={header.key}
                onChange={(e) => updateHeader(index, 'key', e.target.value)}
                placeholder="Key"
                className="flex-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              <input
                type="text"
                value={header.value}
                onChange={(e) => updateHeader(index, 'value', e.target.value)}
                placeholder="Value"
                className="flex-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              <button
                onClick={() => removeHeader(index)}
                className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                aria-label="Remove header"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};