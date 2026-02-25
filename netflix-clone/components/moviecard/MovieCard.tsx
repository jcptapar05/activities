import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function MovieCard({
  title,
  poster_path,
}: {
  title: string;
  poster_path?: string;
}) {
  return (
    <Card className="w-full h-full text-center cursor-pointer hover:scale-105 transition-all duration-300">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Image
          src={`https://image.tmdb.org/t/p/w500${poster_path}`}
          alt={title || 'POSTER'}
          width={500}
          height={500}
        />
      </CardContent>
    </Card>
  );
}

export default MovieCard;
