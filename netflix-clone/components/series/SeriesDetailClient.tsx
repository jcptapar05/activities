'use client';

import React, { useState } from 'react';
import Banner from '@/components/banner/Banner';
import { Season, Movie } from '@/types/movie';
import { Play, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SeriesDetailClientProps {
  id: string;
  seriesData: Movie;
  seasonData: Season[];
}

export default function SeriesDetailClient({
  id,
  seriesData,
  seasonData,
}: SeriesDetailClientProps) {
  const [selectedSeasonNum, setSelectedSeasonNum] = useState(
    seasonData[0]?.season_number || 1
  );
  const [selectedEpisodeNum, setSelectedEpisodeNum] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  const selectedSeason = seasonData.find(
    s => s.season_number === selectedSeasonNum
  );
  const episodes = selectedSeason?.episodes || [];

  const handlePlay = (s?: number, e?: number) => {
    if (s !== undefined) setSelectedSeasonNum(s);
    if (e !== undefined) setSelectedEpisodeNum(e);
    setIsPlaying(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { name, poster_path, overview, vote_average, first_air_date, genres } =
    seriesData;

  const playerUrl = `https://vidsrc.xyz/embed/tv/${id}/${selectedSeasonNum}/${selectedEpisodeNum}`;

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
          title={name || ''}
          poster_path={poster_path || ''}
          overview={overview || ''}
          vote_average={vote_average}
          release_date={first_air_date}
          genre_ids={
            genres?.map((genre: { name: string }) => genre.name).join(', ') ||
            ''
          }
          media_type="tv"
          onPlay={() => handlePlay()}
        />
      )}

      <div className="px-4 md:px-10 py-8 space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gray-900/40 p-6 rounded-2xl border border-gray-800 backdrop-blur-sm">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Episodes
            </h2>
            <p className="text-gray-400 text-sm">
              Explore seasons and episodes
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-2 min-w-[160px]">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">
                Select Season
              </label>
              <Select
                value={selectedSeasonNum.toString()}
                onValueChange={val => {
                  setSelectedSeasonNum(parseInt(val));
                  setSelectedEpisodeNum(1);
                }}
              >
                <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white h-11 focus:ring-red-600">
                  <SelectValue placeholder="Season" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800 text-white">
                  {seasonData.map(season => (
                    <SelectItem
                      key={season.id}
                      value={season.season_number.toString()}
                      className="focus:bg-red-600 focus:text-white"
                    >
                      {season.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2 min-w-[220px]">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">
                Select Episode
              </label>
              <Select
                value={selectedEpisodeNum.toString()}
                onValueChange={val => setSelectedEpisodeNum(parseInt(val))}
              >
                <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white h-11 focus:ring-red-600">
                  <SelectValue placeholder="Episode" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800 text-white">
                  {episodes.map(episode => (
                    <SelectItem
                      key={episode.id}
                      value={episode.episode_number.toString()}
                      className="focus:bg-red-600 focus:text-white"
                    >
                      E{episode.episode_number}: {episode.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <button
              onClick={() => handlePlay()}
              className="bg-red-600 hover:bg-red-700 text-white px-8 h-11 rounded-lg font-bold transition-all transform hover:scale-105 active:scale-95 flex items-center shadow-lg shadow-red-600/20"
            >
              <Play className="w-4 h-4 mr-2 fill-current" /> Play Now
            </button>
          </div>
        </div>

        {/* <div className="grid grid-cols-1 gap-6">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold text-white">
              {selectedSeason?.name}
            </h3>
            <span className="bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded">
              {episodes.length} Episodes
            </span>
          </div>
        </div> */}
      </div>
    </div>
  );
}
