import Banner from '@/components/banner/Banner';
import axios from 'axios';
import React from 'react';

async function MoviesPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const headers = {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
    'Content-Type': 'application/json',
  };
  const res = await axios.get(
    `https://api.themoviedb.org/3/movie/${id}?language=en-US`,
    { headers }
  );
  const {
    title,
    poster_path,
    description,
    vote_average,
    release_date,
    genres,
  } = res.data;

  return (
    <Banner
      id={+id}
      title={title}
      poster_path={poster_path}
      overview={description}
      vote_average={vote_average}
      release_date={release_date}
      genre_ids={genres.map((genre: { name: string }) => genre.name).join(', ')}
      media_type="movie"
    />
  );
}

export default MoviesPage;
