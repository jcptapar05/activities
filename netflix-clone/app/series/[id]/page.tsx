import { Season } from '@/types/movie';
import SeriesDetailClient from '@/components/series/SeriesDetailClient';
import axios from 'axios';
import { notFound } from 'next/navigation';

async function SeriesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const headers = {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
    'Content-Type': 'application/json',
  };

  let seriesData;
  let seasonData: Season[] = [];

  try {
    const res = await axios.get(
      `https://api.themoviedb.org/3/tv/${id}?language=en-US`,
      { headers }
    );
    seriesData = res.data;

    const seasonNumbers: number[] =
      seriesData.seasons
        ?.map((s: { season_number: number }) => s.season_number)
        .filter((n: number) => n > 0) || [];

    const seasonResults = await Promise.all(
      seasonNumbers.map(seasonNum =>
        axios.get(
          `https://api.themoviedb.org/3/tv/${id}/season/${seasonNum}?language=en-US`,
          { headers }
        )
      )
    );

    seasonData = seasonResults.map(r => r.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('TMDB API Error:', {
        status: error.response?.status,
        message: error.response?.data?.status_message,
        url: `https://api.themoviedb.org/3/tv/${id}`,
        apiKeyPresent: !!process.env.NEXT_PUBLIC_API_KEY,
      });
    }
    notFound();
  }

  return (
    <SeriesDetailClient
      id={id}
      seriesData={seriesData}
      seasonData={seasonData}
    />
  );
}

export default SeriesPage;
