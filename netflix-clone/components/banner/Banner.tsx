'use client';
import React from 'react';
import Image from 'next/image';
import { Button } from '../ui/button';
import useAddToMyList from '@/lib/useMyList';
import { Heart, HeartOff, Play, Star } from 'lucide-react';
import { Movie } from '@/types/movie';

function Banner({
  id,
  title,
  poster_path,
  overview,
  vote_average,
  release_date,
  genre_ids,
  media_type,
}: Movie) {
  const { add, remove, isAdded } = useAddToMyList();

  const added = isAdded(id);

  const handleToggleMyList = () => {
    if (added) {
      remove(id);
    } else {
      console.log(media_type);
      add({ id, title, poster_path, media_type });
    }
  };

  return (
    <div
      className="md:h-[80vh] w-full relative mb-14 flex items-center justify-center"
      style={{
        backgroundImage: `url(https://image.tmdb.org/t/p/original${poster_path})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/60 z-0" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-0" />
      <div className="md:flex py-20 md:py-0 items-end z-10 gap-6 px-10 max-w-7xl">
        <div className="relative min-w-[240px] hidden md:block h-[360px] rounded-lg overflow-hidden shadow-2xl">
          <Image
            src={`https://image.tmdb.org/t/p/original${poster_path}`}
            alt={title || 'POSTER'}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="md:text-5xl text-3xl font-bold text-white">{title}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            {vote_average && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>{vote_average}</span>
                <span>|</span>
              </div>
            )}
            <span>{release_date}</span>
            <span>|</span>
            <span>{genre_ids}</span>
          </div>
          <p className="text-sm text-gray-300 max-w-md leading-relaxed line-clamp-3">
            {overview}
          </p>
          <div className="flex gap-3">
            <Button variant="destructive" className="px-6">
              <Play className="w-4 h-4 mr-2" /> Play
            </Button>
            <Button
              variant={added ? 'default' : 'secondary'}
              onClick={handleToggleMyList}
              className="px-6"
            >
              {added ? (
                <>
                  <HeartOff className="w-4 h-4 mr-2" /> Remove from Favorites
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" /> Add to Favorites
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Banner;
