'use client';
import axios from 'axios';
import MovieCard from '@/components/moviecard/MovieCard';
import Loading from '@/components/loading/Loading';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState, useTransition } from 'react';
import Banner from '@/components/banner/Banner';
import { Movie } from '@/types/movie';
import Link from 'next/link';
import { FilterBar } from '@/components/FilterShow';
import Container from '@/components/Container';

const FILTERS = [
  { label: '🔥 Trending', value: 'trending', group: 'sort' as const },
  { label: '⭐ Top Rated', value: 'top-rated', group: 'sort' as const },
  { label: '🎬 Action', value: 'action', group: 'genre' as const },
  { label: '😂 Comedy', value: 'comedy', group: 'genre' as const },
  { label: '😱 Horror', value: 'horror', group: 'genre' as const },
  { label: '💘 Romance', value: 'romance', group: 'genre' as const },
];

// TMDB genre IDs
const GENRE_MAP: Record<string, number> = {
  action: 28,
  comedy: 35,
  horror: 27,
  romance: 10749,
};

// TMDB genre IDs for TV
const TV_GENRE_MAP: Record<string, number> = {
  action: 10759,
  comedy: 35,
  horror: 9648,
  romance: 10749,
};

export default function Home() {
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

    const genreFilters = selectedFilters.filter(f => GENRE_MAP[f]);
    const movieGenres = genreFilters.map(f => GENRE_MAP[f]).join(',');
    const tvGenres = genreFilters.map(f => TV_GENRE_MAP[f]).join(',');
    const movieGenreParam = movieGenres ? `&with_genres=${movieGenres}` : '';
    const tvGenreParam = tvGenres ? `&with_genres=${tvGenres}` : '';

    let movies: Movie[] = [];
    let tvShows: Movie[] = [];
    let totalPages = 1;

    if (isTrending && genreFilters.length === 0 && !isTopRated) {
      const [trendingMovies, trendingTv] = await Promise.all([
        axios.get(
          `https://api.themoviedb.org/3/trending/movie/week?page=${pageParam}`,
          { headers }
        ),
        axios.get(
          `https://api.themoviedb.org/3/trending/tv/week?page=${pageParam}`,
          { headers }
        ),
      ]);

      movies = trendingMovies.data.results.map((x: Movie) => ({
        ...x,
        media_type: 'movie',
      }));
      tvShows = trendingTv.data.results.map((x: Movie) => ({
        ...x,
        media_type: 'tv',
      }));
      totalPages = Math.max(
        trendingMovies.data.total_pages,
        trendingTv.data.total_pages
      );
    } else {
      const movieUrl = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${pageParam}&sort_by=${sortBy}${voteCountFilter}${movieGenreParam}`;
      const tvUrl = `https://api.themoviedb.org/3/discover/tv?include_adult=false&language=en-US&page=${pageParam}&sort_by=${sortBy}${voteCountFilter}${tvGenreParam}`;

      const [movieRes, tvRes] = await Promise.all([
        axios.get(movieUrl, { headers }),
        axios.get(tvUrl, { headers }),
      ]);

      movies = movieRes.data.results.map((x: Movie) => ({
        ...x,
        media_type: 'movie',
      }));
      tvShows = tvRes.data.results.map((x: Movie) => ({
        ...x,
        media_type: 'tv',
      }));
      totalPages = Math.max(movieRes.data.total_pages, tvRes.data.total_pages);
    }

    return {
      results: [...movies, ...tvShows],
      page: pageParam,
      total_pages: totalPages,
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
    queryKey: ['home-feed', activeFilters],
    queryFn: fetchAll,
    initialPageParam: 1,
    // Keep previous data visible while new data loads for a smoother UX
    placeholderData: previousData => previousData,
    getNextPageParam: lastPage => {
      return lastPage.page < lastPage.total_pages && lastPage.page < 500
        ? lastPage.page + 1
        : undefined;
    },
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const current = loaderRef.current;
    if (current) observer.observe(current);
    return () => {
      if (current) observer.unobserve(current);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Only show full-page loading on very first load
  if (isLoading && !data) return <Loading />;

  const firstResult = data?.pages[0].results[0] as Movie;
  const {
    id,
    title,
    poster_path,
    overview,
    vote_average,
    release_date,
    genre_ids,
    media_type,
    name,
  } = firstResult;

  // Is a filter-change fetch in progress (not infinite scroll)?
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
        media_type={media_type}
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
