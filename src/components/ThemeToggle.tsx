'use client';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
function getInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);
  useEffect(() => { const root = document.documentElement; theme === 'dark' ? root.classList.add('dark') : root.classList.remove('dark'); window.localStorage.setItem('theme', theme); }, [theme]);
  return (<button type="button" aria-label="Alternar tema" onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors duration-200 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800">{theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</button>);
}
