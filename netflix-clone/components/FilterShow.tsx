'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Check, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Filter = {
  label: string;
  value: string;
  group?: 'genre' | 'sort' | 'default';
};

type FilterBarProps = {
  filters: Filter[];
  defaultValue?: string;
  onFilterChange?: (value: string) => void;
  multiple?: boolean;
};

type FilterDropdownProps = {
  label: string;
  options: Filter[];
  activeValue: string | null;
  onSelect: (value: string) => void;
  icon?: React.ReactNode;
};

function FilterDropdown({
  label,
  options,
  activeValue,
  onSelect,
  icon,
}: FilterDropdownProps) {
  const hasActive = activeValue !== null;
  const activeLabel = options.find(o => o.value === activeValue)?.label;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500',
            hasActive
              ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:border-indigo-400 dark:text-indigo-300'
              : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
          )}
        >
          {icon && <span className="opacity-70">{icon}</span>}
          {/* Show selected label inline when active */}
          <span>{hasActive ? activeLabel : label}</span>
          <ChevronDown size={14} className="opacity-50" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="min-w-[180px]">
        {options.map(opt => {
          const isActive = activeValue === opt.value;
          return (
            <DropdownMenuItem
              key={opt.value}
              onSelect={() => onSelect(opt.value)}
              className={cn(
                'flex items-center justify-between gap-3 cursor-pointer',
                isActive && 'text-indigo-600 dark:text-indigo-300'
              )}
            >
              <span>{opt.label}</span>
              {isActive && (
                <Check size={13} className="shrink-0 text-indigo-500" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function FilterBar({
  filters,
  defaultValue,
  onFilterChange,
}: FilterBarProps) {
  // Each dropdown is single-select, but genre + sort can be combined
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<string | null>(
    defaultValue ?? null
  );

  const genreFilters = filters.filter(f => f.group === 'genre');
  const sortFilters = filters.filter(f => f.group === 'sort');
  const defaultFilters = filters.filter(f => !f.group || f.group === 'default');

  const notify = (genre: string | null, sort: string | null) => {
    const parts = [sort, genre].filter(Boolean) as string[];
    onFilterChange?.(parts.join(','));
  };

  const handleGenreSelect = (value: string) => {
    // Toggle: clicking active genre deselects it
    const next = selectedGenre === value ? null : value;
    setSelectedGenre(next);
    notify(next, selectedSort);
  };

  const handleSortSelect = (value: string) => {
    // Toggle: clicking active sort deselects it
    const next = selectedSort === value ? null : value;
    setSelectedSort(next);
    notify(selectedGenre, next);
  };

  const handleDefaultToggle = (value: string) => {
    const next = selectedSort === value ? null : value;
    setSelectedSort(next);
    notify(selectedGenre, next);
  };

  const hasActiveFilters = selectedGenre !== null || selectedSort !== null;

  const clearAll = () => {
    setSelectedGenre(null);
    setSelectedSort(null);
    onFilterChange?.('');
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 mb-6 px-10">
      {/* Genre dropdown — single select */}
      {genreFilters.length > 0 && (
        <FilterDropdown
          label="Genre"
          options={genreFilters}
          activeValue={selectedGenre}
          onSelect={handleGenreSelect}
          icon={
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          }
        />
      )}

      {/* Top & Trending dropdown — single select */}
      {sortFilters.length > 0 && (
        <FilterDropdown
          label="Top & Trending"
          options={sortFilters}
          activeValue={selectedSort}
          onSelect={handleSortSelect}
          icon={
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          }
        />
      )}

      {/* Plain pill filters (no group) */}
      {defaultFilters.map(filter => {
        const isActive = selectedSort === filter.value;
        return (
          <button
            key={filter.value}
            onClick={() => handleDefaultToggle(filter.value)}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500',
              isActive
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:border-indigo-400 dark:text-indigo-300'
                : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
            )}
          >
            {filter.label}
            {isActive && <Check size={12} className="text-indigo-500" />}
          </button>
        );
      })}

      {/* Clear all */}
      {hasActiveFilters && (
        <button
          onClick={clearAll}
          className={cn(
            'flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition-all duration-200',
            'border-red-200 bg-red-50 text-red-600 hover:bg-red-100',
            'dark:border-red-800 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900'
          )}
        >
          <X size={13} />
          Clear
        </button>
      )}
    </div>
  );
}
