import { useState, useEffect } from 'react';
import { TaskBoard } from './components/TaskBoard';
import { Sun, Moon, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen flex flex-col bg-secondary-50 dark:bg-secondary-900 text-secondary-900 dark:text-secondary-100 transition-colors duration-200">
      <header className="sticky top-0 z-10 border-b border-secondary-200/80 dark:border-secondary-800/80 bg-white/80 dark:bg-secondary-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={24} className="text-primary-500" />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-primary-700 dark:from-primary-400 dark:to-primary-600">
              TaskFlow
            </h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors shadow-sm"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 flex-1 flex flex-col">
        <TaskBoard />
      </main>
      
      <footer className="border-t border-secondary-200/80 dark:border-secondary-800/80 mt-auto">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center text-secondary-500 dark:text-secondary-400 text-sm">
          <span>TaskFlow - Organize beautifully</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}

export default App;