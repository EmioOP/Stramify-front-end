'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface VideoCardProps {
  id: string;
  title: string;
  thumbnail: string;
  owner: {
    _id: string;
    username: string;
    avatar: string;
  };
  duration?: number;
  views: number;
  createdAt: string;
}

export default function VideoCard({
  id,
  title,
  thumbnail,
  avatar,
  owner,
  duration,
  views,
  createdAt,
}: VideoCardProps) {
  const router = useRouter();

  const goToChannel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/channel/${owner._id}`);
  };

  return (
    <Link href={`/watch/${id}`}>
      <div className="group cursor-pointer">
        {/* Thumbnail */}
        <div className="relative w-full aspect-video bg-secondary rounded-lg overflow-hidden mb-3">
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
              {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex gap-3">
          {/* Channel Avatar */}
          <div
            onClick={goToChannel}
            className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/20 overflow-hidden hover:opacity-80 transition-opacity cursor-pointer"
          >
            <Image
              src={avatar || '/default-avatar.png'}
              alt={"Video Owner"}
              width={36}
              height={36}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Text Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p
              onClick={goToChannel}
              className="text-sm text-muted-foreground hover:text-primary transition-colors truncate cursor-pointer"
            >
              {owner.username}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Eye className="w-3 h-3" />
              <span>{views.toLocaleString()} views</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}