'use client';

import React, { useState } from 'react';
import Banner from '@/components/banner/Banner';
import { Movie } from '@/types/movie';
import { X } from 'lucide-react';

interface MovieDetailClientProps {
  id: string;
  movieData: Movie;
}

export default function MovieDetailClient({
  id,
  movieData,
}: MovieDetailClientProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const { title, poster_path, overview, vote_average, release_date, genres } =
    movieData;

  const playerUrl = `https://vidsrc.xyz/embed/movie/${id}`;

  return (
    <div className="w-full">
      {isPlaying ? (
        <div className="relative w-full aspect-video bg-black group">
          <iframe
            src={playerUrl}
            className="w-full h-full"
            frameBorder="0"
            allowFullScreen
          />
          <button
            onClick={() => setIsPlaying(false)}
            className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-red-600 p-2 rounded-full transition-colors text-white opacity-0 group-hover:opacity-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      ) : (
        <Banner
          id={+id}
          title={title || ''}
          poster_path={poster_path || ''}
          overview={overview || ''}
          vote_average={vote_average}
          release_date={release_date}
          genre_ids={
            genres?.map((genre: { name: string }) => genre.name).join(', ') ||
            ''
          }
          media_type="movie"
          onPlay={() => setIsPlaying(true)}
          showPlayBtn={true}
        />
      )}
    </div>
  );
}
