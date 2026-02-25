'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Movie } from '@/types/movie';

interface MyListContextType {
  data: Movie[];
  add: (item: Movie) => void;
  remove: (id: number) => void;
  isAdded: (id: number) => boolean;
}

const KEY = 'my-list';
const getList = (): Movie[] => {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(KEY) || '[]');
};

const MyListContext = createContext<MyListContextType | null>(null);

export function MyListProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Movie[]>([]);

  useEffect(() => {
    setData(getList());
  }, []);

  const add = (item: Movie) => {
    if (data.some(i => i.id === item.id)) {
      toast.error('Already in My List');
      return;
    }
    const updated = [...data, item];
    localStorage.setItem(KEY, JSON.stringify(updated));
    setData(updated);
    toast.success('Added to My List');
  };

  const remove = (id: number) => {
    const updated = data.filter(item => item.id !== id);
    localStorage.setItem(KEY, JSON.stringify(updated));
    setData(updated);
    toast.success('Removed from My List');
  };

  const isAdded = (id: number) => data.some(item => item.id === id);

  return (
    <MyListContext.Provider value={{ data, add, remove, isAdded }}>
      {children}
    </MyListContext.Provider>
  );
}

export function useMyList() {
  const ctx = useContext(MyListContext);
  if (!ctx) throw new Error('useMyList must be used inside MyListProvider');
  return ctx;
}

export default useMyList;
