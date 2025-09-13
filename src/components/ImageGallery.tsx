'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ImageCard from './ImageCard';
import type { GeneratedImage, AspectRatio, GenerationStyle } from '@/lib/types';

interface ImageGalleryProps {
  images: GeneratedImage[];
  onDelete?: (imageId: string) => void;
  onToggleFavorite?: (imageId: string) => void;
  showFilters?: boolean;
  title?: string;
}

type SortOption = 'newest' | 'oldest' | 'prompt' | 'favorites';
type FilterOption = 'all' | 'favorites' | AspectRatio | GenerationStyle;

export default function ImageGallery({
  images,
  onDelete,
  onToggleFavorite,
  showFilters = true,
  title
}: ImageGalleryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [gridSize, setGridSize] = useState<'small' | 'medium' | 'large'>('medium');

  // Filter and sort images
  const filteredAndSortedImages = useMemo(() => {
    let filtered = [...images];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(image => 
        image.prompt.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filterBy !== 'all') {
      if (filterBy === 'favorites') {
        filtered = filtered.filter(image => image.isFavorite);
      } else if (['1:1', '16:9', '9:16', '4:3', '3:4'].includes(filterBy)) {
        filtered = filtered.filter(image => image.settings.aspectRatio === filterBy);
      } else {
        filtered = filtered.filter(image => image.settings.style === filterBy);
      }
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.timestamp.getTime() - a.timestamp.getTime();
        case 'oldest':
          return a.timestamp.getTime() - b.timestamp.getTime();
        case 'prompt':
          return a.prompt.localeCompare(b.prompt);
        case 'favorites':
          if (a.isFavorite && !b.isFavorite) return -1;
          if (!a.isFavorite && b.isFavorite) return 1;
          return b.timestamp.getTime() - a.timestamp.getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [images, searchQuery, sortBy, filterBy]);

  // Get available filter options
  const availableFilters = useMemo(() => {
    const aspectRatios = new Set(images.map(img => img.settings.aspectRatio));
    const styles = new Set(images.map(img => img.settings.style));
    const favoriteCount = images.filter(img => img.isFavorite).length;

    return {
      aspectRatios: Array.from(aspectRatios),
      styles: Array.from(styles),
      favoriteCount
    };
  }, [images]);

  const getGridCols = () => {
    switch (gridSize) {
      case 'small': return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';
      case 'medium': return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      case 'large': return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3';
      default: return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterBy('all');
    setSortBy('newest');
  };

  if (images.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-xl font-semibold mb-2">No Images Yet</h3>
          <p className="text-muted-foreground mb-4">
            Start generating some amazing AI images to see them here!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{title}</h2>
          <Badge variant="secondary" className="text-sm">
            {images.length} image{images.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      )}

      {/* Filters and Controls */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters & View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search and Sort Row */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search prompts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-md"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="prompt">By Prompt</SelectItem>
                      <SelectItem value="favorites">Favorites First</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={gridSize} onValueChange={(value) => setGridSize(value as typeof gridSize)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Filter Tags */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filterBy === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterBy('all')}
                >
                  All ({images.length})
                </Button>

                {availableFilters.favoriteCount > 0 && (
                  <Button
                    variant={filterBy === 'favorites' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterBy('favorites')}
                  >
                    ❤️ Favorites ({availableFilters.favoriteCount})
                  </Button>
                )}

                {availableFilters.aspectRatios.map(ratio => (
                  <Button
                    key={ratio}
                    variant={filterBy === ratio ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterBy(ratio)}
                  >
                    {ratio} ({images.filter(img => img.settings.aspectRatio === ratio).length})
                  </Button>
                ))}

                {availableFilters.styles.map(style => (
                  style && (
                    <Button
                      key={style}
                      variant={filterBy === style ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterBy(style)}
                    >
                      {style} ({images.filter(img => img.settings.style === style).length})
                    </Button>
                  )
                ))}

                {(searchQuery || filterBy !== 'all' || sortBy !== 'newest') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-muted-foreground"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredAndSortedImages.length} of {images.length} image{images.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Image Grid */}
      {filteredAndSortedImages.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={`grid gap-4 ${getGridCols()}`}>
          {filteredAndSortedImages.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              onDelete={onDelete}
              onToggleFavorite={onToggleFavorite}
              showDetails={gridSize !== 'small'}
            />
          ))}
        </div>
      )}
    </div>
  );
}