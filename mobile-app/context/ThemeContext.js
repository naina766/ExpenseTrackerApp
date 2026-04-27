import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemTheme = useColorScheme();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await AsyncStorage.getItem('expense_theme');
      if (storedTheme) {
        setTheme(storedTheme);
      } else {
        setTheme(systemTheme || 'light');
      }
    };
    loadTheme();
  }, [systemTheme]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await AsyncStorage.setItem('expense_theme', newTheme);
  };

  const isDark = theme === 'dark';

  const colors = {
    primary: isDark ? '#60a5fa' : '#38bdf8',
    secondary: isDark ? '#1e293b' : '#0f172a',
    surface: isDark ? '#334155' : '#111827',
    text: isDark ? '#f1f5f9' : '#ffffff',
    textSecondary: isDark ? '#cbd5e1' : '#94a3b8',
    error: '#f87171',
    background: isDark ? '#0f172a' : '#0f172a', // Keep background dark for now, but can adjust
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
