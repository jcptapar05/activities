'use client';
import MovieCard from '@/components/moviecard/MovieCard';
import axios from 'axios';
import { useInfiniteQuery } from '@tanstack/react-query';
import Loading from '@/components/loading/Loading';
import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import Banner from '@/components/banner/Banner';
import { Movie } from '@/types/movie';
import Container from '@/components/Container';
import { FilterBar } from '@/components/FilterShow';

const FILTERS = [
  { label: '🔥 Trending', value: 'trending', group: 'sort' as const },
  { label: '⭐ Top Rated', value: 'top-rated', group: 'sort' as const },
  { label: '🎬 Action', value: 'action', group: 'genre' as const },
  { label: '😂 Comedy', value: 'comedy', group: 'genre' as const },
  { label: '😱 Horror', value: 'horror', group: 'genre' as const },
  { label: '💘 Romance', value: 'romance', group: 'genre' as const },
];

const TV_GENRE_MAP: Record<string, number> = {
  action: 10759,
  comedy: 35,
  horror: 9648,
  romance: 10749,
};

function SeriesPage() {
  const loaderRef = useRef<HTMLDivElement>(null);
  const [activeFilters, setActiveFilters] = useState('trending');
  const [isPending, startTransition] = useTransition();

  const handleFilterChange = (value: string) => {
    startTransition(() => {
      setActiveFilters(value || 'trending');
    });
  };

  const fetchAll = async ({ pageParam = 1 }: { pageParam: number }) => {
    const headers = {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
      'Content-Type': 'application/json',
    };

    const selectedFilters = activeFilters
      ? activeFilters.split(',')
      : ['trending'];

    const isTrending = selectedFilters.includes('trending');
    const isTopRated = selectedFilters.includes('top-rated');
    const sortBy = isTopRated ? 'vote_average.desc' : 'popularity.desc';
    const voteCountFilter = isTopRated ? '&vote_count.gte=200' : '';

    const genreFilters = selectedFilters.filter(f => TV_GENRE_MAP[f]);
    const tvGenres = genreFilters.map(f => TV_GENRE_MAP[f]).join(',');
    const tvGenreParam = tvGenres ? `&with_genres=${tvGenres}` : '';

    if (isTrending && genreFilters.length === 0 && !isTopRated) {
      const res = await axios.get(
        `https://api.themoviedb.org/3/trending/tv/week?page=${pageParam}`,
        { headers }
      );
      return res.data;
    }

    const res = await axios.get(
      `https://api.themoviedb.org/3/discover/tv?include_adult=false&language=en-US&page=${pageParam}&sort_by=${sortBy}${voteCountFilter}${tvGenreParam}`,
      { headers }
    );
    return res.data;
  };

  const {
    data,
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['series', activeFilters],
    queryFn: fetchAll,
    initialPageParam: 1,
    placeholderData: previousData => previousData,
    getNextPageParam: lastPage => {
      const { page, total_pages } = lastPage;
      return page < total_pages && page < 500 ? page + 1 : undefined;
    },
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const first = entries[0];
        if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) observer.observe(currentLoader);
    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading && !data) return <Loading />;

  const {
    id,
    title,
    name,
    poster_path,
    overview,
    vote_average,
    release_date,
    genre_ids,
  } = data?.pages[0].results[0];

  const isFilterLoading = (isFetching || isPending) && !isFetchingNextPage;

  return (
    <div className="w-full">
      <Banner
        id={id}
        title={title || name || ''}
        poster_path={poster_path}
        overview={overview || ''}
        vote_average={vote_average}
        release_date={release_date}
        genre_ids={genre_ids}
        media_type="tv"
      />

      <FilterBar
        filters={FILTERS}
        defaultValue="trending"
        onFilterChange={handleFilterChange}
      />

      {isFilterLoading && (
        <div className="w-full h-0.5 bg-zinc-200 dark:bg-zinc-800 overflow-hidden mb-4">
          <div className="h-full bg-indigo-500 animate-[loading-bar_1s_ease-in-out_infinite]" />
        </div>
      )}

      <Container>
        {data?.pages.map(page =>
          page.results.map((item: Movie) => (
            <Link key={item.id} href={`/series/${item.id}`}>
              <MovieCard
                title={item.name || item.title || ''}
                poster_path={item.poster_path}
              />
            </Link>
          ))
        )}
      </Container>

      <div ref={loaderRef} className="w-full py-8 flex justify-center">
        {isFetchingNextPage && <Loading />}
      </div>
    </div>
  );
}

export default SeriesPage;
