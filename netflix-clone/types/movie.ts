export interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  overview?: string;
  vote_average?: number;
  release_date?: string;
  media_type?: string;
  genre_ids?: number[] | string;
  genres?: { id: number; name: string }[];
  first_air_date?: string;
}

export interface Season {
  id: number;
  name: string;
  season_number: number;
  episodes: Episode[];
  poster_path: string | null;
  overview?: string;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  still_path: string | null;
  vote_average: number;
  episode_number: number;
  air_date: string;
}
