'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { GeneratedImage } from '@/lib/types';

interface ImageCardProps {
  image: GeneratedImage;
  onDelete?: (imageId: string) => void;
  onToggleFavorite?: (imageId: string) => void;
  showDetails?: boolean;
}

export default function ImageCard({ 
  image, 
  onDelete, 
  onToggleFavorite, 
  showDetails = true 
}: ImageCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleDownload = async () => {
    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-generated-${image.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
      toast.success('Image downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download image');
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(image.prompt);
    toast.success('Prompt copied to clipboard!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Generated Image',
          text: `Check out this AI-generated image: "${image.prompt}"`,
          url: image.imageUrl
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(image.imageUrl);
      toast.success('Image URL copied to clipboard!');
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Card className="group overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
      <div className="relative aspect-square overflow-hidden">
        {/* Image */}
        {!imageError ? (
          <Image
            src={image.imageUrl}
            alt={image.prompt}
            fill
            className={`object-cover transition-opacity duration-200 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setImageError(true);
            }}
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="text-4xl mb-2">🖼️</div>
              <div className="text-sm">Image unavailable</div>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {isLoading && !imageError && (
          <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />

        {/* Action buttons */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 space-y-1">
          {/* Favorite button */}
          {onToggleFavorite && (
            <Button
              size="sm"
              variant="secondary"
              className="w-8 h-8 p-0"
              onClick={() => onToggleFavorite(image.id)}
            >
              {image.isFavorite ? '❤️' : '🤍'}
            </Button>
          )}

          {/* More actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="secondary"
                className="w-8 h-8 p-0"
              >
                ⋯
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDownload}>
                📥 Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyPrompt}>
                📋 Copy Prompt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShare}>
                🔗 Share
              </DropdownMenuItem>
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete(image.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    🗑️ Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Favorite indicator */}
        {image.isFavorite && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-xs">
              ❤️ Favorite
            </Badge>
          </div>
        )}
      </div>

      {/* Card content */}
      {showDetails && (
        <CardContent className="p-3">
          <div className="space-y-2">
            {/* Prompt */}
            <Dialog>
              <DialogTrigger asChild>
                <p className="text-sm line-clamp-2 cursor-pointer hover:text-primary transition-colors">
                  {image.prompt}
                </p>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Generated Image Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="aspect-square relative overflow-hidden rounded-lg">
                    <Image
                      src={image.imageUrl}
                      alt={image.prompt}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-medium text-sm">Prompt:</h4>
                      <p className="text-sm text-muted-foreground">{image.prompt}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {image.settings.aspectRatio}
                      </Badge>
                      <Badge variant="outline">
                        {image.settings.style || 'photorealistic'}
                      </Badge>
                      {image.settings.steps && (
                        <Badge variant="outline">
                          {image.settings.steps} steps
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatDate(image.timestamp)}</span>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {image.settings.aspectRatio}
                </Badge>
                {image.settings.style && (
                  <Badge variant="outline" className="text-xs">
                    {image.settings.style}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}