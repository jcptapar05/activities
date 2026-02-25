'use client';
import MovieCard from '@/components/moviecard/MovieCard';
import axios from 'axios';
import { useInfiniteQuery } from '@tanstack/react-query';
import Loading from '@/components/loading/Loading';
import { useEffect, useRef } from 'react';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
}

function NewAndPopular() {
  const loaderRef = useRef<HTMLDivElement>(null);

  const fetchAll = async ({ pageParam = 1 }: { pageParam: number }) => {
    const headers = {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
    };

    const movieUrl = `https://api.themoviedb.org/3/trending/all/week?page=${pageParam}`;

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

  return (
    <div className="w-full">
      <div className="grid grid-cols-5 gap-4">
        {data?.pages.map(page =>
          page.results.map((item: Movie) => (
            <MovieCard
              key={item.id}
              title={item.title}
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

export default NewAndPopular;
