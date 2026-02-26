import MovieDetailClient from '@/components/movie/MovieDetailClient';
import axios from 'axios';

async function MoviesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const headers = {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
    'Content-Type': 'application/json',
  };
  const res = await axios.get(
    `https://api.themoviedb.org/3/movie/${id}?language=en-US`,
    { headers }
  );

  return <MovieDetailClient id={id} movieData={res.data} />;
}

export default MoviesPage;
