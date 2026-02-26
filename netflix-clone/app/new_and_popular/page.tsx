'use client';
import MovieCard from '@/components/moviecard/MovieCard';
import axios from 'axios';
import { useInfiniteQuery } from '@tanstack/react-query';
import Loading from '@/components/loading/Loading';
import { useEffect, useRef, useState, useTransition } from 'react';
import { Movie } from '@/types/movie';
import Link from 'next/link';
import Container from '@/components/Container';
import Banner from '@/components/banner/Banner';
import { FilterBar } from '@/components/FilterShow';

const FILTERS = [
  { label: '🔥 Trending', value: 'trending', group: 'sort' as const },
  { label: '⭐ Top Rated', value: 'top-rated', group: 'sort' as const },
  { label: '🎬 Action', value: 'action', group: 'genre' as const },
  { label: '😂 Comedy', value: 'comedy', group: 'genre' as const },
  { label: '😱 Horror', value: 'horror', group: 'genre' as const },
  { label: '💘 Romance', value: 'romance', group: 'genre' as const },
];

const MOVIE_GENRE_MAP: Record<string, number> = {
  action: 28,
  comedy: 35,
  horror: 27,
  romance: 10749,
};

const TV_GENRE_MAP: Record<string, number> = {
  action: 10759,
  comedy: 35,
  horror: 9648,
  romance: 10749,
};

function NewAndPopular() {
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
    };

    const selectedFilters = activeFilters
      ? activeFilters.split(',')
      : ['trending'];

    const isTrending = selectedFilters.includes('trending');
    const isTopRated = selectedFilters.includes('top-rated');
    const sortBy = isTopRated ? 'vote_average.desc' : 'popularity.desc';
    const voteCountFilter = isTopRated ? '&vote_count.gte=200' : '';

    const genreFilters = selectedFilters.filter(f => MOVIE_GENRE_MAP[f]);
    const movieGenres = genreFilters.map(f => MOVIE_GENRE_MAP[f]).join(',');
    const tvGenres = genreFilters.map(f => TV_GENRE_MAP[f]).join(',');
    const movieGenreParam = movieGenres ? `&with_genres=${movieGenres}` : '';
    const tvGenreParam = tvGenres ? `&with_genres=${tvGenres}` : '';

    // Default: trending all (mixed movies + TV)
    if (isTrending && genreFilters.length === 0 && !isTopRated) {
      const res = await axios.get(
        `https://api.themoviedb.org/3/trending/all/week?page=${pageParam}`,
        { headers }
      );
      return res.data;
    }

    // With filters: fetch both movies and TV then merge
    const [movieRes, tvRes] = await Promise.all([
      axios.get(
        `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${pageParam}&sort_by=${sortBy}${voteCountFilter}${movieGenreParam}`,
        { headers }
      ),
      axios.get(
        `https://api.themoviedb.org/3/discover/tv?include_adult=false&language=en-US&page=${pageParam}&sort_by=${sortBy}${voteCountFilter}${tvGenreParam}`,
        { headers }
      ),
    ]);

    const movies = movieRes.data.results.map((x: Movie) => ({
      ...x,
      media_type: 'movie',
    }));
    const tvShows = tvRes.data.results.map((x: Movie) => ({
      ...x,
      media_type: 'tv',
    }));

    return {
      results: [...movies, ...tvShows],
      page: pageParam,
      total_pages: Math.max(movieRes.data.total_pages, tvRes.data.total_pages),
    };
  };

  const {
    data,
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['new-and-popular', activeFilters],
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

  const first = data?.pages[0].results[0] as Movie;
  const isFilterLoading = (isFetching || isPending) && !isFetchingNextPage;

  return (
    <div className="w-full">
      <Banner
        id={first.id}
        title={first.title || first.name || ''}
        poster_path={first.poster_path}
        overview={first.overview || ''}
        vote_average={first.vote_average}
        release_date={first.release_date}
        genre_ids={first.genre_ids}
        media_type={first.media_type ?? 'movie'}
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
            <Link
              key={`${item.media_type}-${item.id}`}
              href={`/${item.media_type === 'tv' ? 'series' : 'movies'}/${item.id}`}
            >
              <MovieCard
                title={item.title || item.name || ''}
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

export default NewAndPopular;
