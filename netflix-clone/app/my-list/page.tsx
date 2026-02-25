'use client';
import MovieCard from '@/components/moviecard/MovieCard';
import useMyList from '@/lib/useMyList';
import { Movie } from '@/types/movie';
import Link from 'next/link';

function MyListPage() {
  const { data } = useMyList();

  return (
    <div className="grid grid-cols-5 gap-4 px-10 my-10">
      {data.map((item: Movie) => (
        <Link
          key={item.id}
          href={`/${item.media_type === 'tv' ? 'series' : 'movies'}/${item.id}`}
        >
          <MovieCard title={item.title || ''} poster_path={item.poster_path} />
        </Link>
      ))}
    </div>
  );
}

export default MyListPage;
