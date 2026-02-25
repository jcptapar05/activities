'use client';
import MovieCard from '@/components/moviecard/MovieCard';
import axios from 'axios';
import { useInfiniteQuery } from '@tanstack/react-query';
import Loading from '@/components/loading/Loading';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Banner from '@/components/banner/Banner';
import { Movie } from '@/types/movie';

function MoviesPage() {
  const loaderRef = useRef<HTMLDivElement>(null);

  const fetchAll = async ({ pageParam = 1 }: { pageParam: number }) => {
    const headers = {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
      'Content-Type': 'application/json',
    };

    const movieUrl = `https://api.themoviedb.org/3/discover/tv?include_adult=false&language=en-US&page=${pageParam}&sort_by=popularity.desc`;

    const res = await axios.get(movieUrl, { headers });
    return res.data;
  };

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['movies'],
      queryFn: fetchAll,
      initialPageParam: 1,
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

  if (isLoading) return <Loading />;

  const {
    id,
    title,
    poster_path,
    overview,
    vote_average,
    release_date,
    genre_ids,
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
        media_type="tv"
      />
      <div className="grid grid-cols-5 gap-4 px-10">
        {data?.pages.map(page =>
          page.results.map((item: Movie) => (
            <Link key={item.id} href={`/series/${item.id}`}>
              <MovieCard
                title={item.title || ''}
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

export default MoviesPage;
