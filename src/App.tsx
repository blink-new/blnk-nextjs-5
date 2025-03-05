import { useState, useEffect } from 'react';
import { TaskBoard } from './components/TaskBoard';
import { Sun, Moon } from 'lucide-react';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="min-h-screen bg-secondary-100 dark:bg-secondary-900 text-secondary-900 dark:text-secondary-100 transition-colors duration-200">
      <header className="border-b border-secondary-200 dark:border-secondary-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">TaskBoard</h1>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-secondary-200 dark:hover:bg-secondary-800 transition-colors"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <TaskBoard />
      </main>
      
      <footer className="border-t border-secondary-200 dark:border-secondary-800 mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-secondary-500 dark:text-secondary-400 text-sm">
          TaskBoard - Organize your tasks efficiently
        </div>
      </footer>
    </div>
  );
}

export default App;