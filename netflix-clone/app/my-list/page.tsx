'use client';
import Container from '@/components/Container';
import MovieCard from '@/components/moviecard/MovieCard';
import useMyList from '@/lib/useMyList';
import { Movie } from '@/types/movie';
import Link from 'next/link';

function MyListPage() {
  const { data } = useMyList();

  if (data.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">My List</h1>
        <p className="text-gray-500">No movies in your list</p>
      </div>
    );
  }

  return (
    <Container>
      {data.map((item: Movie) => (
        <Link
          key={item.id}
          href={`/${item.media_type === 'tv' ? 'series' : 'movies'}/${item.id}`}
        >
          <MovieCard title={item.title || ''} poster_path={item.poster_path} />
        </Link>
      ))}
    </Container>
  );
}

export default MyListPage;
