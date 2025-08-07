
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

// Utility functions for common local storage operations
export const localStorageUtils = {
  // Save reflection locally
  saveReflection: (reflection: {
    id: string;
    reflection_text: string;
    worship_date: string;
    bible_verse?: string;
    created_at: string;
  }) => {
    const reflections = JSON.parse(localStorage.getItem('guest_reflections') || '[]');
    reflections.push(reflection);
    localStorage.setItem('guest_reflections', JSON.stringify(reflections));
  },

  // Get local reflections
  getReflections: () => {
    return JSON.parse(localStorage.getItem('guest_reflections') || '[]');
  },

  // Save user stats locally
  saveUserStats: (stats: any) => {
    localStorage.setItem('guest_stats', JSON.stringify(stats));
  },

  // Get local user stats
  getUserStats: () => {
    return JSON.parse(localStorage.getItem('guest_stats') || '{}');
  },

  // Save principle read status
  savePrincipleRead: (principleId: string) => {
    const readPrinciples = JSON.parse(localStorage.getItem('guest_read_principles') || '[]');
    if (!readPrinciples.includes(principleId)) {
      readPrinciples.push(principleId);
      localStorage.setItem('guest_read_principles', JSON.stringify(readPrinciples));
    }
  },

  // Get read principles
  getReadPrinciples: () => {
    return JSON.parse(localStorage.getItem('guest_read_principles') || '[]');
  },

  // Clear all guest data
  clearGuestData: () => {
    localStorage.removeItem('guest_reflections');
    localStorage.removeItem('guest_stats');
    localStorage.removeItem('guest_read_principles');
  }
};
