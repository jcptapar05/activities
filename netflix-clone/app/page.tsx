'use client';
import axios from 'axios';
import MovieCard from '@/components/moviecard/MovieCard';
import Loading from '@/components/loading/Loading';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import Banner from '@/components/banner/Banner';
import { Movie } from '@/types/movie';
import Link from 'next/link';

export default function Home() {
  const loaderRef = useRef<HTMLDivElement>(null);

  const fetchAll = async ({ pageParam = 1 }: { pageParam: number }) => {
    const headers = {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
      'Content-Type': 'application/json',
    };

    const movieUrl = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${pageParam}&sort_by=popularity.desc`;
    const tvUrl = `https://api.themoviedb.org/3/discover/tv?include_adult=false&language=en-US&page=${pageParam}&sort_by=popularity.desc`;

    const [movieRes, tvRes] = await Promise.all([
      axios.get(movieUrl, { headers }),
      axios.get(tvUrl, { headers }),
    ]);

    const movies = movieRes.data.results.map((x: Movie) => ({
      ...x,
      media_type: 'movie',
    }));
    const tv = tvRes.data.results.map((x: Movie) => ({
      ...x,
      media_type: 'tv',
    }));

    return {
      results: [...movies, ...tv],
      page: pageParam,
      total_pages: Math.max(movieRes.data.total_pages, tvRes.data.total_pages),
    };
  };

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['home-feed'],
      queryFn: fetchAll,
      initialPageParam: 1,
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

  if (isLoading) return <Loading />;

  const {
    id,
    title,
    poster_path,
    overview,
    vote_average,
    release_date,
    genre_ids,
    media_type,
  } = data?.pages[0].results[0];

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

      <div className="grid lg:grid-cols-5 md:grid-cols-3 grid-cols-1 gap-4 px-10">
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
      </div>

      <div ref={loaderRef} className="w-full py-8 flex justify-center">
        {isFetchingNextPage && <Loading />}
      </div>
    </div>
  );
}
