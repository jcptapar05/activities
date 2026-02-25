import Banner from '@/components/banner/Banner';
import axios from 'axios';

async function SeriesPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const headers = {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
    'Content-Type': 'application/json',
  };
  const res = await axios.get(
    `https://api.themoviedb.org/3/tv/${id}?language=en-US`,
    { headers }
  );

  const { name, poster_path, overview, vote_average, first_air_date, genres } =
    res.data;

  return (
    <Banner
      id={+id}
      title={name || ''}
      poster_path={poster_path || ''}
      overview={overview || ''}
      vote_average={vote_average}
      release_date={first_air_date}
      genre_ids={genres.map((genre: { name: string }) => genre.name).join(', ')}
      media_type="tv"
    />
  );
}

export default SeriesPage;
