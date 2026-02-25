'use client';
import axios from 'axios';
import MovieCard from '@/components/moviecard/MovieCard';
import Loading from '@/components/loading/Loading';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import Banner from '@/components/banner/Banner';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  media_type: 'movie' | 'tv';
  name?: string;
}

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

  return (
    <div className="w-full">
      <Banner
        id={data?.pages[0].results[0].id}
        title={
          data?.pages[0].results[0].title ||
          data?.pages[0].results[0].name ||
          ''
        }
        poster_path={data?.pages[0].results[0].poster_path}
        description={data?.pages[0].results[0].overview || ''}
      />

      <div className="grid lg:grid-cols-5 md:grid-cols-3 grid-cols-1 gap-4 px-10">
        {data?.pages.map(page =>
          page.results.map((item: Movie) => (
            <MovieCard
              key={`${item.media_type}-${item.id}`}
              title={item.title || item.name || ''}
              poster_path={item.poster_path}
            />
          ))
        )}
      </div>

      <div ref={loaderRef} className="w-full py-8 flex justify-center">
        {isFetchingNextPage && <Loading />}
      </div>
    </div>
  );
}
