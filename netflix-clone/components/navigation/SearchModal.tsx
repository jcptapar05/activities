'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Movie } from '@/types/movie';
import Link from 'next/link';
import MovieCard from '@/components/moviecard/MovieCard';
import Loading from '@/components/loading/Loading';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchSearchResults = async ({
    pageParam = 1,
  }: {
    pageParam: number;
  }) => {
    if (!debouncedSearchTerm) return { results: [], total_pages: 0, page: 1 };

    const headers = {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
      'Content-Type': 'application/json',
    };

    const searchUrl = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(
      debouncedSearchTerm
    )}&include_adult=false&language=en-US&page=${pageParam}`;

    const res = await axios.get(searchUrl, { headers });
    return res.data;
  };

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['search', debouncedSearchTerm],
    queryFn: fetchSearchResults,
    initialPageParam: 1,
    getNextPageParam: lastPage => {
      if (!lastPage) return undefined;
      const { page, total_pages } = lastPage;
      return page < total_pages ? page + 1 : undefined;
    },
    enabled: debouncedSearchTerm.length > 0,
  });

  // Reset search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  // Handle infinite scroll
  useEffect(() => {
    const handleScroll = (e: any) => {
      const { scrollTop, clientHeight, scrollHeight } = e.target;
      if (scrollHeight - scrollTop <= clientHeight * 1.5) {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }
    };

    const modalContent = document.querySelector(
      '[data-radix-scroll-area-viewport]'
    );
    if (modalContent) {
      modalContent.addEventListener('scroll', handleScroll);
      return () => modalContent.removeEventListener('scroll', handleScroll);
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allResults =
    data?.pages.flatMap(page =>
      page.results?.filter((item: any) => item.media_type !== 'person')
    ) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Movies & TV Shows</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-4">
          <div className="sticky top-0 bg-background pt-2 pb-4 z-10">
            <Input
              placeholder="Search for movies or TV shows..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full"
              autoFocus
            />
          </div>

          <div className="min-h-[200px]">
            {isLoading && (
              <div className="flex justify-center py-8">
                <Loading />
              </div>
            )}

            {!isLoading && debouncedSearchTerm && allResults.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No results found for `{debouncedSearchTerm}`
              </div>
            )}

            {!debouncedSearchTerm && (
              <div className="text-center text-muted-foreground py-8">
                Start typing to search for movies and TV shows
              </div>
            )}

            {allResults.length > 0 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {allResults.map((item: Movie) => (
                    <Link
                      key={item.id}
                      href={`/${item.media_type === 'tv' ? 'series' : 'movies'}/${item.id}`}
                      onClick={onClose}
                    >
                      <MovieCard
                        title={item.title || item.name || ''}
                        poster_path={item.poster_path}
                      />
                    </Link>
                  ))}
                </div>

                {isFetchingNextPage && (
                  <div className="flex justify-center py-4">
                    <Loading />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;
