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
  first_air_date?: string;
}
